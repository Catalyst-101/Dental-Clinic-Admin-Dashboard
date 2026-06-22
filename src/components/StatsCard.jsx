import React from "react";
import { motion } from "framer-motion";

export const StatsCard = ({
  badgeType,
  label,
  value,
  change,
  changeType,
  changeText,
  progressBar
}) => {
  // Map badgeType to icons and colors
  let icon = "info";
  let iconColor = "text-primary";
  let bgIconColor = "bg-primary-container/10";
  let displayTrend = change;
  let displayTrendColor = "text-primary bg-primary-container/10";

  switch (badgeType) {
    case "revenue":
      icon = "groups";
      iconColor = "text-primary";
      bgIconColor = "bg-primary-container/10";
      break;
    case "completed":
      icon = "medical_services";
      iconColor = "text-secondary";
      bgIconColor = "bg-secondary-container/10";
      break;
    case "wait":
      icon = "event_note";
      iconColor = "text-primary";
      bgIconColor = "bg-primary/10";
      break;
    case "occupancy":
      icon = "pending_actions";
      iconColor = "text-error";
      bgIconColor = "bg-error-container/20";
      break;
    case "tickets":
      icon = "check_circle";
      iconColor = "text-on-primary-container";
      bgIconColor = "bg-primary-container";
      break;
    default:
      icon = "info";
  }

  // Handle changeType colors
  if (changeType === "up") {
    displayTrendColor = "text-primary bg-primary-container/10";
  } else if (changeType === "down") {
    displayTrendColor = "text-error bg-error-container/10";
  } else if (changeType === "live") {
    displayTrend = "LIVE";
    displayTrendColor = "text-primary bg-primary-container/15 animate-pulse font-bold";
  } else if (changeType === "text" && changeText) {
    displayTrend = changeText;
    displayTrendColor = "text-on-surface-variant bg-surface-container px-2 py-0.5";
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-card card-shadow p-6 rounded-xl border border-outline-variant/30 flex flex-col justify-between h-full select-none cursor-pointer"
    >
      <div>
        {/* Top Icon & Trend Area */}
        <div className="flex justify-between items-start mb-4">
          <div className={`${bgIconColor} p-2 rounded-lg flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${iconColor} text-[22px]`}>
              {icon}
            </span>
          </div>
          {displayTrend && (
            <span className={`${displayTrendColor} font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold`}>
              {displayTrend}
            </span>
          )}
        </div>

        {/* Labels & Numeric value */}
        <p className="text-label-sm font-label-sm text-on-surface-variant font-medium uppercase tracking-wider opacity-85">
          {label}
        </p>
      </div>

      <div className="mt-2 space-y-3">
        <h3 className="text-headline-sm font-headline-sm text-on-surface font-extrabold tracking-tight">
          {value}
        </h3>

        {/* Optional Progress Bar (e.g. occupancy rate) */}
        {progressBar !== undefined && progressBar !== null && (
          <div className="w-full bg-surface-container rounded-full h-1.5 mt-2">
            <div
              style={{ width: `${progressBar}%` }}
              className="bg-primary h-1.5 rounded-full"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
