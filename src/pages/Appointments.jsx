import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import { AppointmentsTable } from "../components/AppointmentsTable";

export default function Appointments() {
  // Tab control: "list" or "schedule"
  const [activeTab, setActiveTab] = useState("list");

  // Search and Filter States (passed down to the table)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");

  // Ref to access the AppointmentsTable methods
  const appointmentsTableRef = useRef(null);

  // Toast for page-level actions (Sync, Export)
  const [toastMessage, setToastMessage] = useState("");

  // Auto-clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Doctors list for dropdown
  const doctorsList = [
    "Dr. Elena Rodriguez",
    "Dr. Marcus Thorne",
    "Dr. Sarah Jenkins",
    "Dr. Julian Chen",
    "Dr. Amara Okoro",
    "Dr. Leo Varadkar"
  ];

  // Calendar Weekly slots
  const daysOfWeek = ["Mon 21", "Tue 22", "Wed 23", "Thu 24", "Fri 25"];
  const timeSlots = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM", // Lunch break
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM"
  ];

  // Check slot type (Demo logic)
  const getSlotDetails = (dayIdx, hourIdx) => {
    if (hourIdx === 4) {
      return { type: "lunch", label: "LUNCH BREAK" };
    }
    if (dayIdx === 4) {
      return { type: "blocked", label: "BLOCKED" };
    }
    if (dayIdx === 0 && hourIdx === 1) {
      return { type: "appt", patient: "Ahmed Khan", service: "Dental Cleaning", doctor: "Dr. Elena Rodriguez" };
    }
    if (dayIdx === 1 && hourIdx === 3) {
      return { type: "appt", patient: "Sarah Jenkins", service: "Checkup", doctor: "Dr. Marcus Thorne" };
    }
    if (dayIdx === 2 && hourIdx === 2) {
      return { type: "appt", patient: "Michael Chen", service: "Root Canal", doctor: "Dr. Sarah Jenkins" };
    }
    if (dayIdx === 3 && hourIdx === 5) {
      return { type: "appt", patient: "Amanda Ross", service: "Extraction", doctor: "Dr. Julian Chen" };
    }
    return { type: "empty" };
  };

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar
        placeholder="Search appointments, patients..."
        onSearchChange={(val) => setSearchTerm(val)}
      />

      <div className="p-gutter w-full space-y-gutter flex-grow">
        {/* Header Section */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              Appointment Management
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80">
              Review and schedule clinical reservations for DentaElite.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-container rounded-lg p-1">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-4 py-1.5 rounded-md text-label-md font-bold transition-all cursor-pointer ${activeTab === "list"
                    ? "bg-surface shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-primary"
                  }`}
              >
                List View
              </button>
              <button
                onClick={() => setActiveTab("schedule")}
                className={`px-4 py-1.5 rounded-md text-label-md font-bold transition-all cursor-pointer ${activeTab === "schedule"
                    ? "bg-surface shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-primary"
                  }`}
              >
                Schedule Grid
              </button>
            </div>
          </div>
        </div>

        {activeTab === "list" ? (
          <>
            {/* Filters Bar */}
            <div className="filters-card glass-card card-shadow rounded-xl p-4 border border-outline-variant/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-label-sm font-semibold text-on-surface-variant">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-body-md font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-label-sm font-semibold text-on-surface-variant">Doctor:</span>
                  <select
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-body-md font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="All">All Doctors</option>
                    {doctorsList.map((doc, idx) => (
                      <option key={idx} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                    setDoctorFilter("All");
                  }}
                  className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-label-sm font-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Reusable Appointments Table Component */}
            <AppointmentsTable
              ref={appointmentsTableRef}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              doctorFilter={doctorFilter}
            />
          </>
        ) : (
          /* Weekly calendar schedule grid */
          <div className="flex flex-col lg:flex-row gap-gutter items-start w-full">
            <div className="flex-1 glass-card card-shadow rounded-2xl p-6 border border-outline-variant/30 overflow-x-auto w-full">
              <div className="min-w-[700px]">
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-6 select-none">Weekly Practitioner Schedule</h3>
                <div className="grid grid-cols-[80px_repeat(5,_1fr)] border-b border-outline-variant pb-3 mb-3 font-semibold select-none">
                  <div className="text-label-sm text-on-surface-variant/50">Time</div>
                  {daysOfWeek.map((day, idx) => (
                    <div key={idx} className="text-center font-bold text-on-surface-variant text-label-md">
                      <span className="block text-primary text-xs uppercase">{day.split(" ")[0]}</span>
                      {day.split(" ")[1]}
                    </div>
                  ))}
                </div>

                <div className="divide-y divide-surface-container/60">
                  {timeSlots.map((hour, hourIdx) => (
                    <div key={hourIdx} className="grid grid-cols-[80px_repeat(5,_1fr)] min-h-[70px] items-stretch">
                      <div className="text-label-sm text-on-surface-variant/60 font-semibold pt-3 select-none">{hour}</div>
                      {Array.from({ length: 5 }).map((_, dayIdx) => {
                        const cell = getSlotDetails(dayIdx, hourIdx);
                        if (cell.type === "lunch") {
                          return (
                            <div key={dayIdx} className="border-l border-t border-surface-container bg-surface-container-low flex items-center justify-center text-label-sm text-on-surface-variant/45 font-bold tracking-wider select-none">
                              LUNCH BREAK
                            </div>
                          );
                        }
                        if (cell.type === "blocked") {
                          return (
                            <div key={dayIdx} className="border-l border-t border-surface-container bg-surface-container flex items-center justify-center text-label-sm text-on-surface-variant/45 font-bold tracking-wider select-none">
                              BLOCKED
                            </div>
                          );
                        }
                        if (cell.type === "appt") {
                          return (
                            <div key={dayIdx} className="border-l border-t border-surface-container bg-primary-container/10 p-1.5 flex flex-col justify-between">
                              <div className="bg-primary text-white p-2 rounded-lg shadow-sm text-[11px] h-full flex flex-col justify-between leading-tight select-none">
                                <span className="font-bold block truncate">{cell.patient}</span>
                                <span className="opacity-80 block truncate text-[9px]">{cell.service} • {cell.doctor.split(" ")[1]}</span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={dayIdx}
                            onClick={() => appointmentsTableRef.current?.openAddModal()}
                            className="border-l border-t border-surface-container hover:bg-primary/5 transition-colors cursor-pointer relative group flex items-center justify-center"
                          >
                            <span className="opacity-0 group-hover:opacity-100 text-primary transition-opacity">
                              <span className="material-symbols-outlined text-[20px]">add_circle</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
              <div className="glass-card card-shadow rounded-2xl p-6 border border-outline-variant/30">
                <h4 className="font-bold text-primary text-label-md uppercase tracking-wider mb-4">Quick Panel</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setToastMessage("Google & Outlook synced (UI demo only)!")}
                    className="w-full flex items-center gap-3 p-3 bg-white border border-outline-variant/30 rounded-xl hover:shadow-md transition-all group text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined p-2 bg-secondary-container text-on-secondary-container rounded-lg group-hover:scale-110 transition-transform">sync</span>
                    <div>
                      <span className="block font-bold text-label-md text-on-surface">Sync Calendar</span>
                      <span className="text-xs text-on-surface-variant font-medium">Google &amp; Outlook</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setToastMessage("Schedule report exported (UI demo only)!")}
                    className="w-full flex items-center gap-3 p-3 bg-white border border-outline-variant/30 rounded-xl hover:shadow-md transition-all group text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined p-2 bg-primary-fixed text-on-primary-fixed rounded-lg group-hover:-translate-y-0.5 transition-transform">ios_share</span>
                    <div>
                      <span className="block font-bold text-label-md text-on-surface">Export Schedule</span>
                      <span className="text-xs text-on-surface-variant font-medium">PDF, CSV or Print</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-outline-variant/30 bg-error-container/10">
                <div className="flex items-center gap-2 text-error mb-2">
                  <span className="material-symbols-outlined">warning</span>
                  <span className="font-bold text-label-sm uppercase tracking-wide">Notice</span>
                </div>
                <p className="text-label-sm text-on-error-container leading-relaxed">
                  <strong>Vacation Mode:</strong> Friday, Oct 25th is currently blocked for practitioners. No new slots can be requested.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
}
