import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Trash2,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Check,
  Building,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Preset avatars for rapid selection
const AVATAR_PRESETS = [
  {
    label: 'Field Tech 1 (Male)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  },
  {
    label: 'Operations Lead (Female)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
  },
  {
    label: 'Electrical Specialist',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  },
  {
    label: 'Field Engineer (Female)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  },
  {
    label: 'Solar Specialist',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=250&auto=format&fit=crop&q=80',
  },
  {
    label: 'Senior Tech (Safety Gear)',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
  },
];

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    currentOrg,
    users,
    userProfileModalOpen,
    setUserProfileModalOpen,
    uploadCurrentUserAvatar,
    removeCurrentUserAvatar,
    updateCurrentUserProfile,
    switchUser,
    showToast,
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync form inputs when current user changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setAvatarPreview(currentUser.avatar || null);
    }
  }, [currentUser, userProfileModalOpen]);

  // Clean up camera stream on unmount or when modal closes
  useEffect(() => {
    if (!userProfileModalOpen && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  }, [userProfileModalOpen]);

  if (!userProfileModalOpen || !currentUser) return null;

  // Process & compress file to 360x360 data URL using client-side canvas
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, etc.)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 360;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Center crop square
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 360, 360);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setAvatarPreview(compressedDataUrl);
        showToast('Image selected! Click "Save Changes" to apply.', 'info');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Live Camera capture
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access unavailable or permission was denied.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 360;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 360, 360);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setAvatarPreview(dataUrl);
    stopCamera();
    showToast('Photo captured! Click "Save Changes" to apply.', 'info');
  };

  const handleSelectPreset = (url: string) => {
    setAvatarPreview(url);
    showToast('Preset avatar selected. Click "Save Changes" to apply.', 'info');
  };

  const handleRemovePhoto = async () => {
    setAvatarPreview(null);
    if (!currentUser.avatar) {
      showToast('Avatar is already cleared', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      await removeCurrentUserAvatar();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Update text details if changed
      const updates: { name?: string; email?: string; phone?: string; avatar?: string } = {};
      if (name.trim() && name !== currentUser.name) updates.name = name.trim();
      if (email.trim() && email !== currentUser.email) updates.email = email.trim();
      if (phone.trim() && phone !== currentUser.phone) updates.phone = phone.trim();

      // 2. Upload avatar if changed
      if (avatarPreview !== currentUser.avatar) {
        if (avatarPreview) {
          await uploadCurrentUserAvatar(avatarPreview);
        } else {
          await removeCurrentUserAvatar();
        }
      }

      if (Object.keys(updates).length > 0) {
        await updateCurrentUserProfile(updates);
      }

      setUserProfileModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save profile changes', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (text: string) => {
    return text
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      id="user-profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) {
          stopCamera();
          setUserProfileModalOpen(false);
        }
      }}
    >
      <div
        id="user-profile-modal-card"
        className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">User Profile &amp; Avatar</h2>
              <p className="text-xs text-slate-400">
                Upload and customize your platform photo and credentials
              </p>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={() => {
              stopCamera();
              setUserProfileModalOpen(false);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Quick Team Member Profile Switcher (Simulate other users) */}
          {users.length > 1 && (
            <div className="bg-[#131D31] p-3.5 rounded-xl border border-slate-700/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  Active User Account:
                </span>
                <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  Role: {currentUser.role.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {users.map(u => {
                  const isActive = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => switchUser(u.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white font-semibold ring-2 ring-teal-400/40 shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-700 shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] flex items-center justify-center h-full text-slate-300 font-bold">
                            {getInitials(u.name)}
                          </span>
                        )}
                      </div>
                      <span>{u.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Profile Picture Upload Section */}
          <div className="bg-[#0B1120] p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-400" />
              Profile Picture
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar Preview Ring */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-teal-500/40 bg-slate-800 shadow-xl flex items-center justify-center relative ring-4 ring-slate-900">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-teal-700 to-emerald-600 text-white font-bold text-2xl">
                      {getInitials(currentUser.name)}
                    </div>
                  )}

                  {/* Hover Overlay Button to trigger upload */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-1 text-[11px] font-medium"
                    title="Click to change photo"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Change</span>
                  </button>
                </div>

                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-[10px]" title="Active">
                  ✓
                </span>
              </div>

              {/* Upload & Action Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    isDragging
                      ? 'border-teal-400 bg-teal-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    id="profile-picture-file-input"
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      id="upload-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Browse Photo
                    </button>

                    {!isCameraActive ? (
                      <button
                        type="button"
                        id="start-camera-btn"
                        onClick={startCamera}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-teal-400" />
                        Use Camera
                      </button>
                    ) : (
                      <button
                        type="button"
                        id="stop-camera-btn"
                        onClick={stopCamera}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel Camera
                      </button>
                    )}

                    {avatarPreview && (
                      <button
                        type="button"
                        id="remove-avatar-btn"
                        onClick={handleRemovePhoto}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Drag and drop your image here, or browse. JPEG, PNG, or WebP.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Camera Viewfinder (if active) */}
            {isCameraActive && (
              <div className="bg-[#121826] p-4 rounded-xl border border-teal-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 animate-pulse" />
                    Webcam Capture Live
                  </span>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="relative mx-auto w-64 h-64 rounded-full overflow-hidden border-2 border-teal-400 bg-black flex items-center justify-center shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-full" />
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    id="capture-photo-btn"
                    onClick={capturePhoto}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Take Snapshot
                  </button>
                </div>
              </div>
            )}

            {cameraError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {cameraError}
              </p>
            )}

            {/* Avatar Presets Selection Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Or pick a professional team avatar preset:
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className="group flex flex-col items-center gap-1.5 p-1.5 rounded-xl border border-slate-800 hover:border-teal-500 bg-slate-900/60 hover:bg-teal-500/5 transition-all text-center"
                    title={preset.label}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 group-hover:border-teal-400 transition-colors">
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-teal-300 truncate max-w-full">
                      {preset.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Information Form */}
          <form id="profile-edit-form" onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-teal-400" />
              User Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="profile-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Faith Wanjiku"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="profile-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    placeholder="e.g. faith@fieldnora.co.ke"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="profile-phone-input"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>

              {/* Organization & Role info */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Organization &amp; Assigned Role
                </label>
                <div className="flex items-center gap-2 p-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300">
                  <Building className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{currentOrg?.name || 'Fieldnora Operations'}</span>
                  <span className="ml-auto font-mono text-[10px] uppercase font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B1120] flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {avatarPreview !== currentUser.avatar ? (
              <span className="text-amber-400 flex items-center gap-1 font-medium">
                ● Unsaved avatar changes
              </span>
            ) : (
              <span>Profile in sync with cloud database</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="cancel-profile-modal-btn"
              onClick={() => {
                stopCamera();
                setUserProfileModalOpen(false);
              }}
              className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-edit-form"
              id="save-profile-modal-btn"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
