
import React from 'react';
import { Linkedin, Instagram, Twitter, Globe } from 'lucide-react';

const SocialMediaLinks = () => (
    <div className="flex items-center justify-center space-x-4 mt-4">
        <a
            href="https://www.linkedin.com/school/vnrvjiethyd/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-500 transition-colors"
            aria-label="LinkedIn"
        >
            <Linkedin size={20} />
        </a>
        <a
            href="https://www.instagram.com/vnrvjiet.hyd/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-pink-500 transition-colors"
            aria-label="Instagram"
        >
            <Instagram size={20} />
        </a>
        <a
            href="https://x.com/vnrvjiethyd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
            aria-label="Twitter"
        >
            <Twitter size={20} />
        </a>
        <a
            href="https://vnrvjiet.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-purple-500 transition-colors"
            aria-label="VNRVJIET Website"
        >
            <Globe size={20} />
        </a>
    </div>
);

export default SocialMediaLinks;
