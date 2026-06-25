import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import TopBar from "../components/TopBar";
import { PatientTable } from "../components/PatientTable";

export default function Patients() {
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const patientTableRef = useRef(null);

  // Export CSV
  const handleExportCSV = () => {
    const tablePatients = patientTableRef.current?.getPatients() || [];
    const headers = [
      "Patient ID",
      "Name",
      "Age",
      "Gender",
      "Phone",
      "Email",
      "Last Visit",
      "Appointments",
      "Status",
      "Address",
      "Notes"
    ];
    const csvRows = [headers.join(",")];

    tablePatients.forEach((p) => {
      const values = [
        p.id,
        `"${p.name}"`,
        p.age,
        p.gender,
        `"${p.phone}"`,
        `"${p.email}"`,
        p.lastVisit,
        p.appts,
        p.status,
        `"${p.address || ""}"`,
        `"${p.notes || ""}"`
      ];
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `patients_export_${new Date().toISOString().split("T")[0]}.csv`);
    a.click();
  };

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar
        placeholder="Search patients by name, ID, contact..."
        onSearchChange={(val) => {
          setSearchTerm(val);
        }}
      />

      <div className="p-gutter w-full space-y-gutter flex-grow">
        {/* Header Bar */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              Patient Management
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80">
              View and manage all registered patients in the clinic.
            </p>
          </div>
        </div>

        {/* Filter Section */}
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-label-sm font-semibold text-on-surface-variant">Date Range:</span>
              <div className="flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-transparent text-sm text-on-surface focus:outline-none cursor-pointer"
                />
                <span className="text-on-surface-variant font-medium text-xs">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-transparent text-sm text-on-surface focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setDateFrom("");
                setDateTo("");
              }}
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-label-sm font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Clear Filters
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/20 py-2 px-4 rounded-lg flex items-center gap-1.5 text-label-sm font-bold text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Patients Table Card using reusable component */}
        <PatientTable
          ref={patientTableRef}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      </div>
    </div>
  );
}

