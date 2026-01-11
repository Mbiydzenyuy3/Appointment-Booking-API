import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function UserProfile() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    profile_picture: "",
    user_type: "",
    provider_info: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // ---------------------
  // Fetch Profile
  // ---------------------
  useEffect(() => {
    if (!user) return;
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        user?.user_type === "provider" ? "/providers/me" : "/auth/profile";
      const response = await api.get(endpoint);

      if (response.data.success) {
        const data = response.data.data;

        if (data.user_type === "provider") {
          setProfileData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            bio: data.bio || "",
            profile_picture: data.profile_picture || "",
            user_type: "provider",
            provider_info: {
              bio: data.bio || "",
              hourly_rate: data.hourly_rate || "",
              service_types: data.service_types || ""
            }
          });
        } else {
          setProfileData({
            ...data,
            user_type: data.user_type,
            provider_info: null
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 404) {
        toast.error(
          "Profile endpoint not available. Please check backend configuration."
        );
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        navigate("/login");
      } else {
        toast.error("Failed to load profile data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------
  // Handlers
  // ---------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProviderInfoChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      provider_info: { ...prev.provider_info, [name]: value }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------------
  // Profile Update
  // ---------------------
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updateData = {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        profile_picture: profileData.profile_picture
      };

      const endpoint =
        user?.user_type === "provider" ? "/providers/me" : "/auth/profile";

      const response = await api.put(endpoint, updateData);

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        fetchProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------
  // Provider Update
  // ---------------------
  const handleProviderProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updateData = {
        bio: profileData.provider_info?.bio || "",
        phone: profileData.phone || ""
      };

      const response = await api.put("/providers/me", updateData);

      if (response.data.success) {
        toast.success("Provider profile updated successfully!");
        fetchProfile();
      }
    } catch (error) {
      console.error("Error updating provider profile:", error);
      toast.error(
        error.response?.data?.message || "Failed to update provider profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------
  // Password Change
  // ---------------------
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------
  // Delete Account
  // ---------------------
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm account deletion");
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.delete("/auth/delete-account", {
        data: { confirmationText: "DELETE" }
      });

      if (response.data.success) {
        toast.success("Account deleted successfully");
        logout();
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmation("");
    }
  };

  // ---------------------
  // Loading State
  // ---------------------
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-600'></div>
      </div>
    );
  }

  // ---------------------
  // Render
  // ---------------------
  return (
    <div className='max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Profile Settings</h1>
        <p className='mt-2 text-gray-600'>
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200 mb-8'>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Profile Information
          </button>

          {profileData.user_type === "provider" && (
            <button
              onClick={() => setActiveTab("provider")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "provider"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Provider Details
            </button>
          )}

          <button
            onClick={() => setActiveTab("security")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "security"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className='bg-white shadow rounded-lg'>
          {profileData.user_type === "provider" ? (
            <div className='p-6 text-center'>
              <div className='text-4xl mb-4'>👤</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Provider Profile
              </h3>
              <p className='text-gray-600 mb-4'>
                Your basic account information is managed through your provider
                profile. Use the "Provider Details" tab to update your business
                information.
              </p>

              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Full Name
                  </label>
                  <input
                    type='text'
                    value={profileData.name}
                    disabled
                    className='mt-1 block w-full text-gray-600 border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Email Address
                  </label>
                  <input
                    type='email'
                    value={profileData.email}
                    disabled
                    className='mt-1 block w-full text-gray-600 border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Account Type
                  </label>
                  <input
                    type='text'
                    value={profileData.user_type}
                    disabled
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm capitalize'
                  />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className='space-y-6 p-6'>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Full Name
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={profileData.name}
                    onChange={handleInputChange}
                    className='mt-1 block w-full text-gray-600 border-gray-300 rounded-md shadow-sm sm:text-sm'
                    placeholder='Enter your full name'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Email Address
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={profileData.email}
                    disabled
                    className='mt-1 block w-full text-gray-600 border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm'
                  />
                  <p className='mt-1 text-xs text-gray-500'>
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className='mt-1 block w-full text-gray-600 border-gray-300 rounded-md shadow-sm sm:text-sm'
                    placeholder='Enter your phone number'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Account Type
                  </label>
                  <input
                    type='text'
                    value={profileData.user_type}
                    disabled
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm capitalize'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Address
                </label>
                <textarea
                  name='address'
                  rows={3}
                  value={profileData.address}
                  onChange={handleInputChange}
                  className='mt-1 block w-full text-gray-600 border-gray-300 rounded-md shadow-sm sm:text-sm'
                  placeholder='Enter your address'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Bio
                </label>
                <textarea
                  name='bio'
                  rows={4}
                  value={profileData.bio}
                  onChange={handleInputChange}
                  className='mt-1 block w-full text-gray-600 border-gray-300 rounded-md shadow-sm sm:text-sm'
                  placeholder='Tell us about yourself...'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Profile Picture URL
                </label>
                <input
                  type='url'
                  name='profile_picture'
                  value={profileData.profile_picture}
                  onChange={handleInputChange}
                  className='mt-1 block w-full text-gray-600 border-gray-300 rounded-md shadow-sm sm:text-sm'
                  placeholder='https://example.com/profile-picture.jpg'
                />
                {profileData.profile_picture && (
                  <div className='mt-2'>
                    <img
                      src={profileData.profile_picture}
                      alt='Profile'
                      className='h-20 w-20 rounded-full object-cover'
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={isSaving}
                  className='ml-3 save-button inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50'
                >
                  {isSaving ? (
                    <div className='flex items-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === "provider" && profileData.user_type === "provider" && (
        <div className='bg-white shadow rounded-lg'>
          <div className='p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
              Provider Information
            </h3>

            {profileData.provider_info ? (
              <form
                onSubmit={handleProviderProfileSubmit}
                className='space-y-6'
              >
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Bio
                  </label>
                  <textarea
                    name='bio'
                    rows={4}
                    value={profileData.provider_info.bio || ""}
                    onChange={handleProviderInfoChange}
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-600'
                    placeholder='Describe your services...'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={profileData.phone || ""}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        phone: e.target.value
                      }))
                    }
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm'
                    placeholder='Enter your phone number'
                  />
                </div>

                <div className='flex justify-end'>
                  <button
                    type='submit'
                    disabled={isSaving}
                    className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50'
                  >
                    {isSaving ? "Saving..." : "Save Provider Info"}
                  </button>
                </div>
              </form>
            ) : (
              <p className='text-gray-500'>
                No provider information available.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className='bg-white shadow rounded-lg'>
          <form onSubmit={handlePasswordSubmit} className='space-y-6 p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
              Change Password
            </h3>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Current Password
              </label>
              <input
                type='password'
                name='currentPassword'
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                New Password
              </label>
              <input
                type='password'
                name='newPassword'
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Confirm New Password
              </label>
              <input
                type='password'
                name='confirmPassword'
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm'
                required
              />
            </div>

            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={isSaving}
                className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50'
              >
                {isSaving ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danger Zone */}
      <div className='border-t border-gray-200 pt-6 mt-6'>
        <h4 className='text-sm font-medium text-red-900 mb-4'>Danger Zone</h4>
        <div className='space-y-3'>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className='inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none'
            >
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
              Delete Account
            </button>
          ) : (
            <div className='border border-red-200 rounded-md p-4 bg-red-50'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-red-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-red-800'>
                    Delete Account
                  </h3>
                  <div className='mt-2 text-sm text-red-700'>
                    <p>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </p>
                    <p className='mt-2 font-medium'>
                      Type{" "}
                      <span className='font-mono bg-red-600 px-1 rounded'>
                        DELETE
                      </span>{" "}
                      to confirm:
                    </p>
                    <input
                      type='text'
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className='mt-1 block w-full border-red-300 rounded-md shadow-sm   sm:text-sm'
                      placeholder='Type DELETE here'
                    />
                  </div>
                  <div className='mt-4 flex space-x-3'>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isSaving || deleteConfirmation !== "DELETE"}
                      className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none    disabled:opacity-50'
                    >
                      {isSaving ? (
                        <div className='flex items-center'>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                          Deleting...
                        </div>
                      ) : (
                        "Delete Account"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmation("");
                      }}
                      className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
