
import {
    Building, FileText, Target, Users, Mail, Award, Calendar, Lightbulb,
    ImageIcon
} from 'lucide-react';

// Import images
import dstLogo from '../assets/dst.jpg';
import vnrLogo from '../assets/vnr.png';
import pareaImg from '../assets/parea.jpg';
import vnrpng from '../assets/vnr-logo.png';

// Gallery Images
import gallery1 from '../assets/gallery-1.jpg';
import gallery2 from '../assets/gallery-2.jpg';
import gallery3 from '../assets/gallery-3.jpg';
import gallery4 from '../assets/gallery-4.jpg';
import gallery5 from '../assets/team.jpeg';
import gallery6 from '../assets/core.jpeg';
import gallery7 from '../assets/gallery-5.jpg';
import gallery8 from '../assets/gallery-6.jpg';
import gallery9 from '../assets/gallery-7.jpg';

// Community Engagement Icons
import communityIcon from '../assets/community.png';
import educationIcon from '../assets/education.png';
import skillBasedIcon from '../assets/skillBased.png';
import innovationIcon from '../assets/innovation.png';

// Livelihood Capitals Images
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import img4 from '../assets/img4.jpg';

export const logos = {
    dst: dstLogo,
    vnr: vnrLogo,
    parea: pareaImg,
    vnrpng: vnrpng
};

export const navLinks = [
    { name: 'Home', href: '#home', icon: Building },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon },
    { name: 'About', href: '#about', icon: FileText },
    { name: 'Team', href: '#team', icon: Users },
    { name: 'Contact', href: '#contact', icon: Mail },
];

export const galleryImages = [gallery1, gallery5, gallery6, gallery2, gallery3, gallery4, gallery9, gallery7, gallery8];

export const engagementOutcomes = [
    {
        icon: communityIcon,
        title: 'Common Facility Centre',
        description: 'Empowering the village through collaboration @Tuniki Village',
        bgGradient: 'from-blue-500 to-purple-600',
        stats: '5+ Centers'
    },
    {
        icon: educationIcon,
        title: 'Awareness Programs',
        description: 'Fostering knowledge and participation',
        bgGradient: 'from-green-500 to-teal-600',
        stats: '200+ Participants'
    },
    {
        icon: skillBasedIcon,
        title: 'Skill Based Training',
        description: 'Building capacity for sustainable growth',
        bgGradient: 'from-red-500 to-pink-600',
        stats: '150+ Trained'
    },
    {
        icon: innovationIcon,
        title: 'Technology Interventions',
        description: 'Integrating innovation with tradition',
        bgGradient: 'from-orange-500 to-yellow-600',
        stats: '10+ Technologies'
    },
];

export const livelihoodCapitals = [
    { image: img1, title: 'Backyard Poultry', description: 'Sustainable poultry farming for rural communities' },
    { image: img2, title: 'Feed and Fodder', description: 'Quality nutrition for livestock development' },
    { image: img3, title: 'Honey Bee Farming', description: 'Sweet success through bee cultivation' },
    { image: img4, title: 'TKS - Seed Bank', description: 'Preserving traditional knowledge and seeds' },
];

export const teamMembers = {
    coInvestigators: [
        { name: 'Dr. Alapati Mallika', role: 'Professor, Dept. of Civil Engineering, VNRVJIET', avatar: '👩‍🔬' },
        { name: 'Dr. Padmavathi Papolu', role: 'Assistant Professor, Chemistry, VNRVJIET', avatar: '👩‍🔬' },
        { name: 'Dr. K Anuradha', role: 'Professor of EEE, VNRVJIET', avatar: '👩‍🔬' },
        { name: 'Dr. Myneni Madhu Bala', role: 'Professor of CSE, VNRVJIET', avatar: '👩‍🔬' },
        { name: 'Dr. B. Ashok', role: 'Sr. Assistant Professor of Physics, VNRVJIET', avatar: '👨‍🔬' },
        { name: 'Dr. B. Prathyusha', role: 'Assistant Professor of MBA, VNRVJIET', avatar: '👩‍🔬' },
        { name: 'Mr. K. Veerendra Gopi', role: 'Assistant Professor, CE, VNRVJIET', avatar: '👨‍🔬' },
        { name: 'Mr. R. Ramu', role: 'Assistant Professor, AE, VNRVJIET', avatar: '👨‍🔬' },
        { name: 'Dr. D. Ramesh Reddy', role: 'Assistant Professor, ECE, VNRVJIET', avatar: '👨‍🔬' },
        { name: 'Mr. D. Mahesh', role: 'DRNVJIRD (Collaborative Institution)', avatar: '👨‍🔬' },
        { name: 'Ms. P. Keerthi', role: 'DRNVJIRD (Collaborative Institution)', avatar: '👩‍🔬' },
        { name: 'Dr. Dattesh Tamatam', role: 'Project Associate CE,VNRVJIET', avatar: '👨‍🔬' },
        { name: 'Mr. Thota Rakesh', role: 'Field Assistant CE,VNRVJIET', avatar: '👩‍🔬' },
        { name: 'Mr. Thangellapally Ramakrishna', role: 'Field Worker CE,VNRVJIET', avatar: '👨‍🔬' },

    ],
};

export const newsItems = [
    {
        title: 'Recruitment Notification for Project Staff (Adv No. DST-STI H/01)',
        date: 'July 2023',
        href: 'adv-man-power.pdf',
        category: 'Recruitment',
        excerpt: 'New positions available for project staff members.',
        link: 'https://drive.google.com/file/d/1jX9uzYPBke7T8fNhIlMM4xA3RnHaSBec/view?usp=sharing',
        target: '_blank'
    },
    {
        title: 'Launch of Science, Technology, and Innovation Hub',
        date: 'September 2023',
        href: '#',
        category: 'Launch',
        excerpt: 'Official inauguration of the STI Hub project.',
        link: '#team',
        target: ''
    },
    {
        title: 'Community Outreach in Kowdipally Block',
        date: 'November 2023',
        href: '#',
        category: 'Outreach',
        excerpt: 'Successful community engagement program completed.',
        link: '#team',
        target: ''
    },
];

export const projectStats = [
    { label: 'Project Cost', value: '₹ 86.8 Lakhs', icon: Award },
    { label: 'Duration', value: '3 Years', icon: Calendar },
    { label: 'Communities', value: '15+', icon: Users },
    { label: 'Technologies', value: '10+', icon: Lightbulb },
];
