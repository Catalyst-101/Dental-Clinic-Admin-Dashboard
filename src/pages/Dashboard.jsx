import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { StatsCard } from "../components/StatsCard";
import { AppointmentsTable } from "../components/AppointmentsTable";
import { getAdminStats } from "../api/notifications";
import { parseErrorMessage } from "../api/axios";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    newContactMessages: 0
  });

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  const fetchStats = async () => {
    setIsLoadingStats(true);
    setStatsError("");
    try {
      const res = await getAdminStats();
      if (res && res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      const friendly = parseErrorMessage(err, "Unable to load dashboard stats from database.");
      setStatsError(friendly);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar placeholder="Search patients, records..." />

      <div className="p-gutter w-full space-y-gutter flex-grow">
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">
              Overview Dashboard
            </h1>
            <p className="text-body-md text-on-surface-variant opacity-80">
              Welcome back. Real-time clinic status fetched directly from database.
            </p>
          </div>
        </div>

        {statsError && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold flex items-center justify-between">
            <span>{statsError}</span>
            <button onClick={fetchStats} className="px-3 py-1 bg-error text-white rounded-lg text-[10px] font-bold">
              Retry
            </button>
          </div>
        )}

        <div className="content-area mt-gutter space-y-gutter">
          {/* Real Database Overview Cards */}
          <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
            <StatsCard
              badgeType="revenue"
              label="Total Patients"
              value={isLoadingStats ? "..." : String(stats.totalPatients)}
              changeType={null}
            />

            <StatsCard
              badgeType="completed"
              label="Total Doctors"
              value={isLoadingStats ? "..." : String(stats.totalDoctors)}
              changeType={null}
            />

            <StatsCard
              badgeType="wait"
              label="Total Appointments"
              value={isLoadingStats ? "..." : String(stats.totalAppointments)}
              changeType={null}
            />

            <StatsCard
              badgeType="occupancy"
              label="Pending Appointments"
              value={isLoadingStats ? "..." : String(stats.pendingAppointments)}
              changeType={null}
            />

            <StatsCard
              badgeType="tickets"
              label="New Messages"
              value={isLoadingStats ? "..." : String(stats.newContactMessages)}
              changeType={null}
            />
          </div>

          <div className="gap-md items-start">
            <div className="w-full">
              <AppointmentsTable isDashboard={true} />
            </div>
          </div>

          <footer className="pt-gutter border-t border-outline-variant/30 select-none">
            <div className="flex justify-between items-center flex-wrap gap-4 text-label-sm font-label-sm text-on-surface-variant opacity-80">
              <p>© 2026 DentaElite Premium Care. All rights reserved.</p>
              <div className="flex gap-gutter">
                <a className="hover:text-primary transition-all font-semibold" href="#">Support</a>
                <a className="hover:text-primary transition-all font-semibold" href="#">Privacy Policy</a>
                <a className="hover:text-primary transition-all font-semibold" href="#">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};