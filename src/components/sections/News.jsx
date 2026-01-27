
import React from 'react';
import { Calendar, FileText, ArrowRight } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { newsItems } from '../../constants/data';

const News = () => (
    <Section className="bg-gray-50 my-8">
        <SectionTitle subtitle="Stay updated with our latest developments and announcements">
            News & Reports
        </SectionTitle>

        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsItems.map((item, index) => (
                    <AnimatedCard key={index} delay={index * 100} className="group">
                        <article className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform group-hover:-translate-y-2">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                                        {item.category}
                                    </span>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Calendar size={14} className="mr-1" />
                                        {item.date}
                                    </div>
                                </div>

                                <a href={item.link} target={item.target} className='hover:underline'><h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h3></a>

                                <p className="text-gray-600 mb-6 leading-relaxed">{item.excerpt}</p>

                                <a
                                    href={item.link} target={item.target}
                                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium group-hover:translate-x-1 transition-all duration-300"
                                >
                                    <FileText size={16} />
                                    <span>Read More</span>
                                    <ArrowRight size={16} />
                                </a>
                            </div>
                        </article>
                    </AnimatedCard>
                ))}
            </div>
        </div>
    </Section>
);

export default News;
