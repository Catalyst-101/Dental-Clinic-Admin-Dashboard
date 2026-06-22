import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const RecentAppointments = () => {
  const appointments = [
    {
      id: 1,
      name: "Ahmed Khan",
      initial: "A",
      bgInitials: "bg-blue-100 text-blue-600",
      service: "Dental Cleaning",
      date: "21 June 2026",
      time: "10:30 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      name: "Sara Ali",
      initial: "S",
      bgInitials: "bg-green-100 text-green-600",
      service: "Root Canal",
      date: "21 June 2026",
      time: "12:00 PM",
      status: "In Progress",
    },
    {
      id: 3,
      name: "Hassan Raza",
      initial: "H",
      bgInitials: "bg-yellow-100 text-yellow-600",
      service: "Tooth Extraction",
      date: "22 June 2026",
      time: "02:30 PM",
      status: "Pending",
    },
    {
      id: 4,
      name: "Fatima Noor",
      initial: "F",
      bgInitials: "bg-purple-100 text-purple-600",
      service: "Checkup",
      date: "23 June 2026",
      time: "09:00 AM",
      status: "Completed",
    },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-secondary-container text-on-secondary-container";
      case "In Progress":
        return "bg-primary-container text-on-primary-container";
      case "Pending":
        return "bg-surface-container-highest text-on-surface-variant";
      case "Completed":
        return "bg-primary-container/85 text-white";
      default:
        return "bg-surface-container text-on-surface-variant";
    }
  };

  return (
    <div className="tickets-table glass-card card-shadow rounded-xl overflow-hidden border border-outline-variant/30 w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/40 backdrop-blur-sm">
        <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
          Recent Appointments
        </h4>

        <button className="text-primary text-label-md font-bold hover:underline">
          View All
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-surface-container-low/60 text-on-surface-variant uppercase text-label-sm tracking-wider border-b border-surface-container">
              <th className="px-6 py-4">Patient Name</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-container/60">
            <AnimatePresence>
              {appointments.map((app) => (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-primary-container/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${app.bgInitials} flex items-center justify-center font-bold text-xs`}
                      >
                        {app.initial}
                      </div>

                      <span className="text-body-md font-semibold text-on-surface">
                        {app.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-body-md text-on-surface-variant font-medium">
                    {app.service}
                  </td>

                  <td className="px-6 py-4 text-body-md text-on-surface-variant font-medium">
                    {app.date}
                  </td>

                  <td className="px-6 py-4 text-body-md text-on-surface-variant font-medium">
                    {app.time}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-label-sm font-semibold ${getStatusBadgeClass(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant/40">
                      delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};