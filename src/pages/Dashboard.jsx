import TopBar from "../components/TopBar";
import { StatsCard } from "../components/StatsCard";
import { AppointmentTrends } from "../components/AppointmentTrends";
import { PopularServices } from "../components/PopularServices";
import { PatientTable } from "../components/PatientTable";

export const Dashboard = () => {
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
              Welcome back. Here is what's happening today.
            </p>
          </div>
        </div>

        <div className="content-area mt-gutter space-y-gutter">
          <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
            <StatsCard
              badgeType="revenue"
              label="Total Patients"
              value="1284"
              change="+12%"
              changeType="up"
            />

            <StatsCard
              badgeType="completed"
              label="Total Doctors"
              value="24"
              change="+2"
              changeType="up"
            />

            <StatsCard
              badgeType="wait"
              label="Appointments"
              value="456"
              change="+8%"
              changeType="up"
            />

            <StatsCard
              badgeType="occupancy"
              label="Pending Today"
              value="10"
              changeType={null}
            />

            <StatsCard
              badgeType="tickets"
              label="Completed Today"
              value="443"
              changeType={null}
            />
          </div>

          <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-md">
            <AppointmentTrends />
            <PopularServices />
          </div>

          <div className="gap-md items-start">
            <div className="w-full">
              <PatientTable isDashboard={true} />
            </div>
          </div>

          <footer className="pt-gutter border-t border-outline-variant/30 select-none">
            <div className="flex justify-between items-center flex-wrap gap-4 text-label-sm font-label-sm text-on-surface-variant opacity-80">
              <p>© 2026 DentaElite Premium Care. All rights reserved.</p>

              <div className="flex gap-gutter">
                <a className="hover:text-primary transition-all font-semibold" href="#">
                  Support
                </a>

                <a className="hover:text-primary transition-all font-semibold" href="#">
                  Privacy Policy
                </a>

                <a className="hover:text-primary transition-all font-semibold" href="#">
                  Terms of Service
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};