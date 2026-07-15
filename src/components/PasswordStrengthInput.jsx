import React, { useState } from "react";

export function PasswordStrengthInput({
  value,
  onChange,
  placeholder = "••••••••",
  id = "password",
  label = "Password",
  required = false,
  showRequirements = true
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Strength Check Logic
  const getRequirements = (val) => {
    return [
      { id: "length", label: "At least 6 characters", met: val.length >= 6 },
      { id: "uppercase", label: "One uppercase letter", met: /[A-Z]/.test(val) },
      { id: "number", label: "One number or symbol", met: /[0-9!@#$%^&*(),.?":{}|<>]/.test(val) }
    ];
  };

  const requirements = getRequirements(value);
  const metCount = requirements.filter((r) => r.met).length;

  let strengthLabel = "Weak";
  let strengthColor = "bg-outline-variant";
  let strengthWidth = "w-0";

  if (value.length > 0) {
    if (metCount === 1) {
      strengthLabel = "Weak";
      strengthColor = "bg-error";
      strengthWidth = "w-1/3";
    } else if (metCount === 2) {
      strengthLabel = "Medium";
      strengthColor = "bg-warning";
      strengthWidth = "w-2/3";
    } else if (metCount === 3) {
      strengthLabel = "Strong";
      strengthColor = "bg-success";
      strengthWidth = "w-full";
    }
  }

  return (
    <div className="space-y-2 text-left">
      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] select-none">
          lock
        </span>
        <input
          id={id}
          required={required}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-12 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/40"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px] select-none">
            {showPassword ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>

      {value.length > 0 && (
        <div className="space-y-1.5 pt-0.5 select-none">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Password Strength:</span>
            <span className={`font-bold ${
              strengthLabel === "Weak" ? "text-error" : strengthLabel === "Medium" ? "text-warning" : "text-success"
            }`}>
              {strengthLabel}
            </span>
          </div>
          {/* Strength Bar */}
          <div className="h-1.5 w-full bg-outline-variant/30 rounded-full overflow-hidden">
            <div className={`h-full ${strengthColor} ${strengthWidth} transition-all duration-300 rounded-full`} />
          </div>
        </div>
      )}

      {showRequirements && value.length > 0 && (
        <ul className="text-xs space-y-1 text-on-surface-variant pt-1 select-none">
          {requirements.map((req) => (
            <li key={req.id} className="flex items-center gap-1.5">
              <span className={`material-symbols-outlined text-[16px] leading-none ${
                req.met ? "text-success" : "text-on-surface-variant/40"
              }`}>
                {req.met ? "check_circle" : "circle"}
              </span>
              <span className={req.met ? "text-on-surface/95 font-semibold" : "opacity-75"}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
