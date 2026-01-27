
import React from 'react';
import { Target, Award, Calendar, MapPin } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { logos } from '../../constants/data';

const AboutProject = () => (
    <Section id="about">
        <SectionTitle subtitle="Transforming lives through science and technology interventions">
            About The Project
        </SectionTitle>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
            <div className="xl:col-span-2 space-y-8">
                <AnimatedCard className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-3xl shadow-xl border border-blue-100">
                    <div className="flex items-start space-x-4 mb-6">
                        <div className="bg-blue-600 p-3 rounded-2xl">
                            <Target className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Project Title</h3>
                            <p className="text-blue-600 text-sm font-medium mb-4">DST/SEED/TSP/STI/2023/956 (G)</p>
                        </div>
                    </div>

                    <p className=" font-semibold text-blue-700 leading-relaxed text-lg mb-8">
                        Science Technology and Innovation Hub for Development of Scheduled Tribe Community in tribal areas of
                        <span className="font-semibold text-blue-700"> Kowdipally Block, Medak District, Telangana State</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
                            <div className="flex items-center space-x-3 mb-3">
                                <Award className="text-green-600" size={24} />
                                <h4 className="text-xl font-bold text-gray-800">Project Cost</h4>
                            </div>
                            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                ₹86.8 Lakhs
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
                            <div className="flex items-center space-x-3 mb-3">
                                <Calendar className="text-purple-600" size={24} />
                                <h4 className="text-xl font-bold text-gray-800">Duration</h4>
                            </div>
                            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                3 Years
                            </p>
                        </div>
                    </div>
                </AnimatedCard>
                <div></div>
                <AnimatedCard delay={200} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-[85vw] mb-6" >
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                        <MapPin className="text-red-500" size={28} />
                        <span>Project Objectives</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700">Establish community-based technology centers</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700">Enhance livelihood opportunities through skill development</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700">Promote sustainable agricultural practices</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700">Foster innovation and technology adoption</p>
                            </div>
                        </div>
                    </div>
                </AnimatedCard>
            </div>

            <div className="xl:col-span-1">
                <AnimatedCard delay={100} className="sticky top-24">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center space-x-2">
                            <MapPin className="text-red-500" size={24} />
                            <span>Project Area</span>
                        </h3>
                        <div className="relative overflow-hidden rounded-2xl shadow-lg">
                            <img
                                src={logos.parea}
                                alt="Map of the project area in Medak District"
                                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <p className="font-semibold text-lg">Kowdipally Block</p>
                                <p className="text-sm opacity-90">Medak District, Telangana</p>
                            </div>
                        </div>
                    </div>
                </AnimatedCard>
            </div>
        </div>
    </Section>
);

export default AboutProject;
