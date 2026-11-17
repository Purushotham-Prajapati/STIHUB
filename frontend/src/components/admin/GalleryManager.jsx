import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../context/AuthContext';
import {
    Trash2, Edit2, UploadCloud, X, Save, ImageIcon, CheckCircle,
    AlertCircle, Video, PlayCircle, PauseCircle, Play, Pause, RotateCcw,
    Loader2, Link as LinkIcon, AlertTriangle
} from 'lucide-react';

const CHUNK_SIZE = 2.5 * 1024 * 1024; // 2.5 MB chunks for faster upload & high resilience
const IMAGEKIT_FREE_TIER_LIMIT_MB = 100;

const GalleryManager = () => {
    const [items, setItems] = useState([]);
    const [engagementCards, setEngagementCards] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Active upload mode: 'file' or 'link'
    const [activeUploadMode, setActiveUploadMode] = useState('file');

    // Video Link Form State
    const [linkForm, setLinkForm] = useState({
        title: '',
        category: 'Outreach',
        customCategory: '',
        videoUrl: '',
        sectionName: 'Project Gallery',
        description: '',
        date: new Date().getFullYear().toString(),
        videoDuration: '',
        thumbnailUrl: '',
    });
    const [linkSubmitting, setLinkSubmitting] = useState(false);

    // Refs for resilient chunked upload controls
    const abortControllersRef = useRef({});
    const pauseFlagsRef = useRef({});

    const normalizeCategory = (cat) => {
        if (!cat) return '';
        return cat.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    // Shared metadata for multi-upload
    const [sharedMeta, setSharedMeta] = useState({
        title: '', category: 'Outreach', customCategory: '', description: '',
        date: new Date().getFullYear().toString(), sectionName: 'Project Gallery'
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filterSection, setFilterSection] = useState('all');
    const [driveStatus, setDriveStatus] = useState(null);

    // Modal-based edit state
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        category: 'Outreach',
        customCategory: '',
        sectionName: 'Project Gallery',
        description: '',
        date: '',
        videoDuration: '',
        thumbnailUrl: '',
    });
    const [editSaving, setEditSaving] = useState(false);

    const checkDriveStatus = async () => {
        try {
            const res = await api.get('/gallery/google-drive-status');
            setDriveStatus(res.data);
        } catch {
            // ignore
        }
    };

    const handleConnectGoogleDrive = async () => {
        try {
            const res = await api.get('/gallery/google-auth-url');
            if (res.data.url) {
                window.open(res.data.url, '_blank');
            }
        } catch (err) {
            alert('Failed to get Google Auth URL: ' + (err.response?.data?.message || err.message));
        }
    };

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
        checkDriveStatus();
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

        const newEntries = files.map(file => {
            const id = Math.random().toString(36).slice(2);
            const isVideo = file.type.startsWith('video/');
            const previewUrl = URL.createObjectURL(file);
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const uploadId = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}-${file.size}`;
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            const isOverFreeLimit = isVideo && (file.size > IMAGEKIT_FREE_TIER_LIMIT_MB * 1024 * 1024);

            // If video, extract metadata and snapshot thumbnail automatically
            if (isVideo) {
                const tempVideo = document.createElement('video');
                tempVideo.preload = 'metadata';
                tempVideo.src = previewUrl;

                tempVideo.onloadedmetadata = () => {
                    const dur = Math.round(tempVideo.duration);
                    if (!isNaN(dur) && dur > 0) {
                        const mins = Math.floor(dur / 60);
                        const secs = dur % 60;
                        const durationString = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                        updateFileMeta(id, 'videoDuration', durationString);
                    }
                    tempVideo.currentTime = Math.min(1, tempVideo.duration / 2);
                };

                tempVideo.onseeked = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.min(640, tempVideo.videoWidth || 640);
                        canvas.height = Math.min(360, tempVideo.videoHeight || 360);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                        const dataUrl = canvas.toDataURL('image/webp', 0.8);
                        updateFileMeta(id, 'thumbnailPreview', dataUrl);
                    } catch {
                        // ignore canvas error
                    }
                };
            }

            return {
                id,
                file,
                isVideo,
                uploadId,
                previewUrl,
                sizeMB,
                isOverFreeLimit,
                title: sharedMeta.title || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
                category: sharedMeta.category,
                customCategory: sharedMeta.customCategory,
                sectionName: sharedMeta.sectionName,
                description: sharedMeta.description,
                date: sharedMeta.date,
                videoDuration: '',
                thumbnailFile: null,
                thumbnailPreview: null,
                status: 'pending',
                progress: 0,
                currentChunk: 0,
                totalChunks,
                speed: '',
                statusText: isVideo ? `Ready (${sizeMB} MB • ${totalChunks} chunks)` : 'Ready to upload',
            };
        });

        setSelectedFiles(prev => [...prev, ...newEntries]);
    };

    const applySharedMeta = () => {
        setSelectedFiles(prev => prev.map(f =>
            f.status === 'pending'
                ? {
                    ...f,
                    title: sharedMeta.title || f.title,
                    category: sharedMeta.category,
                    customCategory: sharedMeta.customCategory,
                    sectionName: sharedMeta.sectionName,
                    description: sharedMeta.description,
                    date: sharedMeta.date
                }
                : f
        ));
    };

    const removeSelectedFile = (id) => setSelectedFiles(prev => prev.filter(f => f.id !== id));

    const updateFileMeta = (id, field, value) => {
        setSelectedFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const handleThumbnailChange = (id, e) => {
        const file = e.target.files[0];
        if (!file) return;
        updateFileMeta(id, 'thumbnailFile', file);
        updateFileMeta(id, 'thumbnailPreview', URL.createObjectURL(file));
    };

    const clearCompleted = () => setSelectedFiles(prev => prev.filter(f => f.status !== 'done'));

    // ── Resumable Video Upload Engine ───────────────────────────────────────────
    const uploadSingleVideoResumable = async (entry) => {
        if (entry.isOverFreeLimit && driveStatus && !driveStatus.hasRefreshToken) {
            const proceed = window.confirm(
                `This video is ${entry.sizeMB} MB (exceeds ImageKit's 100 MB free limit).\n\nTo automatically store videos > 100 MB on Google Drive, Google Drive authorization is required.\n\nClick OK to open the Google Authorization page, or Cancel to use the "Link Video (YouTube / Drive)" tab.`
            );
            if (proceed) {
                handleConnectGoogleDrive();
            }
            return;
        }

        const file = entry.file;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const uploadId = entry.uploadId;

        pauseFlagsRef.current[entry.id] = false;
        updateFileMeta(entry.id, 'status', 'uploading');
        updateFileMeta(entry.id, 'statusText', 'Checking server status...');

        let uploadedChunks = [];
        try {
            const statusRes = await api.get(`/gallery/upload-status/${uploadId}`);
            uploadedChunks = statusRes.data.uploadedChunks || [];
        } catch {
            uploadedChunks = [];
        }

        const startTime = Date.now();
        let bytesUploaded = uploadedChunks.length * CHUNK_SIZE;

        for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
            if (pauseFlagsRef.current[entry.id]) {
                updateFileMeta(entry.id, 'status', 'paused');
                updateFileMeta(entry.id, 'statusText', 'Upload paused. Click resume to continue.');
                return;
            }

            if (uploadedChunks.includes(chunkIdx)) {
                continue;
            }

            let chunkSuccess = false;
            let attempt = 0;
            const maxAttempts = 3;

            while (!chunkSuccess && attempt < maxAttempts) {
                if (pauseFlagsRef.current[entry.id]) {
                    updateFileMeta(entry.id, 'status', 'paused');
                    updateFileMeta(entry.id, 'statusText', 'Upload paused. Click resume to continue.');
                    return;
                }

                attempt++;
                if (attempt > 1) {
                    updateFileMeta(entry.id, 'statusText', `Network retry for chunk ${chunkIdx + 1} (${attempt}/${maxAttempts})...`);
                    await new Promise(r => setTimeout(r, attempt * 1200));
                }

                const start = chunkIdx * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunkBlob = file.slice(start, end);

                const formData = new FormData();
                formData.append('chunk', chunkBlob, `chunk_${chunkIdx}`);
                formData.append('uploadId', uploadId);
                formData.append('chunkIndex', String(chunkIdx));
                formData.append('totalChunks', String(totalChunks));
                formData.append('fileName', file.name);
                formData.append('title', entry.title);
                formData.append('category', normalizeCategory(entry.category === 'new' ? entry.customCategory : entry.category));
                formData.append('sectionName', entry.sectionName || 'Project Gallery');
                formData.append('description', entry.description || '');
                formData.append('date', entry.date || '');
                formData.append('videoDuration', entry.videoDuration || '');
                if (entry.thumbnailPreview) {
                    formData.append('thumbnailBase64', entry.thumbnailPreview);
                }

                const controller = new AbortController();
                abortControllersRef.current[entry.id] = controller;

                try {
                    const response = await api.post('/gallery/upload-chunk', formData, {
                        signal: controller.signal,
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    chunkSuccess = true;
                    uploadedChunks.push(chunkIdx);
                    bytesUploaded += (end - start);

                    const percent = Math.min(99, Math.round((uploadedChunks.length / totalChunks) * 100));
                    const elapsedSec = (Date.now() - startTime) / 1000;
                    const speedMBs = elapsedSec > 0 ? ((bytesUploaded / (1024 * 1024)) / elapsedSec).toFixed(1) : '0.0';

                    updateFileMeta(entry.id, 'progress', percent);
                    updateFileMeta(entry.id, 'currentChunk', chunkIdx + 1);
                    updateFileMeta(entry.id, 'speed', `${speedMBs} MB/s`);
                    updateFileMeta(entry.id, 'statusText', `Uploaded chunk ${chunkIdx + 1} of ${totalChunks} (${speedMBs} MB/s)`);

                    if (response.data.status === 'complete' || response.data.isComplete) {
                        updateFileMeta(entry.id, 'progress', 100);
                        updateFileMeta(entry.id, 'status', 'done');
                        updateFileMeta(entry.id, 'statusText', 'Completed & saved to gallery!');
                        fetchItems();
                        return;
                    }
                } catch (err) {
                    if (err.name === 'CanceledError' || err.name === 'AbortError' || pauseFlagsRef.current[entry.id]) {
                        updateFileMeta(entry.id, 'status', 'paused');
                        updateFileMeta(entry.id, 'statusText', 'Upload paused. Click resume to continue.');
                        return;
                    }
                    console.warn(`Chunk ${chunkIdx} upload failed (attempt ${attempt}):`, err.response?.data?.message || err.message);

                    // If ImageKit size limit error
                    if (err.response?.data?.message?.includes('exceeds ImageKit')) {
                        updateFileMeta(entry.id, 'status', 'error');
                        updateFileMeta(entry.id, 'statusText', err.response.data.message);
                        alert(err.response.data.message);
                        return;
                    }

                    if (attempt >= maxAttempts) {
                        updateFileMeta(entry.id, 'status', 'paused');
                        updateFileMeta(entry.id, 'statusText', 'Network paused. Click resume to retry.');
                        return;
                    }
                }
            }
        }

        // All chunks are on server -> trigger final assembly
        const targetStorage = entry.isOverFreeLimit ? 'Google Drive' : 'ImageKit';
        updateFileMeta(entry.id, 'status', 'assembling');
        updateFileMeta(entry.id, 'statusText', `Assembling chunks and finalizing to ${targetStorage}...`);

        try {
            const finalizeRes = await api.post('/gallery/finalize-upload', {
                uploadId,
                totalChunks,
                fileName: file.name,
                title: entry.title,
                category: normalizeCategory(entry.category === 'new' ? entry.customCategory : entry.category),
                sectionName: entry.sectionName || 'Project Gallery',
                description: entry.description || '',
                date: entry.date || '',
                videoDuration: entry.videoDuration || '',
                thumbnailBase64: entry.thumbnailPreview || '',
            });

            const provider = finalizeRes.data?.storageProvider === 'google-drive' ? 'Google Drive' : 'ImageKit';
            updateFileMeta(entry.id, 'progress', 100);
            updateFileMeta(entry.id, 'status', 'done');
            updateFileMeta(entry.id, 'statusText', `Completed & saved to gallery (${provider})!`);
            fetchItems();
        } catch (finalizeErr) {
            console.error('Finalize error:', finalizeErr);
            const msg = finalizeErr.response?.data?.message || 'Server failed to finalize video upload.';
            updateFileMeta(entry.id, 'status', 'error');
            updateFileMeta(entry.id, 'statusText', msg);
            alert(msg);
        }
    };

    // Standard single upload for photos
    const uploadSingleImage = async (entry) => {
        updateFileMeta(entry.id, 'status', 'uploading');
        updateFileMeta(entry.id, 'statusText', 'Uploading photo...');
        const formData = new FormData();
        formData.append('title', entry.title);
        formData.append('category', normalizeCategory(entry.category === 'new' ? entry.customCategory : entry.category));
        formData.append('sectionName', entry.sectionName || 'Project Gallery');
        formData.append('description', entry.description || '');
        formData.append('date', entry.date || '');
        formData.append('image', entry.file);

        try {
            await api.post('/gallery', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    updateFileMeta(entry.id, 'progress', percent);
                }
            });
            updateFileMeta(entry.id, 'progress', 100);
            updateFileMeta(entry.id, 'status', 'done');
            updateFileMeta(entry.id, 'statusText', 'Completed');
            fetchItems();
        } catch {
            updateFileMeta(entry.id, 'status', 'error');
            updateFileMeta(entry.id, 'statusText', 'Upload failed. Click retry.');
        }
    };

    // Pause handler
    const handlePause = (id) => {
        pauseFlagsRef.current[id] = true;
        if (abortControllersRef.current[id]) {
            abortControllersRef.current[id].abort();
        }
        updateFileMeta(id, 'status', 'paused');
        updateFileMeta(id, 'statusText', 'Upload paused. Click resume to continue.');
    };

    // Resume handler
    const handleResume = (id) => {
        const entry = selectedFiles.find(f => f.id === id);
        if (!entry) return;
        pauseFlagsRef.current[id] = false;
        if (entry.isVideo) {
            uploadSingleVideoResumable(entry);
        } else {
            uploadSingleImage(entry);
        }
    };

    // Cancel upload handler
    const handleCancelUpload = async (id) => {
        pauseFlagsRef.current[id] = true;
        if (abortControllersRef.current[id]) {
            abortControllersRef.current[id].abort();
        }
        const entry = selectedFiles.find(f => f.id === id);
        if (entry?.uploadId && entry.isVideo) {
            try {
                await api.post(`/gallery/cancel-upload/${entry.uploadId}`);
            } catch {
                // ignore
            }
        }
        removeSelectedFile(id);
    };

    // Upload All button
    const handleUploadAll = async () => {
        const pending = selectedFiles.filter(f => f.status === 'pending' || f.status === 'paused' || f.status === 'error');
        if (!pending.length) return alert('No pending files to upload');

        setUploading(true);
        for (const entry of pending) {
            if (entry.isVideo) {
                await uploadSingleVideoResumable(entry);
            } else {
                await uploadSingleImage(entry);
            }
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Handle Video Link Submission ──────────────────────────────────────────
    const handleLinkSubmit = async (e) => {
        e.preventDefault();
        if (!linkForm.videoUrl.trim()) return alert('Please enter a video URL');
        if (!linkForm.title.trim()) return alert('Please enter a title');

        setLinkSubmitting(true);
        try {
            await api.post('/gallery/video-link', {
                title: linkForm.title.trim(),
                category: normalizeCategory(linkForm.category === 'new' ? linkForm.customCategory : linkForm.category),
                sectionName: linkForm.sectionName || 'Project Gallery',
                description: linkForm.description.trim(),
                date: linkForm.date || new Date().getFullYear().toString(),
                videoUrl: linkForm.videoUrl.trim(),
                videoDuration: linkForm.videoDuration.trim(),
                thumbnailUrl: linkForm.thumbnailUrl.trim(),
            });
            alert('Video link added to gallery successfully!');
            setLinkForm({
                title: '',
                category: 'Outreach',
                customCategory: '',
                videoUrl: '',
                sectionName: 'Project Gallery',
                description: '',
                date: new Date().getFullYear().toString(),
                videoDuration: '',
                thumbnailUrl: '',
            });
            fetchItems();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add video link');
        } finally {
            setLinkSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('WARNING: This permanently deletes the file from ImageKit and the database.')) {
            try {
                await api.delete(`/gallery/${id}`);
                fetchItems();
            } catch {
                alert('Delete failed');
            }
        }
    };

    const handleStartEdit = (item) => {
        setEditingItem(item);
        setEditForm({
            title: item.title || '',
            category: item.category || 'Outreach',
            customCategory: '',
            sectionName: item.sectionName || 'Project Gallery',
            description: item.description || '',
            date: item.date || '',
            videoDuration: item.videoDuration || '',
            videoUrl: item.videoUrl || '',
            thumbnailUrl: item.thumbnailUrl || '',
            thumbnailPreview: item.thumbnailUrl || '',
            thumbnailFile: null,
            imageFile: null,
            imagePreview: item.imageUrl || '',
        });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingItem) return;
        if (!editForm.title.trim()) return alert('Please enter a title');

        setEditSaving(true);
        try {
            const chosenCategory = editForm.category === 'new'
                ? (editForm.customCategory?.trim() || 'General')
                : editForm.category;

            const formData = new FormData();
            formData.append('title', editForm.title.trim());
            formData.append('category', normalizeCategory(chosenCategory));
            formData.append('sectionName', editForm.sectionName || 'Project Gallery');
            formData.append('description', editForm.description?.trim() || '');
            formData.append('date', editForm.date?.trim() || '');

            if (editingItem.mediaType === 'video') {
                formData.append('videoDuration', editForm.videoDuration?.trim() || '');
                if (editForm.videoUrl) {
                    formData.append('videoUrl', editForm.videoUrl.trim());
                }
                if (editForm.thumbnailFile) {
                    formData.append('thumbnail', editForm.thumbnailFile);
                } else if (!editForm.thumbnailPreview) {
                    formData.append('thumbnailUrl', '');
                }
            } else if (editingItem.mediaType === 'image') {
                if (editForm.imageFile) {
                    formData.append('image', editForm.imageFile);
                }
            }

            await api.put(`/gallery/${editingItem._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setEditingItem(null);
            fetchItems();
        } catch (err) {
            console.error('Update failed:', err);
            alert(err.response?.data?.message || 'Update failed');
        } finally {
            setEditSaving(false);
        }
    };

    const pendingCount = selectedFiles.filter(f => f.status === 'pending' || f.status === 'paused').length;
    const doneCount = selectedFiles.filter(f => f.status === 'done').length;

    if (loading) return <div className="p-8 text-center text-gray-500">Loading gallery data...</div>;

    const filteredItems = filterSection === 'all'
        ? items
        : items.filter(i => (i.sectionName || 'Project Gallery') === filterSection);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
            {/* Upload Area */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <UploadCloud className="text-blue-500" /> Video & Photo Management
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Upload videos (up to 100MB on ImageKit Free Tier) with pause/resume, or embed larger videos via YouTube/Google Drive link.
                        </p>
                    </div>

                    {/* Mode Selector Tabs */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setActiveUploadMode('file')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                                activeUploadMode === 'file'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <UploadCloud size={14} /> Upload Video/Image File
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveUploadMode('link')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                                activeUploadMode === 'link'
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <LinkIcon size={14} /> Link Video (YouTube / Drive)
                        </button>
                    </div>
                </div>

                {/* ── MODE 1: Direct Resumable Upload ──────────────────────────────── */}
                {activeUploadMode === 'file' && (
                    <>
                        {/* Hybrid Storage Notice Banner */}
                        <div className="mb-4 p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3 text-xs text-blue-900 flex-wrap">
                            <div className="flex items-center gap-2.5">
                                <UploadCloud size={18} className="text-blue-600 shrink-0" />
                                <div>
                                    <span className="font-bold">Smart Hybrid Storage:</span> Videos ≤ 100 MB upload to <strong>ImageKit CDN</strong>. Videos &gt; 100 MB automatically route to <strong>Google Drive</strong>!
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {driveStatus && driveStatus.hasRefreshToken ? (
                                    <span className="text-green-700 font-bold flex items-center gap-1.5 text-xs bg-green-100 border border-green-200 px-3 py-1 rounded-full whitespace-nowrap">
                                        <CheckCircle size={14} className="text-green-600" /> Google Drive Connected
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleConnectGoogleDrive}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm whitespace-nowrap transition-all"
                                    >
                                        <LinkIcon size={13} /> Authorize Google Drive
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Shared Metadata */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shared Title</label>
                                <input type="text" value={sharedMeta.title}
                                    onChange={e => setSharedMeta({ ...sharedMeta, title: e.target.value })}
                                    placeholder="e.g. Workshop at Tuniki"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
                                        <input type="text" value={sharedMeta.customCategory}
                                            onChange={e => setSharedMeta({ ...sharedMeta, customCategory: e.target.value })}
                                            placeholder="e.g. Workshop"
                                            className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gallery Section</label>
                                <select value={sharedMeta.sectionName} onChange={e => setSharedMeta({ ...sharedMeta, sectionName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="Project Gallery">📸 Project Gallery (default)</option>
                                    {sections.map(s => <option key={s._id} value={s.title}>{s.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                                <input type="text" value={sharedMeta.description}
                                    onChange={e => setSharedMeta({ ...sharedMeta, description: e.target.value })}
                                    placeholder="Brief description..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Year/Date</label>
                                <input type="text" value={sharedMeta.date}
                                    onChange={e => setSharedMeta({ ...sharedMeta, date: e.target.value })}
                                    placeholder="2024"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        {/* File Picker + Buttons */}
                        <div className="flex flex-wrap items-center gap-3 mb-6 pt-4 border-t border-gray-100">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm rounded-lg border border-blue-200 transition-colors">
                                <Video size={16} className="text-purple-600" />
                                <ImageIcon size={16} className="text-blue-600" />
                                Select Video or Photo Files
                                <input type="file" multiple accept="image/*,video/*"
                                    onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                            </label>
                            {selectedFiles.some(f => f.status === 'pending') && (
                                <button onClick={applySharedMeta}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 transition-colors">
                                    Apply Metadata to All
                                </button>
                            )}
                            {doneCount > 0 && (
                                <button onClick={clearCompleted}
                                    className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium text-sm rounded-lg border border-green-200 transition-colors">
                                    Clear Completed ({doneCount})
                                </button>
                            )}
                            {pendingCount > 0 && (
                                <button onClick={handleUploadAll} disabled={uploading}
                                    className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm disabled:opacity-60 flex items-center gap-2 transition-colors">
                                    {uploading
                                        ? <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                                        : `Upload All (${pendingCount})`}
                                </button>
                            )}
                        </div>

                        {/* Per-File Preview & Control Cards */}
                        {selectedFiles.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {selectedFiles.map(entry => {
                                    const isPaused = entry.status === 'paused';
                                    const isUploading = entry.status === 'uploading';
                                    const isAssembling = entry.status === 'assembling';
                                    const isDone = entry.status === 'done';
                                    const isError = entry.status === 'error';

                                    return (
                                        <div key={entry.id}
                                            className={`border rounded-xl overflow-hidden shadow-sm transition-all flex flex-col ${
                                                isDone ? 'border-green-300 bg-green-50/20' :
                                                isPaused ? 'border-amber-300 bg-amber-50/20' :
                                                isUploading ? 'border-blue-400 bg-blue-50/10' :
                                                isError ? 'border-red-300 bg-red-50/20' : 'border-gray-200 bg-white'
                                            }`}>

                                            {/* Preview Area */}
                                            <div className="relative h-44 bg-gray-900 group">
                                                {entry.isVideo ? (
                                                    <>
                                                        <video
                                                            src={entry.previewUrl}
                                                            className="w-full h-full object-contain"
                                                            controls
                                                            playsInline
                                                        />
                                                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
                                                            <Video size={10} className="text-purple-400" /> VIDEO
                                                        </div>
                                                    </>
                                                ) : (
                                                    <img src={entry.previewUrl} alt={entry.title} className="w-full h-full object-cover" />
                                                )}

                                                {/* Status Badge */}
                                                <div className="absolute top-2 right-2 pointer-events-none">
                                                    {isDone && <span className="flex items-center gap-1 text-xs bg-green-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow"><CheckCircle size={12} /> Done</span>}
                                                    {isPaused && <span className="flex items-center gap-1 text-xs bg-amber-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow"><Pause size={12} /> Paused</span>}
                                                    {isUploading && <span className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow animate-pulse"><Loader2 size={12} className="animate-spin" /> Uploading</span>}
                                                    {isAssembling && <span className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow"><Loader2 size={12} className="animate-spin" /> Assembling</span>}
                                                    {isError && <span className="flex items-center gap-1 text-xs bg-red-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow"><AlertCircle size={12} /> Error</span>}
                                                </div>

                                                {!isDone && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelUpload(entry.id)}
                                                        className="absolute bottom-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors z-10"
                                                        title="Cancel & Remove"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Size Routing Indicator if > 100MB */}
                                            {entry.isOverFreeLimit && (
                                                <div className="p-2.5 bg-indigo-50 border-b border-indigo-200 text-indigo-900 text-[11px] flex items-start gap-1.5 leading-snug">
                                                    <UploadCloud size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                                                    <span>
                                                        <strong>{entry.sizeMB} MB:</strong> Exceeds 100 MB. Will automatically route to <strong>Google Drive</strong> upon completion.
                                                    </span>
                                                </div>
                                            )}

                                            {/* Progress & Resilient Controls */}
                                            <div className="p-3 bg-gray-50 border-b border-gray-100 space-y-2">
                                                <div className="flex items-center justify-between text-xs font-semibold">
                                                    <span className="text-gray-700 truncate max-w-[200px]">{entry.statusText}</span>
                                                    <span className="text-blue-600 font-bold">{entry.progress}%</span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-300 rounded-full ${
                                                            isDone ? 'bg-green-500' :
                                                            isPaused ? 'bg-amber-500' :
                                                            isError ? 'bg-red-500' : 'bg-blue-600'
                                                        }`}
                                                        style={{ width: `${entry.progress}%` }}
                                                    />
                                                </div>

                                                {/* Resilient Control Buttons */}
                                                <div className="flex items-center justify-between pt-1">
                                                    <div className="text-[11px] text-gray-500">
                                                        {entry.isVideo && (
                                                            <span>{entry.sizeMB} MB • {entry.totalChunks} chunks</span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        {isUploading && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePause(entry.id)}
                                                                className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
                                                            >
                                                                <Pause size={12} /> Pause
                                                            </button>
                                                        )}

                                                        {(isPaused || isError) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleResume(entry.id)}
                                                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
                                                            >
                                                                <RotateCcw size={12} /> Resume
                                                            </button>
                                                        )}

                                                        {entry.status === 'pending' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => entry.isVideo ? uploadSingleVideoResumable(entry) : uploadSingleImage(entry)}
                                                                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors"
                                                            >
                                                                <Play size={12} /> Start
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Per-File Metadata Inputs */}
                                            <div className="p-3 space-y-2 flex-grow flex flex-col">
                                                <input type="text" value={entry.title}
                                                    onChange={e => updateFileMeta(entry.id, 'title', e.target.value)}
                                                    disabled={isDone || isUploading}
                                                    className="w-full text-sm font-semibold border border-gray-200 rounded px-2 py-1 disabled:bg-gray-50 focus:border-blue-400"
                                                    placeholder="Title" />

                                                <div className="flex gap-2">
                                                    <select value={entry.category}
                                                        onChange={e => updateFileMeta(entry.id, 'category', e.target.value)}
                                                        disabled={isDone || isUploading}
                                                        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 disabled:bg-gray-50 bg-white">
                                                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                        <option value="new" className="font-semibold text-blue-600">+ New Category</option>
                                                    </select>
                                                    <input type="text" value={entry.date}
                                                        onChange={e => updateFileMeta(entry.id, 'date', e.target.value)}
                                                        disabled={isDone || isUploading}
                                                        className="w-20 text-xs border border-gray-200 rounded px-2 py-1 disabled:bg-gray-50"
                                                        placeholder="Year" />
                                                </div>

                                                {entry.category === 'new' && (
                                                    <input type="text" value={entry.customCategory || ''}
                                                        onChange={e => updateFileMeta(entry.id, 'customCategory', e.target.value)}
                                                        disabled={isDone || isUploading}
                                                        className="w-full text-xs border border-blue-300 rounded px-2 py-1"
                                                        placeholder="Enter new category name..." />
                                                )}

                                                <input type="text" value={entry.description}
                                                    onChange={e => updateFileMeta(entry.id, 'description', e.target.value)}
                                                    disabled={isDone || isUploading}
                                                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 disabled:bg-gray-50"
                                                    placeholder="Description" />

                                                {/* Video Duration & Custom Thumbnail */}
                                                {entry.isVideo && (
                                                    <div className="pt-2 border-t border-gray-100 space-y-2 mt-auto">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] uppercase font-bold text-gray-400">Duration:</span>
                                                            <input type="text" value={entry.videoDuration}
                                                                onChange={e => updateFileMeta(entry.id, 'videoDuration', e.target.value)}
                                                                disabled={isDone || isUploading}
                                                                className="flex-1 text-xs border border-gray-200 rounded px-2 py-0.5 font-mono"
                                                                placeholder="e.g. 4:29" />
                                                        </div>

                                                        <div>
                                                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                                                                Thumbnail (Auto-captured / Pick custom)
                                                            </label>
                                                            {entry.thumbnailPreview ? (
                                                                <div className="relative h-14 rounded overflow-hidden border border-gray-200 flex items-center justify-between px-2 bg-gray-50">
                                                                    <img src={entry.thumbnailPreview} className="w-16 h-10 object-cover rounded" alt="thumb" />
                                                                    <span className="text-[10px] text-gray-400 font-medium">Ready</span>
                                                                    {!isDone && !isUploading && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateFileMeta(entry.id, 'thumbnailPreview', null)}
                                                                            className="text-gray-400 hover:text-red-600 p-1">
                                                                            <X size={12} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-blue-400 transition-colors">
                                                                    <ImageIcon size={12} /> Pick custom thumbnail
                                                                    <input type="file" accept="image/*" className="hidden"
                                                                        onChange={(e) => handleThumbnailChange(entry.id, e)} />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ── MODE 2: Link Video URL (YouTube / Google Drive / MP4) ──────── */}
                {activeUploadMode === 'link' && (
                    <form onSubmit={handleLinkSubmit} className="space-y-4 pt-2">
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 leading-relaxed">
                            💡 <strong>No file size limit!</strong> Paste any YouTube video URL (e.g. <code>https://youtube.com/watch?v=...</code>) or Google Drive link (e.g. <code>https://drive.google.com/file/d/.../view</code>).
                            The gallery will embed and play it directly for your visitors.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                    Video URL * (YouTube, Google Drive, or direct MP4 link)
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={linkForm.videoUrl}
                                    onChange={e => setLinkForm({ ...linkForm, videoUrl: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=... or https://drive.google.com/..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                    Video Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={linkForm.title}
                                    onChange={e => setLinkForm({ ...linkForm, title: e.target.value })}
                                    placeholder="e.g. Science Technology & Innovation Hub Overview"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Category</label>
                                    <select
                                        value={linkForm.category}
                                        onChange={e => setLinkForm({ ...linkForm, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 bg-white"
                                    >
                                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="new" className="font-semibold text-purple-600">+ New Category</option>
                                    </select>
                                </div>
                                {linkForm.category === 'new' && (
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">New Category</label>
                                        <input
                                            type="text"
                                            value={linkForm.customCategory}
                                            onChange={e => setLinkForm({ ...linkForm, customCategory: e.target.value })}
                                            placeholder="e.g. Documentary"
                                            className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Section</label>
                                <select
                                    value={linkForm.sectionName}
                                    onChange={e => setLinkForm({ ...linkForm, sectionName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 bg-white"
                                >
                                    <option value="Project Gallery">📸 Project Gallery (default)</option>
                                    {sections.map(s => <option key={s._id} value={s.title}>{s.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Duration (e.g. 4:29)</label>
                                <input
                                    type="text"
                                    value={linkForm.videoDuration}
                                    onChange={e => setLinkForm({ ...linkForm, videoDuration: e.target.value })}
                                    placeholder="e.g. 4:29"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Year / Date</label>
                                <input
                                    type="text"
                                    value={linkForm.date}
                                    onChange={e => setLinkForm({ ...linkForm, date: e.target.value })}
                                    placeholder="2026"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Thumbnail Image URL (optional)</label>
                                <input
                                    type="url"
                                    value={linkForm.thumbnailUrl}
                                    onChange={e => setLinkForm({ ...linkForm, thumbnailUrl: e.target.value })}
                                    placeholder="https://... (or leave blank for default poster)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={linkForm.description}
                                    onChange={e => setLinkForm({ ...linkForm, description: e.target.value })}
                                    placeholder="Brief description of the video..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <button
                                type="submit"
                                disabled={linkSubmitting}
                                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-lg shadow-sm disabled:opacity-60 flex items-center gap-2 transition-colors"
                            >
                                {linkSubmitting
                                    ? <><Loader2 size={16} className="animate-spin" /> Adding Video...</>
                                    : <><LinkIcon size={16} /> Add Video to Gallery</>
                                }
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Gallery Database Grid */}
            <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b pb-3">
                    <h3 className="text-lg font-bold text-gray-800">
                        Gallery Database ({filterSection === 'all' ? items.length : filteredItems.length})
                        {filterSection !== 'all' && <span className="ml-2 text-sm font-normal text-blue-600">— {filterSection}</span>}
                    </h3>
                    <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400">
                        <option value="all">All Sections</option>
                        <option value="Project Gallery">📸 Project Gallery</option>
                        {sections.map(s => <option key={s._id} value={s.title}>{s.title}</option>)}
                    </select>
                </div>

                {items.length === 0 ? (
                    <p className="text-gray-500 italic bg-gray-50 p-4 rounded-md text-center">No items uploaded yet.</p>
                ) : filteredItems.length === 0 ? (
                    <p className="text-gray-500 italic bg-gray-50 p-4 rounded-md text-center">No items in this section yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredItems.map(item => {
                            const isVideo = item.mediaType === 'video';
                            return (
                                <div key={item._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">

                                    {/* Thumbnail */}
                                    <div className="h-48 bg-gray-900 relative overflow-hidden">
                                        {isVideo ? (
                                            <>
                                                {item.thumbnailUrl ? (
                                                    <img src={item.thumbnailUrl} alt={item.title}
                                                        className="w-full h-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                                        <Video size={36} className="text-gray-500" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <PlayCircle size={40} className="text-white/60 drop-shadow-lg" fill="rgba(255,255,255,0.2)" />
                                                </div>
                                                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    <Video size={10} /> VIDEO
                                                </div>
                                                {item.videoDuration && (
                                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded">
                                                        {item.videoDuration}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <img src={item.imageUrl} alt={item.title}
                                                className="w-full h-full object-cover" loading="lazy" />
                                        )}

                                        {/* Edit / Delete overlay */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                type="button"
                                                onClick={() => handleStartEdit(item)}
                                                title="Edit details"
                                                className="p-1.5 bg-white/95 text-blue-600 rounded-lg shadow-md hover:bg-blue-50 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item._id)}
                                                title="Delete item"
                                                className="p-1.5 bg-white/95 text-red-600 rounded-lg shadow-md hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded font-medium">
                                            {item.imageKitFileId ? `ID: ...${item.imageKitFileId.slice(-6)}` : item.googleDriveFileId ? '📁 Drive' : '🔗 Link'}
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="p-4 flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <h4 className="font-bold text-gray-900 leading-tight line-clamp-2 flex-1">{item.title}</h4>
                                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                                    {item.category}
                                                </span>
                                            </div>
                                            {item.description && (
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
                                            )}
                                        </div>
                                        <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                                            <span>📅 {item.date || 'Year N/A'}</span>
                                            <span className="text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                {item.sectionName || 'Project Gallery'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Edit Gallery Item Modal ─────────────────────────────── */}
            {editingItem && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 my-8 animate-fadeInUp">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {editingItem.mediaType === 'video' ? (
                                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <Video size={20} />
                                    </div>
                                ) : (
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <ImageIcon size={20} />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        {editingItem.mediaType === 'video' ? 'Edit Video Details' : 'Edit Photo Details'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        ID: {editingItem._id} • {editingItem.storageProvider === 'google-drive' ? 'Stored on Google Drive' : editingItem.imageKitFileId ? 'Stored on ImageKit' : 'Linked URL'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            {/* Media Preview */}
                            <div className="h-44 bg-gray-950 rounded-xl overflow-hidden relative flex items-center justify-center">
                                {editingItem.mediaType === 'video' ? (
                                    editingItem.thumbnailUrl ? (
                                        <img src={editingItem.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-gray-400 space-y-2">
                                            <Video size={36} className="mx-auto text-purple-400" />
                                            <span className="text-xs">Video file / Stream</span>
                                        </div>
                                    )
                                ) : (
                                    <img src={editingItem.imageUrl} alt={editingItem.title} className="w-full h-full object-contain" />
                                )}
                                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-black/75 text-white text-[11px] font-bold rounded-md">
                                    {editingItem.mediaType === 'video' ? 'VIDEO' : 'PHOTO'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        placeholder="Title..."
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Category *
                                    </label>
                                    <select
                                        value={editForm.category}
                                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                    >
                                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="new" className="font-semibold text-blue-600">+ New Category</option>
                                    </select>
                                    {editForm.category === 'new' && (
                                        <input
                                            type="text"
                                            required
                                            value={editForm.customCategory}
                                            onChange={e => setEditForm({ ...editForm, customCategory: e.target.value })}
                                            placeholder="Enter new category name..."
                                            className="w-full mt-2 px-3 py-2 bg-white text-gray-900 border border-blue-400 rounded-lg text-sm"
                                        />
                                    )}
                                </div>

                                {/* Section */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Section
                                    </label>
                                    <select
                                        value={editForm.sectionName}
                                        onChange={e => setEditForm({ ...editForm, sectionName: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                    >
                                        <option value="Project Gallery">📸 Project Gallery (default)</option>
                                        {sections.map(s => <option key={s._id} value={s.title}>{s.title}</option>)}
                                    </select>
                                </div>

                                {/* Date / Year */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Year / Date
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.date}
                                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 shadow-sm"
                                        placeholder="e.g. 2026"
                                    />
                                </div>

                                {/* Video Duration (if video) */}
                                {editingItem.mediaType === 'video' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Video Duration
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.videoDuration}
                                            onChange={e => setEditForm({ ...editForm, videoDuration: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 shadow-sm"
                                            placeholder="e.g. 4:29"
                                        />
                                    </div>
                                )}

                                {/* Video URL (if video) */}
                                {editingItem.mediaType === 'video' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Video Stream / Link URL
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.videoUrl}
                                            onChange={e => setEditForm({ ...editForm, videoUrl: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 shadow-sm"
                                            placeholder="https://..."
                                        />
                                        <p className="text-[11px] text-gray-500 mt-1">
                                            {editingItem.storageProvider === 'google-drive'
                                                ? '📁 Video is hosted in your Google Drive (can be swapped with another Drive/YouTube link anytime)'
                                                : 'Video file stream source'}
                                        </p>
                                    </div>
                                )}

                                {/* Thumbnail Manager (if video) */}
                                {editingItem.mediaType === 'video' && (
                                    <div className="md:col-span-2 pt-2 border-t border-gray-100">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Thumbnail (Auto-Captured / Pick Custom)
                                        </label>
                                        <div className="flex items-center gap-4 flex-wrap">
                                            {editForm.thumbnailPreview ? (
                                                <div className="relative w-44 h-24 rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-gray-900 flex items-center justify-center group">
                                                    <img src={editForm.thumbnailPreview} alt="thumbnail" className="w-full h-full object-cover" />
                                                    <span className="absolute bottom-1.5 left-2 text-[10px] bg-black/80 text-white font-bold px-2 py-0.5 rounded">
                                                        {editForm.thumbnailFile ? 'New Selected' : 'Ready'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditForm(f => ({ ...f, thumbnailFile: null, thumbnailPreview: '' }))}
                                                        className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                                                        title="Remove thumbnail"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-44 h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-xs font-medium">
                                                    No Thumbnail Set
                                                </div>
                                            )}

                                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 rounded-lg text-xs font-bold text-gray-700 shadow-sm transition-all">
                                                <ImageIcon size={16} className="text-blue-500" />
                                                {editForm.thumbnailPreview ? 'Change Custom Thumbnail' : 'Pick Custom Thumbnail'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setEditForm(f => ({
                                                                ...f,
                                                                thumbnailFile: file,
                                                                thumbnailPreview: URL.createObjectURL(file)
                                                            }));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Image Replacement (if photo) */}
                                {editingItem.mediaType === 'image' && (
                                    <div className="md:col-span-2 pt-2 border-t border-gray-100">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Replace Photo (Optional)
                                        </label>
                                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 rounded-lg text-xs font-bold text-gray-700 shadow-sm transition-all">
                                            <ImageIcon size={16} className="text-blue-500" />
                                            {editForm.imageFile ? `Selected: ${editForm.imageFile.name}` : 'Choose Replacement Photo'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setEditForm(f => ({
                                                            ...f,
                                                            imageFile: file,
                                                            imagePreview: URL.createObjectURL(file)
                                                        }));
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={editForm.description}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
                                        placeholder="Description of this item..."
                                    />
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSaving}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {editSaving ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryManager;
