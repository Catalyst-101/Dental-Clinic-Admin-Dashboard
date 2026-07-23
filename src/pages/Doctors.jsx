import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import DoctorForm from "../components/DoctorForm";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  toggleDoctorStatus
} from "../api/doctors";
import { getFullImageUrl, parseErrorMessage } from "../api/axios";

export default function Doctors({ defaultCategory = "All" }) {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  // Modals & Overlays
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [errorMessage, setErrorMessage] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    setSelectedCategory(defaultCategory);
  }, [defaultCategory]);

  // Fetch Doctor List from Backend API
  const fetchDoctorList = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await getDoctors({ category: selectedCategory });
      if (res && res.success) {
        setDoctors(res.data || []);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      const friendlyErr = parseErrorMessage(err, "Unable to load practitioners catalog from server.");
      setErrorMessage(friendlyErr);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorList();
  }, [selectedCategory]);

  // Auto clear toast
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: "", type: "success" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.message]);

  const openAddModal = () => {
    setSelectedDoctor(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsFormModalOpen(true);
  };

  const openViewModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedDoctor) {
        // Edit Mode
        const id = selectedDoctor._id || selectedDoctor.slug || selectedDoctor.customId;
        const res = await updateDoctor(id, formData);
        showToast(`Practitioner "${res.data?.name || formData.name}" updated successfully!`, "success");
      } else {
        // Create Mode
        const res = await createDoctor(formData);
        showToast(`Practitioner "${res.data?.name || formData.name}" onboarded successfully!`, "success");
      }
      setIsFormModalOpen(false);
      setSelectedDoctor(null);
      await fetchDoctorList();
    } catch (err) {
      console.error("Error saving practitioner:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to save doctor details. Please verify your inputs.");
      showToast(friendlyErr, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDoctor) return;
    setIsSubmitting(true);
    try {
      const id = selectedDoctor._id || selectedDoctor.slug || selectedDoctor.customId;
      await deleteDoctor(id);
      showToast(`Practitioner "${selectedDoctor.name}" offboarded successfully.`, "success");
      setIsDeleteModalOpen(false);
      setSelectedDoctor(null);
      await fetchDoctorList();
    } catch (err) {
      console.error("Failed to delete doctor:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to delete doctor record.");
      showToast(friendlyErr, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (doctor) => {
    const id = doctor._id || doctor.slug || doctor.customId;
    const nextStatus = !doctor.isActive;
    try {
      await toggleDoctorStatus(id, nextStatus);
      setDoctors((prev) =>
        prev.map((d) => (d._id === doctor._id || d.slug === doctor.slug ? { ...d, isActive: nextStatus } : d))
      );
      showToast(
        `Practitioner "${doctor.name}" visibility changed to ${nextStatus ? "Active" : "Inactive"}`,
        "success"
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to update practitioner status.");
      showToast(friendlyErr, "error");
    }
  };

  const categories = ["All", "Dentist", "Hygienist", "Surgeon", "Receptionist"];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (doc.category && doc.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.title && doc.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.qualifications && doc.qualifications.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar
        placeholder="Search doctors, specializations, credentials..."
        onSearchChange={(val) => setSearchTerm(val)}
      />

      <div className="p-gutter w-full space-y-gutter flex-grow">
        {/* Page Header */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              Practitioners & Doctors Management
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80">
              Manage clinical staff profiles, qualifications, schedules, and active availability.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="bg-primary text-on-primary py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:opacity-95 transition-opacity shadow-md cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span>Onboard Practitioner</span>
          </motion.button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center justify-between flex-wrap gap-3 select-none">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {cat === "All" ? "All Staff" : cat}
              </button>
            ))}
          </div>
          <div className="text-xs text-on-surface-variant font-semibold">
            Total Staff: <span className="text-primary font-bold">{filteredDoctors.length}</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              onClick={fetchDoctorList}
              className="px-3.5 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-on-surface-variant">Loading practitioners catalog...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          /* Empty State */
          <div className="glass-card rounded-2xl p-12 text-center border border-outline-variant/30 flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px]">stethoscope</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">No practitioners found</h3>
            <p className="text-xs text-on-surface-variant max-w-sm">
              No doctors match your category filter or search query. Click "Onboard Practitioner" to add your first profile.
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span> Onboard Practitioner
            </button>
          </div>
        ) : (
          /* Doctors Table */
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 glass-card">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container/50 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant select-none">
                    <th className="py-3.5 px-4">Profile</th>
                    <th className="py-3.5 px-4">Practitioner Name</th>
                    <th className="py-3.5 px-4">Specialization / Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Experience</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {filteredDoctors.map((doc) => (
                    <tr key={doc._id || doc.slug || doc.customId} className="hover:bg-surface-container/30 transition-colors">
                      {/* Thumbnail Image */}
                      <td className="py-3 px-4">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-container border border-outline-variant/30 shrink-0">
                          <img
                            src={getFullImageUrl(doc.image) || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"}
                            alt={doc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Name & Qualifications */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-on-surface block leading-tight">{doc.name}</span>
                        <span className="text-[11px] text-on-surface-variant opacity-70">
                          {doc.qualifications || doc.credentials || "Medical Practitioner"}
                        </span>
                      </td>

                      {/* Specialization */}
                      <td className="py-3 px-4 text-xs font-semibold text-on-surface">
                        {doc.specialization || doc.title}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant text-[10px] tracking-wider uppercase font-bold">
                          {doc.category || "Dentist"}
                        </span>
                      </td>

                      {/* Experience */}
                      <td className="py-3 px-4 text-xs text-on-surface-variant font-semibold">
                        {doc.experience}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(doc)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            doc.isActive !== false
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                          }`}
                          title="Click to toggle active status"
                        >
                          <span className={`w-2 h-2 rounded-full ${doc.isActive !== false ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                          <span>{doc.isActive !== false ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openViewModal(doc)}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg cursor-pointer"
                            title="View Profile Details"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          <button
                            onClick={() => openEditModal(doc)}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg cursor-pointer"
                            title="Edit Profile"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          <button
                            onClick={() => openDeleteModal(doc)}
                            className="p-1.5 text-error hover:bg-error/10 rounded-lg cursor-pointer"
                            title="Delete Doctor"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT DOCTOR MODAL */}
      {isFormModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    {selectedDoctor ? "edit_note" : "person_add"}
                  </span>
                  <span>{selectedDoctor ? "Edit Doctor Profile" : "Onboard Practitioner"}</span>
                </h2>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1 text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <DoctorForm
                initialData={selectedDoctor}
                defaultCategory={selectedCategory}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormModalOpen(false)}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          </div>,
          document.body
        )}

      {/* VIEW DOCTOR PROFILE MODAL */}
      {isViewModalOpen && selectedDoctor &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-outline-variant/30 max-h-[85vh] overflow-y-auto text-on-surface"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container border border-outline-variant/30 shrink-0">
                    <img
                      src={getFullImageUrl(selectedDoctor.image)}
                      alt={selectedDoctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold">{selectedDoctor.name}</h2>
                    <p className="text-xs font-semibold text-primary">
                      {selectedDoctor.specialization || selectedDoctor.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-1 text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-surface-container/40 p-3 rounded-xl">
                  <div>
                    <span className="font-bold text-on-surface-variant uppercase text-[10px] tracking-wider block">Qualifications</span>
                    <span className="font-semibold text-on-surface">{selectedDoctor.qualifications || selectedDoctor.credentials || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface-variant uppercase text-[10px] tracking-wider block">Experience</span>
                    <span className="font-semibold text-on-surface">{selectedDoctor.experience}</span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface-variant uppercase text-[10px] tracking-wider block">Availability</span>
                    <span className="font-semibold text-on-surface">{selectedDoctor.availability}</span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface-variant uppercase text-[10px] tracking-wider block">Languages</span>
                    <span className="font-semibold text-on-surface">{selectedDoctor.languages}</span>
                  </div>
                </div>

                {selectedDoctor.bio && (
                  <div>
                    <h4 className="font-bold text-on-surface-variant uppercase text-[10px] tracking-wider mb-1">Biography</h4>
                    <p className="text-body-md text-on-surface whitespace-pre-line leading-relaxed">{selectedDoctor.bio}</p>
                  </div>
                )}

                {selectedDoctor.schedule && selectedDoctor.schedule.length > 0 && (
                  <div>
                    <h4 className="font-bold text-on-surface-variant uppercase text-[10px] tracking-wider mb-1.5">Schedule</h4>
                    <div className="space-y-1">
                      {selectedDoctor.schedule.map((slot, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-outline-variant/10">
                          <span className="font-bold">{typeof slot === "string" ? "Schedule" : slot.day}</span>
                          <span className="text-on-surface-variant">{typeof slot === "string" ? slot : slot.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedDoctor);
                  }}
                  className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedDoctor &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-outline-variant/30 text-on-surface"
            >
              <div className="flex items-center gap-3 text-error">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div>
                  <h3 className="text-base font-bold">Offboard Practitioner</h3>
                  <p className="text-xs text-on-surface-variant">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-sm">
                Are you sure you want to offboard <span className="font-bold text-on-surface">"{selectedDoctor.name}"</span> from clinic records?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-outline-variant/40 text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-error text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Offboarding..." : "Offboard Doctor"}
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      {/* CUSTOM TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold text-white ${
              toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {toast.type === "error" ? "error_outline" : "check_circle"}
            </span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
