import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import { STATIC_SERVICES } from "../data/staticServices";

export default function Services() {
  const [services, setServices] = useState(STATIC_SERVICES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal & Overlay States
  const [selectedService, setSelectedService] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Loading & Toast States
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    category: "General Dentistry",
    price: "",
    summary: "",
    image: "",
    benefits: "",
    faqs: "",
    recoveryTips: ""
  });

  // Auto-clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.summary) {
      alert("Title, price, and summary are required.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAddModalOpen(false);
      setToastMessage(`Service "${formData.title}" added successfully (UI demo only)!`);
    }, 1200);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsEditModalOpen(false);
      setToastMessage(`Service details updated (UI demo only)!`);
    }, 1200);
  };

  const handleDeleteConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setToastMessage(`Service deleted from system catalogs (UI demo only)!`);
    }, 1200);
  };

  const openAddModal = () => {
    setFormData({
      title: "",
      tagline: "",
      category: "General Dentistry",
      price: "",
      summary: "",
      image: "",
      benefits: "Highly effective treatment\nImproves dental health\nQuick session time",
      faqs: "Q: Is this safe?\nA: Yes, all clinical procedures are FDA approved.",
      recoveryTips: "Drink plenty of water.\nMaintain standard brushing routine."
    });
    setIsAddModalOpen(true);
  };

  const openViewModal = (service) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setFormData({
      title: service.title,
      tagline: service.tagline || "",
      category: service.category,
      price: service.price,
      summary: service.summary,
      image: service.image || "",
      benefits: service.benefits ? service.benefits.join("\n") : "",
      faqs: service.faqs ? service.faqs.map(f => `Q: ${f.q}\nA: ${f.a}`).join("\n\n") : "",
      recoveryTips: service.recoveryTips ? service.recoveryTips.join("\n") : ""
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const categories = ["All", "General Dentistry", "Cosmetic", "Orthodontics", "Surgery"];

  const filteredServices = services.filter((svc) => {
    const matchesCategory =
      selectedCategory === "All" || svc.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      svc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      svc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      svc.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar
        placeholder="Search services, categories..."
        onSearchChange={(val) => setSearchTerm(val)}
      />

      <div className="p-gutter w-full space-y-gutter flex-grow">
        {/* Page Header */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              Services Management
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80">
              Configure treatment plans, diagnostic packages, and public pricing schedules.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="bg-primary text-on-primary py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:opacity-95 transition-opacity shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="text-label-md">Add New Service</span>
          </motion.button>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-label-sm font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {cat === "All" ? "All Services" : cat}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {filteredServices.map((svc) => (
            <motion.div
              key={svc.id}
              whileHover={{ y: -4 }}
              className="glass-card rounded-xl overflow-hidden hover:shadow-xl transition-all border border-outline-variant/30 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-surface-container select-none">
                <img
                  className="w-full h-full object-cover"
                  alt={svc.title}
                  src={svc.image || "https://images.unsplash.com/photo-1579684389782-64d84b5e905a?auto=format&fit=crop&q=80&w=600&h=300"}
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-black border border-surface-container-lowest/50 shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    ACTIVE
                  </span>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2 select-none">
                    <p className="text-label-sm font-bold text-primary uppercase tracking-wider text-[11px]">{svc.category}</p>
                    <p className="text-headline-sm font-extrabold text-primary">{svc.price}</p>
                  </div>
                  <h3 className="text-headline-sm font-extrabold text-on-surface mb-2 select-none">{svc.title}</h3>
                  <p className="text-body-md text-on-surface-variant line-clamp-3 mb-6 leading-relaxed">
                    {svc.summary}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => openEditModal(svc)}
                    className="flex-1 border border-outline-variant hover:bg-surface-container text-on-surface py-2.5 rounded-lg text-label-sm font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => openViewModal(svc)}
                    className="flex-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold py-2.5 rounded-lg text-label-sm transition-all cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add Service Card */}
          <motion.div
            onClick={openAddModal}
            whileHover={{ scale: 0.99 }}
            className="border-2 border-dashed border-outline-variant/50 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:bg-surface-container-low/40 transition-all cursor-pointer group min-h-[350px]"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
            </div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold mb-1">Add Treatment Service</h3>
            <p className="text-body-md text-on-surface-variant/80 px-4">
              Publish a new medical care plan, pricing structure, and portal details.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ==================== ADD NEW SERVICE MODAL ==================== */}
      <AnimatePresence>
        {isAddModalOpen && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && setIsAddModalOpen(false)}
            className="modal-backdrop fixed inset-0 z-[9999] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card card-shadow rounded-2xl max-w-lg w-full border border-outline-variant/30 p-6 relative max-h-[90vh] overflow-y-auto"
            >
              {!isLoading && (
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}

              <h2 className="text-headline-sm font-headline-sm font-extrabold text-on-surface mb-4 flex items-center gap-2 select-none border-b border-outline-variant/20 pb-3">
                <span className="material-symbols-outlined text-primary text-[28px]">health_and_safety</span>
                Add Care Service
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                  <p className="text-body-md text-on-surface-variant font-bold mt-4">Creating Service Listing...</p>
                </div>
              ) : (
                <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="title">Treatment Title</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="title"
                      required
                      placeholder="Root Canal Treatment"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="category">Category</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="General Dentistry">General Dentistry</option>
                        <option value="Cosmetic">Cosmetic</option>
                        <option value="Orthodontics">Orthodontics</option>
                        <option value="Surgery">Surgery</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="price">Price Tag / Base Fee</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="price"
                        required
                        placeholder="From $450"
                        type="text"
                        value={formData.price}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="tagline">Short Tagline</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="tagline"
                      placeholder="Relieve pain and restore tooth structural health"
                      type="text"
                      value={formData.tagline}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="image">Service Cover Image URL</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="image"
                      placeholder="https://images.unsplash.com/..."
                      type="url"
                      value={formData.image}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="summary">Service Summary</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="summary"
                      required
                      placeholder="Give a brief summary shown in the treatment catalog..."
                      rows="2"
                      value={formData.summary}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="benefits">Treatment Benefits (One per line)</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface font-mono text-xs"
                      id="benefits"
                      rows="3"
                      placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
                      value={formData.benefits}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="recoveryTips">Recovery Tips (One per line)</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface font-mono text-xs"
                      id="recoveryTips"
                      rows="2"
                      placeholder="Tip 1&#10;Tip 2"
                      value={formData.recoveryTips}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 select-none">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="border border-outline-variant/50 text-on-surface font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:opacity-95 transition-all text-label-sm shadow-md cursor-pointer"
                    >
                      Publish Service
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== EDIT SERVICE MODAL ==================== */}
      <AnimatePresence>
        {isEditModalOpen && selectedService && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && setIsEditModalOpen(false)}
            className="modal-backdrop fixed inset-0 z-[9999] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card card-shadow rounded-2xl max-w-lg w-full border border-outline-variant/30 p-6 relative max-h-[90vh] overflow-y-auto"
            >
              {!isLoading && (
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}

              <h2 className="text-headline-sm font-headline-sm font-extrabold text-on-surface mb-4 flex items-center gap-2 select-none border-b border-outline-variant/20 pb-3">
                <span className="material-symbols-outlined text-primary text-[28px]">edit</span>
                Edit Service Offering
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                  <p className="text-body-md text-on-surface-variant font-bold mt-4">Saving Changes...</p>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="title">Treatment Title</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="title"
                      required
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="category">Category</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="General Dentistry">General Dentistry</option>
                        <option value="Cosmetic">Cosmetic</option>
                        <option value="Orthodontics">Orthodontics</option>
                        <option value="Surgery">Surgery</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="price">Base Fee</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="price"
                        required
                        type="text"
                        value={formData.price}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="tagline">Tagline</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="tagline"
                      type="text"
                      value={formData.tagline}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="image">Image URL</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="image"
                      type="url"
                      value={formData.image}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="summary">Service Summary</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="summary"
                      required
                      rows="2"
                      value={formData.summary}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="benefits">Benefits (One per line)</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface font-mono text-xs"
                      id="benefits"
                      rows="3"
                      value={formData.benefits}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="recoveryTips">Recovery Tips (One per line)</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface font-mono text-xs"
                      id="recoveryTips"
                      rows="2"
                      value={formData.recoveryTips}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 select-none">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="border border-outline-variant/50 text-on-surface font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:opacity-95 transition-all text-label-sm shadow-md cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== VIEW SERVICE DETAILS MODAL ==================== */}
      <AnimatePresence>
        {isViewModalOpen && selectedService && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsViewModalOpen(false)}
            className="modal-backdrop fixed inset-0 z-[9999] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card card-shadow rounded-2xl max-w-2xl w-full border border-outline-variant/30 p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="relative h-60 rounded-xl overflow-hidden bg-surface-container select-none mb-5 shadow-xs">
                <img
                  className="w-full h-full object-cover"
                  src={selectedService.image || "https://images.unsplash.com/photo-1579684389782-64d84b5e905a?auto=format&fit=crop&q=80&w=600&h=300"}
                  alt={selectedService.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <span className="bg-secondary-container/90 text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">{selectedService.category}</span>
                    <h2 className="text-headline-md font-headline-md text-white font-extrabold mt-2 leading-none">{selectedService.title}</h2>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-label-sm font-bold text-primary uppercase tracking-wider mb-1">Service Fee Structure</h4>
                    <p className="text-headline-sm font-extrabold text-primary">{selectedService.price}</p>
                  </div>

                  <div>
                    <h4 className="text-label-sm font-bold text-primary uppercase tracking-wider mb-1">Tagline &amp; Overview</h4>
                    <p className="text-body-md font-bold text-on-surface italic">"{selectedService.tagline || 'Elevating oral healthcare standards.'}"</p>
                    <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">{selectedService.summary}</p>
                  </div>

                  {selectedService.benefits && selectedService.benefits.length > 0 && (
                    <div>
                      <h4 className="text-label-sm font-bold text-primary uppercase tracking-wider mb-1.5">Key Patient Benefits</h4>
                      <ul className="space-y-1.5">
                        {selectedService.benefits.map((b, idx) => (
                          <li key={idx} className="text-body-md text-on-surface-variant font-medium flex items-start gap-1.5 leading-tight">
                            <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-l border-outline-variant/20 pl-0 md:pl-6">
                  {selectedService.recoveryTips && selectedService.recoveryTips.length > 0 && (
                    <div>
                      <h4 className="text-label-sm font-bold text-primary uppercase tracking-wider mb-1.5">Care &amp; Recovery Tips</h4>
                      <ul className="space-y-1.5">
                        {selectedService.recoveryTips.map((tip, idx) => (
                          <li key={idx} className="text-body-md text-on-surface-variant font-medium flex items-start gap-1.5 leading-tight">
                            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">spa</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedService.faqs && selectedService.faqs.length > 0 && (
                    <div>
                      <h4 className="text-label-sm font-bold text-primary uppercase tracking-wider mb-1.5">Frequently Asked Questions</h4>
                      <div className="space-y-3">
                        {selectedService.faqs.map((faq, idx) => (
                          <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 p-3 rounded-xl shadow-xs">
                            <p className="text-xs font-extrabold text-on-surface">Q: {faq.q}</p>
                            <p className="text-xs text-on-surface-variant/80 mt-1">A: {faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-outline-variant/20 select-none">
                <button
                  type="button"
                  onClick={() => openDeleteModal(selectedService)}
                  className="bg-error/5 hover:bg-error/10 text-error font-semibold px-4 py-2.5 rounded-xl transition-all text-label-sm cursor-pointer mr-auto"
                >
                  Delete Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedService);
                  }}
                  className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:opacity-95 transition-all text-label-sm shadow-md cursor-pointer"
                >
                  Edit Details
                </button>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedService && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && setIsDeleteModalOpen(false)}
            className="modal-backdrop fixed inset-0 z-[9999] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card card-shadow rounded-2xl max-w-sm w-full border border-outline-variant/30 p-6 relative select-none"
            >
              <h2 className="text-headline-sm font-headline-sm font-extrabold text-error mb-2 flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                <span className="material-symbols-outlined text-[28px]">warning</span>
                Delete Service
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <span className="material-symbols-outlined animate-spin text-error text-5xl">progress_activity</span>
                  <p className="text-body-md text-on-surface-variant font-bold mt-4">Processing Deletion...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    Are you sure you want to remove <strong className="text-on-surface">{selectedService.title}</strong> from DentaElite's active care offerings? This will also remove it from the patient scheduling menus.
                  </p>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="border border-outline-variant/50 text-on-surface font-semibold px-4 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      className="bg-error text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-95 transition-all text-label-sm shadow-md cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== TOAST NOTIFICATION ==================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[99999] bg-inverse-surface text-inverse-on-surface px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-outline-variant/20 select-none max-w-sm"
          >
            <span className="material-symbols-outlined text-secondary-fixed">check_circle</span>
            <span className="text-label-md font-bold leading-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
