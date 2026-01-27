
import React from 'react';

const Section = ({ id, children, className = '' }) => (
    <section id={id} className={`py-6 ${className}`}>
        <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl">
            {children}
        </div>
    </section>
);

export default Section;
