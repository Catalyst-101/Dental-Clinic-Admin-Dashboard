import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { services, doctors } from "../data/clinicData";
export const BookAppointmentCard = ({ onComplete, step, setStep }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [appointmentId, setAppointmentId] = useState("");
    // Form State
    const [formData, setFormData] = useState({
        fullName: "John Doe",
        phone: "+1 (555) 000-0000",
        email: "john@example.com",
        gender: "",
        dob: "",
        address: "123 Dental St, Suite 100",
        notes: "",
        serviceId: "",
        doctorId: "",
        date: "",
        time: ""
    });
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };
    const handleTimeSelect = (timeSlot) => {
        setFormData((prev) => ({
            ...prev,
            time: timeSlot
        }));
    };
    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.phone || !formData.email || !formData.gender || !formData.dob || !formData.address) {
            alert("Please fill in all required patient details.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 800);
    };
    const handleStep2Submit = (e) => {
        e.preventDefault();
        if (!formData.serviceId || !formData.doctorId || !formData.date || !formData.time) {
            alert("Please complete all appointment details.");
            return;
        }
        setStep(3);
    };
    const generateId = () => `DE-${Math.floor(10000 + Math.random() * 90000)}`;
    const handleConfirm = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const newId = generateId();
            setAppointmentId(newId);
            // Save to localStorage
            const saved = localStorage.getItem("appointments");
            let currentAppts = [];
            if (saved) {
                currentAppts = JSON.parse(saved);
            } else {
                currentAppts = [
                    { id: 1, name: "Jane Williams", initial: "JW", bgInitials: "bg-primary-fixed text-on-primary-fixed", service: "Orthodontics Checkup", date: "Oct 24, 2023", time: "09:30 AM", status: "Confirmed" },
                    { id: 2, name: "Robert Miller", initial: "RM", bgInitials: "bg-secondary-fixed text-on-secondary-fixed", service: "Teeth Whitening", date: "Oct 24, 2023", time: "11:15 AM", status: "In Progress" },
                    { id: 3, name: "Sarah King", initial: "SK", bgInitials: "bg-tertiary-fixed text-on-tertiary-fixed", service: "General Consultation", date: "Oct 24, 2023", time: "02:45 PM", status: "Pending" },
                    { id: 4, name: "Ben Thompson", initial: "BT", bgInitials: "bg-error-container/40 text-on-error-container", service: "Root Canal", date: "Oct 23, 2023", time: "04:00 PM", status: "Completed" }
                ];
            }
            const selectedServiceObj = services.find((s) => s.id === formData.serviceId);
            const selectedDoctorObj = doctors.find((d) => d.id === formData.doctorId);

            const dateObj = new Date(formData.date + "T00:00:00");
            const formattedDateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const names = formData.fullName.trim().split(" ");
            const initials = names.length > 1
                ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
                : names[0].slice(0, 2).toUpperCase();
            const bgClasses = [
                "bg-primary-fixed text-on-primary-fixed",
                "bg-secondary-fixed text-on-secondary-fixed",
                "bg-tertiary-fixed text-on-tertiary-fixed",
                "bg-error-container/40 text-on-error-container"
            ];
            const randomBg = bgClasses[Math.floor(Math.random() * bgClasses.length)];
            const newAppt = {
                id: Date.now(),
                name: formData.fullName,
                initial: initials,
                bgInitials: randomBg,
                service: selectedServiceObj ? selectedServiceObj.title : "Gum Treatment",
                date: formattedDateStr,
                time: formData.time,
                status: "Pending"
            };
            // Prepend and save
            const updatedAppts = [newAppt, ...currentAppts];
            localStorage.setItem("appointments", JSON.stringify(updatedAppts));
            // Trigger Confetti Burst
            triggerConfetti();
            // Advance step
            setStep(4);
            if (onComplete) onComplete(newAppt);
        }, 1200);
    };
    const triggerConfetti = () => {
        const container = document.body;
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement("div");
            confetti.className = "confetti rounded-full";
            confetti.style.left = "50%";
            confetti.style.top = "40%";
            confetti.style.backgroundColor = i % 2 === 0 ? "#006b2c" : "#6bff8f";
            container.appendChild(confetti);
            const destinationX = (Math.random() - 0.5) * 800;
            const destinationY = (Math.random() - 0.5) * 600;
            const rotation = Math.random() * 360;
            confetti.animate([
                { transform: "translate(0, 0) scale(0) rotate(0deg)", opacity: 0 },
                { transform: `translate(${destinationX}px, ${destinationY}px) scale(1) rotate(${rotation}deg)`, opacity: 0.6, offset: 0.2 },
                { transform: `translate(${destinationX}px, ${destinationY + 200}px) scale(0) rotate(${rotation * 2}deg)`, opacity: 0 }
            ], {
                duration: 1800 + Math.random() * 1000,
                easing: "cubic-bezier(0, .9, .57, 1)",
                fill: "forwards"
            });
            setTimeout(() => confetti.remove(), 3500);
        }
    };
    // Stepper class helper
    const getStepperClasses = (nodeNum) => {
        if (step > nodeNum) return "bg-primary text-white";
        if (step === nodeNum || (nodeNum === 3 && step === 4)) return "bg-primary text-white ring-4 ring-primary-fixed-dim";
        return "bg-surface-container-high text-on-surface-variant";
    };
    const selectedServiceObj = services.find((s) => s.id === formData.serviceId);
    const selectedDoctorObj = doctors.find((d) => d.id === formData.doctorId);
    const formattedDateStr = formData.date ? new Date(formData.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
    return (
        <div className="w-full space-y-gutter">
            {/* Stepper Wizard Header */}
            {step < 4 && (
                <div className="mb-6 select-none">
                    <div className="flex items-center justify-center gap-20 relative max-w-xl mx-auto">
                        <div className="absolute top-1/2 left-[16%] w-[68%] h-0.5 bg-surface-container-high -z-10 -translate-y-1/2"></div>
                        <div
                            className="absolute top-1/2 left-[16%] h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-300"
                            style={{ width: step === 1 ? "0%" : step === 2 ? "34%" : "68%" }}
                        ></div>

                        {/* Step 1 Node */}
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all font-bold text-sm ${getStepperClasses(1)}`}>
                                {step > 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : <span className="material-symbols-outlined text-[16px]">person</span>}
                            </div>
                            <span className={`text-label-sm font-label-sm ${step >= 1 ? "text-primary font-bold" : "text-on-surface-variant"}`}>Patient</span>
                        </div>

                        {/* Step 2 Node */}
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all font-bold text-sm ${getStepperClasses(2)}`}>
                                {step > 2 ? <span className="material-symbols-outlined text-[16px]">check</span> : <span className="material-symbols-outlined text-[16px]">event</span>}
                            </div>
                            <span className={`text-label-sm font-label-sm ${step >= 2 ? "text-primary font-bold" : "text-on-surface-variant"}`}>Schedule</span>
                        </div>

                        {/* Step 3 Node */}
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all font-bold text-sm ${getStepperClasses(3)}`}>
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            </div>
                            <span className={`text-label-sm font-label-sm ${step >= 3 ? "text-primary font-bold" : "text-on-surface-variant"}`}>Review</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Main Glassmorphic Form Card */}
            <div className="glass-card card-shadow rounded-2xl p-6 md:p-8 border border-outline-variant/30 relative overflow-hidden select-none">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.section
                            key="step1"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-6">
                                <h1 className="text-headline-sm font-headline-sm font-extrabold text-on-surface mb-1">Patient Details</h1>
                                <p className="text-body-md text-on-surface-variant opacity-80">Please provide your medical registration information to continue.</p>
                            </div>
                            <form onSubmit={handleStep1Submit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="fullName">Full Name</label>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                                        id="fullName"
                                        placeholder="John Doe"
                                        required
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="phone">Phone Number</label>
                                        <input
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                                            id="phone"
                                            placeholder="+1 (555) 000-0000"
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="email">Email Address</label>
                                        <input
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                                            id="email"
                                            placeholder="john@example.com"
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="gender">Gender</label>
                                        <select
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                                            id="gender"
                                            required
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="" disabled>Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other / Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="dob">Date of Birth</label>
                                        <input
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                                            id="dob"
                                            required
                                            type="date"
                                            value={formData.dob}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="address">Address</label>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                                        id="address"
                                        placeholder="123 Dental St, Suite 100"
                                        required
                                        type="text"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="notes">Additional Notes (Optional)</label>
                                    <textarea
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-medium text-on-surface"
                                        id="notes"
                                        placeholder="Any allergies or specific concerns?"
                                        rows="2"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                                <div className="pt-4">
                                    <button
                                        className="w-full bg-primary hover:opacity-90 text-on-primary py-3.5 rounded-xl font-bold text-label-md transition-all transform active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? "Processing..." : (
                                            <>
                                                Choose Service &amp; Doctor
                                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.section>
                    )}
                    {step === 2 && (
                        <motion.section
                            key="step2"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-6">
                                <h2 className="text-headline-sm font-headline-sm font-extrabold text-on-surface mb-1">Schedule Appointment</h2>
                                <p className="text-body-md text-on-surface-variant opacity-80">Select your preferred dental service and healthcare professional.</p>
                            </div>
                            <form onSubmit={handleStep2Submit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="serviceId">Select Service</label>
                                        <select
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                                            id="serviceId"
                                            required
                                            value={formData.serviceId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
                                        >
                                            <option value="">Choose a service...</option>
                                            {services.map((s) => (
                                                <option key={s.id} value={s.id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="doctorId">Select Doctor</label>
                                        <select
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                                            id="doctorId"
                                            required
                                            value={formData.doctorId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                                        >
                                            <option value="">Choose a specialist...</option>
                                            {doctors.map((d) => (
                                                <option key={d.id} value={d.id}>{d.name} ({d.specialization.split(" ").slice(-1)[0]})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {selectedDoctorObj && (
                                    <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                                        <img
                                            src={selectedDoctorObj.image}
                                            alt={selectedDoctorObj.name}
                                            className="w-10 h-10 rounded-full object-cover border border-primary-fixed"
                                        />
                                        <div>
                                            <h4 className="text-label-md font-bold text-on-surface">{selectedDoctorObj.name}</h4>
                                            <p className="text-[12px] text-primary font-semibold">{selectedDoctorObj.specialization}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="date">Preferred Date</label>
                                        <input
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-semibold text-on-surface cursor-pointer"
                                            id="date"
                                            required
                                            type="date"
                                            min={new Date().toISOString().split("T")[0]}
                                            value={formData.date}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">Preferred Time</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {["09:00 AM", "10:30 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"].map((slot) => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => handleTimeSelect(slot)}
                                                    className={`py-2 px-1 rounded-lg border text-label-sm font-semibold transition-all text-center cursor-pointer ${formData.time === slot
                                                        ? "border-primary bg-primary-fixed text-on-primary-fixed ring-1 ring-primary"
                                                        : "border-outline-variant bg-surface-container-lowest hover:border-primary text-on-surface"
                                                        }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        className="w-1/3 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/20 py-3.5 rounded-xl font-bold text-label-md transition-all active:scale-95 text-on-surface cursor-pointer"
                                        type="button"
                                        onClick={() => setStep(1)}
                                    >
                                        Back
                                    </button>
                                    <button
                                        className="flex-grow bg-primary text-on-primary py-3.5 rounded-xl font-bold text-label-md hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                        type="submit"
                                    >
                                        Review Details
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </button>
                                </div>
                            </form>
                        </motion.section>
                    )}
                    {step === 3 && (
                        <motion.section
                            key="step3"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-6">
                                <h1 className="text-headline-sm font-headline-sm font-extrabold text-on-surface mb-1">Review Your Appointment</h1>
                                <p className="text-body-md text-on-surface-variant opacity-80">Please check the details below before confirming your clinical reservation.</p>
                            </div>
                            <div className="space-y-4">
                                {/* Patient Summary Card */}
                                <div className="p-4 border border-outline-variant/30 rounded-xl bg-surface-container-lowest shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                                            <h2 className="font-bold text-on-surface text-label-md">Patient Details</h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-primary font-bold hover:underline flex items-center gap-0.5 text-label-sm cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">edit</span>
                                            Edit
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Full Name</p>
                                            <p className="text-label-sm font-semibold text-on-surface">{formData.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Phone Number</p>
                                            <p className="text-label-sm font-semibold text-on-surface">{formData.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Email Address</p>
                                            <p className="text-label-sm font-semibold text-on-surface">{formData.email}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Appointment Summary Card */}
                                <div className="p-4 border border-outline-variant/30 rounded-xl bg-surface-container-lowest shadow-sm space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                                            <h2 className="font-bold text-on-surface text-label-md">Appointment Details</h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="text-primary font-bold hover:underline flex items-center gap-0.5 text-label-sm cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">edit</span>
                                            Edit
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                        <div className="flex items-center gap-3">
                                            {selectedDoctorObj && (
                                                <>
                                                    <img
                                                        src={selectedDoctorObj.image}
                                                        alt={selectedDoctorObj.name}
                                                        className="w-10 h-10 rounded-full object-cover border border-primary-fixed"
                                                    />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Specialist</p>
                                                        <p className="text-label-sm font-semibold text-on-surface">{selectedDoctorObj.name}</p>
                                                        <p className="text-[11px] text-primary font-semibold">{selectedDoctorObj.specialization}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary-container/15 flex items-center justify-center shrink-0 text-primary">
                                                <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Service Type</p>
                                                <p className="text-label-sm font-semibold text-on-surface">{selectedServiceObj?.title}</p>
                                                <p className="text-[11px] text-on-surface-variant font-medium">{selectedServiceObj?.tagline}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">event</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Scheduled Date</p>
                                                <p className="text-label-sm font-semibold text-on-surface">{formattedDateStr}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">schedule</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Time Slot</p>
                                                <p className="text-label-sm font-semibold text-on-surface">{formData.time}</p>
                                                <p className="text-[11px] text-on-surface-variant font-medium">Estimated: 45-60 mins</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {formData.notes && (
                                    <div className="p-3 border border-outline-variant/30 rounded-xl text-left bg-surface-container-lowest">
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Additional Notes</p>
                                        <p className="text-label-sm text-on-surface-variant italic font-semibold">"{formData.notes}"</p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center gap-4 pt-4 border-t border-outline-variant/30 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex items-center gap-1.5 text-on-surface-variant font-bold hover:text-primary transition-all text-label-sm cursor-pointer active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                        Back to Schedule
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        disabled={loading}
                                        className="bg-primary text-on-primary font-bold px-6 py-3.5 rounded-xl shadow-md hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer text-label-md"
                                    >
                                        {loading ? "Booking..." : (
                                            <>
                                                Confirm Appointment
                                                <span className="material-symbols-outlined text-[18px]">check</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.section>
                    )}
                    {step === 4 && (
                        <motion.section
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-center space-y-4"
                        >
                            <div className="py-4">
                                <div className="mb-4 flex justify-center">
                                    <svg className="checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                                        <circle className="checkmark-circle" cx="26" cy="26" fill="none" r="25"></circle>
                                        <path className="checkmark-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none"></path>
                                    </svg>
                                </div>

                                <h1 className="text-headline-sm font-extrabold text-primary mb-1">
                                    Booked Successfully
                                </h1>

                                <p className="text-label-md text-on-surface-variant mb-4">
                                    Thank you, <span className="font-bold text-primary">{formData.fullName.split(" ")[0]}</span>. The appointment has been confirmed and saved to the portal.
                                </p>
                                {/* Info summary grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                                    <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Appointment ID</span>
                                        <span className="text-label-md font-bold text-on-surface font-mono">{appointmentId}</span>
                                    </div>
                                    <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Doctor</span>
                                        <span className="text-label-md font-bold text-on-surface">{selectedDoctorObj?.name.split(" ").slice(-1)[0]}</span>
                                    </div>
                                    <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Date</span>
                                        <span className="text-label-md font-bold text-on-surface">{formattedDateStr}</span>
                                    </div>
                                    <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Time Slot</span>
                                        <span className="text-label-md font-bold text-on-surface">{formData.time}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => alert("Downloading confirmation PDF...")}
                                        className="bg-primary text-on-primary px-5 py-3 rounded-xl font-bold text-label-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        Download
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStep(1);
                                            setFormData({
                                                fullName: "John Doe",
                                                phone: "+1 (555) 000-0000",
                                                email: "john@example.com",
                                                gender: "",
                                                dob: "",
                                                address: "123 Dental St, Suite 100",
                                                notes: "",
                                                serviceId: "",
                                                doctorId: "",
                                                date: "",
                                                time: ""
                                            });
                                        }}
                                        className="border-2 border-primary text-primary hover:bg-primary/5 px-5 py-3 rounded-xl font-bold text-label-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Book New
                                    </button>
                                </div>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
            {/* HIPAA Compliance note */}
            {step < 4 && (
                <div className="flex items-center justify-start gap-2 opacity-65 select-none py-1">
                    <span className="material-symbols-outlined text-primary text-[16px]">security</span>
                    <p className="text-[11px] font-semibold text-on-surface-variant">HIPAA Compliant System Connection</p>
                </div>
            )}
        </div>
    );
};
