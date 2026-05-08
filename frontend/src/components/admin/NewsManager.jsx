import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, AlertCircle, CheckCircle2, Newspaper, ExternalLink } from 'lucide-react';
import { api } from '../../context/AuthContext';

const NewsManager = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        date: '',
        description: '',
        link: '',
        target: '_blank',
        order: 0
    });

    const fetchNews = async () => {
        try {
            const { data } = await api.get('/news');
            setNews(data);
        } catch (error) {
            console.error('Fetch news error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const resetForm = () => {
        setFormData({
            title: '',
            category: '',
            date: '',
            description: '',
            link: '',
            target: '_blank',
            order: news.length * 10
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title,
            category: item.category,
            date: item.date,
            description: item.description,
            link: item.link || '',
            target: item.target || '_blank',
            order: item.order || 0
        });
        setEditingId(item._id);
        setIsAdding(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/news/${editingId}`, formData);
            } else {
                await api.post('/news', formData);
            }
            fetchNews();
            resetForm();
        } catch (error) {
            console.error('Submit news error:', error);
            alert('Failed to save news item');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this news item?')) {
            try {
                await api.delete(`/news/${id}`);
                fetchNews();
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading news data...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Newspaper className="text-blue-500" /> News & Reports
                    </h2>
                    <p className="text-gray-500 text-sm">Manage dynamic cards for the news section</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => {
                            resetForm();
                            setIsAdding(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md active:scale-95"
                    >
                        <Plus size={20} /> Add News Card
                    </button>
                )}
            </div>

            {/* Form Section */}
            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-lg animate-slideDown">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">
                            {editingId ? 'Edit News Card' : 'Create New News Card'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Recruitment Notification..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g., RECRUITMENT"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    placeholder="e.g., July 2023"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Excerpt</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="A brief summary of the news item..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Link (Optional)</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.order}
                                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                            >
                                <Save size={18} /> {editingId ? 'Update Card' : 'Save Card'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                    <div key={item._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                        <div className="p-5 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-blue-100">
                                    {item.category}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded shadow-sm bg-white"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(item._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded shadow-sm bg-white"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            
                            <h4 className="font-bold text-gray-800 mb-2 leading-snug line-clamp-2">{item.title}</h4>
                            <p className="text-gray-500 text-xs mb-3 font-medium uppercase">{item.date}</p>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">{item.description}</p>
                            
                            {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 text-xs font-bold hover:underline">
                                    <ExternalLink size={12} /> View Document
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {news.length === 0 && !isAdding && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Newspaper size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No news cards found. Click "Add News Card" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default NewsManager;
