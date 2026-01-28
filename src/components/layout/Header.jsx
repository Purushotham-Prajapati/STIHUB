
import React, { useState, useEffect } from 'react';
import { Menu, X, Image as ImageIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { navLinks, logos } from '../../constants/data';

// Modify navLinks to include Gallery for the purpose of the menu (temporarily or permanently)
// We need to handle 'Gallery' specially or add it to the list
const navigation = navLinks;

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavigation = (e, href) => {
        setIsMenuOpen(false);

        // If it's the Gallery link
        if (href === '/gallery') {
            e.preventDefault();
            navigate('/gallery');
            return;
        }

        // If it's a hash link (Home sections)
        if (href.startsWith('#')) {
            e.preventDefault();
            if (isHomePage) {
                // Smooth scroll if on home page
                const element = document.querySelector(href);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // Navigate to home then scroll
                navigate('/', { state: { scrollTo: href } });
                // Note: The scrolling logic after navigation needs to be handled in Home or App, 
                // but for simple anchor linking in React Router, simply navigating to '/' usually resets scroll.
                // To support scroll-on-load, we'd need a useEffect in Home. 
                // For this step, standard navigation is fine, handling complex hash-scroll from other pages is a bonus feature.
                // We'll trust the user just wants to go back to Home sections.
                setTimeout(() => {
                    const element = document.getElementById(href.substring(1));
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    };

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || !isHomePage
            ? 'bg-white/95 backdrop-blur-lg shadow-lg py-2'
            : 'bg-white/80 backdrop-blur-md py-4'
            }`}>
            <div className="container mx-auto px-6 md:px-2 max-w-7xl flex items-center justify-between">
                <div className="flex items-center gap-2 justify-center">
                    <a href='https://vnrvjiet.ac.in/' target='_blank' rel="noreferrer"><img src={logos.vnr} alt="VNRVJIET Logo" className="h-14 w-auto object-contain rounded-md" /></a>
                    <Link to="/" className="hidden md:flex border-l border-gray-300 pl-4 h-10 flex-col w-80 justify-center group">
                        <h1 className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight group-hover:text-blue-700 transition-colors">
                            STI HUB
                        </h1>
                        <p className="text-[10px] md:text-xs text-gray-600 font-medium tracking-wide uppercase">
                            SEED, DST – VNR Vignana Jyothi Institute of Engineering and Technology
                        </p>
                    </Link>
                    <img src={logos.dst} alt="DST Logo" className="h-14 w-auto object-contain rounded-md" />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-8">
                    {navigation.map((link) => {
                        const isActive = link.href === location.pathname || (link.href === '#home' && isHomePage && window.scrollY < 100);
                        return (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavigation(e, link.href)}
                                className={`flex items-center space-x-2 transition-all duration-300 font-medium group cursor-pointer ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                <link.icon size={18} className="group-hover:scale-110 transition-transform" />
                                <span>{link.name}</span>
                            </a>
                        );
                    })}
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
                    <div className="absolute top-full left-0 w-full bg-white shadow-xl lg:hidden max-h-[80vh] overflow-y-auto">
                        <nav className="p-6 space-y-4">
                            {navigation.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors py-2"
                                    onClick={(e) => handleNavigation(e, link.href)}
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
