import { useEffect, useState, useRef } from 'react';
import { User, Mail, Phone, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { api, me } from '../../lib/api';

export default function Profile() {
  const { user, updateProfile, token, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<any>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) {
          setLoadingProfile(false);
          return;
        }
        const res = await me();
        setProfile(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch user profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchUser();
  }, [token]);

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone || '');
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const res = await api.put('/user/update', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      updateProfile(res.data);
      setProfile(res.data);
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={avatarPreview || (profile.avatar ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/storage/${profile.avatar}` : '/default-avatar.png')}
                alt={profile.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors duration-200"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-gray-600">{profile.phone || 'Not provided'}</p>
            </div>
            <div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn-primary">
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button onClick={handleCancel} className="btn-outline">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="input-field pl-10 bg-gray-50 text-gray-900">{profile.name}</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="input-field pl-10 bg-gray-50 text-gray-900">{profile.email}</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="input-field pl-10 bg-gray-50 text-gray-900">
                    {profile.phone || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Change Password</h4>
                <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
              </div>
              <button className="btn-outline">Change Password</button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Manage your email notification preferences</p>
              </div>
              <button className="btn-outline">Manage</button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium text-gray-900">Delete Account</h4>
                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
              </div>
              <button className="text-red-600 hover:text-red-700 font-medium">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}