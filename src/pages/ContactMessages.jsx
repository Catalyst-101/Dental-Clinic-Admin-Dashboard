import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import { apiFetch } from "../utils/apiClient";

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchMessages = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await apiFetch("/api/contact-messages");
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (err) {
      setErrorMessage(err.response?.message || err.message || "Failed to load contact messages.");
    } finally {
      setIsLoading(false);
    }
  };

  const openDetailModal = (msg) => {
    setSelectedMessage(msg);
    setIsDetailModalOpen(true);
  };

  const openDeleteModal = (msg) => {
    setSelectedMessage(msg);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedMessage) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await apiFetch(`/api/contact-messages/${selectedMessage._id}`, {
        method: "DELETE"
      });
      if (res.success) {
        setToastMessage("Contact message deleted successfully!");
        setIsDeleteModalOpen(false);
        setSelectedMessage(null);
        await fetchMessages();
      }
    } catch (err) {
      setErrorMessage(err.response?.message || err.message || "Failed to delete contact message.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const query = searchTerm.toLowerCase();
    return (
      (msg.fullName && msg.fullName.toLowerCase().includes(query)) ||
      (msg.email && msg.email.toLowerCase().includes(query)) ||
      (msg.subject && msg.subject.toLowerCase().includes(query)) ||
      (msg.message && msg.message.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar
        placeholder="Search contact messages..."
        onSearchChange={(val) => setSearchTerm(val)}
      />

      <div className="p-gutter w-full space-y-gutter flex-grow pb-32">
        {/* Page Header */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              Contact Inquiries
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80 text-left">
              View and manage submissions from visitors who filled out the website Contact Us form.
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 font-semibold text-sm text-left">
            {errorMessage}
          </div>
        )}

        {/* Messages Table */}
        <div className="glass-card border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/35 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Date Submitted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-body-md">
                {isLoading && messages.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-on-surface-variant">
                      <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                      <p className="mt-2 text-xs font-bold uppercase tracking-wider">Loading messages...</p>
                    </td>
                  </tr>
                ) : filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl">sentiment_dissatisfied</span>
                      <p className="mt-2 text-xs font-bold uppercase tracking-wider">No matching inquiries found</p>
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((msg) => {
                    const dateObj = new Date(msg.createdAt);
                    const formattedDate = isNaN(dateObj.getTime())
                      ? "N/A"
                      : dateObj.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        });

                    return (
                      <tr
                        key={msg._id}
                        className="hover:bg-surface-variant/20 transition-colors group cursor-pointer"
                        onClick={() => openDetailModal(msg)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface">{msg.fullName}</span>
                            <span className="text-xs text-on-surface-variant font-medium">{msg.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-on-surface">{msg.subject || "(No Subject)"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-on-surface-variant font-medium">{formattedDate}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div 
                            className="flex justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()} // Prevent opening details modal when clicking action buttons
                          >
                            <button
                              onClick={() => openDetailModal(msg)}
                              className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded-full transition-colors cursor-pointer"
                              title="Read Message"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            <button
                              onClick={() => openDeleteModal(msg)}
                              className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-full transition-colors cursor-pointer"
                              title="Delete Message"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {isDetailModalOpen && selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-2xl bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 shadow-2xl z-10 text-left space-y-5"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 select-none">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
                  <h3 className="text-headline-sm font-extrabold text-on-surface">Message Detail</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant/40 cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-md border-b border-outline-variant/20 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">From</span>
                  <p className="font-bold text-on-surface">{selectedMessage.fullName}</p>
                  <p className="text-xs text-on-surface-variant font-medium">{selectedMessage.email}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Contact Info</span>
                  <p className="font-bold text-on-surface">{selectedMessage.phone || "(No Phone Provided)"}</p>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {isNaN(new Date(selectedMessage.createdAt).getTime())
                      ? "N/A"
                      : new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider select-none">Subject</span>
                <p className="font-extrabold text-on-surface text-body-lg">{selectedMessage.subject || "(No Subject)"}</p>
              </div>

              <div className="space-y-1 bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-xl max-h-60 overflow-y-auto">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider select-none">Message Body</span>
                <p className="text-on-surface leading-relaxed text-body-md whitespace-pre-wrap mt-1">{selectedMessage.message}</p>
              </div>

              <div className="flex justify-end gap-3 pt-3 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openDeleteModal(selectedMessage);
                  }}
                  className="border border-error/30 text-error font-semibold px-5 py-2.5 rounded-xl hover:bg-error/5 transition-colors text-label-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:opacity-95 transition-all text-label-sm shadow-md cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedMessage && (
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
                Delete Inquiry?
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Are you sure you want to delete the message from <strong className="text-on-surface">{selectedMessage.fullName}</strong>? This action is permanent and cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-3 select-none">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="border border-outline-variant/50 text-on-surface font-semibold px-4 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-label-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  className="bg-error text-on-error font-bold px-5 py-2.5 rounded-xl hover:opacity-95 transition-all text-label-sm shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
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
