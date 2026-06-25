import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { STATIC_APPOINTMENTS } from "../data/staticPatients";

export const AppointmentsTable = forwardRef(({
  isDashboard = false,
  searchTerm = "",
  statusFilter = "All",
  doctorFilter = "All"
}, ref) => {
  const navigate = useNavigate();

  // State initialized from static data
  const [appointments, setAppointments] = useState(STATIC_APPOINTMENTS);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal & Overlay States
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Loading & Toast States
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    service: "Dental Cleaning",
    doctor: "Dr. Elena Rodriguez",
    date: "",
    time: "",
    notes: ""
  });

  // Auto-clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, doctorFilter]);

  // Expose handlers via ref
  useImperativeHandle(ref, () => ({
    openAddModal() {
      setFormData({
        name: "",
        service: "Dental Cleaning",
        doctor: "Dr. Elena Rodriguez",
        date: "",
        time: "",
        notes: ""
      });
      setIsAddModalOpen(true);
    },
    getAppointments() {
      return appointments;
    }
  }));

  // Handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const openViewModal = (appt) => {
    setSelectedAppt(appt);
    setIsViewModalOpen(true);
  };

  const openEditModal = (appt) => {
    setSelectedAppt(appt);
    setFormData({
      name: appt.name,
      service: appt.service,
      doctor: appt.doctor || "Dr. Elena Rodriguez",
      date: appt.date,
      time: appt.time,
      notes: appt.notes || ""
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (appt) => {
    setSelectedAppt(appt);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.time) {
      alert("Name, date, and time are required.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAddModalOpen(false);
      
      // Simulate adding to static array for visual consistency
      const newAppt = {
        id: appointments.length + 1,
        patientId: `PT-${String(Math.floor(1000 + Math.random() * 9000))}`,
        name: formData.name,
        service: formData.service,
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        status: "Pending",
        notes: formData.notes
      };
      setAppointments(prev => [newAppt, ...prev]);

      setToastMessage("Appointment scheduled successfully (UI demo only)!");
    }, 1200);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsEditModalOpen(false);

      // Simulate edit in state
      setAppointments(prev => prev.map(appt => {
        if (appt.id === selectedAppt.id) {
          return {
            ...appt,
            name: formData.name,
            service: formData.service,
            doctor: formData.doctor,
            date: formData.date,
            time: formData.time,
            notes: formData.notes
          };
        }
        return appt;
      }));

      setToastMessage("Appointment details updated (UI demo only)!");
    }, 1200);
  };

  const handleDeleteConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDeleteModalOpen(false);

      // Simulate delete in state
      setAppointments(prev => prev.filter(appt => appt.id !== selectedAppt.id));

      setToastMessage("Appointment cancelled successfully (UI demo only)!");
    }, 1200);
  };

  const handleStatusChange = (apptId, newStatus) => {
    setAppointments(prev => prev.map(appt => {
      if (appt.id === apptId) {
        return { ...appt, status: newStatus };
      }
      return appt;
    }));
    setToastMessage(`Status updated to ${newStatus} (UI demo only)!`);
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter((appt) => {
    const matchesSearch =
      appt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appt.doctor && appt.doctor.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" || appt.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesDoctor =
      doctorFilter === "All" || appt.doctor === doctorFilter;

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  // Pagination calculations
  const limit = isDashboard ? 4 : null;
  const displayedAppointments = limit
    ? filteredAppointments.slice(0, limit)
    : filteredAppointments;

  const totalPages = Math.ceil(displayedAppointments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = isDashboard
    ? displayedAppointments
    : displayedAppointments.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const doctorsList = [
    "Dr. Elena Rodriguez",
    "Dr. Marcus Thorne",
    "Dr. Sarah Jenkins",
    "Dr. Julian Chen",
    "Dr. Amara Okoro",
    "Dr. Leo Varadkar"
  ];

  const containerClasses = isDashboard
    ? "tickets-table glass-card card-shadow rounded-xl overflow-hidden border border-outline-variant/30 w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    : "glass-card card-shadow rounded-xl overflow-hidden border border-outline-variant/30 w-full";

  return (
    <>
      <div className={containerClasses}>
        {/* Dashboard header card */}
        {isDashboard && (
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/40 backdrop-blur-sm">
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
              Recent Appointments
            </h4>
            <button
              onClick={() => navigate("/appointments")}
              className="text-primary text-label-md font-bold hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
        )}

        {/* Appointments Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low/60 text-on-surface-variant uppercase text-label-sm tracking-wider border-b border-surface-container">
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Date &amp; Time</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60">
              <AnimatePresence>
                {currentItems.length > 0 ? (
                  currentItems.map((appt) => (
                    <motion.tr
                      key={appt.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="hover:bg-primary-container/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center font-bold text-xs text-primary`}>
                            {appt.initial || appt.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-body-md font-bold text-on-surface">{appt.name}</p>
                            <p className="text-[12px] font-mono text-on-surface-variant opacity-80">#{appt.patientId || "PT-0000"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-tertiary-container/10 text-on-tertiary-fixed-variant rounded-full text-xs font-semibold">
                          {appt.service}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-body-md font-bold text-on-surface">{appt.date}</p>
                        <p className="text-xs text-on-surface-variant font-medium opacity-75">{appt.time}</p>
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant font-semibold">
                        {appt.doctor || "Dr. Elena Rodriguez"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-label-sm font-semibold ${
                          appt.status === "Confirmed" || appt.status === "Approved" ? "bg-secondary-container text-on-secondary-container" :
                          appt.status === "In Progress" ? "bg-primary-container text-on-primary-container" :
                          appt.status === "Completed" ? "bg-primary-container/85 text-white" :
                          "bg-surface-container-highest text-on-surface-variant"
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleStatusChange(appt.id, "Approved")}
                            title="Approve Reservation"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/70 hover:text-primary hover:bg-primary-container/10 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(appt.id, "Completed")}
                            title="Mark Completed"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/70 hover:text-secondary hover:bg-secondary-container/20 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">task_alt</span>
                          </button>
                          <button
                            onClick={() => openEditModal(appt)}
                            title="Edit Schedule Details"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/70 hover:text-tertiary hover:bg-tertiary/10 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(appt)}
                            title="Cancel Appointment"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/70 hover:text-error hover:bg-error-container/20 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-body-md text-on-surface-variant opacity-70 font-semibold">
                      No reservations matching the search/filter criteria.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isDashboard && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-outline-variant/30 flex justify-between items-center bg-white/20 backdrop-blur-sm select-none">
            <p className="text-label-sm text-on-surface-variant opacity-80">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, displayedAppointments.length)} of {displayedAppointments.length} appointments
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-outline-variant/40 hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => paginate(idx + 1)}
                  className={`w-8 h-8 rounded-lg font-bold text-label-sm transition-all cursor-pointer ${
                    currentPage === idx + 1
                      ? "bg-primary text-on-primary shadow-sm"
                      : "border border-outline-variant/40 hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-outline-variant/40 hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== SCHEDULE APPOINTMENT MODAL ==================== */}
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
              className="glass-card card-shadow rounded-2xl max-w-lg w-full border border-outline-variant/30 p-6 relative"
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
                <span className="material-symbols-outlined text-primary text-[28px]">calendar_today</span>
                Schedule Reservation
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                  <p className="text-body-md text-on-surface-variant font-bold mt-4">Reserving Appointment...</p>
                </div>
              ) : (
                <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="name">Patient Full Name</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="name"
                      required
                      placeholder="Jane Doe"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="service">Service Type</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="service"
                        required
                        value={formData.service}
                        onChange={handleInputChange}
                      >
                        <option value="Dental Cleaning">Dental Cleaning</option>
                        <option value="Root Canal">Root Canal</option>
                        <option value="Dental Implants">Dental Implants</option>
                        <option value="Teeth Whitening">Teeth Whitening</option>
                        <option value="Braces & Aligners">Braces &amp; Aligners</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="doctor">Doctor</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="doctor"
                        required
                        value={formData.doctor}
                        onChange={handleInputChange}
                      >
                        {doctorsList.map((doc, idx) => (
                          <option key={idx} value={doc}>{doc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="date">Appointment Date</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="date"
                        required
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="time">Preferred Time</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="time"
                        required
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="notes">Special Requests/Notes</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="notes"
                      placeholder="Allergies, sensitive teeth, anxiety, etc..."
                      rows="3"
                      value={formData.notes}
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
                      Schedule Appointment
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== EDIT APPOINTMENT MODAL ==================== */}
      <AnimatePresence>
        {isEditModalOpen && selectedAppt && createPortal(
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
              className="glass-card card-shadow rounded-2xl max-w-lg w-full border border-outline-variant/30 p-6 relative"
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
                Modify Reservation
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                  <p className="text-body-md text-on-surface-variant font-bold mt-4">Saving Changes...</p>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="name">Patient Full Name</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="name"
                      required
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="service">Service Type</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="service"
                        required
                        value={formData.service}
                        onChange={handleInputChange}
                      >
                        <option value="Dental Cleaning">Dental Cleaning</option>
                        <option value="Root Canal">Root Canal</option>
                        <option value="Dental Implants">Dental Implants</option>
                        <option value="Teeth Whitening">Teeth Whitening</option>
                        <option value="Braces & Aligners">Braces &amp; Aligners</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="doctor">Doctor</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="doctor"
                        required
                        value={formData.doctor}
                        onChange={handleInputChange}
                      >
                        {doctorsList.map((doc, idx) => (
                          <option key={idx} value={doc}>{doc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="date">Appointment Date</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="date"
                        required
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="time">Preferred Time</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="time"
                        required
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="notes">Special Requests/Notes</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="notes"
                      rows="3"
                      value={formData.notes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 select-none">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="border border-outline-variant/50 text-on-surface font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer"
                    >
                      Cancel
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

      {/* ==================== DELETE APPOINTMENT CONFIRMATION ==================== */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedAppt && createPortal(
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
              className="glass-card card-shadow rounded-2xl max-w-md w-full border border-error/20 p-6 text-center select-none"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <span className="material-symbols-outlined animate-spin text-error text-5xl">progress_activity</span>
                  <p className="text-body-md text-error font-bold mt-4">Cancelling Reservation...</p>
                </div>
              ) : (
                <>
                  <div className="mx-auto w-12 h-12 rounded-full bg-error-container/40 flex items-center justify-center text-error mb-4">
                    <span className="material-symbols-outlined text-[24px]">warning</span>
                  </div>

                  <h3 className="text-headline-sm font-extrabold text-on-surface mb-2">Cancel Appointment?</h3>
                  <p className="text-body-md text-on-surface-variant font-medium leading-relaxed mb-6">
                    Are you sure you want to cancel the reservation for <span className="font-bold text-on-surface">{selectedAppt.name}</span> on <span className="font-bold">{selectedAppt.date}</span> at <span className="font-bold">{selectedAppt.time}</span>?
                  </p>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="border border-outline-variant/50 text-on-surface font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer flex-1"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="bg-error text-on-error font-bold px-5 py-2.5 rounded-xl hover:bg-error/90 transition-colors text-label-sm shadow-sm flex-1 cursor-pointer"
                    >
                      Yes, Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== TOAST FEEDBACK ==================== */}
      <AnimatePresence>
        {toastMessage && createPortal(
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[10000] bg-secondary text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 select-none font-bold"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="text-label-md">{toastMessage}</span>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
});

AppointmentsTable.displayName = "AppointmentsTable";
