import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { uploadDoctorImage } from "../api/doctors";
import { getCategories } from "../api/categories";
import api, { getFullImageUrl, parseErrorMessage } from "../api/axios";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIME_OPTIONS = (() => {
  const options = [];
  for (let h = 7; h <= 21; h++) {
    for (let m = 0; m < 60; m += 30) {
      const period = h >= 12 ? "PM" : "AM";
      let displayH = h % 12;
      if (displayH === 0) displayH = 12;
      const hh = displayH < 10 ? `0${displayH}` : `${displayH}`;
      const mm = m < 10 ? `0${m}` : `${m}`;
      options.push(`${hh}:${mm} ${period}`);
    }
  }
  return options;
})();

const defaultDoctorState = {
  name: "",
  category: "",
  specialization: "",
  qualifications: "",
  experience: "",
  availability: "",
  languages: "",
  image: "",
  bio: "",
  schedule: [
    { day: "Monday", startTime: "09:00 AM", endTime: "05:00 PM", isWorking: true },
    { day: "Tuesday", startTime: "09:00 AM", endTime: "05:00 PM", isWorking: true },
    { day: "Wednesday", startTime: "09:00 AM", endTime: "05:00 PM", isWorking: true },
    { day: "Thursday", startTime: "09:00 AM", endTime: "05:00 PM", isWorking: true },
    { day: "Friday", startTime: "09:00 AM", endTime: "05:00 PM", isWorking: true }
  ],
  qualificationsList: [],
  reviews: [],
  isActive: true
};

