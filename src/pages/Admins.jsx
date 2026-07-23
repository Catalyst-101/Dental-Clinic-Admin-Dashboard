import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import { PasswordStrengthInput } from "../components/PasswordStrengthInput";
import { apiFetch, getFullImageUrl } from "../utils/apiClient";

export default function Admins() {
  const navigate = useNavigate();

  // Component States
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal & Overlay States
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // OTP States
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin"
  });



  // Verify Role & Fetch Admins on Mount
  useEffect(() => {
    const storedUserJson = localStorage.getItem("user") || sessionStorage.getItem("user");
    const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;
    
    if (!storedUser || storedUser.role !== "superadmin") {
      navigate("/dashboard");
      return;
    }

    fetchAdmins();
  }, [navigate]);

  // Auto-clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await apiFetch("/api/admins");
      if (res.success) {
        setAdmins(res.data || []);
      }
    } catch (err) {
      setErrorMessage(err.response?.message || err.message || "Failed to load administrators.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle administrator account creation
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Name and email are required.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      if (!otpStep) {
        // Step 1: Send OTP to the email address
        const res = await apiFetch("/api/admins", {
          method: "POST",
          body: formData
        });
        if (res.otpRequired) {
          setOtpStep(true);
        } else {
          setToastMessage(`Administrator ${formData.name} created successfully!`);
          setIsCreateModalOpen(false);
          fetchAdmins();
        }
      } else {
        // Step 2: Verify OTP and create admin
        if (!otpCode || otpCode.length !== 6) {
          setErrorMessage("Please enter a valid 6-digit OTP code.");
          setIsLoading(false);
          return;
        }
        await apiFetch("/api/admins/verify-otp", {
          method: "POST",
          body: {
            email: formData.email,
            otp: otpCode
          }
        });
        setToastMessage(`Administrator ${formData.name} created successfully!`);
        setIsCreateModalOpen(false);
        fetchAdmins();
      }
    } catch (err) {
      setErrorMessage(err.response?.message || err.message || "Failed to process administrator creation.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await apiFetch("/api/admins", {
        method: "POST",
        body: formData
      });
      setToastMessage("A new verification code has been sent!");
    } catch (err) {
      setErrorMessage(err.response?.message || err.message || "Failed to resend verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Name and email are required.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    
    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      await apiFetch(`/api/admins/${selectedAdmin._id}`, {
        method: "PUT",
        body: payload
      });
      setToastMessage(`Administrator updated successfully!`);
      setIsEditModalOpen(false);
      fetchAdmins();
    } catch (err) {
      setErrorMessage(err.response?.message || err.message || "Failed to update administrator.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      await apiFetch(`/api/admins/${selectedAdmin._id}`, {
        method: "DELETE"
      });
      setToastMessage(`Administrator deleted successfully!`);
      setIsDeleteModalOpen(false);
      fetchAdmins();
    } catch (err) {
      setErrorMessage(err.response?.message || err.message || "Failed to delete administrator.");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "admin"
    });
    setErrorMessage("");
    setOtpStep(false);
    setOtpCode("");
    setIsCreateModalOpen(true);
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "", 
      role: admin.role
    });
    setErrorMessage("");
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setErrorMessage("");
    setIsDeleteModalOpen(true);
  };

  const filteredAdmins = admins.filter((admin) => {
    const query = searchTerm.toLowerCase();
    return (
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      (admin.username && admin.username.toLowerCase().includes(query)) ||
      admin.role.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar
        placeholder="Search administrators..."
        onSearchChange={(val) => setSearchTerm(val)}
      />

      <div className="p-gutter w-full space-y-gutter flex-grow pb-32">
        {/* Page Header */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              Admin Management
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80 text-left">
              Manage database administrators, assign access roles, and audit security credentials.
            </p>
          </div>
          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="bg-primary text-on-primary py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:opacity-95 transition-opacity shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span className="text-label-md">Add Administrator</span>
            </motion.button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 font-semibold text-sm text-left">
            {errorMessage}
          </div>
        )}

        {/* Admins Table */}
        <div className="glass-card border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/35 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Administrator</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Security Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-body-md">
                {isLoading && admins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-on-surface-variant">
                      <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                      <p className="mt-2 text-xs font-bold uppercase tracking-wider">Loading administrators...</p>
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl">sentiment_dissatisfied</span>
                      <p className="mt-2 text-xs font-bold uppercase tracking-wider">No administrators found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-surface-variant/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-on-surface">
                        <div className="flex items-center gap-3">
                          <img
                            src={admin.profilePicture && admin.profilePicture.startsWith("/uploads")
                              ? getFullImageUrl(admin.profilePicture)
                              : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(admin.name)}`
                            }
                            alt="avatar"
                            className="w-8 h-8 rounded-full bg-primary-container/10 border border-primary/20 object-cover"
                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(admin.name)}` }}
                          />
                          {admin.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-primary font-semibold">
                        {admin.username || <span className="opacity-40 italic text-xs">pending...</span>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-on-surface-variant">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border ${
                            admin.role === "superadmin"
                              ? "bg-secondary-fixed text-on-secondary-container border-secondary/30"
                              : "bg-surface-container-highest text-on-surface-variant border-outline-variant/40"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {admin.role === "superadmin" ? "shield_person" : "person"}
                          </span>
                          {admin.role === "superadmin" ? "Super Admin" : "Admin"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(admin)}
                            className="p-1.5 hover:bg-surface-container-highest rounded-lg text-primary transition-colors cursor-pointer"
                            title="Edit Administrator"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(admin)}
                            className="p-1.5 hover:bg-error/10 rounded-lg text-error transition-colors cursor-pointer"
                            title="Delete Administrator"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 shadow-2xl z-10 text-left space-y-4"
            >
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3 select-none">
                <h3 className="text-headline-sm font-extrabold text-on-surface">Add Administrator</h3>
              </div>

              {errorMessage && (
                <div className="p-3 text-xs bg-error-container text-on-error-container font-semibold rounded-lg">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {!otpStep ? (
                  <>
                    <div>
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        required
                        type="text"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Saad Karim"
                      />
                    </div>
                    <div>
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        required
                        type="email"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="saad@dentaelite.com"
                      />
                    </div>
                    <div>
                      <PasswordStrengthInput
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        label="Temporary Password"
                        id="password"
                        placeholder="Auto-generated if left blank"
                        showRequirements={formData.password.length > 0}
                      />
                      <p className="text-[10px] text-on-surface-variant/70 italic mt-1">
                        Leave blank to automatically generate a secure password and email it.
                      </p>
                    </div>
                    <div>
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="role">Access Role</label>
                      <select
                        id="role"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1 cursor-pointer"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl p-4 space-y-2 text-sm text-on-surface-variant mb-2">
                      <div><strong>Name:</strong> {formData.name}</div>
                      <div><strong>Email:</strong> {formData.email}</div>
                      <div><strong>Role:</strong> <span className="capitalize">{formData.role}</span></div>
                    </div>
                    <div>
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="otpCode">Verification OTP</label>
                      <input
                        id="otpCode"
                        required
                        type="text"
                        maxLength={6}
                        pattern="\d{6}"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md text-on-surface text-center tracking-[12px] font-bold text-xl focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="123456"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-[10px] text-on-surface-variant/70 italic">
                          Enter the 6-digit code sent to your email.
                        </p>
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={isLoading}
                          className="text-[11px] text-primary font-bold hover:underline cursor-pointer disabled:opacity-50"
                        >
                          Resend OTP
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => {
                      if (otpStep) {
                        setOtpStep(false);
                      } else {
                        setIsCreateModalOpen(false);
                      }
                    }}
                    className="border border-outline-variant/50 text-on-surface font-semibold px-4 py-2 rounded-xl hover:bg-surface-container-high transition-colors text-label-md cursor-pointer"
                  >
                    {otpStep ? "Back" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={
                      otpStep
                        ? (isLoading || otpCode.length !== 6)
                        : (isLoading || !formData.name || !formData.email || (formData.password.length > 0 && formData.password.length < 8))
                    }
                    className="bg-primary text-on-primary font-bold px-6 py-2 rounded-xl hover:opacity-95 transition-all text-label-md shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-55"
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        {otpStep ? "Verifying..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        {otpStep ? "Verify & Create" : "Create Administrator"}
                        <span className="material-symbols-outlined">
                          {otpStep ? "verified" : "person_add"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 shadow-2xl z-10 text-left"
            >
              <h3 className="text-headline-sm font-extrabold text-on-surface mb-4">Edit Administrator</h3>
              
              {errorMessage && (
                <div className="p-3 text-xs bg-error-container text-on-error-container font-semibold rounded-lg mb-4">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="edit-name">Full Name</label>
                  <input
                    id="name"
                    required
                    type="text"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="edit-email">Email Address</label>
                  <input
                    id="email"
                    required
                    type="email"
                    disabled
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md text-on-surface-variant/50 focus:outline-none mt-1 cursor-not-allowed opacity-60"
                    value={formData.email}
                  />
                </div>
                
                <PasswordStrengthInput
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  label="New Password (leave empty to keep unchanged)"
                  id="edit-password"
                  required={false}
                  showRequirements={formData.password.length > 0}
                />

                <div>
                  <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="edit-role">Access Role</label>
                  <select
                    id="role"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 mt-1 cursor-pointer"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="border border-outline-variant/50 text-on-surface font-semibold px-4 py-2 rounded-xl hover:bg-surface-container-high transition-colors text-label-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary text-on-primary font-bold px-6 py-2 rounded-xl hover:opacity-95 transition-all text-label-md shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Changes
                        <span className="material-symbols-outlined">save</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 shadow-2xl z-10 text-left space-y-4"
            >
              <h3 className="text-headline-sm font-extrabold text-error flex items-center gap-2 select-none">
                <span className="material-symbols-outlined text-[28px]">warning</span>
                Delete Administrator?
              </h3>
              <p className="text-body-md text-on-surface-variant">
                Are you sure you want to delete administrator <span className="font-extrabold text-on-surface">{selectedAdmin.name}</span> ({selectedAdmin.email})? 
                This action is irreversible and will immediately revoke all dashboard permissions.
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="border border-outline-variant/50 text-on-surface font-semibold px-4 py-2 rounded-xl hover:bg-surface-container-high transition-colors text-label-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                  className="bg-error text-on-error font-bold px-6 py-2 rounded-xl hover:opacity-95 transition-all text-label-md shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
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
