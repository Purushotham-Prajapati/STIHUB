
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            <div className="xl:col-span-2 space-y-0 space-x-2">
                <AnimatedCard className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 rounded-xl shadow-sm hover:shadow-md border border-blue-400/50 transition-all duration-300">
                    <div className="flex items-start space-x-4 mb-4">
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-blue-200 shadow-lg">
                            <Target className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Project Title</h3>
                            <p className="text-blue-600 text-sm font-medium mb-4 bg-blue-100 px-3 py-1 rounded-full inline-block"><span className='font-bold text-md mx-1 text-blue-900 '>File No:</span>DST/SEED/TSP/STI/2023/956 (G)</p>
                        </div>
                    </div>

                    <p className="font-medium text-gray-700 leading-relaxed text-lg mb-8">
                        Science Technology and Innovation Hub for Development of Scheduled Tribe Community in tribal areas of
                        <span className="font-bold text-blue-700"> Kowdipally Block, Medak District, Telangana State</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-3">
                                <Award className="text-green-600" size={24} />
                                <h4 className="text-lg font-bold text-gray-800">Project Cost</h4>
                            </div>
                            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                ₹86.8 Lakhs
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-3">
                                <Calendar className="text-purple-600" size={24} />
                                <h4 className="text-lg font-bold text-gray-800">Duration</h4>
                            </div>
                            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                3 Years
                            </p>
                        </div>
                    </div>
                </AnimatedCard>
                <div></div>
            </div>

            <div className="xl:col-span-1">
                <AnimatedCard delay={100} className="sticky top-24 border border-green-400 rounded-2xl">
                    <div className="bg-white p-2 rounded-[2rem] shadow-sm hover:shadow-md border border-gray-100">
                        <div className="relative overflow-hidden rounded-[1.5rem] shadow-inner">
                            <img
                                src={logos.parea}
                                alt="Map of the project area in Medak District"
                                className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <div className="flex items-center space-x-2 mb-1">
                                    <MapPin className="text-red-400" size={20} />
                                    <h3 className="font-bold text-xl">Project Area</h3>
                                </div>
                                <p className="font-medium text-lg ml-7">Kowdipally Block</p>
                                <p className="text-sm text-gray-200 ml-7">Medak District, Telangana</p>
                            </div>
                        </div>
                    </div>
                </AnimatedCard>
            </div>
            <div className='xl:col-span-3'>
                <AnimatedCard delay={200} className="bg-white px-8 py-4 rounded-xl mx-1 shadow-sm hover:shadow-md border border-orange-400 w-full mb-1 " >
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                        <MapPin className="text-red-500" size={28} />
                        <span>Project Objectives</span>
                    </h3>
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-start space-x-3 w-full">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                            <p className="text-gray-600 flex-1">To improve the socio-economic conditions of the target population by strengthening the predominant livelihoods through Science & Technology Interventions</p>
                        </div>
                        <div className="flex items-start space-x-3 w-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2.5 flex-shrink-0"></div>
                            <p className="text-gray-600 flex-1">Skill Development and Capacity Building of target tribal population for strengthening livelihoods.</p>
                        </div>
                        <div className="flex items-start space-x-3 w-full">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2.5 flex-shrink-0"></div>
                            <p className="text-gray-600 flex-1">Creation of social enterprises in backyard poultry and honey bee farming technologies based on livelihood strengths</p>
                        </div>
                        <div className="flex items-start space-x-3 w-full">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2.5 flex-shrink-0"></div>
                            <p className="text-gray-600 flex-1">To improve the livelihood capitals through Science and Technology Interventions</p>
                        </div>
                    </div>
                </AnimatedCard>
            </div>
            
        </div>
    </Section>
);

export default AboutProject;
