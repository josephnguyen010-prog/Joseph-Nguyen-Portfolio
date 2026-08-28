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
    "Excel",
    "Power Platform",
    "Data Visualization",
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
    "JavaScript",
    "Python",
    "Java",
    "PostgreSQL",
    "HTML",
    "Azure",
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
                    <p>
                        <span className="skill-lead">I'm really good at</span>
                        turning scattered spreadsheets into dashboards people actually open.
                    </p>
                    <div className="flex-chips">
                        {labelsFirst.map((label, index) => (
                            <Chip key={index} className='chip' label={label} />
                        ))}
                    </div>
                </Reveal>

                <Reveal className="skill" delay={120}>
                    <FontAwesomeIcon icon={faDiagramProject} size="3x"/>
                    <h3>Business Analysis &amp; Tech Risk</h3>
                    <p>
                        <span className="skill-lead">Ask me about</span>
                        the step in a process everyone forgot they owned.
                    </p>
                    <div className="flex-chips">
                        {labelsSecond.map((label, index) => (
                            <Chip key={index} className='chip' label={label} />
                        ))}
                    </div>
                </Reveal>

                <Reveal className="skill" delay={240}>
                    <FontAwesomeIcon icon={faCode} size="3x"/>
                    <h3>Product &amp; Engineering</h3>
                    <p>
                        <span className="skill-lead">I'd rather</span>
                        build the thing than write the deck about the thing.
                    </p>
                    <div className="flex-chips">
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
