
import React from 'react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { teamMembers } from '../../constants/data';

const Team = () => (
    <Section id="team" className="bg-gradient-to-br from-indigo-50 to-purple-50">
        <SectionTitle subtitle="Meet the dedicated professionals driving innovation and change">
            Our Team
        </SectionTitle>

        <div className="max-w-6xl mx-auto space-y-6">
            {/* Co-Investigators */}
            <AnimatedCard delay={200} className="bg-white rounded-3xl shadow-xl p-10 py-5 mb-4 border border-indigo-100">
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        Co-Investigators
                    </h3>
                    <p className="text-gray-600">Collaborative expertise across multiple disciplines</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {teamMembers.coInvestigators.map((member, index) => (
                        <div key={index} className="bg-gradient-to-br from-gray-50 to-indigo-50 px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-start space-x-4">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                    {member.avatar}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1 leading-tight">{member.name}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{member.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </AnimatedCard>
        </div>
    </Section>
);

export default Team;
