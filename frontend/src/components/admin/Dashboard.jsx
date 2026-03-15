import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Image as ImageIcon, Layout, PlusCircle } from 'lucide-react';
import GalleryManager from './GalleryManager';
import SectionManager from './SectionManager';
import SliderManager from './SliderManager';

const Dashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('gallery');

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        STI Hub Admin <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{user?.email}</span>
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-md hover:bg-red-50"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-6">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('gallery')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${activeTab === 'gallery' ? 'bg-blue-600 text-white font-medium shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <ImageIcon size={20} />
                            Gallery Manager
                        </button>
                        <button
                            onClick={() => setActiveTab('slider')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${activeTab === 'slider' ? 'bg-blue-600 text-white font-medium shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <PlusCircle size={20} />
                            Slider Management
                        </button>
                        <button
                            onClick={() => setActiveTab('sections')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${activeTab === 'sections' ? 'bg-blue-600 text-white font-medium shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Layout size={20} />
                            Dynamic Sections
                        </button>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
                    {activeTab === 'gallery' && <GalleryManager />}
                    {activeTab === 'slider' && <SliderManager />}
                    {activeTab === 'sections' && <SectionManager />}
                </div>


            </div>
        </div>
    );
};

export default Dashboard;
