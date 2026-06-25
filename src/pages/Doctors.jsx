import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import { STATIC_DOCTORS } from "../data/staticDoctors";

export default function Doctors({ defaultCategory = "All" }) {
  // Initialize state with static doctors
  const [doctors, setDoctors] = useState(STATIC_DOCTORS);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal & Overlay States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Loading & Toast States
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Onboard Form State
  const [formData, setFormData] = useState({
    name: "",
    category: defaultCategory === "All" ? "Dentist" : defaultCategory,
    title: "",
    experience: "",
    nextSlot: "",
    status: "Available",
    bio: "",
    credentials: "",
    image: "",
    schedule: "Monday - Friday: 9:00 AM - 5:00 PM"
  });

  // Reset category in form if defaultCategory changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      category: defaultCategory === "All" ? "Dentist" : defaultCategory
    }));
  }, [defaultCategory]);

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

  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.title || !formData.experience) {
      alert("Name, title, and experience are required.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsOnboardModalOpen(false);
      // In a real application, we would push to doctors. In UI demo, we simulate success.
      setToastMessage(`${formData.name} onboarded successfully (UI demo only)!`);
    }, 1200);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsEditModalOpen(false);
      setToastMessage(`Doctor profile updated (UI demo only)!`);
    }, 1200);
  };

  const handleDeleteConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setToastMessage(`Doctor removed from listing (UI demo only)!`);
    }, 1200);
  };

  const openOnboardModal = () => {
    setFormData({
      name: "",
      category: defaultCategory === "All" ? "Dentist" : defaultCategory,
      title: "",
      experience: "",
      nextSlot: "Today, 10:00 AM",
      status: "Available",
      bio: "",
      credentials: "",
      image: "",
      schedule: "Monday - Friday: 9:00 AM - 5:00 PM"
    });
    setIsOnboardModalOpen(true);
  };

  const openViewModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsViewModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name,
      category: doctor.category,
      title: doctor.title,
      experience: doctor.experience,
      nextSlot: doctor.nextSlot,
      status: doctor.status,
      bio: doctor.bio || "",
      credentials: doctor.credentials || "",
      image: doctor.image || "",
      schedule: (doctor.schedule && doctor.schedule.join(", ")) || "Monday - Friday: 9:00 AM - 5:00 PM"
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteModalOpen(true);
  };

  // Filter based on route (defaultCategory) + search query
  const filteredDoctors = doctors.filter((doc) => {
    const matchesCategory =
      defaultCategory === "All" || doc.category.toLowerCase() === defaultCategory.toLowerCase();
    
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.credentials.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar
        placeholder={`Search ${defaultCategory === "All" ? "doctors" : defaultCategory.toLowerCase() + "s"}...`}
        onSearchChange={(val) => setSearchTerm(val)}
      />

      <div className="p-gutter w-full space-y-gutter flex-grow">
        {/* Page Header */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              {defaultCategory === "All" ? "Doctor Directory" : `${defaultCategory}s Directory`}
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80">
              Manage your clinic's professional staff credentials, bios, and listings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openOnboardModal}
              className="bg-primary text-on-primary py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:opacity-95 transition-opacity shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span className="text-label-md">Onboard Doctor</span>
            </motion.button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {/* Doctor Cards */}
          {filteredDoctors.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ y: -4 }}
              className="glass-card rounded-xl p-6 transition-all hover:shadow-xl flex flex-col justify-between border border-outline-variant/30"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="relative">
                    <img
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-surface-container-lowest shadow-sm bg-surface-container"
                      alt={`${doc.name} Profile`}
                      src={doc.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(doc.name)}`}
                    />
                    {doc.rating && doc.rating.includes("4.9") && (
                      <div className="absolute -bottom-2 -right-2 bg-secondary-fixed text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-black border-2 border-surface-container-lowest shadow-sm select-none">
                        TOP RATED
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-label-sm flex items-center gap-1.5 font-bold ${
                    doc.status === "Available" ? "bg-emerald-100 text-emerald-700" :
                    doc.status === "In Meeting" ? "bg-surface-variant text-on-surface-variant" :
                    "bg-error-container/20 text-error"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      doc.status === "Available" ? "bg-emerald-500 animate-pulse" :
                      doc.status === "In Meeting" ? "bg-on-surface-variant/40" :
                      "bg-error"
                    }`}></span>
                    {doc.status}
                  </span>
                </div>

                <div className="space-y-1 mb-4 select-none">
                  <h3 className="text-headline-sm font-headline-sm text-on-surface font-extrabold">{doc.name}</h3>
                  <p className="text-primary font-bold text-label-md">{doc.title}</p>
                  <p className="text-xs text-on-surface-variant/60 font-mono">{doc.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 select-none">
                  <div className="bg-surface-container-low/60 p-3 rounded-lg border border-outline-variant/10">
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Experience</p>
                    <p className="text-body-md font-extrabold text-on-surface mt-0.5">{doc.experience}</p>
                  </div>
                  <div className="bg-surface-container-low/60 p-3 rounded-lg border border-outline-variant/10">
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Next Slot</p>
                    <p className="text-body-md font-extrabold text-primary mt-0.5 truncate">{doc.nextSlot}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => openEditModal(doc)}
                  className="flex-1 bg-surface-container-highest/80 hover:bg-surface-container-highest text-on-surface px-4 py-2.5 rounded-lg text-label-sm font-bold transition-all border border-outline-variant/20 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => openViewModal(doc)}
                  className="flex-[2] bg-primary text-on-primary px-4 py-2.5 rounded-lg text-label-sm font-bold hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  View Profile
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          ))}

          {/* Empty Add Card */}
          <motion.div
            onClick={openOnboardModal}
            whileHover={{ scale: 0.99 }}
            className="border-2 border-dashed border-outline-variant/50 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-surface-container-low/40 transition-all cursor-pointer group min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
            </div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold mb-1">Onboard New Doctor</h3>
            <p className="text-body-md text-on-surface-variant/80 px-4">
              Add credentials, set biography, and initialize work availability.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ==================== ONBOARD DOCTOR MODAL ==================== */}
      <AnimatePresence>
        {isOnboardModalOpen && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && setIsOnboardModalOpen(false)}
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
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}

              <h2 className="text-headline-sm font-headline-sm font-extrabold text-on-surface mb-4 flex items-center gap-2 select-none border-b border-outline-variant/20 pb-3">
                <span className="material-symbols-outlined text-primary text-[28px]">person_add</span>
                Onboard Practitioner
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                  <p className="text-body-md text-on-surface-variant font-bold mt-4">Creating Practitioner Account...</p>
                </div>
              ) : (
                <form onSubmit={handleOnboardSubmit} className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="name">Full Name</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="name"
                        required
                        placeholder="Dr. Eleanor Vance"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="category">Staff Category</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="Dentist">Dentist</option>
                        <option value="Hygienist">Hygienist</option>
                        <option value="Surgeon">Oral Surgeon</option>
                        <option value="Receptionist">Receptionist</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="title">Specialization / Title</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="title"
                        required
                        placeholder="Pediatric Dentist"
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="experience">Years of Experience</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="experience"
                        required
                        placeholder="7 Years"
                        type="text"
                        value={formData.experience}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="nextSlot">First Availability Slot</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="nextSlot"
                        placeholder="Today, 3:30 PM"
                        type="text"
                        value={formData.nextSlot}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="status">Listing Status</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Available">Available</option>
                        <option value="In Meeting">In Meeting</option>
                        <option value="Out of Office">Out of Office</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="image">Profile Image URL</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="image"
                      placeholder="https://images.unsplash.com/..."
                      type="url"
                      value={formData.image}
                      onChange={handleInputChange}
                    />
                    {formData.image && (
                      <div className="mt-2 text-center">
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wide font-bold mb-1">Image Preview</p>
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-16 h-16 rounded-xl object-cover mx-auto border border-outline-variant shadow-sm"
                          onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/initials/svg?seed=preview" }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="credentials">Medical Credentials</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="credentials"
                      placeholder="DDS, Fellowship in Pediatric Dentistry"
                      type="text"
                      value={formData.credentials}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="bio">Professional Biography</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="bio"
                      placeholder="Provide details about the practitioner's medical approach and experience..."
                      rows="3"
                      value={formData.bio}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 select-none">
                    <button
                      type="button"
                      onClick={() => setIsOnboardModalOpen(false)}
                      className="border border-outline-variant/50 text-on-surface font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:opacity-95 transition-all text-label-sm shadow-md cursor-pointer"
                    >
                      Onboard Staff
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== VIEW DOCTOR PROFILE MODAL ==================== */}
      <AnimatePresence>
        {isViewModalOpen && selectedDoctor && createPortal(
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

              <div className="flex flex-col sm:flex-row gap-6 border-b border-outline-variant/20 pb-5 mb-5 select-none">
                <img
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-surface-container-lowest shadow-md self-center sm:self-start bg-surface-container"
                  src={selectedDoctor.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedDoctor.name)}`}
                  alt={selectedDoctor.name}
                />
                <div className="text-center sm:text-left space-y-1.5 self-center">
                  <h2 className="text-headline-md font-headline-md text-on-surface font-extrabold">{selectedDoctor.name}</h2>
                  <p className="text-primary font-bold text-label-md flex items-center justify-center sm:justify-start gap-1">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    {selectedDoctor.title}
                  </p>
                  <p className="text-xs text-on-surface-variant font-mono">{selectedDoctor.id} • {selectedDoctor.category}</p>
                  <p className="text-label-sm text-on-surface-variant font-semibold mt-1">Credentials: <span className="text-on-surface">{selectedDoctor.credentials}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-label-sm font-bold text-primary uppercase tracking-wider mb-1">Biography</h4>
                    <p className="text-body-md text-on-surface leading-relaxed">{selectedDoctor.bio || "No biography provided yet."}</p>
                  </div>
                  <div>
                    <h4 className="text-label-sm font-bold text-primary uppercase tracking-wider mb-1">Years of Experience</h4>
                    <p className="text-body-md font-bold text-on-surface">{selectedDoctor.experience}</p>
                  </div>
                </div>

                <div className="space-y-4 border-l border-outline-variant/20 pl-0 md:pl-6">
                  <div>
                    <h4 className="text-label-sm font-bold text-primary uppercase tracking-wider mb-1">Consultation Schedule</h4>
                    <ul className="space-y-1">
                      {selectedDoctor.schedule && selectedDoctor.schedule.map((item, idx) => (
                        <li key={idx} className="text-body-md text-on-surface-variant font-semibold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-label-sm font-bold text-primary uppercase tracking-wider mb-1">Patient Reviews</h4>
                    <div className="space-y-3">
                      {selectedDoctor.reviews && selectedDoctor.reviews.map((rev, idx) => (
                        <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 p-3 rounded-xl shadow-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-extrabold text-on-surface">{rev.patient}</span>
                            <span className="text-xs font-bold text-secondary flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px] fill-current">star</span>
                              {rev.rating}/5
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant/80 italic">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-outline-variant/20 select-none">
                <button
                  type="button"
                  onClick={() => openDeleteModal(selectedDoctor)}
                  className="bg-error/5 hover:bg-error/10 text-error font-semibold px-4 py-2.5 rounded-xl transition-all text-label-sm cursor-pointer mr-auto"
                >
                  Remove Practitioner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedDoctor);
                  }}
                  className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:opacity-95 transition-all text-label-sm shadow-md cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== EDIT DOCTOR MODAL ==================== */}
      <AnimatePresence>
        {isEditModalOpen && selectedDoctor && createPortal(
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
                Edit Doctor Profile
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                  <p className="text-body-md text-on-surface-variant font-bold mt-4">Saving Changes...</p>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="name">Full Name</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="name"
                        required
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="category">Staff Category</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="Dentist">Dentist</option>
                        <option value="Hygienist">Hygienist</option>
                        <option value="Surgeon">Oral Surgeon</option>
                        <option value="Receptionist">Receptionist</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="title">Specialization / Title</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="title"
                        required
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="experience">Years of Experience</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="experience"
                        required
                        type="text"
                        value={formData.experience}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="nextSlot">First Availability Slot</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="nextSlot"
                        type="text"
                        value={formData.nextSlot}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="status">Listing Status</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Available">Available</option>
                        <option value="In Meeting">In Meeting</option>
                        <option value="Out of Office">Out of Office</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="image">Profile Image URL</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="image"
                      type="url"
                      value={formData.image}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="credentials">Medical Credentials</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="credentials"
                      type="text"
                      value={formData.credentials}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="bio">Biography</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="bio"
                      rows="3"
                      value={formData.bio}
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
                      Save Profile
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedDoctor && createPortal(
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
                Offboard Practitioner
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <span className="material-symbols-outlined animate-spin text-error text-5xl">progress_activity</span>
                  <p className="text-body-md text-on-surface-variant font-bold mt-4">Processing Offboarding...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    Are you sure you want to remove <strong className="text-on-surface">{selectedDoctor.name}</strong> ({selectedDoctor.title}) from the active practitioners registry? This will cancel their profile visibility.
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
