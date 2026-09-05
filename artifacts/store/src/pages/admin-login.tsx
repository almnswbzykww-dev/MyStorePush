import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLoginPage() {
  const { isAdmin, loginMutation } = useAuth();
  const { settings } = useStoreSettings();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
   const [username, setUsername] = useState("");
   const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already admin using useEffect to avoid render-time side effects
  useEffect(() => {
    if (isAdmin) setLocation("/admin");
  }, [isAdmin, setLocation]);

  if (isAdmin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) {
      setError("اسم المستخدم مطلوب");
      return;
    }
    if (!userId.trim()) {
      setError("رقم المستخدم مطلوب");
      return;
    }
    loginMutation.mutate(
      {
        data: {
          username: username.trim(),
          userId: Number.isInteger(Number(userId.trim())) ? Number(userId.trim()) : undefined,
          password,
        },
      },
      {
        onSuccess: (data: any) => {
          if (data?.user) {
            queryClient.setQueryData(getGetMeQueryKey(), data.user);
          }
          setLocation(data?.user?.mustChangePassword ? "/change-password" : "/admin");
        },
        onError: () => {
          setError("رقم المستخدم أو كلمة المرور غير صحيحة");
        },
      }
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      dir="rtl"
      style={{ background: "linear-gradient(145deg, #050315 0%, #0a0520 40%, #0d1a3a 80%, #080415 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-700 opacity-[0.07] rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[hsl(43,96%,56%)] opacity-[0.05] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600 opacity-[0.04] rounded-full blur-3xl" />
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[hsl(43,96%,56%)]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
            animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-5 shadow-2xl shadow-purple-500/40 relative"
            style={{ background: "linear-gradient(135deg, hsl(43,96%,56%) 0%, hsl(300,70%,55%) 50%, hsl(240,80%,60%) 100%)" }}
          >
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="logo" className="w-full h-full object-cover rounded-3xl" />
            ) : (
              <span className="text-4xl font-black text-white" style={{ fontFamily: "'Amiri', serif" }}>ح</span>
            )}
            <div className="absolute inset-0 rounded-3xl bg-white opacity-10 blur-sm" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black text-white mb-2"
            style={{ fontFamily: "'Scheherazade New', serif" }}
          >
            لوحة تحكم المدير
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm"
          >
            {settings.storeName}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-8 shadow-2xl border border-white/8"
          style={{ background: "rgba(8,3,28,0.88)", backdropFilter: "blur(24px)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
                 <div>
                   <label className="block text-sm font-semibold text-gray-300 mb-2">اسم المستخدم</label>
                   <input
                     type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(""); }}
                     required
                     placeholder="المدير"
                     autoComplete="name"
                     className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-[hsl(43,96%,56%)]/50 focus:ring-1 focus:ring-[hsl(43,96%,56%)]/30 transition-all text-sm"
                   />
                 </div>

                 <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">رقم المستخدم</label>
                  <div className="relative">
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                       type="text"
                       value={userId}
                       onChange={e => { setUserId(e.target.value); setError(""); }}
                      required
                       placeholder="admin أو 1"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      data-form-type="other"
                      className="w-full pr-11 pl-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-[hsl(43,96%,56%)]/50 focus:ring-1 focus:ring-[hsl(43,96%,56%)]/30 transition-all text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">كلمة المرور</label>
                  <div className="relative">
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      required
                      placeholder="••••••••"
                      autoComplete="off"
                      data-form-type="other"
                      className="w-full pr-11 pl-12 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-[hsl(43,96%,56%)]/50 focus:ring-1 focus:ring-[hsl(43,96%,56%)]/30 transition-all text-sm"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                    >
                      {showPw ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/12 border border-red-500/25 text-red-400 text-sm"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loginMutation.isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-black text-lg text-[hsl(222,47%,11%)] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-3 shadow-xl shadow-yellow-500/25 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, hsl(43,96%,60%), hsl(43,96%,45%))" }}
                >
                  <motion.span
                    className="absolute inset-0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
                  />
                  {loginMutation.isPending ? (
                    <div className="w-6 h-6 border-2 border-[hsl(222,47%,11%)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      دخول لوحة التحكم
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                   onClick={() => { if (window.history.length > 1) window.history.back(); else setLocation("/"); }}
                  className="w-full py-2.5 text-gray-500 hover:text-gray-300 transition-colors text-sm cursor-pointer"
                >
                  ← العودة للمتجر
                </button>
          </form>
        </motion.div>

        <p className="text-center text-gray-600 text-xs mt-6">{settings.storeName} • جميع الحقوق محفوظة</p>
      </motion.div>
    </div>
  );
}
