/**
 * Live flight listings for the Arrivals demo, proxied so the key stays here.
 *
 * Arrivals is a static bundle served from /arrivals/, and anything a Vite build
 * inlines is readable in the page source — so the SerpApi key cannot live in the
 * app. It lives in this function's environment instead, and the browser only
 * ever talks to this endpoint.
 *
 * Set SERPAPI_KEY in Vercel as type **Config**, not Secret. Vercel withholds
 * Secret values from anything that could reach a browser and does it silently;
 * this one is server-side only so Secret would technically work, but the
 * portfolio has been bitten by that distinction before and consistency is
 * cheaper than remembering which is which.
 *
 * Named .mjs, not .js. The portfolio's package.json has no "type": "module" —
 * adding one would break Create React App's own tooling — so Node reads a .js
 * file here as CommonJS and `export default` is a syntax error that takes the
 * function down on every request. The extension forces ESM for this one file
 * and leaves the build alone. The route is still /api/flights.
 *
 * Without the key the function returns 503 and the app quietly falls back to
 * its own fare estimate and plain search links, which is also what happens on
 * a quota exhaustion, a SerpApi outage, or a cold start that times out. The
 * panel must never show a visitor an error it can't act on.
 */

const SERPAPI = "https://serpapi.com/search.json";

/** Six hours in the CDN, a day of stale-while-revalidate behind it. A fare
 *  moves slowly enough for that, and it is the difference between a quota
 *  measured per visitor and one measured per route per day. */
const CACHE = "public, s-maxage=21600, stale-while-revalidate=86400";

/** Where the demo actually runs. Anything else gets no CORS header, which
 *  stops another site pointing its own app at this key. It is not real
 *  authentication — Origin is trivially forged outside a browser — but it
 *  costs nothing and rules out the casual case. */
const ALLOWED = [
  "https://josephnguyen010-prog.github.io",
  "https://joseph-nguyen-portfolio.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const IATA = /^[A-Z]{3}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowed = !origin || ALLOWED.includes(origin);

  /**
   * Unconditionally, and this is the whole point of it. The answer is cached
   * at the edge for six hours, so without `Vary` the CDN keeps one copy for
   * everybody — and whichever request lands first decides whether that copy
   * carries a CORS header. A curl with no Origin primed it once and the
   * GitHub Pages copy was refused for six hours by a cached response that had
   * simply never been given the header.
   */
  res.setHeader("Vary", "Origin");
  if (origin && allowed) res.setHeader("Access-Control-Allow-Origin", origin);

  /**
   * Turned away before the upstream call rather than after it. Answering a
   * disallowed origin without the header still spent a search from the
   * month's quota to produce something the browser would throw away.
   */
  if (!allowed) return res.status(403).json({ error: "origin_not_allowed" });

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const key = process.env.SERPAPI_KEY;
  if (!key) return res.status(503).json({ error: "not_configured" });

  // Validated rather than passed through: without this the endpoint is an open
  // proxy to any SerpApi engine on someone else's dime.
  const from = String(req.query.from || "").toUpperCase();
  const to = String(req.query.to || "").toUpperCase();
  const depart = String(req.query.depart || "");
  const back = req.query.back ? String(req.query.back) : "";

  if (!IATA.test(from) || !IATA.test(to) || from === to) {
    return res.status(400).json({ error: "bad_route" });
  }
  if (!ISO_DATE.test(depart) || (back && !ISO_DATE.test(back))) {
    return res.status(400).json({ error: "bad_date" });
  }

  const params = new URLSearchParams({
    engine: "google_flights",
    departure_id: from,
    arrival_id: to,
    outbound_date: depart,
    currency: "USD",
    hl: "en",
    type: back ? "1" : "2", // 1 round trip, 2 one way
    api_key: key,
  });
  if (back) params.set("return_date", back);

  try {
    const upstream = await fetch(`${SERPAPI}?${params}`, {
      signal: AbortSignal.timeout(9000),
    });
    const json = await upstream.json();

    if (!upstream.ok || json.error) {
      // SerpApi reports a spent quota as a 4xx with a message. Either way the
      // app's fallback is the same, so the shape it gets is the same too.
      return res.status(502).json({ error: "upstream", detail: shorten(json.error) });
    }

    const flights = [...(json.best_flights || []), ...(json.other_flights || [])]
      .map(trim)
      .filter(Boolean)
      .slice(0, 8);

    res.setHeader("Cache-Control", CACHE);
    return res.status(200).json({
      flights,
      // Google's own read on whether this price is good, when it offers one.
      typical: json.price_insights?.typical_price_range ?? null,
      lowest: json.price_insights?.lowest_price ?? null,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(502).json({ error: "unreachable", detail: shorten(error?.message) });
  }
}

/**
 * Only the fields the panel draws. Trimming here keeps the payload small over a
 * cross-origin hop, and means a change in SerpApi's shape shows up in one place
 * rather than through the UI.
 */
function trim(option) {
  const legs = option?.flights;
  if (!Array.isArray(legs) || legs.length === 0) return null;

  const first = legs[0];
  const last = legs[legs.length - 1];
  if (!first?.departure_airport?.time || !last?.arrival_airport?.time) return null;

  return {
    airline: first.airline || "",
    airlineLogo: option.airline_logo || first.airline_logo || "",
    flightNumber: first.flight_number || "",
    departAirport: first.departure_airport.id || "",
    arriveAirport: last.arrival_airport.id || "",
    departTime: first.departure_airport.time,
    arriveTime: last.arrival_airport.time,
    /** Whole journey including layovers, in minutes. */
    durationMin: option.total_duration ?? null,
    stops: Math.max(0, legs.length - 1),
    price: typeof option.price === "number" ? option.price : null,
  };
}

function shorten(value) {
  return typeof value === "string" ? value.slice(0, 200) : undefined;
}
