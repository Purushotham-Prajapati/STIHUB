
import React from 'react';

const Section = ({ id, children, className = '' }) => (
    <section id={id} className={`py-8 md:py-6 w-[100vw]  ${className}`}>
        <div className="container mx-auto px-6 md:px-12 lg:px-6 max-w-[100vw]">
            {children}
        </div>
    </section>
);

export default Section;
