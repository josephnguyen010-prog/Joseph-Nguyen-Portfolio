import React from "react";
// JPEG rather than PNG: it is a photographic screenshot, so PNG cost 1.7MB
// against 215KB here for no visible difference.
import netflixCaseStudy from '../assets/images/netflix-case-study.jpg';
// Same reasoning - the device mockup is 878KB as a PNG, 186KB here.
import venus from '../assets/images/venus.jpg';
// Same again - a screenshot of the app itself.
import arrivals from '../assets/images/arrivals.jpg';
import jjk from '../assets/images/jjk.jpg';
import Reveal from './Reveal';
import '../assets/styles/Project.scss';

// Served from public/, so it needs PUBLIC_URL to stay correct under the
// GitHub Pages sub-path - same reason as the resume link in Navigation.
const caseStudyUrl = `${process.env.PUBLIC_URL}/netflix-case-study/`;
// Arrivals routes on the hash, so it survives a refresh under this sub-path.
const arrivalsUrl = `${process.env.PUBLIC_URL}/arrivals/`;
// A static page in public/, rebuilt from the jjk-hand-signs repo by build_web.py.
const handSignsUrl = `${process.env.PUBLIC_URL}/jjk/`;

interface ProjectItem {
    image: string;
    title: string;
    href: string;
    description: string;
}

// The layout, hover states and stagger all come from this one array, so adding
// a project means adding an entry here and nothing else.
const projects: ProjectItem[] = [
    {
        image: venus,
        title: "Venus: Blind Dating - Gamified",
        href: "https://joinvenusapp.com",
        description: "An iOS blind dating app for college students, built and shipped end to end. You match anonymously on Monday, trade doodles and clues through the week, then find each other at a surprise venue on Friday night - nobody sees a face until both people check in. React, Supabase and Capacitor, with the Claude API scoring compatibility; the link opens an interactive demo, no signup.",
    },
    {
        image: arrivals,
        title: "Arrivals: Letterboxd for Cities",
        href: arrivalsUrl,
        description: "Log the cities you have been to and rate them out of five. Ties are settled by asking which one you preferred, so a new city lands by binary search - three questions for an eight-city band, not eight. React, TypeScript and Vite; the link opens the working app.",
    },
    {
        image: jjk,
        title: "Jujutsu Kaisen Computer Vision Project",
        href: handSignsUrl,
        description: "Throw one of five anime hand signs at your webcam and it names the character. Machine learning end to end: a neural network trained on 3,000 samples I recorded and labelled myself, scoring 95% on held-out sessions where a random split would have flattered it to 100%. Runs in the browser; no video leaves the tab.",
    },
    {
        image: netflixCaseStudy,
        title: "SaaS Subscription Business Analysis",
        href: caseStudyUrl,
        description: "An end-to-end business analysis of Netflix, built as a browse interface instead of a slide deck - pick a profile, then open a chapter for market position, pricing, regional revenue, content operations, risks and recommendations. Built from public FY2021-FY2024 reporting.",
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