export default function DoctorForm({ initialData, defaultCategory = "", onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(defaultDoctorState);
  const [categoriesList, setCategoriesList] = useState([]);
  const [clinicHours, setClinicHours] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [validationError, setValidationError] = useState("");

  // Load dynamic categories & clinic settings
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const catRes = await getCategories();
        if (catRes && catRes.success) {
          setCategoriesList(catRes.data || []);
        }

        const settingsRes = await api.get("/api/settings");
        if (settingsRes.data && settingsRes.data.data && settingsRes.data.data.businessHours) {
          setClinicHours(settingsRes.data.data.businessHours);
        }
      } catch (err) {
        console.error("Error loading doctor form options:", err);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || defaultCategory || "",
        specialization: initialData.specialization || initialData.title || "",
        qualifications: initialData.qualifications || initialData.credentials || "",
        experience: initialData.experience || "",
        availability: initialData.availability || "",
        languages: initialData.languages || "",
        image: initialData.image || "",
        bio: initialData.bio || "",
        schedule: initialData.schedule && initialData.schedule.length > 0
          ? initialData.schedule.map((s) => ({
              day: s.day || "Monday",
              startTime: s.startTime || (s.time ? s.time.split("-")[0]?.trim() : "09:00 AM"),
              endTime: s.endTime || (s.time ? s.time.split("-")[1]?.trim() : "05:00 PM"),
              isWorking: s.isWorking !== undefined ? Boolean(s.isWorking) : true
            }))
          : defaultDoctorState.schedule,
        qualificationsList: Array.isArray(initialData.qualificationsList) ? initialData.qualificationsList : [],
        reviews: Array.isArray(initialData.reviews) ? initialData.reviews : [],
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        category: defaultCategory || (categoriesList.length > 0 ? categoriesList[0].name : "")
      }));
    }
  }, [initialData, defaultCategory, categoriesList]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValidationError("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

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
    setValidationError("");
    const updated = [...formData.schedule];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, schedule: updated }));
  };

  const addScheduleSlot = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        { day: "Monday", startTime: "09:00 AM", endTime: "05:00 PM", isWorking: true }
      ]
    }));
  };

  const removeScheduleSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  // Qualifications List Handlers
  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualificationsList: [
        ...prev.qualificationsList,
        { title: "", institution: "", details: "" }
      ]
    }));
  };

  const handleQualChange = (index, field, value) => {
    const updated = [...formData.qualificationsList];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, qualificationsList: updated }));
  };

  const removeQualification = (index) => {
    setFormData((prev) => ({
      ...prev,
      qualificationsList: prev.qualificationsList.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.name.trim()) {
      setValidationError("Doctor full name is required.");
      setActiveTab("basic");
      return;
    }
    if (!formData.category.trim()) {
      setValidationError("Staff category is required.");
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
      setValidationError("Doctor profile image is required.");
      setActiveTab("basic");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Navigation Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-2 overflow-x-auto pb-1">
        {[
          { id: "basic", label: "Basic Info", icon: "badge" },
          { id: "schedule", label: "Weekly Schedule", icon: "schedule" },
          { id: "bio", label: "Biography", icon: "description" },
          { id: "qualifications", label: "Qualifications", icon: "school" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* TAB 1: BASIC INFO */}
      {activeTab === "basic" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Doctor Full Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Elena Rodriguez"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-surface"
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
                required
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-surface appearance-none"
              >
                <option value="" disabled>Select Staff Category...</option>
                {categoriesList.map((cat) => (
                  <option key={cat._id || cat.slug} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
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
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-surface"
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
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-surface"
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
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Availability Badge Text
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g. Available: Mon - Fri"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-surface"
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
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-surface"
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULE */}
      {activeTab === "schedule" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Doctor Weekly Schedule</h3>
              <p className="text-xs text-on-surface-variant">
                Configure doctor working hours. Times must stay within Clinic Operating Hours.
              </p>
            </div>
            <button
              type="button"
              onClick={addScheduleSlot}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Day Schedule
            </button>
          </div>

          <div className="space-y-3">
            {formData.schedule.map((slot, idx) => {
              const clinicDayConfig = clinicHours.find(
                (c) => c.day && c.day.toLowerCase() === slot.day.toLowerCase()
              );

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest space-y-2"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* Day Selection */}
                    <div className="w-36">
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-on-surface">Day</label>
                      <select
                        value={slot.day}
                        onChange={(e) => handleScheduleChange(idx, "day", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none"
                      >
                        {WEEK_DAYS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Start Time Selection */}
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-on-surface">Start Time</label>
                      <select
                        value={slot.startTime}
                        onChange={(e) => handleScheduleChange(idx, "startTime", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* End Time Selection */}
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-on-surface">End Time</label>
                      <select
                        value={slot.endTime}
                        onChange={(e) => handleScheduleChange(idx, "endTime", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Working Toggle */}
                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id={`isWorking-${idx}`}
                        checked={slot.isWorking !== false}
                        onChange={(e) => handleScheduleChange(idx, "isWorking", e.target.checked)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <label htmlFor={`isWorking-${idx}`} className="text-xs font-semibold text-on-surface select-none cursor-pointer">
                        Working Day
                      </label>
                    </div>

                    {/* Delete Slot */}
                    <button
                      type="button"
                      onClick={() => removeScheduleSlot(idx)}
                      className="p-1.5 text-error hover:bg-error/10 rounded-lg cursor-pointer mt-4"
                      title="Remove Day Schedule"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>

                  {clinicDayConfig && (
                    <div className="text-[11px] text-on-surface-variant opacity-80 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      <span>
                        Clinic Hours on {slot.day}:{" "}
                        {clinicDayConfig.isClosed ? "CLOSED" : `${clinicDayConfig.open} - ${clinicDayConfig.close}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BIO */}
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
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-surface"
            />
          </div>
        </div>
      )}

      {/* TAB 4: QUALIFICATIONS */}
      {activeTab === "qualifications" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface">Academic Degrees &amp; Certifications</h3>
            <button
              type="button"
              onClick={addQualification}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Qualification
            </button>
          </div>

          {formData.qualificationsList.map((qual, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest space-y-3 relative">
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-on-surface">Degree Title</label>
                  <input
                    type="text"
                    value={qual.title}
                    onChange={(e) => handleQualChange(idx, "title", e.target.value)}
                    placeholder="e.g. Doctorate"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface text-xs font-semibold text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-on-surface">Institution</label>
                  <input
                    type="text"
                    value={qual.institution}
                    onChange={(e) => handleQualChange(idx, "institution", e.target.value)}
                    placeholder="e.g. Johns Hopkins University"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface text-xs text-on-surface"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-on-surface">Details</label>
                <input
                  type="text"
                  value={qual.details}
                  onChange={(e) => handleQualChange(idx, "details", e.target.value)}
                  placeholder="e.g. Advanced Clinical Specialization"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface text-xs text-on-surface"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Action Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary shadow-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Saving..." : initialData ? "Update Practitioner Profile" : "Onboard Practitioner"}
        </button>
      </div>
    </form>
  );
}
