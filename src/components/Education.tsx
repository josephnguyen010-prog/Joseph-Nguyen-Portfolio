import React from "react";
import Reveal from './Reveal';
import vtLogo from '../assets/images/logos/virginia-tech.svg';
import '../assets/styles/Education.scss';

function Education() {
    return (
        <div className="container" id="education">
            <div className="education-container">
                <Reveal><h1>Education</h1></Reveal>

                <Reveal className="education-card" distance={30}>
                    <div className="education-header">
                        <span className="education-icon">
                            <img src={vtLogo} alt="Virginia Tech" />
                        </span>
                        <div className="education-heading">
                            <h2>
                                <span
                                    className="egg"
                                    data-egg="Go Hokies! 🦃"
                                    tabIndex={0}
                                >
                                    Virginia Tech
                                </span>
                            </h2>
                            <p className="education-meta">Blacksburg, VA &nbsp;·&nbsp; 2023 - 2027</p>
                        </div>
                        <span
                            className="education-gpa egg"
                            data-egg="Yeah, it could be higher. But who's really trying these days?"
                            tabIndex={0}
                        >
                            GPA 3.7 / 4.0
                        </span>
                    </div>

                    <p className="education-degree">
                        Bachelor of Business Administration, Business Information Technology
                    </p>
                    <p className="education-concentration">
                        Concentration in Decision Support Systems
                    </p>
                </Reveal>
            </div>
        </div>
    );
}

export default Education;
