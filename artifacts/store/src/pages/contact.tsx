import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";
import { useToast } from "@/hooks/use-toast";

const WA_SVG = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

export default function ContactPage() {
  const [, setLocation] = useLocation();
  const { settings } = useStoreSettings();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [problem, setProblem] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/contact/report", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, problem }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر إرسال البلاغ");
      setSubmitted(true);
    } catch (error) {
      setSubmitted(false);
      toast({
        title: "تعذر إرسال البلاغ",
        description: error instanceof Error ? error.message : "حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.replaceState(null, "", "/");
    setLocation("/");
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      dir="rtl"
      style={{ background: `linear-gradient(145deg, ${settings.welcomeBgColor1 || "#0a0520"} 0%, ${settings.welcomeBgColor2 || "#1a0a3d"} 50%, #080c18 100%)` }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 opacity-[0.07] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500 opacity-[0.05] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 py-4 border-b border-white/10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors cursor-pointer border border-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          رجوع
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-[hsl(43,96%,56%)]" style={{ fontFamily: "'Scheherazade New', serif" }}>
            تواصل معنا
          </h1>
          <p className="text-xs text-gray-400">{settings.storeName}</p>
        </div>
        <div className="w-20" />
      </header>

      <div className="flex-1 relative z-10 max-w-xl mx-auto w-full px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "'Scheherazade New', serif" }}>
            <span className="text-2xl">📞</span>
            معلومات التواصل
          </h2>

          <div className="space-y-3">
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer active:scale-95 transition-all"
              style={{ background: "#25D36615", border: "1px solid #25D36640" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: "#25D366" }}>
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white"><path d={WA_SVG} /></svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">واتساب</p>
                <p className="text-green-400 text-sm font-medium" dir="ltr">+{settings.whatsapp}</p>
                <p className="text-gray-400 text-xs mt-0.5">اضغط للتواصل مباشرة</p>
              </div>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <a
              href={`tel:+${settings.whatsapp}`}
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer active:scale-95 transition-all bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(222,47%,30%), hsl(222,47%,50%))" }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">اتصال هاتفي</p>
                <p className="text-[hsl(43,96%,60%)] text-sm font-medium" dir="ltr">+{settings.whatsapp}</p>
                <p className="text-gray-400 text-xs mt-0.5">اضغط للاتصال المباشر</p>
              </div>
            </a>

            {settings.storeAddress && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(43,96%,40%), hsl(43,96%,60%))" }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">العنوان</p>
                  <p className="text-gray-300 text-sm">{settings.storeAddress}</p>
                </div>
              </div>
            )}

            {settings.email && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">البريد الإلكتروني</p>
                  <p className="text-purple-300 text-sm" dir="ltr">{settings.email}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2" style={{ fontFamily: "'Scheherazade New', serif" }}>
            <span className="text-2xl">🛠️</span>
            أبلغ عن مشكلة
          </h2>
          <p className="text-gray-400 text-sm mb-5">اشرح لنا المشكلة وسنتواصل معك في أقرب وقت</p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">تم إرسال بلاغك</h3>
                <p className="text-gray-400 text-sm mb-5">سيتم مراجعة مشكلتك والتواصل معك قريباً</p>
                <button
                  onClick={() => { setSubmitted(false); setName(""); setPhone(""); setProblem(""); }}
                  className="px-6 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors cursor-pointer"
                >
                  إرسال بلاغ آخر
                </button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleReport}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">اسمك (اختياري)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="أدخل اسمك"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-gray-500 outline-none focus:border-[hsl(43,96%,56%)]/50 focus:ring-1 focus:ring-[hsl(43,96%,56%)]/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">رقم الهاتف (اختياري)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="رقم للتواصل"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-gray-500 outline-none focus:border-[hsl(43,96%,56%)]/50 focus:ring-1 focus:ring-[hsl(43,96%,56%)]/30 transition-colors"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">وصف المشكلة *</label>
                  <textarea
                    value={problem}
                    onChange={e => setProblem(e.target.value)}
                    required
                    rows={4}
                    placeholder="اشرح المشكلة التي تواجهها بالتفصيل..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-gray-500 outline-none focus:border-[hsl(43,96%,56%)]/50 focus:ring-1 focus:ring-[hsl(43,96%,56%)]/30 transition-colors resize-none"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading || !problem.trim()}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-bold text-[hsl(222,47%,11%)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xl"
                  style={{ background: "linear-gradient(135deg, hsl(43,96%,56%), hsl(43,96%,45%))" }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[hsl(222,47%,11%)] border-t-transparent rounded-full animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      إرسال البلاغ
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <a
          href={`https://wa.me/${settings.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer z-50"
          style={{ background: "#25D366" }}
        >
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white"><path d={WA_SVG} /></svg>
        </a>
      </div>
    </div>
  );
}
