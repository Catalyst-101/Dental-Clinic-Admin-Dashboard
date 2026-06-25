import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { STATIC_PATIENTS, STATIC_APPOINTMENTS } from "../data/staticPatients";

export const PatientTable = forwardRef(({
  searchTerm = "",
  statusFilter = "All",
  dateFrom = "",
  dateTo = ""
}, ref) => {
  const navigate = useNavigate();

  // Component States initialized from static data (UI demonstration only)
  const [patients] = useState(STATIC_PATIENTS);
  const [appointments] = useState(STATIC_APPOINTMENTS);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal & Overlay States
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Loading States for UI demo purposes
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Form States (pre-populated or empty)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "Female",
    dob: "",
    address: "",
    status: "Active",
    notes: ""
  });

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  // Handle auto-clear toast message
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Expose Add Modal & Patient Data functions to ref
  useImperativeHandle(ref, () => ({
    openAddModal() {
      resetForm();
      setIsAddModalOpen(true);
    },
    getPatients() {
      return patients;
    }
  }));

  // Form handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert("Name, phone, and email are required.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAddModalOpen(false);
      resetForm();
      setToastMessage("Patient successfully registered (UI demo only)!");
    }, 1200);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert("Name, phone, and email are required.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsEditModalOpen(false);
      resetForm();
      setToastMessage("Patient profile updated successfully (UI demo only)!");
    }, 1200);
  };

  const handleDeleteConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedPatient(null);
      setToastMessage("Patient record deleted successfully (UI demo only)!");
    }, 1200);
  };

  const openViewModal = (patient) => {
    setSelectedPatient(patient);
    setIsViewModalOpen(true);
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      gender: patient.gender,
      dob: patient.dob || "",
      address: patient.address || "",
      status: patient.status,
      notes: patient.notes || ""
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (patient) => {
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      gender: "Female",
      dob: "",
      address: "",
      status: "Active",
      notes: ""
    });
  };

  const getPatientAppointments = (patientId) => {
    return appointments.filter((app) => app.patientId === patientId);
  };

  // Filtering Logic
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "All" ||
      patient.status.toLowerCase() === statusFilter.toLowerCase();

    let matchesDate = true;
    if (dateFrom || dateTo) {
      if (patient.lastVisit && patient.lastVisit !== "New Patient" && patient.lastVisit !== "N/A") {
        const visitDate = new Date(patient.lastVisit);
        if (dateFrom && visitDate < new Date(dateFrom)) matchesDate = false;
        if (dateTo && visitDate > new Date(dateTo)) matchesDate = false;
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination Logic
  const displayedPatients = filteredPatients;

  const totalPages = Math.ceil(displayedPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedPatients.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Container styling matching patients page
  const containerClasses = "glass-card card-shadow rounded-xl overflow-hidden border border-outline-variant/30 w-full transition-all duration-300";

  return (
    <>
      <div className={containerClasses}>

        {/* Patients Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low/60 text-on-surface-variant uppercase text-label-sm tracking-wider border-b border-surface-container">
                <th className="px-6 py-4">Patient ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4">Appts</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-container/60">
              <AnimatePresence>
                {currentItems.length > 0 ? (
                  currentItems.map((patient) => (
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="hover:bg-primary-container/5 transition-colors"
                    >
                      {/* Patient ID */}
                      <td className="px-6 py-4">
                        <span className="text-body-md font-mono font-bold text-on-surface-variant">
                          #{patient.id}
                        </span>
                      </td>

                      {/* Patient Name & Avatar info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={patient.avatar || `https://i.pravatar.cc/150?u=${patient.id}`}
                            alt={patient.name}
                            className="w-10 h-10 rounded-full object-cover border border-outline-variant/30"
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(patient.name)}`;
                            }}
                          />
                          <div>
                            <h5 className="text-body-md font-bold text-on-surface leading-snug">
                              {patient.name}
                            </h5>
                            <p className="text-[12px] text-on-surface-variant font-medium opacity-80">
                              {patient.age} yrs, {patient.gender}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-body-md font-semibold text-on-surface">
                            {patient.phone}
                          </p>
                          <p className="text-xs text-on-surface-variant font-medium opacity-75">
                            {patient.email}
                          </p>
                        </div>
                      </td>

                      {/* Last Visit */}
                      <td className="px-6 py-4 text-body-md text-on-surface-variant font-medium">
                        {patient.lastVisit}
                      </td>

                      {/* Appointments Count */}
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-primary">
                          {String(patient.appts || 0).padStart(2, "0")}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-label-sm font-semibold ${
                            patient.status === "Active"
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-surface-container-highest text-on-surface-variant"
                          }`}
                        >
                          {patient.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions Column matching Patients.jsx */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openViewModal(patient)}
                            title="View Patient Details"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/70 hover:text-primary hover:bg-primary-container/10 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          <button
                            onClick={() => openEditModal(patient)}
                            title="Edit Patient Details"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/70 hover:text-secondary hover:bg-secondary-container/20 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(patient)}
                            title="Delete Patient"
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
                    <td colSpan="7" className="px-6 py-12 text-center text-body-md text-on-surface-variant opacity-70 font-semibold">
                      No registered patients matching your search/filter criteria.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-outline-variant/30 flex justify-between items-center bg-white/20 backdrop-blur-sm select-none">
            <p className="text-label-sm text-on-surface-variant opacity-80">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, displayedPatients.length)} of {displayedPatients.length} patients
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

      {/* ==================== VIEW DETAILS MODAL ==================== */}
      <AnimatePresence>
        {isViewModalOpen && selectedPatient && createPortal(
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
              className="glass-card card-shadow rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-outline-variant/30 flex flex-col p-6 relative"
            >
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <h2 className="text-headline-sm font-headline-sm font-extrabold text-on-surface mb-6 flex items-center gap-2 select-none border-b border-outline-variant/20 pb-3">
                <span className="material-symbols-outlined text-primary text-[28px]">account_box</span>
                Patient Profile
              </h2>

              {/* Patient Core Summary */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 border-b border-outline-variant/20 pb-6">
                <img
                  src={selectedPatient.avatar || `https://i.pravatar.cc/150?u=${selectedPatient.id}`}
                  alt={selectedPatient.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-sm"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedPatient.name)}`;
                  }}
                />
                <div className="space-y-1.5 text-center sm:text-left flex-grow">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <h3 className="text-headline-sm font-black text-on-surface leading-none">{selectedPatient.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      selectedPatient.status === "Active"
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}>
                      {selectedPatient.status}
                    </span>
                  </div>
                  <p className="text-body-md text-on-surface-variant font-semibold">
                    Patient ID: <span className="font-mono text-primary font-bold">#{selectedPatient.id}</span>
                  </p>
                  <p className="text-body-md text-on-surface-variant font-semibold">
                    {selectedPatient.age} yrs old &bull; {selectedPatient.gender}
                  </p>
                </div>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-left">
                <div className="bg-surface-container-low/60 p-3 rounded-xl border border-outline-variant/20">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-0.5">Phone Number</span>
                  <span className="text-label-md font-bold text-on-surface">{selectedPatient.phone}</span>
                </div>
                <div className="bg-surface-container-low/60 p-3 rounded-xl border border-outline-variant/20">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-0.5">Email Address</span>
                  <span className="text-label-md font-bold text-on-surface">{selectedPatient.email}</span>
                </div>
                <div className="bg-surface-container-low/60 p-3 rounded-xl border border-outline-variant/20">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-0.5">Date of Birth</span>
                  <span className="text-label-md font-bold text-on-surface">{selectedPatient.dob || "N/A"}</span>
                </div>
                <div className="bg-surface-container-low/60 p-3 rounded-xl border border-outline-variant/20">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-0.5">Address</span>
                  <span className="text-label-md font-bold text-on-surface">{selectedPatient.address || "N/A"}</span>
                </div>
                <div className="bg-surface-container-low/60 p-3 rounded-xl border border-outline-variant/20 sm:col-span-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-0.5">Medical Notes &amp; History</span>
                  <p className="text-body-md text-on-surface-variant font-medium leading-relaxed italic">
                    "{selectedPatient.notes || "No special medical history noted."}"
                  </p>
                </div>
              </div>

              {/* Appointment History */}
              <div className="text-left border-t border-outline-variant/20 pt-4">
                <h4 className="font-headline-sm text-label-md text-on-surface font-black uppercase tracking-wider mb-3">
                  Appointment History ({getPatientAppointments(selectedPatient.id).length})
                </h4>

                {getPatientAppointments(selectedPatient.id).length > 0 ? (
                  <div className="space-y-3">
                    {getPatientAppointments(selectedPatient.id).map((appt) => (
                      <div key={appt.id} className="flex justify-between items-center bg-surface-container-low/40 border border-outline-variant/15 p-3 rounded-xl">
                        <div>
                          <p className="text-body-md font-bold text-on-surface leading-tight">{appt.service}</p>
                          <p className="text-xs text-on-surface-variant font-medium opacity-80 mt-0.5">
                            {appt.date} &bull; {appt.time}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          appt.status === "Confirmed" ? "bg-secondary-container text-on-secondary-container" :
                          appt.status === "In Progress" ? "bg-primary-container text-on-primary-container" :
                          appt.status === "Completed" ? "bg-primary-container/85 text-white" :
                          "bg-surface-container-highest text-on-surface-variant"
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-md text-on-surface-variant font-semibold italic text-center py-4 bg-surface-container-low/20 rounded-xl">
                    No appointment logs found for this patient.
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 select-none border-t border-outline-variant/20 pt-4">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedPatient);
                  }}
                  className="bg-primary text-on-primary font-bold px-5 py-2.5 rounded-xl hover:opacity-95 transition-all flex items-center gap-1 text-label-sm shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="border border-outline-variant/50 text-on-surface font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== ADD PATIENT MODAL ==================== */}
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
              className="glass-card card-shadow rounded-2xl max-w-xl w-full border border-outline-variant/30 p-6 relative"
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
                <span className="material-symbols-outlined text-primary text-[28px]">person_add</span>
                Register New Patient
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                  <p className="text-body-md text-on-surface-variant font-bold mt-4">Saving Patient Record...</p>
                </div>
              ) : (
                <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="name">Full Name</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="name"
                      required
                      placeholder="Sarah Jenkins"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="phone">Phone Number</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="phone"
                        required
                        placeholder="+1 (555) 234-5678"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="email">Email Address</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="email"
                        required
                        placeholder="sarah.j@email.com"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="gender">Gender</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="gender"
                        required
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="dob">Date of Birth</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="dob"
                        required
                        type="date"
                        value={formData.dob}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="status">Status</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="status"
                        required
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="address">Address</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="address"
                      placeholder="742 Evergreen Terrace, Springfield"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="notes">Medical Notes</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="notes"
                      placeholder="Any allergies or conditions..."
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
                      Register Patient
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* ==================== EDIT PATIENT MODAL ==================== */}
      <AnimatePresence>
        {isEditModalOpen && selectedPatient && createPortal(
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
              className="glass-card card-shadow rounded-2xl max-w-xl w-full border border-outline-variant/30 p-6 relative"
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
                Modify Patient Profile
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
                  <p className="text-body-md text-on-surface-variant font-bold mt-4">Saving Changes...</p>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="phone">Phone Number</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="phone"
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="email">Email Address</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                        id="email"
                        required
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="gender">Gender</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="gender"
                        required
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="dob">Date of Birth</label>
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="dob"
                        required
                        type="date"
                        value={formData.dob}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="status">Status</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                        id="status"
                        required
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="address">Address</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="notes">Medical Notes</label>
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

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedPatient && createPortal(
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
                  <p className="text-body-md text-error font-bold mt-4">Deleting Patient Record...</p>
                </div>
              ) : (
                <>
                  <div className="mx-auto w-12 h-12 rounded-full bg-error-container/40 flex items-center justify-center text-error mb-4">
                    <span className="material-symbols-outlined text-[24px]">warning</span>
                  </div>

                  <h3 className="text-headline-sm font-extrabold text-on-surface mb-2">Delete Patient?</h3>
                  <p className="text-body-md text-on-surface-variant font-medium leading-relaxed mb-6">
                    Are you sure you want to delete patient <span className="font-bold text-on-surface">{selectedPatient.name}</span>? This will permanently remove their profile and delete all associated appointments.
                  </p>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="border border-outline-variant/50 text-on-surface font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="bg-error text-on-error font-bold px-5 py-2.5 rounded-xl hover:bg-error/90 transition-colors text-label-sm shadow-sm flex-1 cursor-pointer"
                    >
                      Yes, Delete
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

PatientTable.displayName = "PatientTable";
