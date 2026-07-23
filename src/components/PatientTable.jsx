import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient
} from "../api/patients";
import { parseErrorMessage } from "../api/axios";

export const PatientTable = forwardRef(({
  searchTerm = "",
  statusFilter = "All",
  dateFrom = "",
  dateTo = ""
}, ref) => {
  const [patients, setPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal & Overlay States
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  // Fetch Patients from Backend
  const fetchPatientList = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await getPatients({ status: statusFilter });
      if (res && res.success) {
        setPatients(res.data || []);
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.error("Failed to load patients:", err);
      const friendlyErr = parseErrorMessage(err, "Unable to load patient records from server.");
      setErrorMessage(friendlyErr);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientList();
  }, [statusFilter]);

  // Form State
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

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
    getPatients() {
      return patients;
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
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setValidationError("Patient name, phone, and email are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPatient(formData);
      showToast(`Patient "${res.data?.name || formData.name}" registered successfully!`, "success");
      setIsAddModalOpen(false);
      resetForm();
      await fetchPatientList();
    } catch (err) {
      console.error("Failed to add patient:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to register patient.");
      setValidationError(friendlyErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setValidationError("Patient name, phone, and email are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const id = selectedPatient._id || selectedPatient.id;
      const res = await updatePatient(id, formData);
      showToast(`Patient "${res.data?.name || formData.name}" profile updated!`, "success");
      setIsEditModalOpen(false);
      resetForm();
      await fetchPatientList();
    } catch (err) {
      console.error("Failed to update patient:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to update patient profile.");
      setValidationError(friendlyErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPatient) return;
    setIsSubmitting(true);
    try {
      const id = selectedPatient._id || selectedPatient.id;
      await deletePatient(id);
      showToast(`Patient record "${selectedPatient.name}" deleted successfully.`, "success");
      setIsDeleteModalOpen(false);
      setSelectedPatient(null);
      await fetchPatientList();
    } catch (err) {
      console.error("Failed to delete patient:", err);
      const friendlyErr = parseErrorMessage(err, "Failed to delete patient record.");
      showToast(friendlyErr, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openViewModal = (patient) => {
    setSelectedPatient(patient);
    setIsViewModalOpen(true);
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || "",
      phone: patient.phone || "",
      email: patient.email || "",
      gender: patient.gender || "Female",
      dob: patient.dob || "",
      address: patient.address || "",
      status: patient.status || "Active",
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
    setValidationError("");
  };

  // Filtered patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.patientId && patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      patient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || patient.status === statusFilter;

    let matchesDate = true;
    if (dateFrom && patient.createdAt) {
      matchesDate = new Date(patient.createdAt) >= new Date(dateFrom);
    }
    if (dateTo && matchesDate && patient.createdAt) {
      matchesDate = new Date(patient.createdAt) <= new Date(dateTo);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="patient-table-container glass-card card-shadow rounded-xl border border-outline-variant/30 overflow-hidden flex flex-col">
      
      {/* Top action bar */}
      <div className="p-4 bg-surface-container/30 border-b border-outline-variant/20 flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-bold text-on-surface-variant">
          Showing <span className="text-primary font-extrabold">{filteredPatients.length}</span> Registered Patients
        </span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-error/10 border-b border-error/20 text-error text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
          <button onClick={fetchPatientList} className="px-3 py-1 bg-error text-white rounded-lg text-[10px] font-bold">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-on-surface-variant">Loading patient records...</p>
        </div>
      ) : paginatedPatients.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center flex flex-col items-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">groups</span>
          </div>
          <h3 className="text-sm font-bold text-on-surface">No patient records found</h3>
          <p className="text-xs text-on-surface-variant max-w-xs">
            No patients match your search query. Click "Register New Patient" to add a patient.
          </p>
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container/50 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant select-none">
                <th className="py-3.5 px-4">Patient ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Gender / DOB</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs">
              {paginatedPatients.map((patient) => (
                <tr key={patient._id || patient.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary">
                    {patient.patientId || patient.id}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-on-surface block">{patient.name}</span>
                    <span className="text-[10px] text-on-surface-variant opacity-70">{patient.email}</span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant font-semibold">
                    {patient.gender} {patient.dob ? `(${patient.dob})` : ""}
                  </td>
                  <td className="py-3 px-4 text-on-surface font-mono">
                    {patient.phone}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      patient.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${patient.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant">
                    {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : "Registered"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openViewModal(patient)}
                        className="p-1 text-on-surface-variant hover:text-primary rounded cursor-pointer"
                        title="View Patient Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        onClick={() => openEditModal(patient)}
                        className="p-1 text-on-surface-variant hover:text-primary rounded cursor-pointer"
                        title="Edit Patient"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => openDeleteModal(patient)}
                        className="p-1 text-error hover:bg-error/10 rounded cursor-pointer"
                        title="Delete Patient"
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
      {!isLoading && filteredPatients.length > 0 && (
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

      {/* ADD / EDIT PATIENT MODAL */}
      {(isAddModalOpen || isEditModalOpen) &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-outline-variant/30 text-on-surface"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    {isEditModalOpen ? "edit_note" : "person_add"}
                  </span>
                  <span>{isEditModalOpen ? "Edit Patient Profile" : "Register New Patient"}</span>
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
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

              <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
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
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 555-0192"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Email *</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="sarah@example.com"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
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
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Status</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs cursor-pointer font-bold text-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Address</label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Residential address..."
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Medical Notes</label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Allergies, medical history notes..."
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 rounded-xl border border-outline-variant/40 text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : isEditModalOpen ? "Update Patient" : "Save Patient"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>,
          document.body
        )}

      {/* VIEW PATIENT MODAL */}
      {isViewModalOpen && selectedPatient &&
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
                  <span className="text-[10px] font-mono font-bold text-primary uppercase">{selectedPatient.patientId || selectedPatient.id}</span>
                  <h3 className="text-lg font-extrabold">{selectedPatient.name}</h3>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="p-1 text-on-surface-variant hover:bg-surface-container rounded cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-surface-container/40 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Email</span>
                    <span className="font-medium text-on-surface">{selectedPatient.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Phone</span>
                    <span className="font-medium text-on-surface font-mono">{selectedPatient.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Gender</span>
                    <span className="font-medium text-on-surface">{selectedPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Status</span>
                    <span className="font-bold text-primary">{selectedPatient.status}</span>
                  </div>
                </div>

                {selectedPatient.address && (
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Address</span>
                    <p className="text-xs text-on-surface">{selectedPatient.address}</p>
                  </div>
                )}

                {selectedPatient.notes && (
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Medical Notes</span>
                    <p className="text-xs text-on-surface whitespace-pre-line">{selectedPatient.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-outline-variant/20 flex justify-end">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedPatient);
                  }}
                  className="bg-primary text-on-primary px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedPatient &&
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
                  <h3 className="text-base font-bold">Delete Patient</h3>
                  <p className="text-xs text-on-surface-variant">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs">
                Are you sure you want to delete patient record <span className="font-bold">"{selectedPatient.name}"</span>?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl border border-outline-variant/40 text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-error text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Deleting..." : "Delete Patient"}
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
