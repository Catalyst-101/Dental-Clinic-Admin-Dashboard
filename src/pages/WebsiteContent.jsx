import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import { apiFetch, getFullImageUrl } from "../utils/apiClient";

export default function WebsiteContent() {
  const [activeTab, setActiveTab] = useState("stats");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Auto-clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Staged states
  const [stats, setStats] = useState([
    { id: 1, label: "Patients Treated", value: "15,000+" },
    { id: 2, label: "Years Experience", value: "28+" },
    { id: 3, label: "Expert Dentists", value: "45+" },
    { id: 4, label: "Successful Procedures", value: "98%" }
  ]);

  const [testimonials, setTestimonials] = useState([]);

  const [gallery, setGallery] = useState([]);

  // Modal states
  const [newTestimonial, setNewTestimonial] = useState({ name: "", rating: 5, comment: "", image: "" });
  const [newGalleryItem, setNewGalleryItem] = useState({ url: "", caption: "", tag: "The Clinic" });
  
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [showAddGallery, setShowAddGallery] = useState(false);

  const fetchCMSData = async () => {
    setIsLoading(true);
    try {
      const settingsRes = await apiFetch("/api/settings");
      if (settingsRes.success && settingsRes.data?.stats) {
        setStats(settingsRes.data.stats);
      }
      const testimonialsRes = await apiFetch("/api/settings/testimonials");
      if (testimonialsRes.success && testimonialsRes.data) {
        const mapped = testimonialsRes.data.map(t => ({
          ...t,
          id: t._id
        }));
        setTestimonials(mapped);
      }
      const galleryRes = await apiFetch("/api/settings/gallery");
      if (galleryRes.success && galleryRes.data) {
        const mapped = galleryRes.data.map(g => ({
          ...g,
          id: g._id
        }));
        setGallery(mapped);
      }
    } catch (err) {
      console.error("Failed to load CMS data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCMSData();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiFetch("/api/settings", {
        method: "PUT",
        body: { stats }
      });
      setToastMessage("CMS content published successfully! Changes are live on DentaElite public website.");
    } catch (err) {
      alert(err.response?.message || err.message || "Failed to publish CMS content.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatChange = (id, field, value) => {
    setStats(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.comment) return;
    
    setIsLoading(true);
    try {
      const payload = {
        name: newTestimonial.name,
        rating: Number(newTestimonial.rating),
        comment: newTestimonial.comment,
        image: newTestimonial.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newTestimonial.name)}`,
        date: new Date().toISOString().split("T")[0]
      };
      await apiFetch("/api/settings/testimonials", {
        method: "POST",
        body: payload
      });
      setNewTestimonial({ name: "", rating: 5, comment: "", image: "" });
      setShowAddTestimonial(false);
      await fetchCMSData();
      setToastMessage("New testimonial added successfully!");
    } catch (err) {
      alert(err.response?.message || err.message || "Failed to add testimonial.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTestimonial = async (id) => {
    setIsLoading(true);
    try {
      await apiFetch(`/api/settings/testimonials/${id}`, {
        method: "DELETE"
      });
      await fetchCMSData();
      setToastMessage("Testimonial removed successfully.");
    } catch (err) {
      alert(err.response?.message || err.message || "Failed to delete testimonial.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setIsLoading(true);
    try {
      const data = await apiFetch("/api/settings/gallery/upload", {
        method: "POST",
        body: formData
      });
      setNewGalleryItem(prev => ({ ...prev, url: data.url }));
      setToastMessage("Image uploaded successfully!");
    } catch (err) {
      alert(err.message || "Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const addGalleryItem = async (e) => {
    e.preventDefault();
    if (!newGalleryItem.url || !newGalleryItem.caption || !newGalleryItem.tag) return;

    setIsLoading(true);
    try {
      await apiFetch("/api/settings/gallery", {
        method: "POST",
        body: {
          url: newGalleryItem.url,
          caption: newGalleryItem.caption,
          tag: newGalleryItem.tag
        }
      });
      setNewGalleryItem({ url: "", caption: "", tag: "The Clinic" });
      setShowAddGallery(false);
      await fetchCMSData();
      setToastMessage("New gallery photo staged successfully!");
    } catch (err) {
      alert(err.response?.message || err.message || "Failed to stage image.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGalleryItem = async (id) => {
    setIsLoading(true);
    try {
      await apiFetch(`/api/settings/gallery/${id}`, {
        method: "DELETE"
      });
      await fetchCMSData();
      setToastMessage("Gallery photo unstaged.");
    } catch (err) {
      alert(err.response?.message || err.message || "Failed to delete gallery photo.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "stats", label: "Clinic Stats", icon: "equalizer" },
    { id: "testimonials", label: "Testimonials", icon: "reviews" },
    { id: "gallery", label: "Staged Gallery", icon: "photo_library" }
  ];

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar placeholder="Search website content items..." />

      <div className="p-gutter w-full space-y-gutter flex-grow pb-32">
        {/* Page Header */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              Website CMS Management
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80">
              Update text copies, clinic values, credentials, and image galleries shown on the public landing page.
            </p>
          </div>
        </div>

        {/* CMS Container */}
        <div className="flex flex-col lg:flex-row gap-gutter items-start">
          {/* Tab Navigation */}
          <div className="w-full lg:w-64 flex flex-col gap-1.5 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/30 select-none">
            <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-3 mb-2">CMS Modules</h4>
            {tabs.map((tab) => (
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
          </div>

          {/* Module Canvas */}
          <div className="flex-1 w-full glass-card rounded-2xl p-6 border border-outline-variant/30 relative min-h-[400px]">
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-50 rounded-2xl">
                <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                <p className="text-body-md text-on-surface font-extrabold mt-4">Publishing live revisions...</p>
              </div>
            )}

            {/* STATS MODULE */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <h3 className="text-headline-sm font-extrabold text-primary select-none flex items-center gap-2 border-b border-outline-variant/10 pb-3">
                  <span className="material-symbols-outlined">equalizer</span>
                  Trust Statistics Indicators
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.id} className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl space-y-3 shadow-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wide">Stat Value</label>
                        <input
                          type="text"
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-label-md font-black text-primary text-center focus:ring-1 focus:ring-primary focus:outline-none"
                          value={stat.value}
                          onChange={(e) => handleStatChange(stat.id, "value", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wide">Descriptive Label</label>
                        <input
                          type="text"
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-label-sm font-bold text-on-surface-variant text-center focus:ring-1 focus:ring-primary focus:outline-none"
                          value={stat.label}
                          onChange={(e) => handleStatChange(stat.id, "label", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-primary-container/10 border border-primary-container/20 rounded-xl select-none text-left">
                  <p className="text-label-sm text-on-primary-container leading-relaxed">
                    <strong>Note:</strong> These numeric badges are featured directly below the primary homepage slider to demonstrate clinic credibility, client loyalty, and medical expertise.
                  </p>
                </div>
              </div>
            )}

            {/* TESTIMONIALS MODULE */}
            {activeTab === "testimonials" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3 select-none">
                  <h3 className="text-headline-sm font-extrabold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">reviews</span>
                    Patient Testimonials
                  </h3>
                  <button
                    onClick={() => setShowAddTestimonial(true)}
                    className="bg-primary text-on-primary px-4 py-2 rounded-xl text-label-sm font-bold shadow-sm hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Review
                  </button>
                </div>

                <div className="space-y-3">
                  {testimonials.map((t) => (
                    <div key={t.id} className="bg-surface-container-low/60 border border-outline-variant/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                      <div className="flex items-center sm:items-start gap-4 flex-grow text-left">
                        <img
                          src={t.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.name)}`}
                          alt={t.name}
                          className="w-12 h-12 rounded-full object-cover border border-outline-variant/30 shadow-xs"
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.name)}`;
                          }}
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2 select-none">
                            <span className="font-bold text-on-surface text-body-md">{t.name}</span>
                            <span className="text-xs text-on-surface-variant opacity-75 font-medium">{t.date}</span>
                            <div className="flex text-secondary ml-2 font-bold text-xs items-center">
                              {Array.from({ length: t.rating }).map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-[14px] fill-current">star</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-body-md text-on-surface-variant leading-relaxed">"{t.comment}"</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTestimonial(t.id)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-full transition-colors cursor-pointer select-none"
                        title="Remove Testimonial"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Testimonial Popover */}
                {showAddTestimonial && (
                  <div className="border border-outline-variant/30 p-4 rounded-xl bg-surface-container-lowest text-left space-y-3 shadow-md mt-4">
                    <h4 className="font-bold text-label-md text-primary select-none">New Patient Feedback</h4>
                    <form onSubmit={addTestimonial} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Patient Name</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md"
                            value={newTestimonial.name}
                            onChange={(e) => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Rating (1-5)</label>
                          <select
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md font-bold cursor-pointer"
                            value={newTestimonial.rating}
                            onChange={(e) => setNewTestimonial(prev => ({ ...prev, rating: Number(e.target.value) }))}
                          >
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Patient Picture URL</label>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md animate-all"
                          value={newTestimonial.image}
                          onChange={(e) => setNewTestimonial(prev => ({ ...prev, image: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Review Copy</label>
                        <textarea
                          required
                          rows="2"
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md"
                          value={newTestimonial.comment}
                          onChange={(e) => setNewTestimonial(prev => ({ ...prev, comment: e.target.value }))}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1 select-none">
                        <button
                          type="button"
                          onClick={() => setShowAddTestimonial(false)}
                          className="border border-outline-variant/60 px-4 py-1.5 rounded-lg text-label-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-label-sm font-bold cursor-pointer"
                        >
                          Stage Review
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* GALLERY MODULE */}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3 select-none">
                  <h3 className="text-headline-sm font-extrabold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">photo_library</span>
                    Clinic Facilities Gallery
                  </h3>
                  <button
                    onClick={() => setShowAddGallery(true)}
                    className="bg-primary text-on-primary px-4 py-2 rounded-xl text-label-sm font-bold shadow-sm hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                    Stage Photo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((img) => (
                    <div key={img.id} className="relative rounded-xl overflow-hidden group border border-outline-variant/30 h-40 select-none">
                      <img 
                        src={img.url.startsWith("/uploads") 
                          ? getFullImageUrl(img.url) 
                          : img.url} 
                        alt={img.caption} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end p-3 text-left">
                        <span className="text-[11px] font-bold text-white truncate">{img.caption}</span>
                        {img.tag && (
                          <span className="text-[9px] font-extrabold uppercase bg-primary text-on-primary px-1.5 py-0.5 rounded-md mt-1 w-fit select-none">
                            {img.tag}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteGalleryItem(img.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                        title="Remove Photo"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                {showAddGallery && (
                  <div className="border border-outline-variant/30 p-4 rounded-xl bg-surface-container-lowest text-left space-y-3 shadow-md mt-4">
                    <h4 className="font-bold text-label-md text-primary select-none">Stage New Facility Photo</h4>
                    <form onSubmit={addGalleryItem} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Upload Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleGalleryUpload}
                            className="w-full text-label-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                          />
                          {newGalleryItem.url && (
                            <div className="mt-2 h-20 w-32 border border-outline-variant/30 rounded-lg overflow-hidden relative select-none">
                              <img 
                                src={newGalleryItem.url.startsWith("/uploads") 
                                  ? getFullImageUrl(newGalleryItem.url) 
                                  : newGalleryItem.url} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Image Caption</label>
                            <input
                              type="text"
                              required
                              placeholder="State-of-the-art Surgery Suite"
                              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md"
                              value={newGalleryItem.caption}
                              onChange={(e) => setNewGalleryItem(prev => ({ ...prev, caption: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Category/Tag</label>
                            <select
                              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md font-bold cursor-pointer"
                              value={newGalleryItem.tag}
                              onChange={(e) => setNewGalleryItem(prev => ({ ...prev, tag: e.target.value }))}
                            >
                              <option value="The Clinic">The Clinic</option>
                              <option value="Equipment">Equipment</option>
                              <option value="Treatments">Treatments</option>
                              <option value="Before & After">Before & After</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 select-none">
                        <button
                          type="button"
                          onClick={() => setShowAddGallery(false)}
                          className="border border-outline-variant/60 px-4 py-1.5 rounded-lg text-label-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-label-sm font-bold cursor-pointer"
                        >
                          Stage Image
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CMS Bottom Publish Control Sticky Bar */}
        <div className="fixed bottom-0 left-64 right-0 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-surface-container-highest px-gutter py-4 flex items-center justify-between z-40 select-none shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></span>
            <span className="text-label-sm font-bold text-on-surface-variant">Staged changes are ready to publish</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                await fetchCMSData();
                setToastMessage("Changes discarded! Staging reset to current live version.");
              }}
              className="border border-outline-variant/50 text-on-surface font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer"
            >
              Discard Staged
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePublish}
              className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:opacity-95 transition-all text-label-sm shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              Publish Live Changes
            </motion.button>
          </div>
        </div>
      </div>

      {/* ==================== TOAST NOTIFICATION ==================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-[99999] bg-inverse-surface text-inverse-on-surface px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-outline-variant/20 select-none max-w-sm"
          >
            <span className="material-symbols-outlined text-secondary-fixed">check_circle</span>
            <span className="text-label-md font-bold leading-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
