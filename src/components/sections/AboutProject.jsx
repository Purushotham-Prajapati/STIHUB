
import React, { useState } from 'react';
import { Target, Award, Calendar, MapPin, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { logos } from '../../constants/data';

const AboutProject = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [zoom, setZoom] = useState(1);

    const openModal = () => {
        setIsModalOpen(true);
        setZoom(1);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setZoom(1);
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.5, 0.5));
    };

    return (
        <Section id="about" className="py-8">
            <SectionTitle subtitle="Transforming lives through science and technology interventions">
                About The Project
            </SectionTitle>

            <div className="max-w-7xl mx-auto space-y-4">
                {/* Top Row: Project Info & Map */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Project Details */}
                    <AnimatedCard className="lg:col-span-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-5 rounded-xl shadow-sm border border-blue-200/50">
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 ">Project Title</h3>
                                    </div>
                                    <div className="bg-blue-600 p-2 rounded-lg shadow-md hidden sm:block">
                                        <Target className="text-white" size={20} />
                                    </div>
                                </div>

                                <p className="text-gray-700 leading-relaxed text-sm mb-2 md:mb-2">
                                    Science Technology and Innovation Hub for Development of Scheduled Tribe Community in tribal areas of Kowdipally Block, Medak District, Telangana State
                                </p>
                                <div className="inline-flex items-center bg-blue-100 px-3 py-1 rounded-full border border-blue-200 mb-4 md:mb-2">
                                    <span className="text-xs font-bold text-blue-900 mr-2">File No:</span>
                                    <span className="text-xs font-medium text-blue-700">DST/SEED/TSP/STI/2023/956 (G)</span>
                                </div>
                            </div>

                            {/* Compact Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto md:mt-0">
                                <div className=" md:col-span-2 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Award className="text-green-600" size={18} />
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Project Cost</span>
                                    </div>
                                    <p className="text-sm font-bold text-green-700 leading-tight">
                                        ₹ Eighty Six Lakhs Eighty Thousand Nine Hundred and Fifty Four Rupees
                                    </p>
                                </div>

                                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Calendar className="text-purple-600" size={18} />
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Duration</span>
                                    </div>
                                    <p className="text-lg font-bold text-purple-700">3 Years</p>
                                </div>

                            </div>
                        </div>
                    </AnimatedCard>

                    {/* Map Section */}
                    <AnimatedCard className="lg:col-span-4 h-full">
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 h-full cursor-pointer group relative" onClick={openModal}>
                            <div className="relative h-full overflow-hidden rounded-lg shadow-inner min-h-[200px]">
                                <img
                                    src={logos.parea}
                                    alt="Map of the project area in Medak District"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                                {/* Hover Indicator */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white/90 p-2 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                        <Maximize2 className="text-blue-600" size={24} />
                                    </div>
                                </div>

                                <div className="absolute bottom-4 left-4 text-white">
                                    <div className="flex items-center space-x-2 mb-0.5">
                                        <MapPin className="text-red-400" size={16} />
                                        <h3 className="font-bold text-lg text-blue-300">Project Area</h3>
                                    </div>
                                    <p className="text-sm font-medium ml-6">Kowdipally Block</p>
                                    <p className="text-xs text-gray-300 ml-6">Medak District, Telangana</p>
                                </div>
                            </div>
                        </div>
                    </AnimatedCard>
                </div>

                {/* Bottom Row: Objectives */}
                <AnimatedCard delay={100} className="bg-white px-6 py-5 rounded-xl shadow-sm border border-orange-200 w-full">
                    <div className="flex items-center space-x-3 mb-4  md:mb-2 border-b border-orange-100 pb-2 md:pb-0">
                        <MapPin className="text-orange-500" size={24} />
                        <h3 className="text-xl font-bold text-gray-800">Project Objectives</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-0">
                        <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-orange-50/50 transition-colors">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700 text-sm leading-snug">To improve the socio-economic conditions of the target population by strengthening the predominant livelihoods through Science & Technology Interventions</p>
                        </div>
                        <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-orange-50/50 transition-colors">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700 text-sm leading-snug">Skill Development and Capacity Building of target tribal population for strengthening livelihoods</p>
                        </div>
                        <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-orange-50/50 transition-colors">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700 text-sm leading-snug">Creation of social enterprises in backyard poultry and honey bee farming technologies based on livelihood strengths</p>
                        </div>
                        <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-orange-50/50 transition-colors">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700 text-sm leading-snug">To improve the livelihood capitals through Science and Technology Interventions</p>
                        </div>
                    </div>
                </AnimatedCard>

                {/* Map Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-50"
                        >
                            <X size={24} />
                        </button>

                        <div className="relative w-full max-w-5xl h-full max-h-[90vh] flex flex-col items-center">
                            {/* Toolbar */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-50">
                                <button
                                    onClick={handleZoomOut}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                    disabled={zoom <= 0.5}
                                >
                                    <ZoomOut size={20} />
                                </button>
                                <span className="text-xs font-mono text-white/80 min-w-[3ch] text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                    disabled={zoom >= 4}
                                >
                                    <ZoomIn size={20} />
                                </button>
                            </div>

                            {/* Image Container */}
                            <div className="flex-1 w-full flex items-center justify-center overflow-auto p-4 md:p-10 cursor-move">
                                <div
                                    className="relative transition-transform duration-200 ease-out origin-center"
                                    style={{ transform: `scale(${zoom})` }}
                                >
                                    <img
                                        src={logos.parea}
                                        alt="Detailed Map"
                                        className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                                    />
                                </div>
                            </div>

                            {/* Description Footer */}
                            <div className="w-full bg-white/10 backdrop-blur-md border-t border-white/10 p-4 rounded-b-xl md:rounded-xl mt-4 text-center">
                                <div className="flex items-center justify-center space-x-2 text-white mb-1">
                                    <MapPin className="text-blue-400" size={18} />
                                    <h3 className="text-lg font-bold text-blue-400">Project Area Map</h3>
                                </div>
                                <p className="text-gray-300 text-sm">
                                    Detailed view of the STI Hub project area covering 15+ communities in the Kowdipally Block, Medak District.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
};

export default AboutProject;
