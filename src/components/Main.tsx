import React from "react";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DescriptionIcon from '@mui/icons-material/Description';
import Typewriter from './Typewriter';
import '../assets/styles/Main.scss';
import avatar from '../assets/images/avatar.jpg';

const resumeUrl = `${process.env.PUBLIC_URL}/Joseph_Nguyen_Resume.pdf`;

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
          {/* The visible text cycles, so the heading carries a stable label for
              screen readers and search engines. */}
          <h1 aria-label="Joseph Nguyen">
            <Typewriter
              phrases={["Hey my name is Joseph Nguyen", "Welcome to my portfolio"]}
              start={started}
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