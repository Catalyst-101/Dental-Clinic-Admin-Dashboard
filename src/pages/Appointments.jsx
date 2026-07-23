import React, { useState, useEffect, useRef } from "react";
import TopBar from "../components/TopBar";
import { AppointmentsTable } from "../components/AppointmentsTable";
import { getDoctors } from "../api/doctors";

export default function Appointments() {
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [doctorsList, setDoctorsList] = useState([]);

  const appointmentsTableRef = useRef(null);

  // Fetch doctors for filter dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await getDoctors({ all: "true" });
        if (res && res.success && res.data) {
          setDoctorsList(res.data);
        }
      } catch (err) {
        console.error("Failed to load doctors for filter:", err);
      }
    };
    fetchDoctors();
  }, []);

  const handleOpenAddModal = () => {
    if (appointmentsTableRef.current) {
      appointmentsTableRef.current.openAddModal();
    }
  };

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar
        placeholder="Search appointments, patients, doctors..."
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
              Review and manage clinical reservations for Sami Dental Clinic.
            </p>
          </div>
          
          <button
            onClick={handleOpenAddModal}
            className="bg-primary text-on-primary py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 font-semibold hover:opacity-95 transition-opacity shadow-md cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="filters-card glass-card card-shadow rounded-xl p-4 border border-outline-variant/30 flex flex-wrap items-center justify-between gap-4 select-none">
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
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
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
                {doctorsList.map((doc) => (
                  <option key={doc._id || doc.name} value={doc.name}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

        {/* Appointments Table (Schedule Grid completely removed; single book appointment button used) */}
        <AppointmentsTable
          ref={appointmentsTableRef}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          doctorFilter={doctorFilter}
          hideInnerBookButton={true}
        />
      </div>
    </div>
  );
}
