
import React from 'react';
// Sections
import Hero from '../components/sections/Hero';
import Gallery from '../components/sections/Gallery';
import AboutProject from '../components/sections/AboutProject';
import CommunityEngagement from '../components/sections/CommunityEngagement';
import LivelihoodCapitals from '../components/sections/LivelihoodCapitals';
import Team from '../components/sections/Team';
import News from '../components/sections/News';
import Contact from '../components/sections/Contact';

const Home = () => {
    return (
        <>
            <Hero />
            <Gallery />
            <AboutProject />
            <CommunityEngagement />
            <LivelihoodCapitals />
            <Team />
            <News />
            <Contact />
        </>
    );
};

export default Home;
