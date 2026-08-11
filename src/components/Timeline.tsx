import React from "react";
import '@fortawesome/free-regular-svg-icons';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import venusLogo from '../assets/images/logos/venus.png';
import eaLogo from '../assets/images/logos/ea.jpg';
import accentureLogo from '../assets/images/logos/accenture.jpg';
import rsmLogo from '../assets/images/logos/rsm.jpg';
import vtLogo from '../assets/images/logos/virginia-tech.svg';
import '../assets/styles/Timeline.scss';

interface Role {
  title: string;
  org: string;
  location: string;
  date: string;
  blurb: string;
  logo?: string;
  /** Artwork that already has its own background, so it fills the circle. */
  fullBleed?: boolean;
  /** Shown when there is no logo asset available. */
  monogram?: string;
}

const ROLES: Role[] = [
  {
    title: "Founder & CEO",
    org: "Venus",
    location: "Blacksburg, VA",
    date: "January 2026 - Present",
    logo: venusLogo,
    fullBleed: true,
    blurb:
      "Built a college blind dating app around progressive hints, mutual opt-in, and " +
      "GPS-verified check-in. Designed a two-layer matching algorithm scoring compatibility " +
      "across 22 weighted dimensions, on a 20-table Postgres backend with row-level security " +
      "and server-enforced state machines.",
  },
  {
    title: "Tech Risk Consulting Intern",
    org: "RSM US LLP",
    location: "Minneapolis, MN",
    date: "Summer 2026",
    logo: rsmLogo,
    fullBleed: true,
    blurb:
      "Reviewed change management processes across 3 client engagements, documenting how " +
      "system changes are requested, approved, and deployed. Tested 50+ application access " +
      "controls for provisioning and terminated-access exceptions, and documented 6 process " +
      "walkthroughs to map current-state workflows.",
  },
  {
    title: "Digital Solutions Intern",
    org: "RSM US LLP",
    location: "Minneapolis, MN",
    date: "Summer 2025",
    logo: rsmLogo,
    fullBleed: true,
    blurb:
      "Designed 5+ interactive Power BI dashboards that consolidated reporting across teams, " +
      "ran project roadmaps in Miro and Jira, and used the Power Platform, Excel, and SQL to " +
      "clean and integrate data from multiple source systems.",
  },
  {
    title: "Product Management Extern",
    org: "Electronic Arts",
    location: "Remote",
    date: "Winter 2025",
    logo: eaLogo,
    fullBleed: true,
    blurb:
      "Selected 8+ high-impact KPIs to assess core business problems for a strategy RPG mobile " +
      "game, then delivered a data-driven presentation translating those findings into " +
      "feature-level recommendations for gameplay, retention, and product health.",
  },
  {
    title: "Tech Consulting Extern",
    org: "Accenture",
    location: "Remote",
    date: "Spring 2024",
    logo: accentureLogo,
    fullBleed: true,
    blurb:
      "Created structured interview frameworks to capture customer requirements for an online " +
      "voting system, and designed 3 process flows and Tableau dashboards with user stories " +
      "and acceptance criteria for Agile delivery.",
  },
  {
    title: "Undergraduate Teaching Assistant",
    org: "Pamplin Engage",
    location: "Virginia Tech",
    date: "Spring 2024 - Present",
    logo: vtLogo,
    blurb:
      "Supported 2 semesters of Foundations of Business, leading weekly review sessions for " +
      "100+ students, holding 2-3 weekly office hours, and covering course delivery during " +
      "instructor absences.",
  },
];

function Timeline() {
  return (
    <div id="career">
      <div className="items-container">
        <h1>Career</h1>
        <VerticalTimeline>
          {ROLES.map((role, index) => (
            <VerticalTimelineElement
              key={`${role.org}-${role.date}`}
              className="vertical-timeline-element--work"
              contentStyle={index === 0
                ? { background: 'white', color: 'rgb(39, 40, 34)' }
                : undefined}
              contentArrowStyle={index === 0
                ? { borderRight: '7px solid  white' }
                : undefined}
              date={role.date}
              /* No accent ring: the library draws one by default, and several of
                 these logos carry their own brand colour that it clashed with. */
              iconStyle={{ background: '#ffffff', boxShadow: 'none' }}
              icon={
                <span className={`timeline-mark${role.fullBleed ? ' is-full' : ''}`}>
                  {role.logo
                    ? <img src={role.logo} alt={role.org} />
                    : <span className="timeline-monogram">{role.monogram}</span>}
                </span>
              }
            >
              <h3 className="vertical-timeline-element-title">
                {role.title}, {role.org}
              </h3>
              <h4 className="vertical-timeline-element-subtitle">{role.location}</h4>
              <p>{role.blurb}</p>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </div>
  );
}

export default Timeline;
