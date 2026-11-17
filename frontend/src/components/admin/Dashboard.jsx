import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Image as ImageIcon, Layout, PlusCircle, Users, Newspaper, Briefcase } from 'lucide-react';
import GalleryManager from './GalleryManager';
import SectionManager from './SectionManager';
import SliderManager from './SliderManager';
import EngagementManager from './EngagementManager';
import NewsManager from './NewsManager';
import LivelihoodManager from './LivelihoodManager';

const Dashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('gallery');

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navItems = [
        { id: 'gallery',     label: 'Gallery Manager',    icon: <ImageIcon size={20} /> },
        { id: 'slider',      label: 'Hero Sliders',       icon: <PlusCircle size={20} /> },
        { id: 'sections',    label: 'Dynamic Sections',   icon: <Layout size={20} /> },
        { id: 'engagement',  label: 'Engagement Cards',   icon: <Users size={20} /> },
        { id: 'news',        label: 'News & Reports',     icon: <Newspaper size={20} /> },
        { id: 'livelihoods', label: 'Livelihood Capitals',icon: <Briefcase size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row mt-[10vh]">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col p-6 shadow-sm">
                <div className="mb-10">
                    <h1 className="text-2xl font-black text-blue-600 tracking-tight">STI-HUB</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Admin Control Area</p>
                </div>

                <nav className="flex-grow space-y-2">
                    {navItems.map(({ id, label, icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                                activeTab === id
                                    ? 'bg-blue-600 text-white font-medium shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {icon}
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                            {user?.username?.charAt(0) || user?.email?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate">{user?.username || user?.email || 'Admin User'}</p>
                            <p className="text-[10px] text-gray-400 font-medium">System Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'gallery' && <GalleryManager />}
                    {activeTab === 'slider' && <SliderManager />}
                    {activeTab === 'sections' && <SectionManager />}
                    {activeTab === 'engagement' && <EngagementManager />}
                    {activeTab === 'news' && <NewsManager />}
                    {activeTab === 'livelihoods' && <LivelihoodManager />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
