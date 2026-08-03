import React from "react";
import '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faDiagramProject, faCode } from '@fortawesome/free-solid-svg-icons';
import Chip from '@mui/material/Chip';
import Reveal from './Reveal';
import '../assets/styles/Expertise.scss';

const labelsFirst = [
    "Power BI",
    "Tableau",
    "SQL",
    "Python",
    "MS Excel",
    "VBA",
    "Power Platform",
    "KPI Design",
];

const labelsSecond = [
    "Process Mapping",
    "Requirements Gathering",
    "Risk Assessments",
    "Access Controls",
    "AI Governance",
    "Agile",
    "Jira",
    "Miro",
];

const labelsThird = [
    "React",
    "TypeScript",
    "JavaScript",
    "Java",
    "Python",
    "PostgreSQL",
    "HTML",
    "Git",
];

function Expertise() {
    return (
    <div className="container" id="skills">
        <div className="skills-container">
            <Reveal><h1>Skills</h1></Reveal>
            <div className="skills-grid">
                <Reveal className="skill" delay={0}>
                    <FontAwesomeIcon icon={faChartColumn} size="3x"/>
                    <h3>Data &amp; Analytics</h3>
                    <p>I turn scattered source data into reporting people actually use. At RSM I built interactive Power BI dashboards that replaced manual report assembly across multiple teams, and I use SQL, Python, and Excel to clean and integrate data end to end.</p>
                    <div className="flex-chips">
                        <span className="chip-title">Tech stack:</span>
                        {labelsFirst.map((label, index) => (
                            <Chip key={index} className='chip' label={label} />
                        ))}
                    </div>
                </Reveal>

                <Reveal className="skill" delay={120}>
                    <FontAwesomeIcon icon={faDiagramProject} size="3x"/>
                    <h3>Business Analysis &amp; Tech Risk</h3>
                    <p>I map how a business actually works and find where it breaks. I've run process walkthroughs with client owners, tested application access controls against approved listings, and supported AI governance work on regulatory and compliance considerations.</p>
                    <div className="flex-chips">
                        <span className="chip-title">Tech stack:</span>
                        {labelsSecond.map((label, index) => (
                            <Chip key={index} className='chip' label={label} />
                        ))}
                    </div>
                </Reveal>

                <Reveal className="skill" delay={240}>
                    <FontAwesomeIcon icon={faCode} size="3x"/>
                    <h3>Product &amp; Engineering</h3>
                    <p>I build the things I design. As founder of Venus I architected a 20-table Postgres backend with row-level security and server-enforced state machines, and engineered a two-layer matching algorithm scoring compatibility across 22 weighted dimensions.</p>
                    <div className="flex-chips">
                        <span className="chip-title">Tech stack:</span>
                        {labelsThird.map((label, index) => (
                            <Chip key={index} className='chip' label={label} />
                        ))}
                    </div>
                </Reveal>
            </div>
        </div>
    </div>
    );
}

export default Expertise;
