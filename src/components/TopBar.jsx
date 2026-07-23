import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getFullImageUrl } from "../utils/apiClient";
import { getNotifications, markNotificationRead } from "../api/notifications";

const TopBar = ({ 
  placeholder = "Search...",
  adminName, 
  role, 
  avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuClAoOwWiTNglQ5J0I82BtqM6ngI5baNAT8phZkSylKmwYpkZhNhb_a9ybUP45ui6oUc0gqZA2KCJCIKFVdkTqfVzQ8OZr8FNLcDKOagax0IH9Tl554cqfZs39uPxj_1oecIcZ6vncb-n24oUU2W5XZvOP_Vw29D6DtpqsgOLPh3avDzp2RGuBdDMUm-bEbM1OwqB2HNF6Ar6WXnvr3lp77Jk_VQ0IsWpSw7dqGbRA91mUXWiiCBgUDC22Vhs8BJNcoSHVReLQ5lMoh",
  onSearchChange
}) => {
  const navigate = useNavigate();
  const storedUserJson = localStorage.getItem("user") || sessionStorage.getItem("user");
  const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;

  const displayAdminName = adminName || storedUser?.name || "Dr. Smith";
  const displayRole = role || (storedUser?.role === "superadmin" ? "Super Admin" : (storedUser?.role === "admin" ? "Admin" : "Chief Administrator"));
  
  const displayAvatarUrl = storedUser?.profilePicture
    ? (storedUser.profilePicture.startsWith("/uploads")
        ? getFullImageUrl(storedUser.profilePicture)
        : storedUser.profilePicture)
    : avatarUrl;

  // Notification System States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch real notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res && res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationRead(notifId);
      if (notifId === "all") {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif.id);
    setIsDropdownOpen(false);
    if (notif.type === "appointment") {
      navigate("/appointments");
    } else if (notif.type === "message") {
      navigate("/messages");
    }
  };

  return (
    <header className="flex justify-between items-center px-6 py-2 sticky top-0 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-container-highest z-30 select-none">
      
      {/* Search Input Bar */}
      <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 w-96 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20 border border-transparent focus-within:border-outline-variant/30">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px] select-none">
          search
        </span>
        <input 
          type="text" 
          placeholder={placeholder} 
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-label-md w-full ml-2 text-on-surface placeholder:text-on-surface-variant/50"
        />
      </div>

      {/* Action Controls & Admin Profile */}
      <div className="flex items-center gap-4">
        {/* Notification System Dropdown (Question Mark Icon Completely Removed) */}
        <div className="relative mr-2" ref={dropdownRef}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="hover:bg-surface-container-high rounded-full p-2 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-4 px-1 bg-error text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-surface-container-lowest">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {/* Notification Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden z-50 text-on-surface"
              >
                <div className="p-3.5 bg-surface-container/50 border-b border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => handleMarkAsRead("all", e)}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/10">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-on-surface-variant">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 hover:bg-surface-container/40 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                          !notif.isRead ? "bg-primary/5 font-medium" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                            notif.type === "appointment" ? "text-primary" : "text-amber-500"
                          }`}>
                            {notif.type === "appointment" ? "event" : "mail"}
                          </span>
                          <div className="space-y-0.5 text-xs">
                            <p className="font-bold text-on-surface leading-snug">{notif.title}</p>
                            <p className="text-on-surface-variant text-[11px]">
                              Patient: <span className="font-semibold text-on-surface">{notif.name}</span>
                            </p>
                            <p className="text-[10px] text-on-surface-variant opacity-75">{notif.detail}</p>
                            <p className="text-[9px] text-primary font-bold mt-1">{notif.time}</p>
                          </div>
                        </div>

                        {!notif.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-md font-bold shrink-0 cursor-pointer"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Card Separated by Vertical Divider */}
        <div 
          onClick={() => navigate("/settings")} 
          className="flex items-center gap-3 pl-4 border-l border-surface-container-highest cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-label-md text-on-surface font-semibold">{displayAdminName}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-80 mt-0.5">{displayRole}</p>
          </div>
          
          <motion.img 
            whileHover={{ scale: 1.05 }}
            alt={`${displayAdminName} Profile`} 
            className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed cursor-pointer shadow-sm"
            src={displayAvatarUrl}
          />
        </div>
      </div>

    </header>
  );
};

export default TopBar;
