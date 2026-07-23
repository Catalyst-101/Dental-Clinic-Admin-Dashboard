import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { uploadServiceImage } from "../api/services";
import { getFullImageUrl, parseErrorMessage } from "../api/axios";

// Predefined Icon Selection System (Curated Dental & Healthcare Icons)
export const PREDEFINED_ICONS = [
  { value: "medical_services", label: "Medical Services", category: "Clinical" },
  { value: "cleaning_services", label: "Dental Cleaning", category: "Clinical" },
  { value: "biotech", label: "Root Canal / Biotech", category: "Clinical" },
  { value: "settings_backup_restore", label: "Dental Implants", category: "Clinical" },
  { value: "auto_fix_high", label: "Teeth Whitening", category: "Cosmetic" },
  { value: "align_vertical_center", label: "Braces & Aligners", category: "Orthodontics" },
  { value: "face", label: "Cosmetic Smile", category: "Cosmetic" },
  { value: "health_and_safety", label: "Gum Care & Periodontics", category: "Periodontics" },
  { value: "child_care", label: "Pediatric Care", category: "Pediatrics" },
  { value: "dentistry", label: "General Dentistry", category: "Clinical" },
  { value: "medication", label: "Medication & Care", category: "Care" },
  { value: "healing", label: "Recovery & Healing", category: "Care" },
  { value: "stethoscope", label: "Examination & Diagnostics", category: "Clinical" },
  { value: "vaccines", label: "Preventative Treatment", category: "Clinical" },
  { value: "emergency", label: "Emergency Care", category: "Clinical" },
  { value: "shield", label: "Protection", category: "General" },
  { value: "verified", label: "Verified Quality", category: "General" },
  { value: "clinical_notes", label: "Assessment Notes", category: "General" },
  { value: "celebration", label: "Post-Treatment", category: "General" },
  { value: "restaurant", label: "Diet & Food Tip", category: "Aftercare" },
  { value: "pill", label: "Medicine Tip", category: "Aftercare" },
  { value: "spa", label: "Wellness & Relief", category: "Aftercare" },
  { value: "check", label: "Standard Benefit Check", category: "General" }
];

