import React, {useState, useEffect} from "react";
import {
  Main,
  Timeline,
  Education,
  Expertise,
  Project,
  About,
  DoodleGame,
  Contact,
  Navigation,
  Footer,
} from "./components";
import FadeIn from './components/FadeIn';
import Reveal from './components/Reveal';
import LoadingScreen from './components/LoadingScreen';
import './index.scss';

function App() {
    const [mode, setMode] = useState<string>('dark');
    const [loading, setLoading] = useState<boolean>(true);

    const handleModeChange = () => {
        if (mode === 'dark') {
            setMode('light');
        } else {
            setMode('dark');
        }
    }

    useEffect(() => {
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
      }, []);

    return (
    <>
    {loading && <LoadingScreen onFinish={() => setLoading(false)}/>}
    {/* `is-loaded` holds the hero entrance animations back until the splash is
        gone, so they aren't spent behind it. */}
    <div className={`main-container ${mode === 'dark' ? 'dark-mode' : 'light-mode'}${loading ? '' : ' is-loaded'}`}>
        <Navigation parentToChild={{mode}} modeChange={handleModeChange}/>
        {/* The hero is above the fold, so it animates as soon as the splash
            clears. Everything below waits until it is scrolled into view. */}
        <FadeIn transitionDuration={700} visible={!loading}>
            <Main started={!loading}/>
        </FadeIn>
        {/* About, Education and Expertise stagger their own children, so they
            must NOT be wrapped again here - a parent Reveal sits at opacity 0
            while the children's observers fire anyway, spending the whole
            stagger invisibly. Only sections that animate as one block are
            wrapped. */}
        <About/>
        <Education/>
        <Reveal><Timeline/></Reveal>
        <Expertise/>
        <Project/>
        {/* Not wrapped in Reveal: it is interactive and a nav target, so it
            should be ready the moment you arrive. */}
        <DoodleGame mode={mode}/>
        {/* Deliberately not wrapped: it is the jump target for the nav, and
            animating a section you have just scrolled to lands you on blank
            space that then slides in under you. */}
        <Contact/>
        <Footer />
    </div>
    </>
    );
}

export default App;