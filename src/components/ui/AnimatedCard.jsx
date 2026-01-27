
import React from 'react';

const AnimatedCard = ({ children, className = '', delay = 0 }) => (
    <div
        className={`transform transition-all duration-700 hover:scale-102 ${className}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        {children}
    </div>
);

export default AnimatedCard;
