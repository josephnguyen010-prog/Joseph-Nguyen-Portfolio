import React from "react";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DescriptionIcon from '@mui/icons-material/Description';
import Typewriter from './Typewriter';
import '../assets/styles/Main.scss';
import avatar from '../assets/images/avatar.jpg';

const resumeUrl = `${process.env.PUBLIC_URL}/Joseph_Nguyen_Resume.pdf`;

/** Rotated so the greeting is different each time the hero comes back around. */
const GREETINGS = ["Hi there!", "Howdy!", "What's up!", "How's it going?"];

/**
 * Two stanzas per cycle: the greeting and the name share the screen, one line
 * above the other, then both clear and the welcome arrives on its own. One pass
 * through this array is four cycles, each opening differently.
 *
 * Built once at module scope rather than inline in the JSX: Typewriter keys its
 * timer effect on this array, so a fresh one on every render would tear the
 * pending timer down and rebuild it on each typed character.
 */
const HERO_STANZAS = GREETINGS.flatMap((greeting) => [
  [greeting, "I'm Joseph Nguyen"],
  ["Welcome to my personal portfolio"],
]);

interface Props {
  /** False while the loading splash is still up. */
  started?: boolean;
}

function Main({ started = true }: Props) {

  return (
    <div className="container">
      <div className="about-section">
        <div className="image-wrapper">
          <img src={avatar} alt="Avatar" />
        </div>
        <div className="content">
          <div className="social_icons">
            <a href="https://github.com/josephnguyen010-prog" target="_blank" rel="noreferrer"><GitHubIcon/></a>
            <a href="https://www.linkedin.com/in/josephnguyen2005" target="_blank" rel="noreferrer"><LinkedInIcon/></a>
          </div>
          {/* The visible text animates, so the heading carries a stable label
              for screen readers and search engines. */}
          <h1 aria-label="Joseph Nguyen">
            {/* Loops, so the greeting keeps changing for anyone who stays on
                the page. Reduced motion gets the whole thought at once instead,
                since a greeting on its own says nothing. */}
            <Typewriter
              stanzas={HERO_STANZAS}
              start={started}
              typeSpeed={110}
              holdBetweenLines={1500}
              holdAfterType={2600}
              fitLines
              staticLines={["Hi there!", "I'm Joseph Nguyen"]}
            />
          </h1>
              

          <div className="mobile_social_icons">
            <a href="https://github.com/josephnguyen010-prog" target="_blank" rel="noreferrer"><GitHubIcon/></a>
            <a href="https://www.linkedin.com/in/josephnguyen2005" target="_blank" rel="noreferrer"><LinkedInIcon/></a>
          </div>

          {/* The visible label swaps on hover, so the accessible name is set
              explicitly here and both labels are hidden from assistive tech. */}
          <a
            className="resume-button"
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="View my resume (PDF)"
          >
            <DescriptionIcon aria-hidden="true"/>
            <span className="resume-label">
              <span className="resume-label-rest" aria-hidden="true">Recruiter? Start here</span>
              <span className="resume-label-hover" aria-hidden="true">View Resume</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Main;