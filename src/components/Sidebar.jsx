import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const Sidebar = ({ onLogout, onNewAppointment }) => {
    const [staffExpanded, setStaffExpanded] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const activeItem = location.pathname.replace("/", "") || "dashboard";

    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "dashboard"
        },
        {
            id: "patients",
            label: "Patients",
            icon: "person"
        },
        {
            id: "staff",
            label: "Clinical Staff",
            icon: "groups",
            hasDropdown: true,
            subItems: [
                { id: "dentists", label: "Dentists" },
                { id: "hygienists", label: "Hygienists" },
                { id: "surgeons", label: "Oral Surgeons" },
                { id: "receptionists", label: "Receptionists" },
            ],
        },
        {
            id: "appointments",
            label: "Appointments",
            icon: "event_available"
        },
        {
            id: "services",
            label: "Services",
            icon: "health_and_safety"
        },
        {
            id: "settings",
            label: "Settings",
            icon: "settings"
        },
    ];

    // Safely extract sub-item IDs to check if any child of 'staff' is currently active
    const staffItem = menuItems.find((item) => item.id === "staff");
    const staffSubIds = staffItem?.subItems?.map((sub) => sub.id) || [];
    const isStaffChildActive = staffSubIds.includes(activeItem);

    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col py-6 border-r border-outline-variant/30 z-40 shadow-sm select-none">

            {/* Brand Header */}
            <div className="px-6 mb-8">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl leading-none">
                        dentistry
                    </span>
                    <h1 className="text-headline-sm font-headline-sm font-black text-primary tracking-tight">
                        DentaElite
                    </h1>
                </div>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-1.5 opacity-80">
                    Admin Gateway
                </p>
            </div>

            { }
            <nav className="flex-1 space-y-1.5 px-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isItemActive = activeItem === item.id;
                    const isParentActive = item.id === "staff" && isStaffChildActive;
                    const isSelected = isItemActive || isParentActive;

                    return (
                        <div key={item.id} className="space-y-1">
                            {/* Main Button Trigger */}
                            <button
                                type="button"
                                className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${isSelected
                                    ? "bg-secondary-container text-on-secondary-container font-semibold shadow-sm translate-x-1"
                                    : "text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface"
                                    }`}
                                onClick={() => {
                                    if (item.hasDropdown) {
                                        setStaffExpanded((prev) => !prev);
                                    } else {
                                        navigate(`/${item.id}`);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[22px]">
                                        {item.icon}
                                    </span>
                                    <span className="font-label-md text-label-md">{item.label}</span>
                                </div>

                                {/* Optional Chevron Transition Indicator */}
                                {item.hasDropdown && (
                                    <motion.span
                                        animate={{ rotate: staffExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="material-symbols-outlined text-[18px] opacity-70"
                                    >
                                        expand_more
                                    </motion.span>
                                )}
                            </button>

                            { }
                            {item.hasDropdown && item.subItems && (
                                <AnimatePresence initial={false}>
                                    {staffExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="overflow-hidden pl-10 pr-2 space-y-1 bg-surface-variant/10 rounded-lg py-1 mx-2"
                                        >
                                            {item.subItems.map((sub) => {
                                                const isSubActive = activeItem === sub.id;
                                                return (
                                                    <button
                                                        key={sub.id}
                                                        type="button"
                                                        className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-colors ${isSubActive
                                                            ? "text-primary font-bold bg-primary/5"
                                                            : "text-on-surface-variant/80 hover:text-primary hover:bg-surface-variant/20"
                                                            }`}
                                                        onClick={() => navigate(`/${sub.id}`)}
                                                    >
                                                        {sub.label}
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </div>
                    );
                })}
            </nav>

            { }
            <div className="px-4 mt-auto space-y-4">
                {/* New Appointment Primary Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onNewAppointment}
                    className="w-full bg-primary text-on-primary py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold hover:opacity-95 transition-opacity shadow-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span className="text-label-md">New Appointment</span>
                </motion.button>

                {/* Divider separator */}
                <hr className="border-outline-variant/30" />

                {/* Logout Action Button */}
                <button
                    type="button"
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/5 transition-all text-left"
                >
                    <span className="material-symbols-outlined text-[22px]">logout</span>
                    <span className="font-label-md text-label-md font-semibold">Logout</span>
                </button>
            </div>
        </aside>
    );
};