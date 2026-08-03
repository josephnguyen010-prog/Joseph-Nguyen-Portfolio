import React from "react";
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import '../assets/styles/Footer.scss'

function Footer() {
  return (
    <footer>
      <div>
        <a href="https://github.com/josephnguyen010-prog" target="_blank" rel="noreferrer"><GitHubIcon/></a>
        <a href="https://www.linkedin.com/in/josephnguyen2005" target="_blank" rel="noreferrer"><LinkedInIcon/></a>
      </div>
      <p>Built by Joseph Nguyen with 💜 — from a <a href="https://github.com/yujisatojr/react-portfolio-template" target="_blank" rel="noreferrer">template by Yuji Sato</a></p>
    </footer>
  );
}

export default Footer;