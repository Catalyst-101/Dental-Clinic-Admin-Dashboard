import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getServices } from "../api/services";
import { getDoctors } from "../api/doctors";
import { createAppointment } from "../api/appointments";
import api, { getFullImageUrl, parseErrorMessage } from "../api/axios";

export const BookAppointmentCard = ({ onComplete, step, setStep }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [appointmentId, setAppointmentId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Data lists from backend
    const [servicesList, setServicesList] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    // Form State (Clean - No Pre-filled Text)
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        gender: "",
        dob: "",
        address: "",
        notes: "",
        serviceId: "",
        doctorId: "",
        date: "",
        time: ""
    });

    // Load active services on mount
    useEffect(() => {
        const loadServices = async () => {
            try {
                const res = await getServices();
                if (res && res.success) {
                    setServicesList(res.data || []);
                }
            } catch (err) {
                console.error("Failed to load services for appointment booking:", err);
            }
        };
        loadServices();
    }, []);

    // Filter doctors whenever selected service changes
    useEffect(() => {
        if (!formData.serviceId) {
            setFilteredDoctors([]);
            setFormData((prev) => ({ ...prev, doctorId: "", time: "" }));
            setAvailableSlots([]);
            return;
        }

        const fetchAssignedDoctors = async () => {
            try {
                const res = await getDoctors({ serviceId: formData.serviceId });
                if (res && res.success) {
                    setFilteredDoctors(res.data || []);
                } else {
                    setFilteredDoctors([]);
                }
            } catch (err) {
                console.error("Failed to fetch assigned doctors:", err);
                setFilteredDoctors([]);
            }
        };

        fetchAssignedDoctors();
        setFormData((prev) => ({ ...prev, doctorId: "", time: "" }));
        setAvailableSlots([]);
    }, [formData.serviceId]);

    // Fetch dynamic slots whenever Service, Doctor, or Date changes
    useEffect(() => {
        if (!formData.serviceId || !formData.doctorId || !formData.date) {
            setAvailableSlots([]);
            return;
        }

        const fetchDynamicSlots = async () => {
            setFetchingSlots(true);
            setErrorMessage("");
            try {
                const res = await api.get("/appointments/available-slots", {
                    params: {
                        serviceId: formData.serviceId,
                        doctorId: formData.doctorId,
                        date: formData.date
                    }
                });

                if (res.data && res.data.success) {
                    setAvailableSlots(res.data.data || []);
                } else {
                    setAvailableSlots([]);
                }
            } catch (err) {
                console.error("Failed to fetch dynamic slots:", err);
                const friendly = parseErrorMessage(err, "Unable to calculate doctor availability.");
                setErrorMessage(friendly);
                setAvailableSlots([]);
            } finally {
                setFetchingSlots(false);
            }
        };

        fetchDynamicSlots();
    }, [formData.serviceId, formData.doctorId, formData.date]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setErrorMessage("");
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleTimeSelect = (timeSlot) => {
        setErrorMessage("");
        setFormData((prev) => ({
            ...prev,
            time: timeSlot
        }));
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.phone || !formData.email || !formData.gender || !formData.dob || !formData.address) {
            setErrorMessage("Please complete all required patient details.");
            return;
        }
        setErrorMessage("");
        setStep(2);
    };

    const handleStep2Submit = (e) => {
        e.preventDefault();
        if (!formData.serviceId || !formData.doctorId || !formData.date || !formData.time) {
            setErrorMessage("Please complete all appointment scheduling options.");
            return;
        }
        setErrorMessage("");
        setStep(3);
    };

    const handleConfirm = async () => {
        setLoading(true);
        setErrorMessage("");

        const selectedServiceObj = servicesList.find((s) => (s._id === formData.serviceId || s.id === formData.serviceId || s.slug === formData.serviceId));
        const selectedDoctorObj = filteredDoctors.find((d) => (d._id === formData.doctorId || d.id === formData.doctorId || d.slug === formData.doctorId));

        try {
            const payload = {
                patientName: formData.fullName,
                patientEmail: formData.email,
                patientPhone: formData.phone,
                gender: formData.gender,
                dob: formData.dob,
                address: formData.address,
                notes: formData.notes,
                serviceId: selectedServiceObj ? selectedServiceObj._id : formData.serviceId,
                serviceName: selectedServiceObj ? selectedServiceObj.title : "Dental Service",
                doctorId: selectedDoctorObj ? selectedDoctorObj._id : formData.doctorId,
                doctorName: selectedDoctorObj ? selectedDoctorObj.name : "Assigned Practitioner",
                date: formData.date,
                time: formData.time,
                status: "Confirmed"
            };

            const res = await createAppointment(payload);
            if (res && res.success && res.data) {
                setAppointmentId(res.data.appointmentId || res.data._id);
                setStep(4);
            } else {
                setErrorMessage("Failed to confirm appointment. Please try again.");
            }
        } catch (err) {
            console.error("Booking error:", err);
            const friendly = parseErrorMessage(err, "Failed to confirm appointment booking.");
            setErrorMessage(friendly);
        } finally {
            setLoading(false);
        }
    };

    const selectedServiceObj = servicesList.find((s) => (s._id === formData.serviceId || s.id === formData.serviceId || s.slug === formData.serviceId));
    const selectedDoctorObj = filteredDoctors.find((d) => (d._id === formData.doctorId || d.id === formData.doctorId || d.slug === formData.doctorId));

    return (
        <div className="w-full max-w-4xl mx-auto py-4">
            {/* Stepper Header */}
            {step < 4 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between relative max-w-xl mx-auto select-none">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-high -z-10 -translate-y-1/2"></div>
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-300"
                            style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
                        ></div>

                        {/* Step 1 Node */}
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>
                                {step > 1 ? <span className="material-symbols-outlined text-[18px]">check</span> : 1}
                            </div>
                            <span className={`text-[11px] font-bold ${step >= 1 ? "text-primary" : "text-on-surface-variant opacity-70"}`}>Patient Details</span>
                        </div>

                        {/* Step 2 Node */}
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>
                                {step > 2 ? <span className="material-symbols-outlined text-[18px]">check</span> : 2}
                            </div>
                            <span className={`text-[11px] font-bold ${step >= 2 ? "text-primary" : "text-on-surface-variant opacity-70"}`}>Schedule</span>
                        </div>

                        {/* Step 3 Node */}
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>
                                3
                            </div>
                            <span className={`text-[11px] font-bold ${step >= 3 ? "text-primary" : "text-on-surface-variant opacity-70"}`}>Confirmation</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => setErrorMessage("")} className="text-error opacity-70 hover:opacity-100">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            )}

            {/* Main Form Card */}
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
                                <h1 className="text-headline-sm font-headline-sm font-extrabold text-on-surface mb-1">Patient Information</h1>
                                <p className="text-body-md text-on-surface-variant opacity-80">Provide patient details to register appointment.</p>
                            </div>
                            <form onSubmit={handleStep1Submit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="fullName">Full Name *</label>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md font-medium text-on-surface"
                                        id="fullName"
                                        placeholder="Enter patient full name"
                                        required
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="phone">Phone Number *</label>
                                        <input
                                            className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md font-medium text-on-surface"
                                            id="phone"
                                            placeholder="Enter phone number"
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="email">Email Address *</label>
                                        <input
                                            className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md font-medium text-on-surface"
                                            id="email"
                                            placeholder="Enter email address"
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="gender">Gender *</label>
                                        <select
                                            className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md font-semibold text-on-surface cursor-pointer"
                                            id="gender"
                                            required
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="" disabled>Select gender...</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other / Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="dob">Date of Birth *</label>
                                        <input
                                            className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md font-semibold text-on-surface cursor-pointer"
                                            id="dob"
                                            required
                                            type="date"
                                            value={formData.dob}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="address">Address *</label>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md font-medium text-on-surface"
                                        id="address"
                                        placeholder="Enter residential address"
                                        required
                                        type="text"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="notes">Clinical Notes (Optional)</label>
                                    <textarea
                                        className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md font-medium text-on-surface"
                                        id="notes"
                                        placeholder="Additional notes or concerns..."
                                        rows="2"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                                <div className="pt-4">
                                    <button
                                        className="w-full bg-primary hover:opacity-90 text-on-primary py-3.5 rounded-xl font-bold text-label-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                        type="submit"
                                    >
                                        Choose Service &amp; Doctor
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
                                <h2 className="text-headline-sm font-headline-sm font-extrabold text-on-surface mb-1">Service &amp; Doctor Scheduling</h2>
                                <p className="text-body-md text-on-surface-variant opacity-80">Select service first to display assigned doctors and calculated availability.</p>
                            </div>
                            <form onSubmit={handleStep2Submit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 1. Service Selection */}
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="serviceId">1. Select Service *</label>
                                        <select
                                            className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md font-semibold text-on-surface cursor-pointer"
                                            id="serviceId"
                                            required
                                            value={formData.serviceId}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, serviceId: e.target.value }))}
                                        >
                                            <option value="">Choose a service...</option>
                                            {servicesList.map((s) => (
                                                <option key={s._id || s.id || s.slug} value={s._id || s.id || s.slug}>
                                                    {s.title} ({s.duration || 30} mins)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Doctor Selection (Filtered by Service) */}
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="doctorId">2. Select Assigned Doctor *</label>
                                        <select
                                            className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md font-semibold text-on-surface cursor-pointer disabled:opacity-50"
                                            id="doctorId"
                                            required
                                            disabled={!formData.serviceId}
                                            value={formData.doctorId}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, doctorId: e.target.value }))}
                                        >
                                            <option value="">
                                                {!formData.serviceId
                                                    ? "Select a service first..."
                                                    : filteredDoctors.length === 0
                                                    ? "No doctors assigned to this service"
                                                    : "Choose a specialist..."}
                                            </option>
                                            {filteredDoctors.map((d) => (
                                                <option key={d._id || d.id || d.slug} value={d._id || d.id || d.slug}>
                                                    {d.name} ({d.specialization})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 3. Date Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="date">3. Preferred Date *</label>
                                        <input
                                            className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md font-semibold text-on-surface cursor-pointer"
                                            id="date"
                                            required
                                            type="date"
                                            min={new Date().toISOString().split("T")[0]}
                                            value={formData.date}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    {/* 4. Dynamic Time Slot Selection */}
                                    <div className="space-y-1">
                                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
                                            4. Available Start Times (Dynamic)
                                        </label>
                                        {fetchingSlots ? (
                                            <div className="p-3 text-xs text-primary font-bold flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                                <span>Calculating doctor availability...</span>
                                            </div>
                                        ) : !formData.serviceId || !formData.doctorId || !formData.date ? (
                                            <p className="text-xs text-on-surface-variant opacity-70 p-2 italic">
                                                Select service, doctor, and date to view calculated times.
                                            </p>
                                        ) : availableSlots.length === 0 ? (
                                            <p className="text-xs text-error font-bold p-2">
                                                No available time slots fit this service duration on the selected date.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
                                                {availableSlots.map((slot) => (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => handleTimeSelect(slot)}
                                                        className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                                                            formData.time === slot
                                                                ? "border-primary bg-primary/15 text-primary ring-1 ring-primary"
                                                                : "border-outline-variant/30 bg-surface hover:border-primary text-on-surface"
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        className="w-1/3 border border-outline-variant text-on-surface hover:bg-surface-container py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                                        type="button"
                                        onClick={() => setStep(1)}
                                    >
                                        Back
                                    </button>
                                    <button
                                        className="flex-grow bg-primary hover:opacity-90 text-on-primary py-3.5 rounded-xl font-bold text-label-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        type="submit"
                                        disabled={!formData.time}
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
                                <h2 className="text-headline-sm font-headline-sm font-extrabold text-on-surface mb-1">Confirm Appointment Details</h2>
                                <p className="text-body-md text-on-surface-variant opacity-80">Verify all information before creating appointment record.</p>
                            </div>

                            <div className="space-y-4 mb-6 bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30">
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-on-surface-variant font-bold uppercase tracking-wider block text-[10px]">Patient Name</span>
                                        <span className="font-bold text-on-surface text-sm">{formData.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-on-surface-variant font-bold uppercase tracking-wider block text-[10px]">Phone &amp; Email</span>
                                        <span className="font-bold text-on-surface">{formData.phone} | {formData.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-on-surface-variant font-bold uppercase tracking-wider block text-[10px]">Selected Service</span>
                                        <span className="font-bold text-primary">{selectedServiceObj?.title || formData.serviceId}</span>
                                    </div>
                                    <div>
                                        <span className="text-on-surface-variant font-bold uppercase tracking-wider block text-[10px]">Assigned Doctor</span>
                                        <span className="font-bold text-on-surface">{selectedDoctorObj?.name || formData.doctorId}</span>
                                    </div>
                                    <div>
                                        <span className="text-on-surface-variant font-bold uppercase tracking-wider block text-[10px]">Date &amp; Time</span>
                                        <span className="font-bold text-on-surface">{formData.date} at {formData.time}</span>
                                    </div>
                                    <div>
                                        <span className="text-on-surface-variant font-bold uppercase tracking-wider block text-[10px]">Service Duration</span>
                                        <span className="font-bold text-on-surface">{selectedServiceObj?.duration || 30} mins</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    className="w-1/3 border border-outline-variant text-on-surface hover:bg-surface-container py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                                    type="button"
                                    onClick={() => setStep(2)}
                                >
                                    Back
                                </button>
                                <button
                                    className="flex-grow bg-primary hover:opacity-90 text-on-primary py-3.5 rounded-xl font-bold text-label-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    onClick={handleConfirm}
                                    disabled={loading}
                                >
                                    {loading ? "Confirming..." : "Confirm & Book Appointment"}
                                </button>
                            </div>
                        </motion.section>
                    )}

                    {step === 4 && (
                        <motion.section
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-center py-6 space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-[36px]">check_circle</span>
                            </div>
                            <h2 className="text-headline-sm font-extrabold text-on-surface">Appointment Confirmed!</h2>
                            <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                                Appointment ID: <strong className="text-primary">{appointmentId}</strong> has been registered successfully.
                            </p>
                            <div className="pt-4 flex justify-center gap-3">
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setFormData({
                                            fullName: "", phone: "", email: "", gender: "", dob: "", address: "", notes: "", serviceId: "", doctorId: "", date: "", time: ""
                                        });
                                        if (onComplete) onComplete();
                                    }}
                                    className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs shadow-md"
                                >
                                    Book Another Appointment
                                </button>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