const IconSelector = ({ value, onChange, label, className = "" }) => {
  return (
    <div className={className}>
      {label && <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-on-surface">{label}</label>}
      <div className="relative flex items-center">
        <div className="absolute left-2.5 flex items-center justify-center text-primary pointer-events-none">
          <span className="material-symbols-outlined text-[18px]">{value || "medical_services"}</span>
        </div>
        <select
          value={value || "medical_services"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs font-semibold appearance-none cursor-pointer text-on-surface"
        >
          {PREDEFINED_ICONS.map((icon) => (
            <option key={icon.value} value={icon.value}>
              {icon.label} ({icon.value})
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 pointer-events-none text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </div>
      </div>
    </div>
  );
};

const defaultServiceState = {
  title: "",
  tagline: "",
  icon: "medical_services",
  summary: "",
  image: "",
  overview: "",
  description: "",
  bulletPoints: [""],
  benefits: [
    { title: "", description: "", icon: "health_and_safety" }
  ],
  steps: [
    { number: "01.", title: "", description: "", icon: "clinical_notes" }
  ],
  recovery: {
    intro: "",
    tips: [{ icon: "restaurant", text: "" }]
  },
  faqs: [
    { question: "", answer: "" }
  ],
  isActive: true
};

export default function ServiceForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(defaultServiceState);
  const [activeTab, setActiveTab] = useState("basic");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        tagline: initialData.tagline || "",
        icon: initialData.icon || "medical_services",
        summary: initialData.summary || "",
        image: initialData.image || "",
        overview: initialData.overview || "",
        description: initialData.description || "",
        bulletPoints: initialData.bulletPoints && initialData.bulletPoints.length > 0
          ? initialData.bulletPoints
          : [""],
        benefits: initialData.benefits && initialData.benefits.length > 0
          ? initialData.benefits
          : [{ title: "", description: "", icon: "health_and_safety" }],
        steps: initialData.steps && initialData.steps.length > 0
          ? initialData.steps
          : [{ number: "01.", title: "", description: "", icon: "clinical_notes" }],
        recovery: {
          intro: (initialData.recovery && initialData.recovery.intro) || "",
          tips: (initialData.recovery && initialData.recovery.tips && initialData.recovery.tips.length > 0)
            ? initialData.recovery.tips
            : [{ icon: "restaurant", text: "" }]
        },
        faqs: initialData.faqs && initialData.faqs.length > 0
          ? initialData.faqs
          : [{ question: "", answer: "" }],
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValidationError("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Backend File Image Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError("");
    setValidationError("");

    try {
      const res = await uploadServiceImage(file);
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
      } else {
        setUploadError("Failed to upload service image to the server.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      const friendly = parseErrorMessage(err, "Failed to upload image file to backend.");
      setUploadError(friendly);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Bullet Points handlers
  const handleBulletChange = (index, value) => {
    const updated = [...formData.bulletPoints];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, bulletPoints: updated }));
  };

  const addBulletPoint = () => {
    setFormData((prev) => ({
      ...prev,
      bulletPoints: [...prev.bulletPoints, ""]
    }));
  };

  const removeBulletPoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      bulletPoints: prev.bulletPoints.filter((_, i) => i !== index)
    }));
  };

  const moveBulletPoint = (index, direction) => {
    const updated = [...formData.bulletPoints];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFormData((prev) => ({ ...prev, bulletPoints: updated }));
  };

  // Benefits handlers
  const handleBenefitChange = (index, field, value) => {
    const updated = [...formData.benefits];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, benefits: updated }));
  };

  const addBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, { title: "", description: "", icon: "check" }]
    }));
  };

  const removeBenefit = (index) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  // Steps handlers
  const handleStepChange = (index, field, value) => {
    const updated = [...formData.steps];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, steps: updated }));
  };

  const addStep = () => {
    const nextNum = (formData.steps.length + 1).toString().padStart(2, "0") + ".";
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, { number: nextNum, title: "", description: "", icon: "clinical_notes" }]
    }));
  };

  const removeStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  // Recovery handlers
  const handleRecoveryIntroChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      recovery: { ...prev.recovery, intro: value }
    }));
  };

  const handleTipChange = (index, field, value) => {
    const updatedTips = [...formData.recovery.tips];
    updatedTips[index] = { ...updatedTips[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      recovery: { ...prev.recovery, tips: updatedTips }
    }));
  };

  const addTip = () => {
    setFormData((prev) => ({
      ...prev,
      recovery: {
        ...prev.recovery,
        tips: [...prev.recovery.tips, { icon: "spa", text: "" }]
      }
    }));
  };

  const removeTip = (index) => {
    setFormData((prev) => ({
      ...prev,
      recovery: {
        ...prev.recovery,
        tips: prev.recovery.tips.filter((_, i) => i !== index)
      }
    }));
  };

  // FAQs handlers
  const handleFaqChange = (index, field, value) => {
    const updated = [...formData.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, faqs: updated }));
  };

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }]
    }));
  };

  const removeFaq = (index) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.title.trim()) {
      setValidationError("Service title is required.");
      setActiveTab("basic");
      return;
    }
    if (!formData.summary.trim()) {
      setValidationError("Short summary is required.");
      setActiveTab("basic");
      return;
    }
    if (!formData.image.trim()) {
      setValidationError("Please upload a service image file before submitting.");
      setActiveTab("basic");
      return;
    }
    if (!formData.description.trim()) {
      setValidationError("Detailed description is required.");
      setActiveTab("description");
      return;
    }

    const cleanedData = {
      ...formData,
      bulletPoints: formData.bulletPoints.map((b) => b.trim()).filter(Boolean),
      benefits: formData.benefits.filter((b) => b.title.trim()),
      steps: formData.steps.filter((s) => s.title.trim()),
      recovery: {
        intro: formData.recovery.intro.trim(),
        tips: formData.recovery.tips.filter((t) => t.text.trim())
      },
      faqs: formData.faqs.filter((f) => f.question.trim() && f.answer.trim())
    };

    onSubmit(cleanedData);
  };

  const navTabs = [
    { id: "basic", label: "Basic Info", icon: "info" },
    { id: "description", label: "Overview & Description", icon: "description" },
    { id: "bullets", label: "Bullet Points", icon: "format_list_bulleted" },
    { id: "benefits", label: "Benefits", icon: "star" },
    { id: "steps", label: "Treatment Steps", icon: "timeline" },
    { id: "recovery", label: "Recovery", icon: "healing" },
    { id: "faqs", label: "FAQs", icon: "quiz" }
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

      {/* TAB 1: BASIC INFO */}
      {activeTab === "basic" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Service Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Dental Cleaning"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
                Tagline / Subheading
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. PREVENTATIVE CARE"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Predefined Icon Dropdown Selector */}
            <IconSelector
              label="Service Main Icon"
              value={formData.icon}
              onChange={(newIcon) => setFormData((prev) => ({ ...prev, icon: newIcon }))}
            />

            <div className="flex items-center pt-5">
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
                  Active Service
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
              Short Summary <span className="text-error">*</span>
            </label>
            <textarea
              name="summary"
              rows={2}
              value={formData.summary}
              onChange={handleChange}
              placeholder="Brief high-level summary of service..."
              required
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          {/* Backend File Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
              Upload Service Image <span className="text-error">*</span>
            </label>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary font-bold text-xs cursor-pointer hover:bg-primary/20 transition-all">
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>{formData.image ? "Change Image File" : "Choose Image File"}</span>
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
              <div className="mt-3 relative rounded-xl overflow-hidden border border-outline-variant/30 h-44 bg-surface-container">
                <img
                  src={getFullImageUrl(formData.image)}
                  alt="Service preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Image Uploaded ({formData.image})</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OVERVIEW & DESCRIPTION */}
      {activeTab === "description" && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
              Overview Text
            </label>
            <textarea
              name="overview"
              rows={3}
              value={formData.overview}
              onChange={handleChange}
              placeholder="High-level clinical overview..."
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
              Detailed Description <span className="text-error">*</span>
            </label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Full detailed clinical description of the treatment..."
              required
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>
      )}

      {/* TAB 3: BULLET POINTS */}
      {activeTab === "bullets" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Dynamic Bullet Points</h3>
            <button
              type="button"
              onClick={addBulletPoint}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Bullet Point
            </button>
          </div>

          {formData.bulletPoints.map((bullet, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface-variant w-5">{idx + 1}.</span>
              <input
                type="text"
                value={bullet}
                onChange={(e) => handleBulletChange(idx, e.target.value)}
                placeholder="e.g. Advanced Ultrasonic Scaling"
                className="flex-grow px-4 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <button
                type="button"
                onClick={() => moveBulletPoint(idx, -1)}
                disabled={idx === 0}
                className="p-1.5 text-on-surface-variant hover:text-primary disabled:opacity-30 cursor-pointer"
                title="Move Up"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
              <button
                type="button"
                onClick={() => moveBulletPoint(idx, 1)}
                disabled={idx === formData.bulletPoints.length - 1}
                className="p-1.5 text-on-surface-variant hover:text-primary disabled:opacity-30 cursor-pointer"
                title="Move Down"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
              </button>
              <button
                type="button"
                onClick={() => removeBulletPoint(idx)}
                className="p-1.5 text-error hover:bg-error/10 rounded-lg cursor-pointer"
                title="Remove"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: BENEFITS */}
      {activeTab === "benefits" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Treatment Benefits Cards</h3>
            <button
              type="button"
              onClick={addBenefit}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Benefit
            </button>
          </div>

          {formData.benefits.map((benefit, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeBenefit(idx)}
                className="absolute top-3 right-3 text-error hover:bg-error/10 p-1 rounded-lg cursor-pointer"
                title="Remove Benefit"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Benefit Title</label>
                  <input
                    type="text"
                    value={benefit.title}
                    onChange={(e) => handleBenefitChange(idx, "title", e.target.value)}
                    placeholder="e.g. Plaque Removal"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                  />
                </div>
                <IconSelector
                  label="Icon"
                  value={benefit.icon}
                  onChange={(newIcon) => handleBenefitChange(idx, "icon", newIcon)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  value={benefit.description}
                  onChange={(e) => handleBenefitChange(idx, "description", e.target.value)}
                  placeholder="Explain why this benefit matters..."
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: TREATMENT STEPS */}
      {activeTab === "steps" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Treatment Procedure Steps</h3>
            <button
              type="button"
              onClick={addStep}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Step
            </button>
          </div>

          {formData.steps.map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeStep(idx)}
                className="absolute top-3 right-3 text-error hover:bg-error/10 p-1 rounded-lg cursor-pointer"
                title="Remove Step"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Step Number</label>
                  <input
                    type="text"
                    value={step.number}
                    onChange={(e) => handleStepChange(idx, "number", e.target.value)}
                    placeholder="e.g. 01."
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs font-bold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Step Title</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                    placeholder="e.g. Examination"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                  />
                </div>
                <IconSelector
                  label="Icon"
                  value={step.icon}
                  onChange={(newIcon) => handleStepChange(idx, "icon", newIcon)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Step Description</label>
                <textarea
                  rows={2}
                  value={step.description}
                  onChange={(e) => handleStepChange(idx, "description", e.target.value)}
                  placeholder="Describe what happens during this step..."
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: RECOVERY */}
      {activeTab === "recovery" && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-on-surface">
              Recovery Overview / Intro
            </label>
            <textarea
              rows={2}
              value={formData.recovery.intro}
              onChange={(e) => handleRecoveryIntroChange(e.target.value)}
              placeholder="e.g. No downtime needed! You can return to daily activities immediately."
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-bold">Recovery & Aftercare Tips</h3>
            <button
              type="button"
              onClick={addTip}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Tip
            </button>
          </div>

          {formData.recovery.tips.map((tip, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <IconSelector
                value={tip.icon}
                onChange={(newIcon) => handleTipChange(idx, "icon", newIcon)}
                className="w-48"
              />
              <input
                type="text"
                value={tip.text}
                onChange={(e) => handleTipChange(idx, "text", e.target.value)}
                placeholder="Aftercare advice tip text..."
                className="flex-grow px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs"
              />
              <button
                type="button"
                onClick={() => removeTip(idx)}
                className="p-1.5 text-error hover:bg-error/10 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: FAQS */}
      {activeTab === "faqs" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Frequently Asked Questions</h3>
            <button
              type="button"
              onClick={addFaq}
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add FAQ
            </button>
          </div>

          {formData.faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeFaq(idx)}
                className="absolute top-3 right-3 text-error hover:bg-error/10 p-1 rounded-lg cursor-pointer"
                title="Remove FAQ"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                  placeholder="e.g. How often should I get a dental cleaning?"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Answer</label>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                  placeholder="Comprehensive clinical answer..."
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
              {initialData ? "Update Service" : "Publish Service"}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
