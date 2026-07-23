import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment
} from "../api/appointments";
import { getDoctors } from "../api/doctors";
import { getServices } from "../api/services";
import { parseErrorMessage } from "../api/axios";

export const AppointmentsTable = forwardRef(({
  searchTerm = "",
  statusFilter = "All",
  doctorFilter = "All",
  isDashboard = false,
  hideInnerBookButton = false
}, ref) => {
  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isDashboard ? 5 : 8;

  // Modal States
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [errorMessage, setErrorMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Form State
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    gender: "Female",
    dob: "",
    doctorName: "",
    serviceName: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    notes: ""
  });

  // Fetch Doctors & Services for Dynamic Dropdowns
  const fetchDoctorsAndServices = async () => {
    try {
      const [docsRes, servsRes] = await Promise.all([
        getDoctors({ all: "true" }),
        getServices({ all: "true" })
      ]);
      if (docsRes && docsRes.success && docsRes.data) {
        setDoctorsList(docsRes.data);
        if (docsRes.data.length > 0 && !formData.doctorName) {
          setFormData((prev) => ({ ...prev, doctorName: docsRes.data[0].name }));
        }
      }
      if (servsRes && servsRes.success && servsRes.data) {
        setServicesList(servsRes.data);
        if (servsRes.data.length > 0 && !formData.serviceName) {
          setFormData((prev) => ({ ...prev, serviceName: servsRes.data[0].title }));
        }
      }
    } catch (err) {
      console.error("Error fetching doctors/services for dropdowns:", err);
    }
  };

  const fetchAppointmentList = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await getAppointments({ status: statusFilter, doctor: doctorFilter });
      if (res && res.success) {
        setAppointments(res.data || []);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
      const friendlyErr = parseErrorMessage(err, "Unable to load appointments from backend.");
      setErrorMessage(friendlyErr);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsAndServices();
    fetchAppointmentList();
  }, [statusFilter, doctorFilter]);

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: "", type: "success" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.message]);

  useImperativeHandle(ref, () => ({
    openAddModal() {
      resetForm();
      setIsAddModalOpen(true);
    },
    getAppointments() {
      return appointments;
    }
  }));

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setValidationError("");
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    if (!formData.patientName.trim() || !formData.patientEmail.trim() || !formData.patientPhone.trim()) {
      setValidationError("Patient name, email, and phone are required.");
      return;
    }
    if (!formData.doctorName.trim()) {
      setValidationError("Please select a doctor.");
      return;
    }
    if (!formData.serviceName.trim()) {
      setValidationError("Please select a service.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAppointment(formData);
      showToast(`Appointment booked & patient profile registered!`, "success");
      setIsAddModalOpen(false);
      resetForm();
      await fetchAppointmentList();
    } catch (err) {
      console.error("Failed to create appointment:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to schedule appointment.");
      setValidationError(friendlyErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (appointment, newStatus) => {
    const id = appointment._id || appointment.id;
    try {
      await updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id || a.id === appointment.id ? { ...a, status: newStatus } : a))
      );
      showToast(`Appointment status changed to ${newStatus}`, "success");
    } catch (err) {
      console.error("Failed to update status:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to update appointment status.");
      showToast(friendlyErr, "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAppointment) return;
    setIsSubmitting(true);
    try {
      const id = selectedAppointment._id || selectedAppointment.id;
      await deleteAppointment(id);
      showToast(`Appointment record deleted successfully.`, "success");
      setIsDeleteModalOpen(false);
      setSelectedAppointment(null);
      await fetchAppointmentList();
    } catch (err) {
      console.error("Failed to delete appointment:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to delete appointment.");
      showToast(friendlyErr, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      gender: "Female",
      dob: "",
      doctorName: doctorsList.length > 0 ? doctorsList[0].name : "",
      serviceName: servicesList.length > 0 ? servicesList[0].title : "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM",
      notes: ""
    });
    setValidationError("");
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.appointmentId && apt.appointmentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || apt.status === statusFilter;
    const matchesDoctor = doctorFilter === "All" || apt.doctorName === doctorFilter;

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="appointments-table-container glass-card card-shadow rounded-xl border border-outline-variant/30 overflow-hidden flex flex-col">
      
      {!isDashboard && (
        <div className="p-4 bg-surface-container/30 border-b border-outline-variant/20 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs font-bold text-on-surface-variant">
            Total Appointments: <span className="text-primary font-extrabold">{filteredAppointments.length}</span>
          </span>
          {!hideInnerBookButton && (
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="bg-primary text-on-primary py-2 px-4 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-md hover:opacity-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Book Appointment
            </button>
          )}
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-error/10 border-b border-error/20 text-error text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
          <button onClick={fetchAppointmentList} className="px-3 py-1 bg-error text-white rounded-lg text-[10px] font-bold">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-on-surface-variant">Loading clinical reservations...</p>
        </div>
      ) : paginatedAppointments.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center flex flex-col items-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">event_busy</span>
          </div>
          <h3 className="text-sm font-bold text-on-surface">No appointments found</h3>
          <p className="text-xs text-on-surface-variant max-w-xs">
            No appointment records match your filters.
          </p>
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container/50 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant select-none">
                <th className="py-3.5 px-4">Appt ID</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Practitioner</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs">
              {paginatedAppointments.map((apt) => (
                <tr key={apt._id || apt.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary">
                    {apt.appointmentId || apt.id}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-on-surface block">{apt.patientName}</span>
                    <span className="text-[10px] text-on-surface-variant opacity-70">{apt.patientPhone}</span>
                  </td>
                  <td className="py-3 px-4 text-on-surface font-semibold">
                    {apt.doctorName}
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant">
                    {apt.serviceName}
                  </td>
                  <td className="py-3 px-4 font-mono text-on-surface">
                    {apt.date} at {apt.time}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border focus:outline-none cursor-pointer ${
                        apt.status === "Confirmed"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : apt.status === "Completed"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : apt.status === "Cancelled"
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1 text-on-surface-variant hover:text-primary rounded cursor-pointer"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1 text-error hover:bg-error/10 rounded cursor-pointer"
                        title="Delete Appointment"
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
      )}

      {/* Pagination Footer */}
      {!isLoading && filteredAppointments.length > 0 && (
        <div className="p-4 border-t border-outline-variant/20 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-on-surface-variant">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container disabled:opacity-30 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CREATE APPOINTMENT MODAL (Includes Patient Auto-Registration & Dynamic Doctor/Service Dropdowns) */}
      {isAddModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-outline-variant/30 text-on-surface max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">add_circle</span>
                  <span>Book Appointment & Register Patient</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-on-surface-variant hover:bg-surface-container rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {validationError && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold flex items-center justify-between">
                  <span>{validationError}</span>
                  <button type="button" onClick={() => setValidationError("")}>
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                {/* Patient Profile Fields */}
                <div className="p-3 rounded-xl bg-surface-container/40 space-y-2.5 border border-outline-variant/20">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Patient Details</span>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Patient Name *</label>
                    <input
                      type="text"
                      id="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      placeholder="e.g. Sarah Jenkins"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Phone Number *</label>
                      <input
                        type="text"
                        id="patientPhone"
                        value={formData.patientPhone}
                        onChange={handleInputChange}
                        placeholder="+1 555-0199"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Email Address *</label>
                      <input
                        type="email"
                        id="patientEmail"
                        value={formData.patientEmail}
                        onChange={handleInputChange}
                        placeholder="sarah@example.com"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Gender</label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs cursor-pointer font-medium"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Date of Birth</label>
                      <input
                        type="date"
                        id="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment Clinical Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Select Doctor *</label>
                    <select
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs font-semibold cursor-pointer"
                    >
                      {doctorsList.length === 0 ? (
                        <option value="Dr. Elena Rodriguez">Dr. Elena Rodriguez</option>
                      ) : (
                        doctorsList.map((doc) => (
                          <option key={doc._id || doc.name} value={doc.name}>
                            {doc.name} ({doc.specialization || doc.category})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Select Service *</label>
                    <select
                      id="serviceName"
                      value={formData.serviceName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs font-semibold cursor-pointer"
                    >
                      {servicesList.length === 0 ? (
                        <option value="Dental Cleaning">Dental Cleaning</option>
                      ) : (
                        servicesList.map((srv) => (
                          <option key={srv._id || srv.title} value={srv.title}>
                            {srv.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Date *</label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs cursor-pointer font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Time Slot *</label>
                    <input
                      type="text"
                      id="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      placeholder="10:00 AM"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Notes</label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Patient notes or procedure instructions..."
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-outline-variant/40 text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {isSubmitting ? "Booking..." : "Book Appointment & Save Patient"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>,
          document.body
        )}

      {/* VIEW APPOINTMENT DETAILS MODAL */}
      {isViewModalOpen && selectedAppointment &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-outline-variant/30 text-on-surface"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-primary uppercase">
                    {selectedAppointment.appointmentId || selectedAppointment.id}
                  </span>
                  <h3 className="text-base font-extrabold">{selectedAppointment.patientName}</h3>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-1 text-on-surface-variant hover:bg-surface-container rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-surface-container/40 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Phone</span>
                    <span className="font-mono font-medium text-on-surface">{selectedAppointment.patientPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Email</span>
                    <span className="font-medium text-on-surface">{selectedAppointment.patientEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Doctor</span>
                    <span className="font-semibold text-on-surface">{selectedAppointment.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Service</span>
                    <span className="font-semibold text-on-surface">{selectedAppointment.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Date & Time</span>
                    <span className="font-mono font-medium text-on-surface">{selectedAppointment.date} at {selectedAppointment.time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Status</span>
                    <span className="font-bold text-primary">{selectedAppointment.status}</span>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Notes</span>
                    <p className="text-xs text-on-surface whitespace-pre-line bg-surface-container/30 p-2.5 rounded-lg border border-outline-variant/10">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-outline-variant/20 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-primary text-on-primary px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedAppointment &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-outline-variant/30 text-on-surface"
            >
              <div className="flex items-center gap-3 text-error">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div>
                  <h3 className="text-base font-bold">Delete Appointment</h3>
                  <p className="text-xs text-on-surface-variant">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs">
                Are you sure you want to delete appointment <span className="font-bold">"{selectedAppointment.appointmentId || selectedAppointment.id}"</span>?
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
                  {isSubmitting ? "Deleting..." : "Delete Appointment"}
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold text-white ${
              toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toast.type === "error" ? "error_outline" : "check_circle"}
            </span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
