import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../context/AuthContext';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical, Plus, Trash2, Edit2, Eye, EyeOff, Save, X,
    ImageIcon, CheckCircle, AlertCircle, Briefcase, ArrowRight, Settings,
} from 'lucide-react';

// ─── Toast system ──────────────────────────────────────────────────────────────
const useToasts = () => {
    const [toasts, setToasts] = useState([]);
    const add = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };
    const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));
    return { toasts, add, remove };
};

const ToastContainer = ({ toasts, remove }) => (
    <div className="fixed top-5 right-5 z-[200] space-y-2 w-80">
        {toasts.map(t => (
            <div key={t.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-fadeIn transition-all
                    ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                {t.type === 'success' ? <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-600" /> : <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />}
                <span className="flex-grow">{t.message}</span>
                <button onClick={() => remove(t.id)} className="shrink-0 opacity-50 hover:opacity-100"><X size={14} /></button>
            </div>
        ))}
    </div>
);

// ─── Sortable row — MUST be defined before LivelihoodManager ─────────────────
// Each row handles its own DnD via useSortable, inline edit form, actions.
const SortableCard = ({
    item,
    editingId,
    editForm,
    setEditForm,
    editImagePreview,
    editLoading,
    editFileRef,
    onStartEdit,
    onToggleActive,
    onDelete,
    onEditSave,
    onEditImageChange,
    onClearEditImage,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    const isEditing = editingId === item._id;

    return (
        <div ref={setNodeRef} style={style}>
            <div className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-colors group ${isEditing ? 'border-blue-400' : 'border-gray-200 hover:border-blue-200'}`}>

                {/* ── Always-visible summary row ── */}
                <div className="flex items-center gap-3 p-3">
                    {/* Drag handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-2 text-gray-300 hover:text-blue-400 transition-colors shrink-0"
                        title="Drag to reorder"
                    >
                        <GripVertical size={20} />
                    </div>

                    {/* Thumbnail */}
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        {item.imageUrl
                            ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-gray-300" /></div>
                        }
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{item.title}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {item.active ? 'Active' : 'Hidden'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                        {item.link && item.link !== '#' && (
                            <p className="text-[10px] text-blue-500 truncate mt-0.5">🔗 {item.link}</p>
                        )}
                    </div>

                    {/* Actions — visible on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                            onClick={() => onStartEdit(item)}
                            className={`p-2 rounded-lg transition-colors ${isEditing ? 'text-white bg-blue-500' : 'text-blue-600 hover:bg-blue-50'}`}
                            title={isEditing ? 'Close editor' : 'Edit'}
                        >
                            {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                        </button>
                        <button
                            onClick={() => onToggleActive(item)}
                            className={`p-2 rounded-lg transition-colors ${item.active ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={item.active ? 'Hide card' : 'Show card'}
                        >
                            {item.active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                            onClick={() => onDelete(item._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete permanently"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* ── Inline edit form (expands below the row) ── */}
                {isEditing && (
                    <div className="border-t border-blue-100 bg-blue-50/40 px-6 py-5">
                        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Edit2 size={16} className="text-blue-500" /> Editing: {item.title}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Left — image replace */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Replace Image (optional)</label>
                                {editImagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-blue-200 aspect-video">
                                        <img src={editImagePreview} alt="new" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={onClearEditImage}
                                            className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video mb-2">
                                            <img src={item.imageUrl} alt="current" className="w-full h-full object-cover opacity-70" />
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-600 bg-white/30">Current image</span>
                                        </div>
                                        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 hover:border-blue-400 rounded-lg text-xs text-gray-500 hover:text-blue-500 transition-colors">
                                            <ImageIcon size={14} /> Click to replace image
                                            <input type="file" accept="image/*" className="hidden" ref={editFileRef} onChange={onEditImageChange} />
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Right — text fields */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                                    <textarea
                                        rows={2}
                                        value={editForm.description}
                                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Button Text</label>
                                        <input
                                            type="text"
                                            value={editForm.buttonText}
                                            onChange={e => setEditForm(f => ({ ...f, buttonText: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target</label>
                                        <select
                                            value={editForm.target}
                                            onChange={e => setEditForm(f => ({ ...f, target: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="_self">Same Tab</option>
                                            <option value="_blank">New Tab</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Link URL</label>
                                    <input
                                        type="text"
                                        value={editForm.link}
                                        onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                        placeholder="# or https://..."
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.active}
                                        onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Visible on website</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-blue-100">
                            <button
                                type="button"
                                onClick={() => onStartEdit(item)}
                                className="px-4 py-2 text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg font-medium text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onEditSave(item._id)}
                                disabled={editLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm disabled:opacity-60 flex items-center gap-2 transition-colors"
                            >
                                {editLoading
                                    ? <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                                    : <Save size={16} />
                                }
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main component ────────────────────────────────────────────────────────────
const LivelihoodManager = () => {
    const { toasts, add: addToast, remove: removeToast } = useToasts();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasOrderChanged, setHasOrderChanged] = useState(false);

    // Section header
    const [header, setHeader] = useState({ title: 'Livelihood Capitals', subtitle: '' });
    const [headerSaving, setHeaderSaving] = useState(false);

    // Add form
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({ title: '', description: '', buttonText: 'Learn More', link: '#', target: '_self', active: true });
    const [addImageFile, setAddImageFile] = useState(null);
    const [addImagePreview, setAddImagePreview] = useState(null);
    const [addLoading, setAddLoading] = useState(false);
    const addFileRef = useRef(null);

    // Edit form — shared across all cards (only one open at a time)
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', buttonText: '', link: '', target: '_self', active: true });
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const editFileRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchAll = async () => {
        try {
            const { data } = await api.get('/livelihoods/admin');
            setItems(data.items || []);
            if (data.header) setHeader(data.header);
            setHasOrderChanged(false);
        } catch {
            addToast('Failed to load livelihood cards', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // ── Header save ────────────────────────────────────────────────────────────
    const handleHeaderSave = async () => {
        if (!header.title.trim()) return addToast('Section title cannot be empty', 'error');
        setHeaderSaving(true);
        try {
            await api.put('/livelihoods/header', { title: header.title, subtitle: header.subtitle });
            addToast('Section header updated!');
        } catch {
            addToast('Failed to update header', 'error');
        } finally {
            setHeaderSaving(false);
        }
    };

    // ── Add form helpers ───────────────────────────────────────────────────────
    const handleAddImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAddImageFile(file);
        setAddImagePreview(URL.createObjectURL(file));
    };

    const resetAddForm = () => {
        setAddForm({ title: '', description: '', buttonText: 'Learn More', link: '#', target: '_self', active: true });
        setAddImageFile(null);
        setAddImagePreview(null);
        if (addFileRef.current) addFileRef.current.value = '';
        setShowAddForm(false);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!addImageFile) return addToast('Please select an image', 'error');
        if (!addForm.title.trim()) return addToast('Title is required', 'error');
        if (!addForm.description.trim()) return addToast('Description is required', 'error');

        setAddLoading(true);
        const fd = new FormData();
        fd.append('image', addImageFile);
        fd.append('title', addForm.title.trim());
        fd.append('description', addForm.description.trim());
        fd.append('buttonText', addForm.buttonText || 'Learn More');
        fd.append('link', addForm.link || '#');
        fd.append('target', addForm.target);
        fd.append('active', String(addForm.active));

        try {
            await api.post('/livelihoods', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            addToast('Livelihood card created!');
            resetAddForm();
            fetchAll();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to create card', 'error');
        } finally {
            setAddLoading(false);
        }
    };

    // ── Edit helpers ───────────────────────────────────────────────────────────
    const startEdit = (item) => {
        // Toggle: clicking edit on the same card closes it
        if (editingId === item._id) {
            setEditingId(null);
            return;
        }
        setEditingId(item._id);
        setEditForm({
            title: item.title,
            description: item.description,
            buttonText: item.buttonText || 'Learn More',
            link: item.link || '#',
            target: item.target || '_self',
            active: item.active,
        });
        setEditImageFile(null);
        setEditImagePreview(null);
        if (editFileRef.current) editFileRef.current.value = '';
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditImageFile(file);
        setEditImagePreview(URL.createObjectURL(file));
    };

    const clearEditImage = () => {
        setEditImageFile(null);
        setEditImagePreview(null);
        if (editFileRef.current) editFileRef.current.value = '';
    };

    const handleEditSave = async (itemId) => {
        if (!editForm.title.trim()) return addToast('Title cannot be empty', 'error');
        setEditLoading(true);
        const fd = new FormData();
        fd.append('title', editForm.title.trim());
        fd.append('description', editForm.description.trim());
        fd.append('buttonText', editForm.buttonText || 'Learn More');
        fd.append('link', editForm.link || '#');
        fd.append('target', editForm.target);
        fd.append('active', String(editForm.active));
        if (editImageFile) fd.append('image', editImageFile);

        try {
            await api.put(`/livelihoods/${itemId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            addToast('Card updated successfully!');
            setEditingId(null);
            fetchAll();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to update card', 'error');
        } finally {
            setEditLoading(false);
        }
    };

    // ── Toggle visibility ──────────────────────────────────────────────────────
    const handleToggleActive = async (item) => {
        try {
            const fd = new FormData();
            fd.append('active', String(!item.active));
            await api.put(`/livelihoods/${item._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            addToast(item.active ? 'Card hidden from public view' : 'Card is now visible');
            fetchAll();
        } catch {
            addToast('Failed to update visibility', 'error');
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this livelihood card and its image from ImageKit? This cannot be undone.')) return;
        try {
            await api.delete(`/livelihoods/${id}`);
            addToast('Card deleted successfully');
            if (editingId === id) setEditingId(null);
            fetchAll();
        } catch {
            addToast('Delete failed', 'error');
        }
    };

    // ── Drag & Drop ────────────────────────────────────────────────────────────
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setItems(prev => {
            const oldIdx = prev.findIndex(i => i._id === active.id);
            const newIdx = prev.findIndex(i => i._id === over.id);
            return arrayMove(prev, oldIdx, newIdx);
        });
        setHasOrderChanged(true);
    };

    const handleSaveOrder = async () => {
        setSaving(true);
        try {
            const orderedIds = items.map(i => i._id);
            await api.put('/livelihoods/reorder', { orderedIds });
            addToast('Display order saved!');
            setHasOrderChanged(false);
        } catch {
            addToast('Failed to save order', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="p-8 flex items-center justify-center text-gray-500 gap-3">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
            Loading livelihood cards...
        </div>
    );

    return (
        <div className="space-y-8">
            <ToastContainer toasts={toasts} remove={removeToast} />

            {/* ─── Page heading ───────────────────────────────────────────── */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase size={26} className="text-blue-600" /> Livelihood Capitals Manager
                </h2>
                <p className="text-sm text-gray-500 mt-1">Add, edit, reorder, and control visibility of your livelihood initiative cards.</p>
            </div>

            {/* ─── Section Header Editor ──────────────────────────────────── */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <Settings size={18} className="text-purple-500" /> Section Header
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Section Title</label>
                        <input
                            type="text"
                            value={header.title}
                            onChange={e => setHeader(h => ({ ...h, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g. Livelihood Capitals"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Section Subtitle</label>
                        <input
                            type="text"
                            value={header.subtitle}
                            onChange={e => setHeader(h => ({ ...h, subtitle: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g. Sustainable livelihood solutions..."
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleHeaderSave}
                        disabled={headerSaving}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-60 flex items-center gap-2 transition-colors"
                    >
                        {headerSaving
                            ? <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                            : <Save size={16} />
                        }
                        Save Header
                    </button>
                </div>
            </div>

            {/* ─── Add New Card ──────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                    onClick={() => setShowAddForm(v => !v)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                    <span className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <Plus size={20} className="text-green-500" /> Add New Initiative
                    </span>
                    <span className={`text-gray-400 transition-transform duration-200 ${showAddForm ? 'rotate-45' : ''}`}>
                        <Plus size={20} />
                    </span>
                </button>

                {showAddForm && (
                    <form onSubmit={handleAddSubmit} className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left — image upload */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Card Image *</label>
                                {addImagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video">
                                        <img src={addImagePreview} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setAddImageFile(null); setAddImagePreview(null); if (addFileRef.current) addFileRef.current.value = ''; }}
                                            className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl aspect-video text-gray-400 hover:text-blue-500 transition-colors">
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-sm font-medium">Click to select image</span>
                                        <span className="text-xs mt-1">JPG, PNG, WebP — recommended 4:3 or 16:9</span>
                                        <input type="file" accept="image/*" className="hidden" ref={addFileRef} onChange={handleAddImageChange} />
                                    </label>
                                )}
                            </div>

                            {/* Right — fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={addForm.title}
                                        onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Backyard Poultry"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description *</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={addForm.description}
                                        onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Short description shown on the card..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Button Text</label>
                                        <input
                                            type="text"
                                            value={addForm.buttonText}
                                            onChange={e => setAddForm(f => ({ ...f, buttonText: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                            placeholder="Learn More"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Link Target</label>
                                        <select
                                            value={addForm.target}
                                            onChange={e => setAddForm(f => ({ ...f, target: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="_self">Same Tab</option>
                                            <option value="_blank">New Tab</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Link URL</label>
                                    <input
                                        type="text"
                                        value={addForm.link}
                                        onChange={e => setAddForm(f => ({ ...f, link: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                        placeholder="# or https://..."
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={addForm.active}
                                        onChange={e => setAddForm(f => ({ ...f, active: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Visible on website immediately</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={resetAddForm}
                                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addLoading}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg shadow-sm disabled:opacity-60 flex items-center gap-2 transition-colors"
                            >
                                {addLoading
                                    ? <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                                    : <Plus size={16} />
                                }
                                Create Card
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* ─── Cards list ───────────────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <Briefcase size={18} className="text-blue-500" />
                            Livelihood Cards
                            <span className="ml-1 text-sm font-normal text-gray-500">({items.length} total)</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Drag the grip icon to reorder. Click the eye to toggle visibility.</p>
                    </div>
                    {hasOrderChanged && (
                        <button
                            onClick={handleSaveOrder}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-green-100 transition-all"
                        >
                            {saving
                                ? <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                                : <Save size={16} />
                            }
                            Save New Order
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No livelihood cards yet. Add one above!</p>
                    </div>
                ) : (
                    <>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-3">
                                    {items.map(item => (
                                        <SortableCard
                                            key={item._id}
                                            item={item}
                                            editingId={editingId}
                                            editForm={editForm}
                                            setEditForm={setEditForm}
                                            editImagePreview={editImagePreview}
                                            editLoading={editLoading}
                                            editFileRef={editFileRef}
                                            onStartEdit={startEdit}
                                            onToggleActive={handleToggleActive}
                                            onDelete={handleDelete}
                                            onEditSave={handleEditSave}
                                            onEditImageChange={handleEditImageChange}
                                            onClearEditImage={clearEditImage}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {/* Sticky save-order floating button */}
                        {hasOrderChanged && (
                            <div className="sticky bottom-6 flex justify-center pt-2">
                                <button
                                    onClick={handleSaveOrder}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-2xl shadow-blue-200 transition-all transform hover:scale-105 active:scale-95"
                                >
                                    {saving
                                        ? <div className="animate-spin h-5 w-5 rounded-full border-2 border-white border-t-transparent" />
                                        : <Save size={20} />
                                    }
                                    Confirm & Save New Order
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ─── Info banner ──────────────────────────────────────────── */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 flex items-start gap-3">
                <ArrowRight size={18} className="shrink-0 mt-0.5" />
                <span>
                    Changes are reflected on the <strong>homepage</strong> under the <em>"Livelihood Capitals"</em> section in real-time.
                    Use the <strong>eye icon</strong> to hide cards without deleting them.
                </span>
            </div>
        </div>
    );
};

export default LivelihoodManager;
