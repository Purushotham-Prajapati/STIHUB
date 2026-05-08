import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Upload, X, Save, Image as ImageIcon, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, Users } from 'lucide-react';
import { api } from '../../context/AuthContext';

const EngagementManager = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCard, setCurrentCard] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        bgGradient: 'from-blue-500 to-purple-600',
    });
    const [iconFile, setIconFile] = useState(null);
    
    // For Image Management within card
    const [activeSection, setActiveSection] = useState('cards'); // 'cards' or 'images'
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [categoryImages, setCategoryImages] = useState([]);
    const [imageUploadStatus, setImageUploadStatus] = useState({ type: '', message: '' });
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const { data } = await api.get('/engagement');
            setCards(data);
            setLoading(false);
        } catch (error) {
            console.error("Fetch cards error:", error);
            setStatus({ type: 'error', message: 'Failed to load engagement cards' });
            setLoading(false);
        }
    };

    const fetchCategoryImages = async (category) => {
        try {
            const { data } = await api.get(`/gallery?category=${category}`);
            setCategoryImages(data);
        } catch (error) {
            console.error("Fetch items error:", error);
        }
    };

    const handleOpenModal = (card = null) => {
        if (card) {
            setCurrentCard(card);
            setFormData({
                title: card.title,
                description: card.description,
                category: card.category,
                bgGradient: card.bgGradient,
            });
        } else {
            setCurrentCard(null);
            setFormData({
                title: '',
                description: '',
                category: '',
                bgGradient: 'from-blue-500 to-purple-600',
            });
        }
        setIconFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCard(null);
        setIconFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: 'info', message: currentCard ? 'Updating card...' : 'Creating card...' });

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('bgGradient', formData.bgGradient);
            if (iconFile) {
                data.append('icon', iconFile);
            }

            if (currentCard) {
                await api.put(`/engagement/${currentCard._id}`, formData);
                setStatus({ type: 'success', message: 'Card updated successfully' });
            } else {
                if (!iconFile) {
                    setStatus({ type: 'error', message: 'Icon is required for new cards' });
                    setLoading(false);
                    return;
                }
                await api.post('/engagement', data);
                setStatus({ type: 'success', message: 'Card created successfully' });
            }

            fetchCards();
            handleCloseModal();
        } catch (error) {
            console.error("Submit error:", error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Action failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCard = async (id) => {
        if (!window.confirm('Are you sure you want to delete this card and its associated icon? Gallery images will NOT be deleted.')) return;

        try {
            setLoading(true);
            await api.delete(`/engagement/${id}`);
            setStatus({ type: 'success', message: 'Card deleted successfully' });
            fetchCards();
        } catch (error) {
            console.error("Delete error:", error);
            setStatus({ type: 'error', message: 'Failed to delete card' });
        } finally {
            setLoading(false);
        }
    };

    const handleManageImages = (card) => {
        setSelectedCardId(card._id);
        fetchCategoryImages(card.category);
        setActiveSection('images');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedCardId) return;

        const card = cards.find(c => c._id === selectedCardId);
        if (!card) return;

        setIsUploadingImage(true);
        setImageUploadStatus({ type: 'info', message: 'Uploading image...' });

        try {
            const uploadData = new FormData();
            uploadData.append('image', file);
            uploadData.append('title', `Engagement - ${card.title}`);
            uploadData.append('category', card.category);
            uploadData.append('sectionName', card.title);
            uploadData.append('description', `Community Engagement event for ${card.title}`);
            uploadData.append('date', new Date().getFullYear().toString());

            await api.post('/gallery', uploadData);
            setImageUploadStatus({ type: 'success', message: 'Image uploaded to category successfully' });
            fetchCategoryImages(card.category);
        } catch (error) {
            console.error("Upload failed", error);
            setImageUploadStatus({ type: 'error', message: 'Image upload failed' });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleDeleteImage = async (id) => {
        if (!window.confirm('Delete this image from gallery?')) return;
        
        try {
            await api.delete(`/gallery/${id}`);
            const card = cards.find(c => c._id === selectedCardId);
            fetchCategoryImages(card.category);
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    if (loading && cards.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="text-blue-600" />
                    Community Engagement Cards
                </h2>
                {activeSection === 'cards' ? (
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
                    >
                        <Plus size={18} /> Add New Card
                    </button>
                ) : (
                    <button
                        onClick={() => setActiveSection('cards')}
                        className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-200"
                    >
                        <ChevronLeft size={18} /> Back to Cards
                    </button>
                )}
            </div>

            {status.message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                    {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    {status.message}
                </div>
            )}

            {activeSection === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cards.map(card => (
                        <div key={card._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className={`h-24 bg-gradient-to-br ${card.bgGradient} flex items-center justify-center`}>
                                <img src={card.iconUrl} alt={card.title} className="w-12 h-12 object-contain filter brightness-0 invert" />
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-900">{card.title}</h3>
                                    <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase tracking-wider">{card.category}</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-6 line-clamp-2">{card.description}</p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleManageImages(card)}
                                        className="flex-grow flex items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded-lg border border-gray-200 transition-colors text-sm"
                                    >
                                        <ImageIcon size={16} /> Manage Images
                                    </button>
                                    <button 
                                        onClick={() => handleOpenModal(card)}
                                        className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteCard(card._id)}
                                        className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cards.length === 0 && !loading && (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No engagement cards found. Create your first one!</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Management UI for Category Images */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="font-bold text-blue-900 text-lg">
                                {cards.find(c => c._id === selectedCardId)?.title}
                            </h3>
                            <p className="text-blue-700 text-sm font-medium">
                                Category: <span className="uppercase">{cards.find(c => c._id === selectedCardId)?.category}</span>
                                <span className="mx-2">•</span>
                                {categoryImages.length} Images Linked
                            </p>
                        </div>
                        <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95">
                            <Upload size={18} />
                            {isUploadingImage ? 'Uploading...' : 'Direct Upload to Card'}
                            <input type="file" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} accept="image/*" />
                        </label>
                    </div>

                    {imageUploadStatus.message && (
                        <div className={`p-3 text-sm rounded-lg ${imageUploadStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {imageUploadStatus.message}
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryImages.map(img => (
                            <div key={img._id} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => handleDeleteImage(img._id)}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="absolute bottom-1 right-1">
                                    <span className="text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                                        FIFO: {new Date(img.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 border border-gray-200">
                        <AlertCircle size={14} className="inline mr-2" />
                        <strong>Note:</strong> Images shown here are filtered strictly by the card's <strong>Category</strong>. You can also add images to this category directly from the Main Gallery Manager.
                    </div>
                </div>
            )}

            {/* Modal for Card CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">{currentCard ? 'Edit Card' : 'Create New Engagement Card'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Common Facility Centre"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief summary of the engagement area..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Linking Category</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g., outreach"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Images in gallery with this category will appear on click.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">BG Gradient</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all"
                                        value={formData.bgGradient}
                                        onChange={e => setFormData({ ...formData, bgGradient: e.target.value })}
                                    >
                                        <option value="from-blue-500 to-purple-600">Blue Purple</option>
                                        <option value="from-green-500 to-teal-600">Green Teal</option>
                                        <option value="from-red-500 to-pink-600">Red Pink</option>
                                        <option value="from-orange-500 to-yellow-600">Orange Yellow</option>
                                        <option value="from-indigo-500 to-cyan-500">Indigo Cyan</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Icon (SVG/PNG)</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 border-dashed ${iconFile ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
                                        {iconFile ? (
                                            <Upload className="text-blue-500" size={24} />
                                        ) : currentCard ? (
                                            <img src={currentCard.iconUrl} className="w-8 h-8 object-contain filter brightness-0" />
                                        ) : (
                                            <ImageIcon className="text-gray-400" size={24} />
                                        )}
                                    </div>
                                    <label className="flex-1">
                                        <div className="bg-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer text-center transition-colors">
                                            {iconFile ? iconFile.name : 'Choose Icon File'}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={e => setIconFile(e.target.files[0])} />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : currentCard ? 'Update Card' : 'Create Card'}
                                    <Save size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EngagementManager;
