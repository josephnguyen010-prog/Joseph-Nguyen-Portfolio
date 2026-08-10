import React from "react";
// JPEG rather than PNG: it is a photographic screenshot, so PNG cost 1.7MB
// against 215KB here for no visible difference.
import netflixCaseStudy from '../assets/images/netflix-case-study.jpg';
// Same reasoning - the device mockup is 878KB as a PNG, 186KB here.
import venus from '../assets/images/venus.jpg';
// Same again - a screenshot of the app itself.
import arrivals from '../assets/images/arrivals.jpg';
import Reveal from './Reveal';
import '../assets/styles/Project.scss';

// Served from public/, so it needs PUBLIC_URL to stay correct under the
// GitHub Pages sub-path - same reason as the resume link in Navigation.
const caseStudyUrl = `${process.env.PUBLIC_URL}/netflix-case-study/`;
// Arrivals routes on the hash, so it survives a refresh under this sub-path.
const arrivalsUrl = `${process.env.PUBLIC_URL}/arrivals/`;

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
        description: "An iOS blind dating app for college students, built and shipped end to end. You get matched anonymously on Monday, trade daily doodles and personality clues through the week, then use a proximity finder on Friday night to find each other at a surprise venue - both check in before anyone sees a face. React, Supabase, and Capacitor, with the Claude API scoring compatibility and writing the clues. Live on the App Store - the link here opens an interactive demo you can walk through in a browser, no signup.",
    },
    {
        image: arrivals,
        title: "Arrivals: Letterboxd for Cities",
        href: arrivalsUrl,
        description: "A place to log the cities you have been to, rate them out of five, and keep a ranking that is built rather than guessed. Give a city the same rating as one you have already logged and it asks which of the two you preferred, then places it by binary search - so an eight-city band costs three questions, not eight. You rate the city but log the trip, because cities get visited a few times a year rather than a hundred, and the MyPassport screen shows every visit in order. React, TypeScript and Vite, with the ranking logic kept as pure functions under test. The link opens the working app - your log saves to your own browser.",
    },
    {
        image: netflixCaseStudy,
        title: "SaaS Subscription Business Analysis",
        href: caseStudyUrl,
        description: "An end-to-end business analysis of Netflix, built as an interactive browse interface instead of a slide deck: pick a profile, then open each chapter for the market position, pricing ladder, regional revenue, content operations, risks, and recommendations. Built from public FY2021-FY2024 reporting.",
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
