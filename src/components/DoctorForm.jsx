import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { uploadDoctorImage } from "../api/doctors";
import { getFullImageUrl, parseErrorMessage } from "../api/axios";

const defaultDoctorState = {
  name: "",
  category: "Dentist",
  specialization: "",
  qualifications: "",
  experience: "",
  availability: "Available: Mon, Wed, Fri",
  languages: "English",
  image: "",
  bio: "",
  schedule: [
    { day: "Monday", time: "09:00 AM - 05:00 PM" },
    { day: "Wednesday", time: "10:00 AM - 06:00 PM" },
    { day: "Friday", time: "09:00 AM - 04:00 PM" }
  ],
  qualificationsList: [
    { title: "Doctorate", institution: "Ph.D.", details: "Advanced Clinical Practice" }
  ],
  reviews: [
    { name: "", date: "Recent Patient", stars: 5, comment: "", avatar: "" }
  ],
  isActive: true
};

export default function DoctorForm({ initialData, defaultCategory = "Dentist", onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(defaultDoctorState);
  const [activeTab, setActiveTab] = useState("basic");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || (defaultCategory === "All" ? "Dentist" : defaultCategory),
        specialization: initialData.specialization || initialData.title || "",
        qualifications: initialData.qualifications || initialData.credentials || "",
        experience: initialData.experience || "",
        availability: initialData.availability || "Available: Mon, Wed, Fri",
        languages: initialData.languages || "English",
        image: initialData.image || "",
        bio: initialData.bio || "",
        schedule: initialData.schedule && initialData.schedule.length > 0
          ? (typeof initialData.schedule[0] === "string"
              ? initialData.schedule.map((s) => ({ day: "Schedule", time: s }))
              : initialData.schedule)
          : [{ day: "Monday", time: "09:00 AM - 05:00 PM" }],
        qualificationsList: initialData.qualificationsList && initialData.qualificationsList.length > 0
          ? initialData.qualificationsList
          : [{ title: "", institution: "", details: "" }],
        reviews: initialData.reviews && initialData.reviews.length > 0
          ? initialData.reviews
          : [{ name: "", date: "Recent Patient", stars: 5, comment: "", avatar: "" }],
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        category: defaultCategory === "All" ? "Dentist" : defaultCategory
      }));
    }
  }, [initialData, defaultCategory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValidationError("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Image Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError("");
    setValidationError("");

    try {
      const res = await uploadDoctorImage(file);
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
      } else {
        setUploadError("Failed to upload profile image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      const friendly = parseErrorMessage(err, "Failed to upload image file.");
      setUploadError(friendly);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Schedule Handlers
  const handleScheduleChange = (index, field, value) => {
    const updated = [...formData.schedule];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, schedule: updated }));
  };

  const addScheduleSlot = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { day: "Monday", time: "09:00 AM - 05:00 PM" }]
    }));
  };

  const removeScheduleSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  // Qualifications List Handlers
  const handleQualChange = (index, field, value) => {
    const updated = [...formData.qualificationsList];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, qualificationsList: updated }));
  };

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualificationsList: [...prev.qualificationsList, { title: "", institution: "", details: "" }]
    }));
  };

  const removeQualification = (index) => {
    setFormData((prev) => ({
      ...prev,
      qualificationsList: prev.qualificationsList.filter((_, i) => i !== index)
    }));
  };

  // Reviews Handlers
  const handleReviewChange = (index, field, value) => {
    const updated = [...formData.reviews];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, reviews: updated }));
  };

  const addReview = () => {
    setFormData((prev) => ({
      ...prev,
      reviews: [...prev.reviews, { name: "", date: "Recent Patient", stars: 5, comment: "", avatar: "" }]
    }));
  };

  const removeReview = (index) => {
    setFormData((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.name.trim()) {
      setValidationError("Doctor name is required.");
      setActiveTab("basic");
      return;
    }
    if (!formData.specialization.trim()) {
      setValidationError("Specialization / Title is required.");
      setActiveTab("basic");
      return;
    }
    if (!formData.experience.trim()) {
      setValidationError("Experience length is required.");
      setActiveTab("basic");
      return;
    }
    if (!formData.image.trim()) {
      setValidationError("Please upload a profile image file.");
      setActiveTab("basic");
      return;
    }

    const cleanedData = {
      ...formData,
      schedule: formData.schedule.filter((s) => s.day.trim() && s.time.trim()),
      qualificationsList: formData.qualificationsList.filter((q) => q.title.trim()),
      reviews: formData.reviews.filter((r) => r.name.trim() && r.comment.trim())
    };

    onSubmit(cleanedData);
  };

  const navTabs = [
    { id: "basic", label: "Basic Profile", icon: "badge" },
    { id: "bio", label: "Bio & Overview", icon: "description" },
    { id: "schedule", label: "Weekly Schedule", icon: "calendar_month" },
    { id: "qualifications", label: "Qualifications List", icon: "school" },
    { id: "reviews", label: "Patient Reviews", icon: "star" }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-on-surface">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant/20 pb-3">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Validation Error Alert Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError("")}
            className="text-error opacity-70 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* TAB 1: BASIC PROFILE */}
      {activeTab === "basic" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Elena Rodriguez"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Staff Category <span className="text-error">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-semibold cursor-pointer"
              >
                <option value="Dentist">Dentist</option>
                <option value="Hygienist">Hygienist</option>
                <option value="Surgeon">Surgeon</option>
                <option value="Receptionist">Receptionist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Specialization / Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Senior Implant Specialist"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Qualifications Summary
              </label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="e.g. DDS, Ph.D. in Implantology"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Experience <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 15+ Years Experience"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Availability Badge
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g. Available: Mon, Wed, Fri"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Languages Spoken
              </label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="e.g. English, Spanish"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center pt-2">
            <label className="relative inline-flex items-center cursor-pointer gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="text-sm font-semibold text-on-surface">
                Active Practitioner Profile
              </span>
            </label>
          </div>

          {/* Profile Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
              Upload Profile Image <span className="text-error">*</span>
            </label>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary font-bold text-xs cursor-pointer hover:bg-primary/20 transition-all">
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>{formData.image ? "Change Profile Image" : "Choose Image File"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>

              {isUploadingImage && (
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>Uploading image to server...</span>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-xs text-error mt-1.5 font-semibold">{uploadError}</p>
            )}

            {formData.image && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-outline-variant/30 w-32 h-32 bg-surface-container">
                <img
                  src={getFullImageUrl(formData.image)}
                  alt="Doctor preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[9px] font-bold text-center truncate">
                  Uploaded Image
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BIO */}
      {activeTab === "bio" && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
              Professional Biography
            </label>
            <textarea
              name="bio"
              rows={6}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Detailed professional background, clinical philosophy, and expertise..."
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>
      )}

      {/* TAB 3: WEEKLY SCHEDULE */}
      {activeTab === "schedule" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Weekly Clinical Schedule</h3>
            <button
              type="button"
              onClick={addScheduleSlot}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Slot
            </button>
          </div>

          {formData.schedule.map((slot, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                value={slot.day}
                onChange={(e) => handleScheduleChange(idx, "day", e.target.value)}
                placeholder="Day (e.g. Monday)"
                className="w-40 px-3.5 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs font-semibold"
              />
              <input
                type="text"
                value={slot.time}
                onChange={(e) => handleScheduleChange(idx, "time", e.target.value)}
                placeholder="Hours (e.g. 09:00 AM - 05:00 PM)"
                className="flex-grow px-3.5 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs"
              />
              <button
                type="button"
                onClick={() => removeScheduleSlot(idx)}
                className="p-1.5 text-error hover:bg-error/10 rounded-lg cursor-pointer"
                title="Remove Slot"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: QUALIFICATIONS LIST */}
      {activeTab === "qualifications" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Academic Degrees & Certifications</h3>
            <button
              type="button"
              onClick={addQualification}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Degree
            </button>
          </div>

          {formData.qualificationsList.map((qual, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeQualification(idx)}
                className="absolute top-3 right-3 text-error hover:bg-error/10 p-1 rounded-lg cursor-pointer"
                title="Remove Qualification"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Degree Title</label>
                  <input
                    type="text"
                    value={qual.title}
                    onChange={(e) => handleQualChange(idx, "title", e.target.value)}
                    placeholder="e.g. Doctorate"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Institution</label>
                  <input
                    type="text"
                    value={qual.institution}
                    onChange={(e) => handleQualChange(idx, "institution", e.target.value)}
                    placeholder="e.g. Ph.D. from Johns Hopkins"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Specialty Details</label>
                <input
                  type="text"
                  value={qual.details}
                  onChange={(e) => handleQualChange(idx, "details", e.target.value)}
                  placeholder="e.g. Advanced Clinical Research in Tissue Regeneration"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: PATIENT REVIEWS */}
      {activeTab === "reviews" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Patient Reviews & Testimonials</h3>
            <button
              type="button"
              onClick={addReview}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Review
            </button>
          </div>

          {formData.reviews.map((rev, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeReview(idx)}
                className="absolute top-3 right-3 text-error hover:bg-error/10 p-1 rounded-lg cursor-pointer"
                title="Remove Review"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={rev.name}
                    onChange={(e) => handleReviewChange(idx, "name", e.target.value)}
                    placeholder="e.g. Marcus Chen"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Date Tag</label>
                  <input
                    type="text"
                    value={rev.date}
                    onChange={(e) => handleReviewChange(idx, "date", e.target.value)}
                    placeholder="e.g. Patient since 2021"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Rating (Stars 1-5)</label>
                  <select
                    value={rev.stars}
                    onChange={(e) => handleReviewChange(idx, "stars", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs font-bold"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Review Comment</label>
                <textarea
                  rows={2}
                  value={rev.comment}
                  onChange={(e) => handleReviewChange(idx, "comment", e.target.value)}
                  placeholder="Patient testimonial comment..."
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  value={rev.avatar}
                  onChange={(e) => handleReviewChange(idx, "avatar", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant font-semibold hover:bg-surface-container text-xs cursor-pointer"
        >
          Cancel
        </button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting || isUploadingImage}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-md cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {initialData ? "Update Practitioner" : "Onboard Practitioner"}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
