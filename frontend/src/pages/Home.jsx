
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

import SEO from '../components/seo/SEO';

const Home = () => {
    const homeSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "STIHUB VNRVJIET",
        "url": "https://stihub-vnrvjiet.in",
        "logo": "https://stihub-vnrvjiet.in/favicon.png",
        "description": "Science Technology and Innovation Hub at VNRVJIET for sustainable development.",
        "contactPoint": {
            "@type": "ContactPoint",
            "email": "dststihubvnr@gmail.com",
            "contactType": "customer service"
        }
    };

    return (
        <>
            <SEO
                title="Home"
                description="Empowering communities through Science, Technology, and Innovation at STIHUB VNRVJIET. Explore our initiatives and impact."
                schema={homeSchema}
            />
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
