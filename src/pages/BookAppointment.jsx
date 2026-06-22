import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TopBar from "../components/TopBar";
import { BookAppointmentCard } from "../components/BookAppointmentCard";

const BookAppointment = () => {

  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  const handleComplete = () => {
    // Notify any active components that the appointments database has changed
    const event = new CustomEvent("appointments-updated");
    window.dispatchEvent(event);
  };

  return (
    <div className="flex flex-col flex-grow w-full">
      <TopBar placeholder="Search patients, records..." />

      <div className="p-gutter w-full space-y-gutter flex-grow flex flex-col">
        {/* Header Title Section */}
        <div className="header-bar flex items-end justify-between flex-wrap gap-4 border-b border-outline-variant/20 pb-4 select-none">
          <div className="header-title space-y-1">
            <h1 className="text-headline-md font-headline-md text-on-surface font-extrabold tracking-tight">Clinical Registration</h1>
            <p className="text-body-md text-on-surface-variant opacity-80">Book a new dental patient reservation directly into the system.</p>
          </div>
          <div className="header-actions">
            {step !== 4 ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 border border-outline-variant/50 text-on-surface py-2.5 px-4 rounded-xl font-bold text-label-md hover:bg-surface-container-high transition-all cursor-pointer"
              >
                Cancel Booking
              </button>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 border border-outline-variant/50 text-on-surface py-2.5 px-4 rounded-xl font-bold text-label-md hover:bg-surface-container-high transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area pt-4">
          <BookAppointmentCard onComplete={handleComplete} step={step} setStep={setStep} />
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
