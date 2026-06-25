import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
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

  // Form States
  const [generalSettings, setGeneralSettings] = useState({
    clinicName: "DentaElite Premium Care",
    clinicDescription: "Providing world-class restorative and aesthetic dentistry services in a premium, patient-focused environment. We combine state-of-the-art technology with high-end hospitality.",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5x3fsFR2dpzcw9XWJta6FvDyglaUrpXfxOtwSR6XWH5r3ulJXyPO4DuboJetQlno9F27iy-oWVFf5YC9ILA3IemwTVxIWfeTLqObtOkQHPYxFrebWF1kb58NDgdKarpW63BWZxnpcQJ7YOEoBAv0F_-ZhZtj13QpAfFb0CencZ4cXy1a0Byr736PFKK4pskJZBMzE6CPgHVsbYeih1cT3kz6wELtHqosEyeTPPU5OV9yThkl-h6UrebW2caITr1LAhjdD4GZzgmwd"
  });

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
    confirmPassword: "",
    twoFactorEnabled: true
  });

  // Track changes to show unsaved badge
  const markDirty = () => {
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDirty(false);
      setToastMessage("Settings updated successfully (UI demo only)!");
    }, 1200);
  };

  const handleDiscard = () => {
    setGeneralSettings({
      clinicName: "DentaElite Premium Care",
      clinicDescription: "Providing world-class restorative and aesthetic dentistry services in a premium, patient-focused environment. We combine state-of-the-art technology with high-end hospitality.",
      logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5x3fsFR2dpzcw9XWJta6FvDyglaUrpXfxOtwSR6XWH5r3ulJXyPO4DuboJetQlno9F27iy-oWVFf5YC9ILA3IemwTVxIWfeTLqObtOkQHPYxFrebWF1kb58NDgdKarpW63BWZxnpcQJ7YOEoBAv0F_-ZhZtj13QpAfFb0CencZ4cXy1a0Byr736PFKK4pskJZBMzE6CPgHVsbYeih1cT3kz6wELtHqosEyeTPPU5OV9yThkl-h6UrebW2caITr1LAhjdD4GZzgmwd"
    });
    setContactSettings({
      address: "742 Medical Mile, Suite 200, Beverly Hills, CA 90210",
      phone: "+1 (555) 012-3456",
      whatsApp: "+1 (555) 012-3456",
      email: "hello@dentaelite.care",
      googleMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.6175394982635!2d-73.98774768459392!3d40.748440479328224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1655000000000!5m2!1sen!2sus"
    });
    setSocialSettings({
      whatsApp: "https://wa.me/15550123456",
      facebook: "https://facebook.com/dentaelite",
      instagram: "https://instagram.com/dentaelite"
    });
    setBusinessHours([
      { day: "Monday", open: "08:00 AM", close: "05:00 PM", isClosed: false },
      { day: "Tuesday", open: "08:00 AM", close: "05:00 PM", isClosed: false },
      { day: "Wednesday", open: "08:00 AM", close: "05:00 PM", isClosed: false },
      { day: "Thursday", open: "08:00 AM", close: "05:00 PM", isClosed: false },
      { day: "Friday", open: "08:00 AM", close: "05:00 PM", isClosed: false },
      { day: "Saturday", open: "09:00 AM", close: "02:00 PM", isClosed: false },
      { day: "Sunday", open: "09:00 AM", close: "12:00 PM", isClosed: true }
    ]);
    setSecuritySettings({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactorEnabled: true
    });
    setIsDirty(false);
    setToastMessage("Changes discarded. Settings reset to live configuration.");
  };

  const handleGeneralChange = (field, val) => {
    setGeneralSettings((prev) => ({ ...prev, [field]: val }));
    markDirty();
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
    markDirty();
  };

  const handleLogoUploadSim = () => {
    const fakeUrls = [
      "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=200"
    ];
    const randomUrl = fakeUrls[Math.floor(Math.random() * fakeUrls.length)];
    handleGeneralChange("logoUrl", randomUrl);
    setToastMessage("Logo uploaded successfully (simulated)!");
  };

  const handleLogoRemove = () => {
    handleGeneralChange("logoUrl", "");
    setToastMessage("Logo removed.");
  };

  const menuTabs = [
    { id: "general", label: "General", icon: "tune" },
    { id: "contact", label: "Contact", icon: "alternate_email" },
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
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-label-md font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
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
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <section className="glass-card rounded-2xl p-6 border border-outline-variant/30 text-left space-y-6">
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3 select-none">
                  <span className="material-symbols-outlined text-primary text-[28px]">tune</span>
                  <h2 className="text-headline-sm font-extrabold text-on-surface">General Information</h2>
                </div>

                {/* Logo Upload Box */}
                <div className="flex items-center gap-6 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs">
                  <div className="w-24 h-24 rounded-xl bg-primary-container/10 flex items-center justify-center border-2 border-dashed border-primary/30 group cursor-pointer hover:bg-primary-container/20 transition-all overflow-hidden relative shadow-sm select-none">
                    {generalSettings.logoUrl ? (
                      <img
                        alt="Clinic Logo Preview"
                        className="w-full h-full object-cover"
                        src={generalSettings.logoUrl}
                        onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/initials/svg?seed=DE" }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-primary/50 text-3xl">dentistry</span>
                    )}
                    <div
                      onClick={handleLogoUploadSim}
                      className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-white">upload</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 select-none">
                    <p className="text-label-md font-bold text-on-surface">Clinic Logo Banner</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">PNG, JPG or SVG. Max 2MB. Recommended dimensions 512x512px.</p>
                    <div className="flex gap-4 pt-1">
                      <button
                        onClick={handleLogoUploadSim}
                        className="text-label-sm font-bold text-primary hover:underline cursor-pointer"
                      >
                        Upload Image
                      </button>
                      {generalSettings.logoUrl && (
                        <button
                          onClick={handleLogoRemove}
                          className="text-label-sm font-bold text-error hover:underline cursor-pointer"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="clinic-name">Clinic Name</label>
                    <input
                      id="clinic-name"
                      type="text"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={generalSettings.clinicName}
                      onChange={(e) => handleGeneralChange("clinicName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="clinic-desc">Clinic Description Copy</label>
                    <textarea
                      id="clinic-desc"
                      rows="4"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md font-medium text-on-surface leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={generalSettings.clinicDescription}
                      onChange={(e) => handleGeneralChange("clinicDescription", e.target.value)}
                    />
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
                        <iframe title="map-preview" src={contactSettings.googleMapUrl} className="w-full h-full border-none"></iframe>
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

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="curr-pass">Current Password</label>
                    <input
                      id="curr-pass"
                      type="password"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={securitySettings.currentPassword}
                      onChange={(e) => handleSecurityChange("currentPassword", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="new-pass">New Password</label>
                      <input
                        id="new-pass"
                        type="password"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={securitySettings.newPassword}
                        onChange={(e) => handleSecurityChange("newPassword", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="conf-pass">Confirm Password</label>
                      <input
                        id="conf-pass"
                        type="password"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={securitySettings.confirmPassword}
                        onChange={(e) => handleSecurityChange("confirmPassword", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Two Factor Switch */}
                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xs select-none">
                    <div className="space-y-0.5 text-left pr-4">
                      <p className="text-label-md font-bold text-on-surface">Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-on-surface-variant">Use an authenticator app (Google Authenticator, Duo) to generate secure login verification codes.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSecurityChange("twoFactorEnabled", !securitySettings.twoFactorEnabled)}
                      className={`relative w-12 h-6.5 rounded-full flex items-center p-0.5 transition-colors cursor-pointer focus:outline-none ${
                        securitySettings.twoFactorEnabled ? "bg-primary" : "bg-outline-variant"
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-5.5 h-5.5 rounded-full bg-white shadow-sm"
                        animate={{ x: securitySettings.twoFactorEnabled ? 22 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
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
