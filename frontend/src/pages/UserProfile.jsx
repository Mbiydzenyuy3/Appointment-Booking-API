import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function UserProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/profile");
      if (response.data.success) {
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 404) {
        toast.error(
          "Profile endpoint not available. Please check backend configuration."
        );
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to load profile data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProviderInfoChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      provider_info: {
        ...prev.provider_info,
        [name]: value
      }
    }));
  };

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

      const response = await api.put("/auth/profile", updateData);

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        fetchProfile(); // Refresh profile data
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProviderProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updateData = {
        bio: profileData.provider_info?.bio || "",
        hourly_rate: profileData.provider_info?.hourly_rate || "",
        service_types: profileData.provider_info?.service_types || ""
      };

      const response = await api.put("/auth/provider-profile", updateData);

      if (response.data.success) {
        toast.success("Provider profile updated successfully!");
        fetchProfile(); // Refresh profile data
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

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-600'></div>
      </div>
    );
  }

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
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
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
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm'
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
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
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
                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
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
                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
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
                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
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
                className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50'
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
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
                    placeholder='Describe your services...'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Hourly Rate
                  </label>
                  <div className='mt-1 relative rounded-md shadow-sm'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <span className='text-gray-500 sm:text-sm'>$</span>
                    </div>
                    <input
                      type='number'
                      name='hourly_rate'
                      value={profileData.provider_info.hourly_rate || ""}
                      onChange={handleProviderInfoChange}
                      className='pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
                      placeholder='0.00'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Service Types
                  </label>
                  <textarea
                    name='service_types'
                    rows={3}
                    value={profileData.provider_info.service_types || ""}
                    onChange={handleProviderInfoChange}
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
                    placeholder='e.g., Haircut, Beard trim, Hair styling...'
                  />
                </div>

                <div className='flex justify-end'>
                  <button
                    type='submit'
                    disabled={isSaving}
                    className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50'
                  >
                    Save Provider Info
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
        <div className='space-y-6'>
          {/* Password Change Section */}
          <div className='bg-white shadow rounded-lg'>
            <div className='p-6'>
              <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                Change Password
              </h3>

              <form onSubmit={handlePasswordSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Current Password
                  </label>
                  <input
                    type='password'
                    name='currentPassword'
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
                    placeholder='Enter your current password'
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
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
                    placeholder='Enter your new password'
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
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm'
                    placeholder='Confirm your new password'
                  />
                </div>

                <div className='flex justify-end'>
                  <button
                    type='submit'
                    disabled={isSaving}
                    className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50'
                  >
                    {isSaving ? (
                      <div className='flex items-center'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Changing...
                      </div>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Actions Section */}
          <div className='bg-white shadow rounded-lg'>
            <div className='p-6'>
              <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                Account Actions
              </h3>

              <div className='border-t border-gray-200 pt-6'>
                <h4 className='text-sm font-medium text-gray-900 mb-4'>
                  Connected Accounts
                </h4>
                <div className='space-y-3'>
                  <button className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                    <svg className='w-4 h-4 mr-2' viewBox='0 0 24 24'>
                      <path
                        fill='#4285F4'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='#34A853'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      />
                      <path
                        fill='#EA4335'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      />
                    </svg>
                    Google Account Connected
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className='border-t border-gray-200 pt-6 mt-6'>
                <h4 className='text-sm font-medium text-red-900 mb-4'>
                  Danger Zone
                </h4>
                <div className='space-y-3'>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className='inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
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
                              This action cannot be undone. This will
                              permanently delete your account and remove your
                              data from our servers.
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
                              onChange={(e) =>
                                setDeleteConfirmation(e.target.value)
                              }
                              className='mt-1 block w-full border-red-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm'
                              placeholder='Type DELETE here'
                            />
                          </div>
                          <div className='mt-4 flex space-x-3'>
                            <button
                              onClick={handleDeleteAccount}
                              disabled={
                                isSaving || deleteConfirmation !== "DELETE"
                              }
                              className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50'
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
                              className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
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
          </div>
        </div>
      )}
    </div>
  );
}
