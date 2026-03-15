import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../context/AuthContext';
import { Trash2, Edit2, UploadCloud, X, Save, ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

const GalleryManager = () => {
    const [items, setItems] = useState([]);
    const [engagementCards, setEngagementCards] = useState([]);
    const [sections, setSections] = useState([]); // Dynamic sections from DB
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const fileInputRef = useRef(null);

    const normalizeCategory = (cat) => {
        if (!cat) return '';
        return cat.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    // Shared metadata for multi-upload
    const [sharedMeta, setSharedMeta] = useState({
        title: '', category: 'Outreach', customCategory: '', description: '', date: new Date().getFullYear().toString(),
        sectionName: 'Project Gallery'
    });
    // Each selected file gets its own metadata entry (inherits from shared initially)
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [editData, setEditData] = useState({});
    const [filterSection, setFilterSection] = useState('all'); // 'all' or a sectionName

    const fetchItems = async () => {
        try {
            const [galleryRes, engagementRes] = await Promise.all([
                api.get('/gallery'),
                api.get('/engagement')
            ]);
            setItems(galleryRes.data);
            setEngagementCards(engagementRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        // Fetch all dynamic sections to populate section picker
        api.get('/sections').then(({ data }) => setSections(data)).catch(() => { });
    }, []);

    // Dynamically generate category list from existing items + defaults + engagement cards
    const defaultCategories = ['Outreach', 'Training', 'Technology', 'Event'];
    const allCategories = Array.from(new Set([
        ...defaultCategories.map(normalizeCategory),
        ...items.map(i => normalizeCategory(i.category)).filter(Boolean),
        ...engagementCards.map(c => normalizeCategory(c.category)).filter(Boolean)
    ])).sort();

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const newEntries = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            title: sharedMeta.title || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
            category: sharedMeta.category,
            customCategory: sharedMeta.customCategory,
            sectionName: sharedMeta.sectionName,
            description: sharedMeta.description,
            date: sharedMeta.date,
            status: 'pending',
            id: Math.random().toString(36).slice(2),
        }));
        setSelectedFiles(prev => [...prev, ...newEntries]);
    };

    // When shared meta changes, apply them to all pending files
    const applySharedMeta = () => {
        setSelectedFiles(prev => prev.map(f =>
            f.status === 'pending'
                ? { ...f, title: sharedMeta.title || f.title, category: sharedMeta.category, customCategory: sharedMeta.customCategory, sectionName: sharedMeta.sectionName, description: sharedMeta.description, date: sharedMeta.date }
                : f
        ));
    };

    const removeSelectedFile = (id) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== id));
    };

    const updateFileMeta = (id, field, value) => {
        setSelectedFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const clearCompleted = () => {
        setSelectedFiles(prev => prev.filter(f => f.status !== 'done'));
    };

    const handleUploadAll = async () => {
        const pending = selectedFiles.filter(f => f.status === 'pending');
        if (!pending.length) return alert('No images selected to upload');

        setUploading(true);

        // Upload each file sequentially (to avoid rate limits)
        for (const entry of pending) {
            setSelectedFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'uploading' } : f));

            const formData = new FormData();
            formData.append('title', entry.title);
            formData.append('category', normalizeCategory(entry.category === 'new' ? entry.customCategory : entry.category));
            formData.append('sectionName', entry.sectionName || 'Project Gallery');
            formData.append('description', entry.description);
            formData.append('date', entry.date);
            formData.append('image', entry.file);

            try {
                await api.post('/gallery', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSelectedFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'done' } : f));
            } catch {
                setSelectedFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'error' } : f));
            }
        }

        setUploading(false);
        fetchItems();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (id) => {
        if (window.confirm('WARNING: This permanently deletes the image from ImageKit and the database.')) {
            try {
                await api.delete(`/gallery/${id}`);
                fetchItems();
            } catch {
                alert('Delete failed');
            }
        }
    };

    const startEdit = (item) => {
        setEditingId(item._id);
        setEditData({ title: item.title, category: item.category, description: item.description, date: item.date });
    };

    const saveEdit = async (id) => {
        try {
            const payload = { ...editData };
            if (payload.category === 'new') {
                payload.category = payload.customCategory;
            }
            payload.category = normalizeCategory(payload.category);

            await api.put(`/gallery/${id}`, payload);
            setEditingId(null);
            fetchItems();
        } catch {
            alert('Update failed');
        }
    };

    const pendingCount = selectedFiles.filter(f => f.status === 'pending').length;
    const doneCount = selectedFiles.filter(f => f.status === 'done').length;

    if (loading) return <div className="p-8 text-center text-gray-500">Loading gallery data...</div>;

    const filteredItems = filterSection === 'all'
        ? items
        : items.filter(i => (i.sectionName || 'Project Gallery') === filterSection);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
            {/* Upload Area */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <UploadCloud className="text-blue-500" /> Upload Images
                </h2>

                {/* Shared Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shared Title</label>
                        <input
                            type="text"
                            value={sharedMeta.title}
                            onChange={e => setSharedMeta({ ...sharedMeta, title: e.target.value })}
                            placeholder="e.g. Workshop at Tuniki"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                            <select value={sharedMeta.category} onChange={e => setSharedMeta({ ...sharedMeta, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="new" className="font-semibold text-blue-600">+ New Category</option>
                            </select>
                        </div>
                        {sharedMeta.category === 'new' && (
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">New Category</label>
                                <input type="text" value={sharedMeta.customCategory} onChange={e => setSharedMeta({ ...sharedMeta, customCategory: e.target.value })}
                                    placeholder="e.g. Workshop" className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500" />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gallery Section</label>
                        <select value={sharedMeta.sectionName} onChange={e => setSharedMeta({ ...sharedMeta, sectionName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="Project Gallery">📸 Project Gallery (default)</option>
                            {sections.map(s => (
                                <option key={s._id} value={s.title}>{s.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                        <input type="text" value={sharedMeta.description} onChange={e => setSharedMeta({ ...sharedMeta, description: e.target.value })}
                            placeholder="Brief description..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Year/Date</label>
                        <input type="text" value={sharedMeta.date} onChange={e => setSharedMeta({ ...sharedMeta, date: e.target.value })}
                            placeholder="2024" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>

                {/* File Picker + Apply Button */}
                <div className="flex flex-wrap items-center gap-3 mb-6 pt-4 border-t border-gray-100">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm rounded-lg border border-blue-200 transition-colors">
                        <ImageIcon size={16} />
                        Select Images
                        <input
                            type="file" multiple accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                        />
                    </label>
                    {selectedFiles.some(f => f.status === 'pending') && (
                        <button onClick={applySharedMeta} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 transition-colors">
                            Apply Shared Metadata to All
                        </button>
                    )}
                    {doneCount > 0 && (
                        <button onClick={clearCompleted} className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium text-sm rounded-lg border border-green-200 transition-colors">
                            Clear Completed ({doneCount})
                        </button>
                    )}
                    {pendingCount > 0 && (
                        <button
                            onClick={handleUploadAll}
                            disabled={uploading}
                            className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm disabled:opacity-60 flex items-center gap-2 transition-colors"
                        >
                            {uploading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading...</> : `Upload ${pendingCount} Image${pendingCount > 1 ? 's' : ''}`}
                        </button>
                    )}
                </div>

                {/* Per-Image Preview Grid */}
                {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedFiles.map(entry => (
                            <div key={entry.id} className={`border rounded-xl overflow-hidden shadow-sm ${entry.status === 'done' ? 'border-green-300 bg-green-50/30' : entry.status === 'error' ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-white'}`}>
                                {/* Preview Image */}
                                <div className="relative h-36 bg-gray-100">
                                    <img src={entry.previewUrl} alt={entry.title} className="w-full h-full object-cover" />
                                    {/* Status Badge */}
                                    <div className="absolute top-2 left-2">
                                        {entry.status === 'done' && <span className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium"><CheckCircle size={12} /> Done</span>}
                                        {entry.status === 'error' && <span className="flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium"><AlertCircle size={12} /> Error</span>}
                                        {entry.status === 'uploading' && <span className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium"><div className="animate-spin h-2 w-2 rounded-full border border-white border-t-transparent"></div> Uploading</span>}
                                    </div>
                                    {entry.status === 'pending' && (
                                        <button onClick={() => removeSelectedFile(entry.id)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition-colors">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                {/* Per-Image Metadata - editable */}
                                <div className="p-3 space-y-2">
                                    <input type="text" value={entry.title} onChange={e => updateFileMeta(entry.id, 'title', e.target.value)} disabled={entry.status !== 'pending'}
                                        className="w-full text-sm font-semibold border border-gray-200 rounded px-2 py-1 disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-400" placeholder="Title" />
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <select value={entry.category} onChange={e => updateFileMeta(entry.id, 'category', e.target.value)} disabled={entry.status !== 'pending'}
                                                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 disabled:bg-gray-50 bg-white">
                                                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                <option value="new" className="font-semibold text-blue-600">+ New Category</option>
                                            </select>
                                            <input type="text" value={entry.date} onChange={e => updateFileMeta(entry.id, 'date', e.target.value)} disabled={entry.status !== 'pending'}
                                                className="w-20 text-xs border border-gray-200 rounded px-2 py-1 disabled:bg-gray-50" placeholder="Year" />
                                        </div>
                                        {entry.category === 'new' && (
                                            <input type="text" value={entry.customCategory || ''} onChange={e => updateFileMeta(entry.id, 'customCategory', e.target.value)} disabled={entry.status !== 'pending'}
                                                className="w-full text-xs border border-blue-300 rounded px-2 py-1 disabled:bg-gray-50" placeholder="Enter new category name..." />
                                        )}
                                    </div>
                                    <input type="text" value={entry.description} onChange={e => updateFileMeta(entry.id, 'description', e.target.value)} disabled={entry.status !== 'pending'}
                                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 disabled:bg-gray-50 disabled:text-gray-500" placeholder="Description" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Gallery Grid */}
            <div>
                {/* Header with filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b pb-3">
                    <h3 className="text-lg font-bold text-gray-800">
                        Gallery Database ({filterSection === 'all' ? items.length : items.filter(i => (i.sectionName || 'Project Gallery') === filterSection).length})
                        {filterSection !== 'all' && <span className="ml-2 text-sm font-normal text-blue-600">— {filterSection}</span>}
                    </h3>
                    <select
                        value={filterSection}
                        onChange={e => setFilterSection(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    >
                        <option value="all">All Sections</option>
                        <option value="Project Gallery">📸 Project Gallery</option>
                        {sections.map(s => (
                            <option key={s._id} value={s.title}>{s.title}</option>
                        ))}
                    </select>
                </div>

                {items.length === 0 ? (
                    <p className="text-gray-500 italic bg-gray-50 p-4 rounded-md text-center">No images uploaded yet.</p>
                ) : filteredItems.length === 0 ? (
                    <p className="text-gray-500 italic bg-gray-50 p-4 rounded-md text-center">No images in this section yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <div key={item._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {editingId !== item._id ? (
                                            <>
                                                <button onClick={() => startEdit(item)} className="p-1.5 bg-white text-blue-600 rounded shadow hover:bg-blue-50"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-white text-red-600 rounded shadow hover:bg-red-50"><Trash2 size={16} /></button>
                                            </>
                                        ) : (
                                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-white text-gray-600 rounded shadow hover:bg-gray-50"><X size={16} /></button>
                                        )}
                                    </div>
                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded font-medium">
                                        ID: ...{item.imageKitFileId.slice(-6)}
                                    </div>
                                </div>

                                <div className="p-4 flex-grow flex flex-col">
                                    {editingId === item._id ? (
                                        <div className="space-y-3 flex-grow border border-blue-200 p-2 rounded bg-blue-50/30">
                                            <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="w-full text-sm font-bold border-gray-300 rounded px-2 py-1" />
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <select value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="w-2/3 text-sm border-gray-300 rounded px-2 py-1 bg-white">
                                                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                        <option value="new" className="font-semibold text-blue-600">+ New Category</option>
                                                    </select>
                                                    <input type="text" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} className="w-1/3 text-sm border-gray-300 rounded px-2 py-1" />
                                                </div>
                                                {editData.category === 'new' && (
                                                    <input type="text" value={editData.customCategory || ''} onChange={(e) => setEditData({ ...editData, customCategory: e.target.value })}
                                                        className="w-full text-sm border-blue-400 rounded px-2 py-1" placeholder="Enter new category name..." />
                                                )}
                                            </div>
                                            <textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="w-full text-sm border-gray-300 rounded px-2 py-1" rows="2" />
                                            <button onClick={() => saveEdit(item._id)} className="w-full bg-blue-600 text-white text-sm font-medium py-1.5 rounded hover:bg-blue-700 flex justify-center items-center gap-2"><Save size={16} /> Save</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-900 leading-tight pr-2">{item.title}</h4>
                                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                                            <div className="mt-auto text-xs text-gray-400 font-medium">
                                                {item.date} • Created: {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryManager;
