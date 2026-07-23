import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import ServiceForm from "../components/ServiceForm";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus
} from "../api/services";
import { getFullImageUrl, parseErrorMessage } from "../api/axios";

export default function Services() {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals & Overlays
  const [selectedService, setSelectedService] = useState(null);
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

  // Load Services from API
  const fetchServiceList = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await getServices();
      if (res && res.success) {
        setServices(res.data || []);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Failed to load services:", err);
      const friendlyErr = parseErrorMessage(err, "Unable to load service catalog from backend API.");
      setErrorMessage(friendlyErr);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceList();
  }, []);

  // Auto clear toast
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: "", type: "success" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.message]);

  const openAddModal = () => {
    setSelectedService(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setIsFormModalOpen(true);
  };

  const openViewModal = (service) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedService) {
        // Edit Mode
        const id = selectedService._id || selectedService.slug;
        const res = await updateService(id, formData);
        showToast(`Service "${res.data?.title || formData.title}" updated successfully!`, "success");
      } else {
        // Create Mode
        const res = await createService(formData);
        showToast(`Service "${res.data?.title || formData.title}" published successfully!`, "success");
      }
      setIsFormModalOpen(false);
      setSelectedService(null);
      await fetchServiceList();
    } catch (err) {
      console.error("Error saving service:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to save service details. Please verify your inputs.");
      showToast(friendlyErr, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    try {
      const id = selectedService._id || selectedService.slug;
      await deleteService(id);
      showToast(`Service "${selectedService.title}" deleted successfully.`, "success");
      setIsDeleteModalOpen(false);
      setSelectedService(null);
      await fetchServiceList();
    } catch (err) {
      console.error("Failed to delete service:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to delete service record.");
      showToast(friendlyErr, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (service) => {
    const id = service._id || service.slug;
    const nextStatus = !service.isActive;
    try {
      await toggleServiceStatus(id, nextStatus);
      setServices((prev) =>
        prev.map((s) => (s._id === service._id || s.slug === service.slug ? { ...s, isActive: nextStatus } : s))
      );
      showToast(
        `Service "${service.title}" visibility changed to ${nextStatus ? "Active" : "Inactive"}`,
        "success"
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to update service status.");
      showToast(friendlyErr, "error");
    }
  };

  const filteredServices = services.filter((svc) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && svc.isActive) ||
      (statusFilter === "Inactive" && !svc.isActive);

    const matchesSearch =
      svc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (svc.tagline && svc.tagline.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (svc.summary && svc.summary.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar
        placeholder="Search services, taglines..."
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
              Manage clinical offerings, procedure steps, aftercare tips, and website visibility.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="bg-primary text-on-primary py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:opacity-95 transition-opacity shadow-md cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Add New Service</span>
          </motion.button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 select-none">
          <div className="flex items-center gap-2">
            {["All", "Active", "Inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {status} Services
              </button>
            ))}
          </div>
          <div className="text-xs text-on-surface-variant font-semibold">
            Total Services: <span className="text-primary font-bold">{filteredServices.length}</span>
          </div>
        </div>

        {/* Custom Error Banner (No Raw 404/Status Strings) */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              onClick={fetchServiceList}
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
            <p className="text-sm font-semibold text-on-surface-variant">Loading clinic services catalog...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          /* Empty State */
          <div className="glass-card rounded-2xl p-12 text-center border border-outline-variant/30 flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px]">medical_services</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">No services found</h3>
            <p className="text-xs text-on-surface-variant max-w-sm">
              No services match your search or filter. Click "Add New Service" to create a new clinical service.
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Service
            </button>
          </div>
        ) : (
          /* Services Table */
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 glass-card">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container/50 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant select-none">
                    <th className="py-3.5 px-4">Thumbnail</th>
                    <th className="py-3.5 px-4">Service Name</th>
                    <th className="py-3.5 px-4">Tagline</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {filteredServices.map((svc) => (
                    <tr key={svc._id || svc.slug} className="hover:bg-surface-container/30 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-surface-container border border-outline-variant/20 shrink-0">
                          <img
                            src={getFullImageUrl(svc.image) || "https://images.unsplash.com/photo-1579684389782-64d84b5e905a?auto=format&fit=crop&q=80&w=200"}
                            alt={svc.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Title & Icon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary-container/60 text-on-primary-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">
                              {svc.icon || "medical_services"}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-on-surface block leading-tight">{svc.title}</span>
                            <span className="text-[11px] text-on-surface-variant opacity-70 font-mono">
                              /services/{svc.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tagline */}
                      <td className="py-3 px-4 text-xs font-semibold text-on-surface-variant">
                        {svc.tagline ? (
                          <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant uppercase text-[10px] tracking-wider font-bold">
                            {svc.tagline}
                          </span>
                        ) : (
                          <span className="italic text-on-surface-variant/40">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(svc)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            svc.isActive
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                          }`}
                          title="Click to toggle visibility"
                        >
                          <span className={`w-2 h-2 rounded-full ${svc.isActive ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                          <span>{svc.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-xs text-on-surface-variant">
                        {svc.createdAt ? new Date(svc.createdAt).toLocaleDateString() : "System Record"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openViewModal(svc)}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg cursor-pointer"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          <button
                            onClick={() => openEditModal(svc)}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg cursor-pointer"
                            title="Edit Service"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          <button
                            onClick={() => openDeleteModal(svc)}
                            className="p-1.5 text-error hover:bg-error/10 rounded-lg cursor-pointer"
                            title="Delete Service"
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

      {/* CREATE / EDIT SERVICE MODAL */}
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
                    {selectedService ? "edit_note" : "add_box"}
                  </span>
                  <span>{selectedService ? "Edit Service" : "Add New Service"}</span>
                </h2>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1 text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <ServiceForm
                initialData={selectedService}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormModalOpen(false)}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          </div>,
          document.body
        )}

      {/* VIEW SERVICE MODAL */}
      {isViewModalOpen && selectedService &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-outline-variant/30 max-h-[85vh] overflow-y-auto text-on-surface"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {selectedService.tagline || "Clinical Service"}
                  </span>
                  <h2 className="text-xl font-extrabold">{selectedService.title}</h2>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-1 text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="h-48 rounded-xl overflow-hidden bg-surface-container">
                <img
                  src={getFullImageUrl(selectedService.image)}
                  alt={selectedService.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">Summary</h4>
                  <p className="text-body-md text-on-surface mt-0.5">{selectedService.summary}</p>
                </div>

                <div>
                  <h4 className="font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">Description</h4>
                  <p className="text-body-md text-on-surface mt-0.5 whitespace-pre-line">{selectedService.description}</p>
                </div>

                {selectedService.bulletPoints && selectedService.bulletPoints.length > 0 && (
                  <div>
                    <h4 className="font-bold text-on-surface-variant uppercase text-[10px] tracking-wider mb-1">Key Highlights</h4>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {selectedService.bulletPoints.map((bp, i) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedService);
                  }}
                  className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Edit This Service
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedService &&
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
                  <h3 className="text-base font-bold">Delete Service</h3>
                  <p className="text-xs text-on-surface-variant">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-sm">
                Are you sure you want to delete <span className="font-bold text-on-surface">"{selectedService.title}"</span> from the clinic catalog?
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
                  {isSubmitting ? "Deleting..." : "Delete Service"}
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      {/* CUSTOM TOAST NOTIFICATION (NO POPUP ALERTS OR RAW 404 STRINGS) */}
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
