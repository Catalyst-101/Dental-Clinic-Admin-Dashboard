import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("loading");

    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        localStorage.setItem("isAuthenticated", "true");
        navigate("/dashboard");
        setStatus("idle");
        setEmail("");
        setPassword("");
      }, 1000);
    }, 1500);
  };

  return (
    <main className="min-h-screen w-full flex overflow-hidden bg-surface font-body-md text-on-surface">
      <motion.section
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-container"
      >
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
            <span className="material-symbols-outlined text-white text-5xl leading-none">
              dentistry
            </span>
            <h1 className="text-3xl lg:text-4xl font-semibold text-white leading-none">
              DentaElite Admin
            </h1>
          </div>
          <p className="text-white opacity-90 text-base lg:text-lg leading-relaxed">
            Premium dental care administrative gateway. Manage practitioners,
            appointments, and patient wellness through our unified clinical
            interface.
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
        <motion.div
          whileHover={{
            y: -8,
            boxShadow: "0 25px 50px rgba(0,0,0,.12)",
          }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md glass-card card-shadow p-6 md:p-8 rounded-2xl z-10"
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="font-headline-md text-headline-md">Welcome Back</h2>
            <p className="text-on-surface-variant mt-2">
              Access the medical management portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-on-surface-variant">
                Email Address
              </label>
              <div className="relative mt-2">
                <span className="material-symbols-outlined absolute left-4 top-3 text-on-surface-variant">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 py-3 rounded-lg border border-outline-variant outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="dr.smith@dentaelite.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-on-surface-variant">
                Password
              </label>
              <div className="relative mt-2">
                <span className="material-symbols-outlined absolute left-4 top-3">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-lg border border-outline-variant outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-3"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                Remember Me
              </label>
              <a className="text-primary hover:underline">Forgot Password?</a>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                disabled={status !== "idle"}
                className="w-full py-3"
              >
                {status === "idle" && (
                  <>
                    Login
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </>
                )}
                {status === "loading" && "Authenticating..."}
                {status === "success" && "Access Granted ✓"}
              </Button>
            </motion.div>
          </form>

          <div className="mt-lg pt-md border-t border-outline-variant flex flex-col gap-sm items-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Need clinical support or access?
            </p>
            <div className="flex gap-gutter">
              <a
                className="flex items-center gap-1 text-label-sm font-label-sm text-secondary hover:text-primary transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-[16px]">
                  help
                </span>{" "}
                Help Center
              </a>
              <a
                className="flex items-center gap-1 text-label-sm font-label-sm text-secondary hover:text-primary transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-[16px]">
                  contact_support
                </span>{" "}
                IT Support
              </a>
            </div>
          </div>
          <div className="mt-gutter text-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">
              © 2024 DentaElite Premium Care Systems. All rights reserved.
            </p>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
};

export default LoginPage;