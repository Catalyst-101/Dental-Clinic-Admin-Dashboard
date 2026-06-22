import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const AppointmentTrends = ({ 
  weeklyTrends = [
    { day: "Mon", actual: 60, target: 70 },
    { day: "Tue", actual: 80, target: 85 },
    { day: "Wed", actual: 45, target: 60 },
    { day: "Thu", actual: 90, target: 95 },
    { day: "Fri", actual: 70, target: 80 },
    { day: "Sat", actual: 85, target: 90 },
    { day: "Sun", actual: 55, target: 65 },
  ] 
}) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div className="grid-item-large lg:col-span-2 glass-card card-shadow p-6 rounded-xl relative overflow-hidden h-[400px] border border-outline-variant/30 flex flex-col justify-between select-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Appointment Trends</h4>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary-fixed"></span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">Target</span>
          </div>
        </div>
      </div>

      {/* Animated Chart Body */}
      <div className="relative flex-grow flex items-end justify-between px-2 pb-6 mt-6 h-60">
        
        {/* Dynamic Tooltip */}
        <AnimatePresence>
          {hoveredBar !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs rounded-xl py-2 px-3 shadow-lg z-20 border border-outline-variant/30"
            >
              <p className="font-bold text-center border-b border-outline-variant/30 pb-1 mb-1">
                {weeklyTrends[hoveredBar].day} Stats
              </p>
              <p className="flex justify-between gap-4">
                <span>Actual:</span>
                <span className="font-extrabold text-primary-fixed-dim">{weeklyTrends[hoveredBar].actual}%</span>
              </p>
              <p className="flex justify-between gap-4">
                <span>Target:</span>
                <span className="font-extrabold text-secondary-fixed">{weeklyTrends[hoveredBar].target}%</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Columns Grid */}
        <div className="flex items-end justify-around w-full h-[90%] gap-4 z-10">
          {weeklyTrends.map((data, idx) => (
            <div 
              key={data.day} 
              className="flex flex-col items-center gap-2 h-full justify-end cursor-pointer"
              onMouseEnter={() => setHoveredBar(idx)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div className="flex items-end gap-1.5 h-full w-full justify-center">
                {/* Actual Bar */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${data.actual}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.05 }}
                  className={`w-3.5 bg-primary rounded-t-md hover:brightness-110 transition-all ${hoveredBar === idx ? 'shadow-md ring-1 ring-primary/40' : ''}`}
                />
                
                {/* Target Bar */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${data.target}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.05 + 0.1 }}
                  className={`w-3.5 bg-secondary-fixed rounded-t-md hover:brightness-95 transition-all ${hoveredBar === idx ? 'shadow-md ring-1 ring-secondary-fixed/40' : ''}`}
                />
              </div>
              <span className="text-label-sm font-label-sm text-on-surface-variant font-semibold mt-1">
                {data.day}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
