import React from "react";
import '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import '../assets/styles/Timeline.scss'

function Timeline() {
  return (
    <div id="history">
      <div className="items-container">
        <h1>Career History</h1>
        <VerticalTimeline>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            contentStyle={{ background: 'white', color: 'rgb(39, 40, 34)' }}
            contentArrowStyle={{ borderRight: '7px solid  white' }}
            date="January 2026 - Present"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faBriefcase} />}
          >
            <h3 className="vertical-timeline-element-title">Founder &amp; CEO — Venus</h3>
            <h4 className="vertical-timeline-element-subtitle">Blacksburg, VA</h4>
            <p>
              Built a college blind dating app around progressive hints, mutual opt-in, and
              GPS-verified check-in. Designed a two-layer matching algorithm scoring compatibility
              across 22 weighted dimensions, on a 20-table Postgres backend with row-level security
              and server-enforced state machines.
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            date="Summer 2026"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faBriefcase} />}
          >
            <h3 className="vertical-timeline-element-title">Tech Risk Consulting Intern — RSM US LLP</h3>
            <h4 className="vertical-timeline-element-subtitle">Minneapolis, MN</h4>
            <p>
              Supported the AI governance team across client engagements, tested 50+ application
              access controls for provisioning and terminated-access exceptions, and documented
              6 process walkthroughs to map current-state workflows.
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            date="Summer 2025"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faBriefcase} />}
          >
            <h3 className="vertical-timeline-element-title">Digital Solutions Intern — RSM US LLP</h3>
            <h4 className="vertical-timeline-element-subtitle">Minneapolis, MN</h4>
            <p>
              Designed 5+ interactive Power BI dashboards that consolidated reporting across teams,
              ran project roadmaps in Miro and Jira, and used the Power Platform, Excel, and SQL to
              clean and integrate data from multiple source systems.
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            date="Winter 2025"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faBriefcase} />}
          >
            <h3 className="vertical-timeline-element-title">Product Management Extern — Electronic Arts</h3>
            <h4 className="vertical-timeline-element-subtitle">Remote</h4>
            <p>
              Selected 8+ high-impact KPIs to assess core business problems for a strategy RPG mobile
              game, then delivered a data-driven presentation translating those findings into
              feature-level recommendations for gameplay, retention, and product health.
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            date="Spring 2024"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faBriefcase} />}
          >
            <h3 className="vertical-timeline-element-title">Tech Consulting Extern — Accenture</h3>
            <h4 className="vertical-timeline-element-subtitle">Remote</h4>
            <p>
              Created structured interview frameworks to capture customer requirements for an online
              voting system, and designed 3 process flows and Tableau dashboards with user stories
              and acceptance criteria for Agile delivery.
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            date="Spring 2024 - Present"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faBriefcase} />}
          >
            <h3 className="vertical-timeline-element-title">Undergraduate Teaching Assistant — Pamplin Engage</h3>
            <h4 className="vertical-timeline-element-subtitle">Virginia Tech</h4>
            <p>
              Supported 2 semesters of Foundations of Business, leading weekly review sessions for
              100+ students, holding 2-3 weekly office hours, and covering course delivery during
              instructor absences.
            </p>
          </VerticalTimelineElement>
          <VerticalTimelineElement
            className="vertical-timeline-element--work"
            date="2023 - 2027"
            iconStyle={{ background: '#5000ca', color: 'rgb(39, 40, 34)' }}
            icon={<FontAwesomeIcon icon={faGraduationCap} />}
          >
            <h3 className="vertical-timeline-element-title">B.B.A. Business Information Technology</h3>
            <h4 className="vertical-timeline-element-subtitle">Virginia Tech — Blacksburg, VA</h4>
            <p>
              Concentration in Decision Support Systems. GPA 3.7/4.0. 1st place, RSM Capstone Case
              Study Competition (out of 100 interns); RSM Excellence Academy Scholar; Pamplin Inspire
              Excellence Scholarship.
            </p>
          </VerticalTimelineElement>
        </VerticalTimeline>
      </div>
    </div>
  );
}

export default Timeline;
