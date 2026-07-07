import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { PasswordStrengthInput } from "../components/PasswordStrengthInput";
import { apiFetch } from "../utils/apiClient";

const LoginPage = () => {
  const navigate = useNavigate();

  // Navigation / sub-views: "login" | "mfa" | "forgot" | "verify-otp" | "reset-password" | "success"
  const [view, setView] = useState("login");

  // Form inputs
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  // OTP and Token states
  const [mfaToken, setMfaToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Handle cooldown timers for OTP resends
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Handle toast timers
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (status !== "idle") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { email: emailOrUsername, password, rememberMe }
      });

      if (data.mfaRequired) {
        setMfaToken(data.mfaToken);
        setForgotEmail(data.email); // standard placeholder for email displaying
        setView("mfa");
        setStatus("idle");
        setCooldown(60); // start 60s cooldown for resend
      } else {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", data.token);
        storage.setItem("isAuthenticated", "true");
        storage.setItem("user", JSON.stringify(data.user || {}));
        setStatus("success");
        navigate("/dashboard");
      }
    } catch (error) {
      setStatus("idle");
      setErrorMessage(error.response?.message || error.message || "Authentication failed.");
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (status !== "idle") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const data = await apiFetch("/api/auth/verify-2fa", {
        method: "POST",
        body: { mfaToken, otp: otpCode }
      });

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      storage.setItem("isAuthenticated", "true");
      storage.setItem("user", JSON.stringify(data.user || {}));
      setStatus("success");
      navigate("/dashboard");
    } catch (error) {
      setStatus("idle");
      setErrorMessage(error.response?.message || error.message || "Invalid 2FA code.");
    }
  };

  const handleMfaResend = async () => {
    if (cooldown > 0) return;
    setErrorMessage("");
    try {
      await apiFetch("/api/auth/resend-2fa", {
        method: "POST",
        body: { mfaToken }
      });
      setToastMessage("A new verification code has been sent!");
      setCooldown(60);
    } catch (error) {
      setErrorMessage(error.response?.message || error.message || "Failed to resend code.");
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: { email: forgotEmail }
      });
      setToastMessage("Password reset code sent to your email!");
      setView("verify-otp");
      setStatus("idle");
      setCooldown(60);
    } catch (error) {
      setStatus("idle");
      setErrorMessage(error.response?.message || error.message || "Failed to send reset code.");
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setErrorMessage("Please enter the verification code.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const data = await apiFetch("/api/auth/verify-reset-otp", {
        method: "POST",
        body: { email: forgotEmail, otp: otpCode }
      });
      setResetToken(data.resetToken);
      setView("reset-password");
      setStatus("idle");
      setOtpCode("");
      setErrorMessage("");
    } catch (error) {
      setStatus("idle");
      setErrorMessage(error.response?.message || error.message || "Invalid or expired code.");
    }
  };

  const handleForgotResend = async () => {
    if (cooldown > 0) return;
    setErrorMessage("");
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: { email: forgotEmail }
      });
      setToastMessage("Reset code resent successfully!");
      setCooldown(60);
    } catch (error) {
      setErrorMessage(error.response?.message || error.message || "Failed to resend code.");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: { resetToken, newPassword }
      });
      setView("success");
      setStatus("idle");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus("idle");
      setErrorMessage(error.response?.message || error.message || "Failed to reset password.");
    }
  };

  const switchView = (targetView) => {
    setErrorMessage("");
    setOtpCode("");
    setStatus("idle");
    setView(targetView);
  };

  return (
    <main className="min-h-screen w-full flex overflow-hidden bg-surface font-body-md text-on-surface">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[99999] bg-inverse-surface text-inverse-on-surface px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-outline-variant/20 select-none max-w-sm"
          >
            <span className="material-symbols-outlined text-secondary-fixed">check_circle</span>
            <span className="text-label-md font-bold leading-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-container">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary/20 to-transparent" />
        <img
          alt="Dental Clinic"
          className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4otsU1mvcNJgttGD-LKondRjx196mcc1KB1JrAvVU-CQieVSuSqD26CowosNfpABcpRJT5WRr7ydqMXFCFpn-Mu4lHw43577ZPuhwUL8-xH18XJhN7ajHavSBT0EFPsCQb64yaV5RmqegAlUoeHyQ8jyCRSlNcEjvPpfVpSJeh3-f_kZ_GVx08oW6ub8oUbeK43qe_8NkWSjlVgcpF1t5SdnrJvslNhy0SUPi83R5DroyLS_OH0OKWiOqtOvIX21mucq0SgMeHBaD"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="absolute bottom-10 left-8 lg:left-14 z-20 max-w-lg"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-white text-5xl leading-none">dentistry</span>
            <h1 className="text-3xl lg:text-4xl font-semibold text-white leading-none">DentaElite Admin</h1>
          </div>
          <p className="text-white opacity-90 text-base lg:text-lg leading-relaxed text-left">
            Premium dental care administrative gateway. Manage practitioners, appointments, and patient wellness through our unified clinical interface.
          </p>
        </motion.div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-5 md:p-10 bg-transparent relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl" />
        
        <div className="w-full max-w-md glass-card card-shadow p-6 md:p-8 rounded-2xl z-10 min-h-[480px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            
            {/* LOGIN VIEW */}
            {view === "login" && (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center lg:text-left">
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Welcome Back</h2>
                  <p className="text-on-surface-variant mt-2">Access the medical management portal</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="text-left">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
                      Email or Username
                    </label>
                    <div className="relative mt-2">
                      <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant text-[20px] select-none">
                        person
                      </span>
                      <input
                        type="text"
                        required
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant outline-none bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
                        placeholder="dr.smith or dr.smith@dentaelite.com"
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
                      Password
                    </label>
                    <div className="relative mt-2">
                      <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant text-[20px] select-none">
                        lock
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 rounded-lg border border-outline-variant outline-none bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute right-4 top-3 text-on-surface-variant hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[20px] select-none">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center gap-2 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary cursor-pointer"
                      />
                      Remember Me
                    </label>
                    <button
                      type="button"
                      onClick={() => switchView("forgot")}
                      className="text-primary hover:underline font-bold text-xs"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" disabled={status !== "idle"} className="w-full py-3">
                      {status === "idle" && (
                        <>
                          Login
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                      )}
                      {status === "loading" && "Authenticating..."}
                      {status === "success" && "Access Granted ✓"}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {/* TWO FACTOR VIEW */}
            {view === "mfa" && (
              <motion.div
                key="mfa-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center lg:text-left">
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[32px]">security</span>
                    2-Factor Verification
                  </h2>
                  <p className="text-on-surface-variant mt-2 text-sm text-left">
                    {useRecoveryCode 
                      ? "Enter one of your 8-character recovery codes to log into your account."
                      : "Please enter the 6-digit verification code from your Google Authenticator or other authenticator app."
                    }
                  </p>
                </div>

                <form onSubmit={handleMfaSubmit} className="space-y-5">
                  <div className="text-left">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
                      {useRecoveryCode ? "Recovery Code" : "Verification Code"}
                    </label>
                    <input
                      type="text"
                      maxLength={useRecoveryCode ? 12 : 6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(
                        useRecoveryCode 
                          ? e.target.value.replace(/[^a-zA-Z0-9]/g, "") 
                          : e.target.value.replace(/[^0-9]/g, "")
                      )}
                      className={`w-full py-3 rounded-lg border border-outline-variant outline-none bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40 mt-2 ${
                        useRecoveryCode ? "px-4 text-left font-mono" : "text-center text-2xl font-bold tracking-[8px]"
                      }`}
                      placeholder={useRecoveryCode ? "e.g. a1b2c3d4" : "000000"}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <button
                      type="button"
                      onClick={() => switchView("login")}
                      className="text-on-surface-variant hover:text-on-surface hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Back to Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUseRecoveryCode(!useRecoveryCode);
                        setOtpCode("");
                      }}
                      className="text-primary hover:underline font-bold cursor-pointer"
                    >
                      {useRecoveryCode ? "Use Authenticator Code" : "Use a Recovery Code"}
                    </button>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" disabled={status !== "idle" || (useRecoveryCode ? otpCode.length < 8 : otpCode.length !== 6)} className="w-full py-3">
                      {status === "idle" && (
                        <>
                          Verify & Login
                          <span className="material-symbols-outlined">check_circle</span>
                        </>
                      )}
                      {status === "loading" && "Verifying..."}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {view === "forgot" && (
              <motion.div
                key="forgot-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center lg:text-left">
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Forgot Password?</h2>
                  <p className="text-on-surface-variant mt-2 text-sm text-left">
                    Enter your registered email address below, and we will send you a 6-digit OTP code to verify and reset your credentials.
                  </p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  <div className="text-left">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
                      Email Address
                    </label>
                    <div className="relative mt-2">
                      <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant text-[20px] select-none">
                        mail
                      </span>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant outline-none bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
                        placeholder="dr.smith@dentaelite.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-center text-xs">
                    <button
                      type="button"
                      onClick={() => switchView("login")}
                      className="text-on-surface-variant hover:text-on-surface hover:underline font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Back to Login
                    </button>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" disabled={status !== "idle"} className="w-full py-3">
                      {status === "idle" && (
                        <>
                          Send Reset Code
                          <span className="material-symbols-outlined">send</span>
                        </>
                      )}
                      {status === "loading" && "Sending..."}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {/* VERIFY RESET OTP VIEW */}
            {view === "verify-otp" && (
              <motion.div
                key="verify-otp-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center lg:text-left">
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Enter Reset Code</h2>
                  <p className="text-on-surface-variant mt-2 text-sm text-left">
                    Please type the verification code sent to <span className="font-bold text-on-surface">{forgotEmail}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                  <div className="text-left">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full text-center py-3 text-2xl font-bold tracking-[8px] rounded-lg border border-outline-variant outline-none bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
                      placeholder="000000"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <button
                      type="button"
                      onClick={() => switchView("forgot")}
                      className="text-on-surface-variant hover:text-on-surface hover:underline font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Back
                    </button>
                    {cooldown > 0 ? (
                      <span className="text-on-surface-variant opacity-75">Resend in {cooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgotResend}
                        className="text-primary hover:underline font-bold"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" disabled={status !== "idle" || otpCode.length !== 6} className="w-full py-3">
                      {status === "idle" && (
                        <>
                          Verify Code
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                      )}
                      {status === "loading" && "Checking..."}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {/* RESET PASSWORD VIEW */}
            {view === "reset-password" && (
              <motion.div
                key="reset-password-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center lg:text-left">
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Choose New Password</h2>
                  <p className="text-on-surface-variant mt-2 text-sm text-left">
                    Your code is verified! Setup a strong and secure new password below.
                  </p>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                  <PasswordStrengthInput
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    label="New Password"
                    id="newPassword"
                    required
                  />

                  <div className="text-left space-y-2">
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] select-none">
                        lock
                      </span>
                      <input
                        id="confirmPassword"
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-12 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px] select-none">
                          {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" disabled={status !== "idle" || !newPassword || newPassword !== confirmPassword} className="w-full py-3">
                      {status === "idle" && (
                        <>
                          Reset Password
                          <span className="material-symbols-outlined">published_with_changes</span>
                        </>
                      )}
                      {status === "loading" && "Saving Password..."}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {/* SUCCESS VIEW */}
            {view === "success" && (
              <motion.div
                key="success-view"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <span className="material-symbols-outlined text-success text-[72px] animate-bounce select-none">
                    check_circle
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Password Updated!</h2>
                <p className="text-on-surface-variant text-sm max-w-sm mx-auto">
                  Your password has been changed successfully. You can now use your new password to log in.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={() => switchView("login")} className="w-full py-3 mt-4">
                    Return to Login
                    <span className="material-symbols-outlined">login</span>
                  </Button>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Global Error Banner */}
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-error font-semibold"
            >
              {errorMessage}
            </motion.p>
          )}

          {/* IT & HELP CENTER FOOTER */}
          <div className="mt-8 pt-4 border-t border-outline-variant flex flex-col gap-2 items-center select-none">
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-80">
              Need clinical support or access?
            </p>
            <div className="flex gap-4">
              <a className="flex items-center gap-1 text-label-sm font-bold text-secondary hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">help</span> Help Center
              </a>
              <a className="flex items-center gap-1 text-label-sm font-bold text-secondary hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">contact_support</span> IT Support
              </a>
            </div>
            <p className="font-label-sm text-[10px] text-on-surface-variant opacity-60 mt-4">
              © 2024 DentaElite Premium Care Systems. All rights reserved.
            </p>
          </div>

        </div>
      </motion.section>
    </main>
  );
};

export default LoginPage;