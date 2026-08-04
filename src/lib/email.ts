import emailjs from '@emailjs/browser';

/**
 * Every EmailJS call on the site goes through here, so the credentials and the
 * "is this even set up?" check live in one place rather than being re-derived
 * per component.
 *
 * Read at build time. CRA inlines these into the bundle, so they are public by
 * design — EmailJS issues a publishable key precisely for browser use. The
 * public key is not the thing protecting your quota; the domain allowlist in
 * the EmailJS dashboard is. Turn that on.
 */
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const CONTACT_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;

/**
 * Optional second template, worth making because it can render the drawing
 * inline with `<img src="{{image_url}}">` instead of just linking it. Without
 * one we fall back to the contact template, which still receives the link
 * inside {{message}} — so the doodle send works the moment the contact form
 * does, and improves if you add the dedicated template later.
 */
const DOODLE_TEMPLATE_ID =
  process.env.REACT_APP_EMAILJS_DOODLE_TEMPLATE_ID || CONTACT_TEMPLATE_ID;

export const EMAIL = 'joseph.nguyen010@gmail.com';

/** False until all three values are present. Callers use this to avoid
 *  pretending to send when nothing is wired up. */
export const isEmailConfigured = Boolean(SERVICE_ID && CONTACT_TEMPLATE_ID && PUBLIC_KEY);

const send = (templateId: string, params: Record<string, string>) =>
  emailjs.send(SERVICE_ID as string, templateId, params, {
    publicKey: PUBLIC_KEY as string,
  });

/** Deliberately loose. This is not validating the visitor's input — the form
 *  asks for "Email / Phone" and a phone number is a perfectly good answer. It
 *  only decides whether the value is safe to hand to Reply-To. */
const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * `reply_to` exists separately from `email` because the template's Reply-To
 * header cannot take a phone number: EmailJS rejects the whole send when that
 * field is not a valid address, which would fail every visitor who gave a
 * number instead. So Reply-To gets a guaranteed-valid address and the body
 * keeps {{email}} — whatever they actually typed — either way.
 */
export const sendContactMessage = (fields: {
  name: string;
  email: string;
  message: string;
}) =>
  send(CONTACT_TEMPLATE_ID as string, {
    ...fields,
    reply_to: looksLikeEmail(fields.email.trim()) ? fields.email.trim() : EMAIL,
  });

/**
 * The doodle mail. `name`/`email`/`message` are populated as well as the
 * doodle-specific fields so that the contact template renders something
 * sensible when no dedicated template exists.
 *
 * The doodle form deliberately does not ask for the sender's address, so both
 * `email` and `reply_to` fall back to my own rather than being left blank —
 * EmailJS rejects the send outright when Reply-To resolves to an empty string.
 * A reply therefore lands back with me, which is the honest outcome for an
 * anonymous drawing.
 */
export const sendDoodle = (fields: {
  name: string;
  note: string;
  prompt: string;
  imageUrl: string;
}) => {
  const { name, note, prompt, imageUrl } = fields;
  const message =
    `${name} drew "${prompt}".\n\n` +
    (note ? `They said: ${note}\n\n` : '') +
    `See it: ${imageUrl}`;

  return send(DOODLE_TEMPLATE_ID as string, {
    name,
    email: EMAIL,
    reply_to: EMAIL,
    message,
    note,
    prompt,
    image_url: imageUrl,
  });
};
