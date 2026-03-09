
import React from 'react';
import { MapPin, Mail, Building } from 'lucide-react';
import SocialMediaLinks from '../common/SocialMediaLinks';
import { navLinks, logos } from '../../constants/data';

const Footer = () => (
    <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                        <img src={logos.dst} alt="DST Logo" className="h-10 w-10 object-contain rounded-lg" />
                        <h3 className="text-xl font-bold text-white">STI HUB</h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        Empowering communities through science, technology, and innovation initiatives.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                        {navLinks.slice(0, 4).map((link) => (
                            <li key={link.name}>
                                <a href={link.href} className="hover:text-white transition-colors flex items-center space-x-2">
                                    <link.icon size={16} />
                                    <span>{link.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Contact Info</h4>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <MapPin size={16} className="text-blue-400 flex-shrink-0" />
                            <span className="text-sm">Medchal District, Telangana</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Mail size={16} className="text-blue-400 flex-shrink-0" />
                            <span className="text-sm">dststihubvnr@gmail.com</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Building size={16} className="text-blue-400 flex-shrink-0" />
                            <span className="text-sm">VNRVJIET, Hyderabad</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-8 text-center">
                <p className="text-gray-400 mb-4">
                    &copy; {new Date().getFullYear()} STI Hub, VNRVJIET. All Rights Reserved. |
                    <span className="text-blue-400 ml-1">Funded by Vigyan Dhara, DST, Government of India</span>
                </p>
                <SocialMediaLinks />
            </div>
        </div>
    </footer>
);

export default Footer;
