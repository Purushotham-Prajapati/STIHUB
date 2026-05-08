import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    Trash2, 
    UploadCloud, 
    X, 
    Save, 
    ImageIcon, 
    CheckCircle, 
    AlertCircle,
    GripVertical,
    Plus
} from 'lucide-react';

// Sortable Item Component
const SortableSliderItem = ({ item, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex items-center gap-4 p-3 group hover:border-blue-300 transition-colors"
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-blue-500 transition-colors">
                <GripVertical size={20} />
            </div>
            
            <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-grow">
                <h4 className="font-semibold text-gray-800 text-sm">{item.title || 'Untitled Slide'}</h4>
                <p className="text-xs text-gray-400 font-medium">Order: {item.order}</p>
            </div>

            <button 
                onClick={() => onDelete(item._id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

const SliderManager = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [title, setTitle] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchItems = async () => {
        try {
            const { data } = await api.get('/slider-items');
            setItems(data);
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to fetch slider items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('title', title);

        try {
            await api.post('/slider-items', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSelectedFile(null);
            setPreviewUrl(null);
            setTitle('');
            fetchItems();
        } catch (error) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this slider image?')) {
            try {
                await api.delete(`/slider-items/${id}`);
                fetchItems();
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i._id === active.id);
                const newIndex = items.findIndex((i) => i._id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                setHasChanges(true);
                return newItems;
            });
        }
    };

    const handleSaveOrder = async () => {
        setSaving(true);
        try {
            const orderedIds = items.map(i => i._id);
            await api.put('/slider-items/reorder', { orderedIds });
            setHasChanges(false);
            fetchItems();
            alert('Order saved successfully!');
        } catch (error) {
            alert('Failed to save order');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading slider data...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Upload Slider Image */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 text-blue-600">
                    <ImageIcon size={24} /> Add Slider Image
                </h2>
                
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:w-64 aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group">
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => {setSelectedFile(null); setPreviewUrl(null);}}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-blue-500 transition-colors">
                                <Plus size={32} />
                                <span className="text-sm mt-2">Pick an image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>
                    
                    <div className="flex-grow space-y-4 w-full">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Slide Title (Optional)</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Enter a title for this slide..."
                            />
                        </div>
                        <button 
                            disabled={!selectedFile || uploading}
                            onClick={handleUpload}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <UploadCloud size={20} />}
                            {uploading ? 'Uploading...' : 'Upload Slide'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Reorder/Queue Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Slider Queue</h3>
                        <p className="text-sm text-gray-400">Drag and place images to set the display order</p>
                    </div>
                    {hasChanges && (
                        <button 
                            onClick={handleSaveOrder}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-100 transition-all animate-bounceIn"
                        >
                            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={18} />}
                            Save New Order
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No slider images yet. Upload your first one above!</p>
                    </div>
                ) : (
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={items.map(i => i._id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {items.map(item => (
                                    <SortableSliderItem 
                                        key={item._id} 
                                        item={item} 
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
            
            {hasChanges && (
                <div className="sticky bottom-6 flex justify-center animate-fadeIn">
                    <button 
                        onClick={handleSaveOrder}
                        disabled={saving}
                        className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-2xl shadow-blue-300 transition-all transform hover:scale-105 active:scale-95"
                    >
                        {saving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <Save size={20} />}
                        Confirm and Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default SliderManager;
