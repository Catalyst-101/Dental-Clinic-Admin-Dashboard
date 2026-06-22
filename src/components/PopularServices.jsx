import React from "react";
import { motion } from "framer-motion";

export const PopularServices = ({ 
  services = [
    { name: "General Dentistry", percent: 45, color: "bg-primary" },
    { name: "Orthodontics", percent: 30, color: "bg-secondary" },
    { name: "Teeth Whitening", percent: 15, color: "bg-primary-container" },
    { name: "Oral Surgery", percent: 10, color: "bg-tertiary-container" },
  ] 
}) => {
  return (
    <div className="grid-item-small glass-card card-shadow p-6 rounded-xl border border-outline-variant/30 flex flex-col justify-between select-none h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div>
        <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight mb-6">Popular Services</h4>
        <div className="space-y-5">
          {services.map((service, idx) => (
            <div key={service.name} className="space-y-2">
              <div className="flex justify-between text-label-md font-label-md font-semibold">
                <span className="text-on-surface">{service.name}</span>
                <span className="text-on-surface-variant">{service.percent}%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${service.percent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                  className={`${service.color} h-2 rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center bg-surface-container-low/50 py-3 rounded-lg border border-outline-variant/20">
        <p className="text-label-sm font-label-sm text-on-surface-variant font-medium">
          Calculated from the last 30 days
        </p>
      </div>
    </div>
  );
};
