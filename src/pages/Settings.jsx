import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import { PasswordStrengthInput } from "../components/PasswordStrengthInput";
import { apiFetch, getFullImageUrl } from "../utils/apiClient";

const getMapUrl = (urlOrIframe) => {
  if (!urlOrIframe) return "";
  if (urlOrIframe.trim().startsWith("<iframe")) {
    const match = urlOrIframe.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : urlOrIframe;
  }
  return urlOrIframe;
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // Auto-clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Profile States
  const [profileSettings, setProfileSettings] = useState({
    name: "",
    username: "",
    email: "",
    profilePicture: ""
  });

  const fetchSettings = async () => {
    try {
      const res = await apiFetch("/api/settings");
      if (res.success && res.data) {
        if (res.data.contact) {
          setContactSettings({
            address: res.data.contact.address || "",
            phone: res.data.contact.phone || "",
            whatsApp: res.data.contact.whatsApp || "",
            email: res.data.contact.email || "",
            googleMapUrl: res.data.contact.googleMapUrl || ""
          });
        }
        if (res.data.social) {
          setSocialSettings({
            whatsApp: res.data.social.whatsApp || "",
            facebook: res.data.social.facebook || "",
            instagram: res.data.social.instagram || ""
          });
        }
        if (res.data.businessHours) {
          setBusinessHours(res.data.businessHours);
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  // Fetch live admin data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch("/api/auth/me");
        if (data.success && data.user) {
          setProfileSettings({
            name: data.user.name || "",
            username: data.user.username || "",
            email: data.user.email || "",
            profilePicture: data.user.profilePicture || ""
          });

        }
      } catch (err) {
        console.error("Failed to fetch administrator details:", err);
      }
    };
    fetchProfile();
    fetchSettings();
  }, []);

  // Form States (Clinic Information Mockup Settings)

  const [contactSettings, setContactSettings] = useState({
    address: "742 Medical Mile, Suite 200, Beverly Hills, CA 90210",
    phone: "+1 (555) 012-3456",
    whatsApp: "+1 (555) 012-3456",
    email: "hello@dentaelite.care",
    googleMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.6175394982635!2d-73.98774768459392!3d40.748440479328224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1655000000000!5m2!1sen!2sus"
  });

  const [socialSettings, setSocialSettings] = useState({
    whatsApp: "https://wa.me/15550123456",
    facebook: "https://facebook.com/dentaelite",
    instagram: "https://instagram.com/dentaelite"
  });

  const [businessHours, setBusinessHours] = useState([
    { day: "Monday", open: "08:00 AM", close: "05:00 PM", isClosed: false },
    { day: "Tuesday", open: "08:00 AM", close: "05:00 PM", isClosed: false },
    { day: "Wednesday", open: "08:00 AM", close: "05:00 PM", isClosed: false },
    { day: "Thursday", open: "08:00 AM", close: "05:00 PM", isClosed: false },
    { day: "Friday", open: "08:00 AM", close: "05:00 PM", isClosed: false },
    { day: "Saturday", open: "09:00 AM", close: "02:00 PM", isClosed: false },
    { day: "Sunday", open: "09:00 AM", close: "12:00 PM", isClosed: true }
  ]);

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [securityError, setSecurityError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forced password change state
  const [mustChangePassword, setMustChangePassword] = useState(false);



  // Check if forced password change is required on mount
  useEffect(() => {
    const storedUserJson = localStorage.getItem("user") || sessionStorage.getItem("user");
    const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;
    if (storedUser && storedUser.mustChangePassword) {
      setMustChangePassword(true);
      setActiveTab("security"); // Force redirect to security tab
    }
  }, []);



  const markDirty = () => {
    setIsDirty(true);
  };

  const handleProfileChange = (field, val) => {
    setProfileSettings((prev) => ({ ...prev, [field]: val }));
    markDirty();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setIsLoading(true);
    try {
      const data = await apiFetch("/api/auth/profile-picture", {
        method: "POST",
        body: formData
      });
      setProfileSettings((prev) => ({ ...prev, profilePicture: data.url }));
      markDirty();
      setToastMessage("Avatar image uploaded successfully!");
    } catch (err) {
      alert(err.message || "Failed to upload avatar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarRemove = () => {
    handleProfileChange("profilePicture", "");
    setToastMessage("Avatar removed.");
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSecurityError("");

    if (activeTab === "profile") {
      if (!profileSettings.name.trim()) {
        alert("Name is required.");
        setIsLoading(false);
        return;
      }
      if (!profileSettings.username.trim()) {
        alert("Username is required.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiFetch("/api/auth/profile", {
          method: "PUT",
          body: {
            name: profileSettings.name,
            username: profileSettings.username,
            profilePicture: profileSettings.profilePicture
          }
        });

        const rememberMe = localStorage.getItem("token") !== null;
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(data.user));

        window.dispatchEvent(new Event("storage"));
        setToastMessage("Admin profile updated successfully!");
        setIsDirty(false);
      } catch (error) {
        const msg = error.response?.message || error.message || "Failed to update profile.";
        alert(msg);
      } finally {
        setIsLoading(false);
      }
    } else if (activeTab === "security") {
      try {
        // Process password change if inputs filled
        if (
          securitySettings.currentPassword ||
          securitySettings.newPassword ||
          securitySettings.confirmPassword
        ) {
          if (!securitySettings.currentPassword) {
            setSecurityError("Current password is required to change password.");
            setIsLoading(false);
            return;
          }
          if (!securitySettings.newPassword) {
            setSecurityError("New password is required.");
            setIsLoading(false);
            return;
          }
          if (securitySettings.newPassword.length < 8) {
            setSecurityError("New password must be at least 8 characters.");
            setIsLoading(false);
            return;
          }
          if (securitySettings.newPassword !== securitySettings.confirmPassword) {
            setSecurityError("Passwords do not match.");
            setIsLoading(false);
            return;
          }

          const data = await apiFetch("/api/auth/change-password", {
            method: "PATCH",
            body: {
              currentPassword: securitySettings.currentPassword,
              newPassword: securitySettings.newPassword,
              confirmPassword: securitySettings.confirmPassword
            }
          });

          const rememberMe = localStorage.getItem("token") !== null;
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem("token", data.token);
          setSecuritySettings((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          }));

          setToastMessage("Password updated successfully!");
          setMustChangePassword(false);
          setIsDirty(false);

          // Clear mustChangePassword in stored user object
          const storedUser = JSON.parse(storage.getItem("user") || "{}");
          storedUser.mustChangePassword = false;
          storage.setItem("user", JSON.stringify(storedUser));
          window.dispatchEvent(new Event("storage"));
        } else {
          setIsDirty(false);
        }
      } catch (error) {
        const backendError = error.response?.message || error.response?.errors?.[0]?.message || error.message || "Failed to save security settings.";
        setSecurityError(backendError);
      } finally {
        setIsLoading(false);
      }
    } else if (["contact", "social", "hours"].includes(activeTab)) {
      try {
        const payload = {};
        if (activeTab === "contact") payload.contact = contactSettings;
        if (activeTab === "social") payload.social = socialSettings;
        if (activeTab === "hours") payload.businessHours = businessHours;

        await apiFetch("/api/settings", {
          method: "PUT",
          body: payload
        });
        setToastMessage("Settings updated successfully!");
        setIsDirty(false);
      } catch (error) {
        alert(error.response?.message || error.message || "Failed to update settings.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDiscard = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/api/auth/me");
      if (data.success && data.user) {
        setProfileSettings({
          name: data.user.name || "",
          username: data.user.username || "",
          email: data.user.email || "",
          profilePicture: data.user.profilePicture || ""
        });
        setSecuritySettings({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
      await fetchSettings();
      setIsDirty(false);
      setToastMessage("Changes discarded. All settings re-synced.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactChange = (field, val) => {
    setContactSettings((prev) => ({ ...prev, [field]: val }));
    markDirty();
  };

  const handleSocialChange = (field, val) => {
    setSocialSettings((prev) => ({ ...prev, [field]: val }));
    markDirty();
  };

  const handleHoursChange = (idx, field, val) => {
    setBusinessHours((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
    markDirty();
  };

  const handleSecurityChange = (field, val) => {
    setSecuritySettings((prev) => ({ ...prev, [field]: val }));
    setSecurityError("");
    markDirty();
  };

  const menuTabs = [
    { id: "profile", label: "Admin Profile", icon: "person" },
    { id: "contact", label: "Contact Info", icon: "alternate_email" },
    { id: "social", label: "Social Connect", icon: "share" },
    { id: "hours", label: "Business Hours", icon: "schedule" },
    { id: "security", label: "Security", icon: "shield" }
  ];

  const timeOptions = [
    "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar placeholder="Search settings..." />

      <div className="p-gutter w-full space-y-gutter flex-grow pb-32">
        {/* Page Header */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              Clinic Settings
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80">
              Manage your clinic's digital identity, contact details, social listings, hours of care, and admin security credentials.
            </p>
          </div>
        </div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-lg items-start">
          {/* Vertical Menu Tabs */}
          <nav className="flex flex-col gap-1 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/30 select-none">
            <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-3 mb-2">Configuration</h4>
            {menuTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (mustChangePassword && tab.id !== "security") {
                    setSecurityError("You must update your temporary password before configuring other settings.");
                    setToastMessage("Please update your password first!");
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-label-md font-bold transition-all cursor-pointer ${activeTab === tab.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Form Content Panel */}
          <div className="space-y-6">

            {/* ADMIN PROFILE TAB */}
            {activeTab === "profile" && (
              <section className="glass-card rounded-2xl p-6 border border-outline-variant/30 text-left space-y-6">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3 select-none">
                  <span className="material-symbols-outlined text-primary text-[28px]">person</span>
                  <h2 className="text-headline-sm font-extrabold text-on-surface">Admin Profile Settings</h2>
                </div>

                {/* Avatar Upload */}
                <div className="flex items-center gap-6 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs">
                  <div className="w-24 h-24 rounded-xl bg-primary-container/10 flex items-center justify-center border-2 border-dashed border-primary/30 group cursor-pointer hover:bg-primary-container/20 transition-all overflow-hidden relative shadow-sm select-none">
                    {profileSettings.profilePicture ? (
                      <img
                        alt="Admin Avatar Preview"
                        className="w-full h-full object-cover"
                        src={profileSettings.profilePicture.startsWith("/uploads")
                          ? getFullImageUrl(profileSettings.profilePicture)
                          : profileSettings.profilePicture
                        }
                        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileSettings.name)}` }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-primary/50 text-3xl">person</span>
                    )}
                    <label className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="material-symbols-outlined text-white">upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                  <div className="space-y-1.5 select-none">
                    <p className="text-label-md font-bold text-on-surface">Profile picture</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">PNG, JPG or SVG. Max 2MB.</p>
                    <div className="flex gap-4 pt-1">
                      <label className="text-label-sm font-bold text-primary hover:underline cursor-pointer">
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </label>
                      {profileSettings.profilePicture && (
                        <button
                          onClick={handleAvatarRemove}
                          className="text-label-sm font-bold text-error hover:underline cursor-pointer"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="profile-name">Full Name</label>
                      <input
                        id="profile-name"
                        type="text"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={profileSettings.name}
                        onChange={(e) => handleProfileChange("name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="profile-username">Username</label>
                      <input
                        id="profile-username"
                        type="text"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={profileSettings.username}
                        onChange={(e) => handleProfileChange("username", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="profile-email">Email Address</label>
                    <input
                      id="profile-email"
                      type="email"
                      disabled
                      className="w-full bg-surface-container/50 border border-outline-variant rounded-lg p-3 text-body-md font-semibold text-on-surface-variant/70 cursor-not-allowed"
                      value={profileSettings.email}
                    />
                    <p className="text-[10px] text-on-surface-variant/60 font-semibold italic">Email cannot be changed after administrator onboarding.</p>
                  </div>
                </div>
              </section>
            )}



            {/* CONTACT TAB */}
            {activeTab === "contact" && (
              <section className="glass-card rounded-2xl p-6 border border-outline-variant/30 text-left space-y-6">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3 select-none">
                  <span className="material-symbols-outlined text-primary text-[28px]">alternate_email</span>
                  <h2 className="text-headline-sm font-extrabold text-on-surface">Contact Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="address">Physical Address</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">location_on</span>
                      <input
                        id="address"
                        type="text"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-4 text-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={contactSettings.address}
                        onChange={(e) => handleContactChange("address", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="phone">Public Support Phone</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">call</span>
                        <input
                          id="phone"
                          type="tel"
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-4 text-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={contactSettings.phone}
                          onChange={(e) => handleContactChange("phone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="whatsApp">WhatsApp Contact Number</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">chat</span>
                        <input
                          id="whatsApp"
                          type="tel"
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-4 text-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={contactSettings.whatsApp || ""}
                          onChange={(e) => handleContactChange("whatsApp", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="email">Public Contact Email</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                        <input
                          id="email"
                          type="email"
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-4 text-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={contactSettings.email}
                          onChange={(e) => handleContactChange("email", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="googleMapUrl">Map Location Iframe Source URL</label>
                    <input
                      id="googleMapUrl"
                      type="text"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs font-mono text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={contactSettings.googleMapUrl || ""}
                      onChange={(e) => handleContactChange("googleMapUrl", e.target.value)}
                    />
                    {contactSettings.googleMapUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-outline-variant/30 h-40 shadow-xs select-none">
                        <iframe title="map-preview" src={getMapUrl(contactSettings.googleMapUrl)} className="w-full h-full border-none"></iframe>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* SOCIAL TAB */}
            {activeTab === "social" && (
              <section className="glass-card rounded-2xl p-6 border border-outline-variant/30 text-left space-y-6">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3 select-none">
                  <span className="material-symbols-outlined text-primary text-[28px]">share</span>
                  <h2 className="text-headline-sm font-extrabold text-on-surface">Social Portals Connect</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="social-whatsapp">WhatsApp Connect Link</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">link</span>
                      <input
                        id="social-whatsapp"
                        type="url"
                        placeholder="https://wa.me/..."
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-4 text-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={socialSettings.whatsApp || ""}
                        onChange={(e) => handleSocialChange("whatsApp", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="social-facebook">Facebook Page URL</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">link</span>
                      <input
                        id="social-facebook"
                        type="url"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-4 text-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={socialSettings.facebook || ""}
                        onChange={(e) => handleSocialChange("facebook", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="social-instagram">Instagram Handle URL</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">link</span>
                      <input
                        id="social-instagram"
                        type="url"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-4 text-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={socialSettings.instagram || ""}
                        onChange={(e) => handleSocialChange("instagram", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* HOURS TAB */}
            {activeTab === "hours" && (
              <section className="glass-card rounded-2xl p-6 border border-outline-variant/30 text-left space-y-6">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3 select-none">
                  <span className="material-symbols-outlined text-primary text-[28px]">schedule</span>
                  <h2 className="text-headline-sm font-extrabold text-on-surface">Business Care Hours</h2>
                </div>

                <div className="space-y-3.5">
                  {businessHours.map((item, idx) => (
                    <div key={item.day} className="flex flex-wrap items-center justify-between gap-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xs">
                      <span className="w-28 font-extrabold text-on-surface text-body-md select-none">{item.day}</span>

                      <div className="flex items-center gap-3 flex-1 justify-end max-w-lg">
                        <select
                          disabled={item.isClosed}
                          value={item.open}
                          onChange={(e) => handleHoursChange(idx, "open", e.target.value)}
                          className="bg-surface-container border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-label-sm font-bold text-on-surface focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
                        >
                          {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
                        </select>
                        <span className="text-xs text-on-surface-variant font-bold uppercase select-none">to</span>
                        <select
                          disabled={item.isClosed}
                          value={item.close}
                          onChange={(e) => handleHoursChange(idx, "close", e.target.value)}
                          className="bg-surface-container border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-label-sm font-bold text-on-surface focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
                        >
                          {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
                        </select>

                        <label className="flex items-center gap-1.5 ml-4 text-label-sm font-bold text-on-surface-variant select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isClosed}
                            onChange={(e) => handleHoursChange(idx, "isClosed", e.target.checked)}
                            className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary focus:ring-offset-0 cursor-pointer"
                          />
                          Closed
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <section className="glass-card rounded-2xl p-6 border border-outline-variant/30 text-left space-y-6">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3 select-none">
                  <span className="material-symbols-outlined text-primary text-[28px]">shield</span>
                  <h2 className="text-headline-sm font-extrabold text-on-surface">Security &amp; Credentials</h2>
                </div>

                {mustChangePassword && (
                  <div className="p-4 bg-error-container/20 text-on-error-container border border-error/20 rounded-2xl flex items-start gap-3 shadow-sm select-none">
                    <span className="material-symbols-outlined text-error text-[28px]">warning</span>
                    <div className="space-y-1">
                      <p className="font-bold text-label-md">Temporary Password Detected</p>
                      <p className="text-xs opacity-90">You are currently logged in using a temporary password. For security reasons, you must update your password below before you can access other settings.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="curr-pass">Current Password</label>
                    <div className="relative">
                      <input
                        id="curr-pass"
                        type={showCurrentPassword ? "text" : "password"}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 pr-12 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={securitySettings.currentPassword}
                        onChange={(e) => handleSecurityChange("currentPassword", e.target.value)}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px] select-none">
                          {showCurrentPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PasswordStrengthInput
                      value={securitySettings.newPassword}
                      onChange={(e) => handleSecurityChange("newPassword", e.target.value)}
                      label="New Password"
                      id="new-pass"
                    />

                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="conf-pass">Confirm Password</label>
                      <div className="relative">
                        <input
                          id="conf-pass"
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 pr-12 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={securitySettings.confirmPassword}
                          onChange={(e) => handleSecurityChange("confirmPassword", e.target.value)}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px] select-none">
                            {showConfirmPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {securityError && (
                    <p className="text-sm text-error font-medium mt-2">
                      {securityError}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Settings Bottom Sticky Action Bar */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-0 left-64 right-0 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-surface-container-highest px-gutter py-4 flex items-center justify-between z-40 select-none shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></span>
                <span className="text-label-sm font-bold text-on-surface-variant">You have unsaved changes</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDiscard}
                  className="border border-outline-variant/50 text-on-surface font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer"
                >
                  Discard Changes
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="bg-primary text-on-primary font-bold px-8 py-2.5 rounded-xl hover:opacity-95 transition-all text-label-sm shadow-md cursor-pointer flex items-center justify-center gap-2 min-w-[150px]"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Save Settings
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== TOAST NOTIFICATION ==================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[99999] bg-inverse-surface text-inverse-on-surface px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-outline-variant/20 select-none max-w-sm`}
          >
            <span className="material-symbols-outlined text-secondary-fixed">check_circle</span>
            <span className="text-label-md font-bold leading-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
