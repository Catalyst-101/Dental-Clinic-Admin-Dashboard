import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const Sidebar = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const activeItem = location.pathname.replace("/", "") || "dashboard";

    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "dashboard",
            path: "/dashboard"
        },
        {
            id: "patients",
            label: "Patients",
            icon: "person",
            path: "/patients"
        },
        {
            id: "staff",
            label: "Clinical Staff",
            icon: "groups",
            path: "/dentists",
            matchIds: ["dentists", "hygienists", "surgeons", "receptionists"]
        },
        {
            id: "appointments",
            label: "Appointments",
            icon: "event_available",
            path: "/appointments"
        },
        {
            id: "services",
            label: "Services",
            icon: "health_and_safety",
            path: "/services"
        },
        {
            id: "content",
            label: "Website Content",
            icon: "edit_note",
            path: "/content"
        },
        {
            id: "messages",
            label: "Contact Messages",
            icon: "mail",
            path: "/messages"
        },
        {
            id: "settings",
            label: "Settings",
            icon: "settings",
            path: "/settings"
        },
    ];

    // Show Admins only for superadmin
    const storedUserJson =
        localStorage.getItem("user") || sessionStorage.getItem("user");

    let storedUser = null;

    try {
        storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;
    } catch (error) {
        console.error("Invalid user data:", error);
    }

    const isSuperAdmin = storedUser?.role === "superadmin";

    const visibleMenuItems = [...menuItems];

    if (isSuperAdmin) {
        visibleMenuItems.splice(
            visibleMenuItems.length - 1,
            0,
            {
                id: "admins",
                label: "Admins",
                icon: "admin_panel_settings",
                path: "/admins"
            }
        );
    }

    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col py-6 border-r border-outline-variant/30 z-40 shadow-sm select-none">

            {/* Brand Header */}
            <div className="px-6 mb-8">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl leading-none">
                        dentistry
                    </span>

                    <h1 className="text-headline-sm font-headline-sm font-black text-primary tracking-tight">
                        SAMI DENTAL CLINIC
                    </h1>
                </div>

                <p className="text-label-sm text-on-surface-variant mt-1.5 opacity-80">
                    Admin Gateway
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1.5 px-2 overflow-y-auto">
                {visibleMenuItems.map((item) => {
                    const isSelected =
                        activeItem === item.id ||
                        (item.matchIds && item.matchIds.includes(activeItem));

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 cursor-pointer ${
                                isSelected
                                    ? "bg-secondary-container text-on-secondary-container font-semibold shadow-sm translate-x-1"
                                    : "text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[22px]">
                                {item.icon}
                            </span>

                            <span className="font-label-md text-label-md">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="px-4 mt-auto space-y-3">
                <hr className="border-outline-variant/30" />

                {/* Logout */}
                <button
                    type="button"
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/5 transition-all text-left cursor-pointer font-semibold"
                >
                    <span className="material-symbols-outlined text-[22px]">
                        logout
                    </span>

                    <span className="font-label-md text-label-md">
                        Logout
                    </span>
                </button>
            </div>

        </aside>
    );
};