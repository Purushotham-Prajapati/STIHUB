
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { navLinks, logos } from '../../constants/data';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed  top-0 w-full z-50 transition-all duration-300 ${isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg py-2'
            : 'bg-white/80 backdrop-blur-md py-4'
            }`}>
            <div className="container mx-auto px-6 md:px-2 max-w-7xl flex items-center justify-between">
                <div className="flex items-center gap-2 justify-center">
                    <a href='https://vnrvjiet.ac.in/' target='_blank' rel="noreferrer"><img src={logos.vnr} alt="VNRVJIET Logo" className="h-14 w-auto object-contain rounded-md" /></a>
                    <div className="hidden md:flex border-l border-gray-300 pl-4 h-10 flex-col w-80 justify-center">
                        <h1 className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight">
                            STI HUB
                        </h1>
                        <p className="text-[10px] md:text-xs text-gray-600 font-medium tracking-wide uppercase">
                            SEED, DST – VNR Vignana Jyothi Institute of Engineering and Technology
                        </p>
                    </div>
                    <img src={logos.dst} alt="DST Logo" className="h-14 w-auto object-contain rounded-md" />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium group"
                        >
                            <link.icon size={18} className="group-hover:scale-110 transition-transform" />
                            <span>{link.name}</span>
                        </a>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white shadow-xl lg:hidden">
                        <nav className="p-6 space-y-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <link.icon size={20} />
                                    <span className="font-medium">{link.name}</span>
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
