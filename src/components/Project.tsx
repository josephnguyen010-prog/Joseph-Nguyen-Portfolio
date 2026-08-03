import React from "react";
import mock01 from '../assets/images/mock01.png';
import mock02 from '../assets/images/mock02.png';
import mock03 from '../assets/images/mock03.png';
import mock04 from '../assets/images/mock04.png';
import mock05 from '../assets/images/mock05.png';
import mock06 from '../assets/images/mock06.png';
import mock07 from '../assets/images/mock07.png';
import mock08 from '../assets/images/mock08.png';
import mock09 from '../assets/images/mock09.png';
import mock10 from '../assets/images/mock10.png';
import Reveal from './Reveal';
import '../assets/styles/Project.scss';

interface ProjectItem {
    image: string;
    title: string;
    href: string;
    description: string;
}

/**
 * TODO: these are still the template author's projects, thumbnails included.
 * Replace each entry with your own — the layout, hover states and stagger all
 * come from this one array, so nothing else needs touching.
 */
const projects: ProjectItem[] = [
    {
        image: mock10,
        title: "Filmate AI",
        href: "https://www.filmate.club/",
        description: "Developed movie finder app with semantic search and sentiment analysis using OpenAI GPT-3.5 Turbo, Qdrant, React, and Flask.",
    },
    {
        image: mock09,
        title: "High Speed Chase",
        href: "https://yujisatojr.itch.io/highspeedchase",
        description: "Designed, developed, and launched a 3D multiplayer racing game with C# and Unity. This is available on Itch.io for gamers worldwide to enjoy.",
    },
    {
        image: mock08,
        title: "Astro Raiders",
        href: "https://yujisatojr.itch.io/spacecraft",
        description: "Developed and released a 2D shooting game with C# and Unity. This project is hosted on the Itch.io public marketplace.",
    },
    {
        image: mock07,
        title: "Datum: Integrated Learning Platform",
        href: "https://www.datumlearn.com/",
        description: "This is an online educational platform that provides high-quality, data science-focused learning resources in the Japanese language. I created the entire platform from scratch using Ruby on Rails.",
    },
    {
        image: mock06,
        title: "WeManage: Real Estate Asset Management",
        href: "http://www.wemanage.jp/",
        description: "This mobile application allows realtors in Japan to securely manage their property information and view future income predictions. This app is built with Ruby on Rails and JavaScript.",
    },
    {
        image: mock05,
        title: "COVID-19 Case Management",
        href: "https://www.byuh.edu/covid-19-case-management",
        description: "Built official charts for COVID/vaccination tracking for an educational institution using JavaScript and the Google Sheets API v4. The dashboard served the university's leadership in their decision-making processes.",
    },
    {
        image: mock04,
        title: "Multiple Regression Property Analysis",
        href: "https://github.com/yujisatojr/multi-reg-analysis",
        description: "Analyzed the real estate market in Japan and predicted property prices by implementing statistical methods such as OLS and multi-regression analysis. This project leveraged Python and various libraries such as Pandas, NumPy, Matplotlib, and Scikit-Learn.",
    },
    {
        image: mock03,
        title: "Programs of Study",
        href: "https://holokai.byuh.edu/programs-of-study",
        description: "Designed and developed a custom component for a CMS-based platform (e.g., 'Brightspot') using Java, Handlebars, and LESS. University students can find their majors of interest through this module.",
    },
    {
        image: mock02,
        title: "Transfer Evaluation Matrix",
        href: "https://hookele.byuh.edu/transfer-evaluation-guidelines-and-matrix",
        description: "Created an interactive CSV table generator with Java, Handlebars, and LESS. This project helps transfer students to quickly identify eligible credits.",
    },
    {
        image: mock01,
        title: "Submeowrine",
        href: "https://github.com/yujisatojr/submeowrine",
        description: "Developed and released an Android mobile application using Java and Android Studio that runs a 2D shooting game.",
    },
];

function Project() {
    return(
    <div className="projects-container" id="projects">
        <Reveal><h1>Personal Projects</h1></Reveal>
        <div className="projects-grid">
            {projects.map((project, index) => (
                // Offset by column so the two cards in a row arrive in sequence
                // rather than together.
                <Reveal
                    key={project.title}
                    className="project"
                    delay={(index % 2) * 110}
                    distance={30}
                >
                    <a href={project.href} target="_blank" rel="noreferrer">
                        <img src={project.image} className="zoom" alt="thumbnail" width="100%"/>
                    </a>
                    <a href={project.href} target="_blank" rel="noreferrer">
                        <h2>{project.title}</h2>
                    </a>
                    <p>{project.description}</p>
                </Reveal>
            ))}
        </div>
    </div>
    );
}

export default Project;
