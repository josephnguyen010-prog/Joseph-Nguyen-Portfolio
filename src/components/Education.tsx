import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faTrophy } from '@fortawesome/free-solid-svg-icons';
import Chip from '@mui/material/Chip';
import Reveal from './Reveal';
import '../assets/styles/Education.scss';

const coursework = [
    "Decision Support Systems",
    "Database Management",
    "Business Analytics",
    "Process Modeling",
    "Systems Analysis & Design",
];

const awards = [
    {
        title: "1st Place — RSM Capstone Case Study Competition",
        detail: "Out of 100 interns",
    },
    {
        title: "RSM Excellence Academy Scholar",
        detail: "Selected participant",
    },
    {
        title: "Pamplin Inspire Excellence Scholarship",
        detail: "Virginia Tech",
    },
    {
        title: "Pamplin Multicultural Diversity Council",
        detail: "Selected case study participant",
    },
];

function Education() {
    return (
        <div className="container" id="education">
            <div className="education-container">
                <Reveal><h1>Education</h1></Reveal>

                <Reveal className="education-card" distance={30}>
                    <div className="education-header">
                        <span className="education-icon">
                            <FontAwesomeIcon icon={faGraduationCap} size="2x"/>
                        </span>
                        <div className="education-heading">
                            <h2>Virginia Tech</h2>
                            <p className="education-meta">Blacksburg, VA &nbsp;·&nbsp; 2023 – 2027</p>
                        </div>
                        <span className="education-gpa">GPA 3.7 / 4.0</span>
                    </div>

                    <p className="education-degree">
                        Bachelor of Business Administration, Business Information Technology
                    </p>
                    <p className="education-concentration">
                        Concentration in Decision Support Systems
                    </p>

                    <div className="education-coursework">
                        <span className="chip-title">Focus areas:</span>
                        {coursework.map((label, index) => (
                            <Chip key={index} className="chip" label={label} />
                        ))}
                    </div>
                </Reveal>

                <h3 className="awards-heading">Honors &amp; Awards</h3>
                <div className="awards-grid">
                    {awards.map((award, index) => (
                        <Reveal
                            key={award.title}
                            className="award"
                            delay={index * 90}
                            distance={26}
                        >
                            <FontAwesomeIcon icon={faTrophy} />
                            <div>
                                <p className="award-title">{award.title}</p>
                                <p className="award-detail">{award.detail}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Education;
