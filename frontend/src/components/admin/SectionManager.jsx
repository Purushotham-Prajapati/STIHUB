import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Trash2, Edit2, Plus, ArrowUp, ArrowDown, ListOrdered } from 'lucide-react';

const SectionManager = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        _id: '',
        title: '',
        content: '',
        targetPage: 'gallery',
        insertBeforeId: 'end', // 'end' means append, or a section _id to insert before
    });

    const fetchSections = async () => {
        try {
            const { data } = await api.get('/sections');
            setSections(data);
        } catch (error) {
            console.error('Failed to fetch sections:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    // Sections on the currently selected target page for position dropdown
    const sectionsForTargetPage = sections.filter(s => s.targetPage === formData.targetPage);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/sections/${formData._id}`, {
                    title: formData.title,
                    content: formData.content,
                    targetPage: formData.targetPage,
                });
            } else {
                await api.post('/sections', {
                    title: formData.title,
                    content: formData.content,
                    targetPage: formData.targetPage,
                    insertBeforeId: formData.insertBeforeId,
                });
            }
            fetchSections();
            resetForm();
        } catch (error) {
            alert('Failed to save section');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            try {
                await api.delete(`/sections/${id}`);
                fetchSections();
            } catch (error) {
                alert('Failed to delete section');
            }
        }
    };

    const handleEdit = (section) => {
        setFormData({
            _id: section._id,
            title: section.title,
            content: section.content,
            targetPage: section.targetPage,
            insertBeforeId: 'end',
        });
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    const resetForm = () => {
        setFormData({ _id: '', title: '', content: '', targetPage: 'gallery', insertBeforeId: 'end' });
        setIsEditing(false);
    };

    const moveOrder = async (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === sections.length - 1)) return;

        const newSections = [...sections];
        const current = newSections[index];
        const swap = newSections[index + direction];

        const currentOrder = current.order;
        current.order = swap.order;
        swap.order = currentOrder;

        newSections.sort((a, b) => a.order - b.order);
        setSections(newSections);

        await Promise.all([
            api.put(`/sections/${current._id}`, { order: current.order }),
            api.put(`/sections/${swap._id}`, { order: swap.order })
        ]);
        fetchSections();
    };

    if (loading) return <div className="p-8 text-center text-gray-500 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>Loading sections...</div>;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Form Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    {isEditing ? <Edit2 className="text-blue-500" /> : <Plus className="text-green-500" />}
                    {isEditing ? 'Edit Section' : 'Add New Section'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                            <input
                                required type="text" value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Latest News & Updates"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Page</label>
                            <select
                                value={formData.targetPage}
                                onChange={(e) => setFormData({ ...formData, targetPage: e.target.value, insertBeforeId: 'end' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="gallery">Gallery Page</option>
                                <option value="home">Home Page</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content / Description</label>
                        <textarea
                            required value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Supports basic text that will be rendered cleanly in the chosen section."
                        />
                    </div>

                    {/* Position selector — only shown when creating (not editing) */}
                    {!isEditing && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <label className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-2">
                                <ListOrdered size={16} />
                                Insert Position
                            </label>
                            <select
                                value={formData.insertBeforeId}
                                onChange={(e) => setFormData({ ...formData, insertBeforeId: e.target.value })}
                                className="w-full px-4 py-2 border border-blue-200 rounded-md bg-white text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="end">➕ Append at the end (default)</option>
                                {sectionsForTargetPage.length > 0 && (
                                    <option value={sectionsForTargetPage[0]._id}>🔝 Insert First (position 1)</option>
                                )}
                                {sectionsForTargetPage.map((s, idx) => (
                                    <option key={s._id} value={s._id}>
                                        📍 At position {idx + 1} — before "{s.title}"
                                    </option>
                                ))}
                            </select>
                            {sectionsForTargetPage.length === 0 && (
                                <p className="text-xs text-blue-600 mt-1 italic">No existing sections for this page — will be created as the first one.</p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors">
                                Cancel
                            </button>
                        )}
                        <button type="submit" className={`px-6 py-2 text-white rounded-md font-medium transition-colors shadow-sm ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                            {isEditing ? 'Save Changes' : 'Create Section'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Existing Sections</h3>
                {sections.length === 0 ? (
                    <p className="text-gray-500 italic bg-gray-50 p-4 rounded-md text-center">No sections created yet.</p>
                ) : (
                    <div className="space-y-4">
                        {sections.map((section, idx) => (
                            <div key={section._id} className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                {/* Order controls */}
                                <div className="p-4 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex md:flex-col justify-between items-center w-full md:w-16">
                                    <button onClick={() => moveOrder(idx, -1)} disabled={idx === 0} className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30">
                                        <ArrowUp size={20} />
                                    </button>
                                    <span className="text-xs font-bold text-gray-400 tracking-wider">#{idx + 1}</span>
                                    <button onClick={() => moveOrder(idx, 1)} disabled={idx === sections.length - 1} className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30">
                                        <ArrowDown size={20} />
                                    </button>
                                </div>
                                <div className="flex-grow p-4 md:p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{section.title}</h4>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium tracking-wide uppercase">
                                                Page: {section.targetPage}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(section)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(section._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-3 line-clamp-3">{section.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectionManager;
