import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getFullImageUrl } from "../utils/apiClient";

const Navbar = ({ 
  adminName, 
  role, 
  avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuClAoOwWiTNglQ5J0I82BtqM6ngI5baNAT8phZkSylKmwYpkZhNhb_a9ybUP45ui6oUc0gqZA2KCJCIKFVdkTqfVzQ8OZr8FNLcDKOagax0IH9Tl554cqfZs39uPxj_1oecIcZ6vncb-n24oUU2W5XZvOP_Vw29D6DtpqsgOLPh3avDzp2RGuBdDMUm-bEbM1OwqB2HNF6Ar6WXnvr3lp77Jk_VQ0IsWpSw7dqGbRA91mUXWiiCBgUDC22Vhs8BJNcoSHVReLQ5lMoh" 
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

  return (
    <header className="flex justify-between items-center px-6 py-2 sticky top-0 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-container-highest z-30 select-none">
      
      {/* Search Input Bar */}
      <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 w-96 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20 border border-transparent focus-within:border-outline-variant/30">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px] select-none">
          search
        </span>
        <input 
          type="text" 
          placeholder="Search patients, records..." 
          className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-label-md w-full ml-2 text-on-surface placeholder:text-on-surface-variant/50"
        />
      </div>

      {/* Action Controls & Admin Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications & Help Buttons */}
        <div className="flex items-center gap-2 mr-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hover:bg-surface-container-high rounded-full p-2 transition-colors relative"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-lowest"></span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hover:bg-surface-container-high rounded-full p-2 transition-colors"
            aria-label="Help System"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
              help
            </span>
          </motion.button>
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

export default Navbar;
