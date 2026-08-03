import React, {useState, useEffect} from "react";
import {
  Main,
  Timeline,
  Education,
  Expertise,
  Project,
  Gallery,
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
        {/* Education, Expertise and Gallery stagger their own children, so they
            must NOT be wrapped again here — a parent Reveal sits at opacity 0
            while the children's observers fire anyway, spending the whole
            stagger invisibly. Only sections that animate as one block are
            wrapped. */}
        <Education/>
        <Reveal><Timeline/></Reveal>
        <Expertise/>
        <Project/>
        <Gallery/>
        <Reveal><Contact/></Reveal>
        <Footer />
    </div>
    </>
    );
}

export default App;