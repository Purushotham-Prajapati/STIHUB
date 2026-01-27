
import React from 'react';

const SectionTitle = ({ children, subtitle }) => (
    <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-4">
            {children}
        </h2>
        {subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
        )}
    </div>
);

export default SectionTitle;
