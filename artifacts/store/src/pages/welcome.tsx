import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";

const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

const SHOE_ICONS = ["👠", "👞", "👟", "🥿", "👡", "🥾", "👢", "🩴"];

function FloatingShoe({ icon, style }: { icon: string; style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute text-4xl select-none pointer-events-none"
      style={style}
      animate={{
        y: [0, -18, 0],
        rotate: [0, 8, -8, 0],
        opacity: [0.12, 0.22, 0.12],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 3,
      }}
    >
      {icon}
    </motion.div>
  );
}

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const { settings } = useStoreSettings();
  const [showSubscription, setShowSubscription] = useState(false);
  const [subPlan, setSubPlan] = useState<"monthly" | "yearly">("monthly");
  const [subWallet, setSubWallet] = useState("kuraimi");
  const [subDone, setSubDone] = useState(false);
  const [colorStep, setColorStep] = useState(0);


  useEffect(() => {
    const id = setInterval(() => setColorStep(s => (s + 1) % 4), 2000);
    return () => clearInterval(id);
  }, []);

  const titleColors = [
    "hsl(43,96%,60%)",
    "hsl(280,90%,75%)",
    "hsl(180,80%,65%)",
    "hsl(10,90%,70%)",
  ];

  const handleSubscribe = () => {
    setSubDone(true);
    setTimeout(() => { setSubDone(false); setShowSubscription(false); }, 3500);
  };

  const wallets = [
    { id: "kuraimi", label: "محفظة كريمي", owner: settings.kuraimiOwner || "صاحب المحفظة", phone: settings.kuraimiPhone || settings.phone, color: "#1a6e3c", icon: "🏦" },
    { id: "jeeb", label: "محفظة جيب", owner: settings.jeebOwner || "صاحب المحفظة", phone: settings.jeebPhone || settings.phone, color: "#0066cc", icon: "💳" },
    { id: "jawali", label: "محفظة جوالي", owner: settings.jawaliOwner || "صاحب المحفظة", phone: settings.jawaliPhone || settings.phone, color: "#e63946", icon: "📱" },
  ];

  const selectedWallet = wallets.find(w => w.id === subWallet)!;
  const price = subPlan === "monthly" ? "5.99" : "49.99";

  const floatingShoes = [
    { icon: "👠", style: { top: "8%", right: "6%", fontSize: "2.5rem" } },
    { icon: "👞", style: { top: "15%", left: "5%", fontSize: "2rem" } },
    { icon: "👟", style: { top: "38%", right: "3%", fontSize: "2.2rem" } },
    { icon: "🥿", style: { bottom: "30%", left: "4%", fontSize: "1.8rem" } },
    { icon: "👡", style: { bottom: "18%", right: "7%", fontSize: "2rem" } },
    { icon: "🥾", style: { top: "60%", left: "8%", fontSize: "1.6rem" } },
    { icon: "👢", style: { top: "28%", left: "12%", fontSize: "1.5rem" } },
    { icon: "🩴", style: { bottom: "40%", right: "10%", fontSize: "1.7rem" } },
  ];

  const bg = settings.heroImageUrl
    ? `url(${settings.heroImageUrl}) center/cover no-repeat`
    : `linear-gradient(145deg, ${settings.welcomeBgColor1 || "#0a0520"} 0%, ${settings.welcomeBgColor2 || "#1a0a3d"} 40%, #0d1a3a 75%, #080415 100%)`;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      dir="rtl"
      style={{ background: bg }}
    >
      {settings.heroImageUrl && <div className="absolute inset-0 bg-black/75 z-0" />}

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-purple-600 opacity-[0.07] rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[hsl(43,96%,56%)] opacity-[0.06] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.09, 0.04] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[hsl(43,96%,56%)] rounded-full blur-3xl"
        />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f5c842' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {floatingShoes.map((s, i) => (
          <FloatingShoe key={i} icon={s.icon} style={s.style as React.CSSProperties} />
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => setLocation("/products")}
        className="fixed top-5 left-5 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer shadow-lg"
        title="الخروج"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>


      <div className="flex-1 flex flex-col items-center justify-center z-10 px-4 py-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mb-8"
          >
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.storeName} className="w-28 h-28 mx-auto rounded-3xl object-cover shadow-2xl shadow-purple-500/30 mb-6" />
            ) : (
              <div
                className="w-28 h-28 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/40 relative"
                style={{ background: "linear-gradient(135deg, hsl(43,96%,56%) 0%, hsl(280,80%,50%) 100%)" }}
              >
                <span className="text-5xl font-black text-white" style={{ fontFamily: "'Amiri', serif" }}>ح</span>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs font-black text-purple-600">™</span>
                </div>
              </div>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[hsl(43,96%,65%)] font-bold text-sm tracking-widest mb-4"
            style={{ fontFamily: "'Amiri', serif", letterSpacing: "0.15em" }}
          >
            ✦ متجر راقٍ للأحذية الفاخرة ✦
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mb-2"
          >
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight"
              style={{ fontFamily: "'Scheherazade New', 'Amiri', serif", fontWeight: 700 }}
            >
              <motion.span
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                مرحباً بكم في
              </motion.span>
            </h1>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="text-5xl md:text-6xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "'Scheherazade New', 'Amiri', serif", fontWeight: 700 }}
          >
            <motion.span
              animate={{ color: titleColors }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {settings.storeName}
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-gray-300 text-base mb-1 flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4 text-[hsl(43,96%,56%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {settings.storeAddress}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="text-lg text-gray-300 mb-10 max-w-lg mx-auto leading-relaxed"
            style={{ fontFamily: "'Scheherazade New', serif", fontSize: "1.25rem" }}
          >
            اكتشف أجود الأحذية الفاخرة لكل أفراد العائلة بأسعار مخفضة لا تصدق
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 50px rgba(245,200,66,0.55)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation("/products")}
              className="w-full max-w-xs px-10 py-4 rounded-2xl text-xl font-black shadow-2xl shadow-yellow-500/30 cursor-pointer flex items-center justify-center gap-3"
              style={{ background: "linear-gradient(135deg, hsl(43,96%,56%) 0%, hsl(280,70%,55%) 100%)", color: "white" }}
              data-testid="button-enter-store"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              تسوق الان
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(168,85,247,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation("/admin-login")}
              className="w-full max-w-xs px-10 py-3.5 rounded-2xl text-base font-bold cursor-pointer flex items-center justify-center gap-3 relative overflow-hidden"
              style={{
                background: "transparent",
                border: "2px solid transparent",
                backgroundImage: "linear-gradient(#0a0520, #0a0520), linear-gradient(135deg, hsl(43,96%,56%), hsl(280,80%,60%), hsl(180,80%,55%))",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                color: "hsl(43,96%,70%)",
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>دخول لوحة المدير</span>
              <motion.span
                className="absolute inset-0 rounded-2xl"
                animate={{ opacity: [0, 0.08, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ background: "linear-gradient(135deg, hsl(43,96%,56%), hsl(280,80%,60%))" }}
              />
            </motion.button>

            <div className="flex gap-3 flex-wrap justify-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowSubscription(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold border border-[hsl(43,96%,56%)]/35 text-[hsl(43,96%,65%)] hover:bg-[hsl(43,96%,56%)]/10 transition-all cursor-pointer flex items-center gap-2 backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                العضوية المميزة
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLocation("/contact")}
                className="px-5 py-2.5 rounded-xl text-sm font-bold border border-purple-400/35 text-purple-300 hover:bg-purple-400/10 transition-all cursor-pointer flex items-center gap-2 backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                تواصل معنا
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 flex justify-center gap-10 text-center"
          >
            {[
              { num: "50+", label: "منتج فاخر", icon: "👟" },
              { num: "4", label: "فئات متنوعة", icon: "🏷️" },
              { num: "100%", label: "جودة مضمونة", icon: "⭐" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                className="flex flex-col items-center"
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <p className="text-2xl font-black text-[hsl(43,96%,60%)]">{item.num}</p>
                <p className="text-gray-400 text-xs mt-1">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-3 px-4 py-3 backdrop-blur-xl border-t border-white/10"
        style={{ background: "rgba(10,5,32,0.85)" }}>
        <a
          href={`https://wa.me/${settings.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm cursor-pointer shadow-lg active:scale-95 transition-transform"
          style={{ background: "#25D366" }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white"><path d={WA_PATH} /></svg>
          <span>واتساب</span>
        </a>
        <a
          href={`tel:+${settings.whatsapp}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm cursor-pointer border border-white/20 bg-white/10 hover:bg-white/15 shadow-lg active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>اتصال</span>
        </a>
        <span className="text-gray-500 text-xs hidden sm:block">{settings.phone}</span>
        <p className="text-gray-600 text-xs hidden md:block mr-auto">{settings.copyright}</p>
      </div>

      <AnimatePresence>
        {showSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setShowSubscription(false); }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              className="rounded-3xl p-7 max-w-md w-full shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]"
              style={{ background: "linear-gradient(145deg, #0e0a28 0%, #1a0a3d 100%)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-[hsl(43,96%,60%)]" style={{ fontFamily: "'Scheherazade New', serif" }}>
                  ✦ العضوية المميزة ✦
                </h2>
                <button onClick={() => setShowSubscription(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!subDone ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { id: "monthly" as const, label: "شهري", price: "5.99", per: "/ شهر", badge: "" },
                      { id: "yearly" as const, label: "سنوي", price: "49.99", per: "/ سنة", badge: "وفر 30%" },
                    ].map(plan => (
                      <motion.button
                        key={plan.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSubPlan(plan.id)}
                        className={`relative p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          subPlan === plan.id ? "border-[hsl(43,96%,56%)] bg-[hsl(43,96%,56%)]/10" : "border-white/10 bg-white/5 hover:border-white/25"
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute -top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{plan.badge}</span>
                        )}
                        <p className="text-white font-bold text-lg">{plan.label}</p>
                        <p className="text-[hsl(43,96%,60%)] font-black text-2xl">${plan.price}</p>
                        <p className="text-gray-400 text-xs">{plan.per}</p>
                      </motion.button>
                    ))}
                  </div>

                  <p className="text-gray-400 text-sm mb-3 font-medium">اختر طريقة الدفع:</p>
                  <div className="space-y-2.5 mb-5">
                    {wallets.map(w => (
                      <motion.button
                        key={w.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSubWallet(w.id)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                          subWallet === w.id ? "border-[hsl(43,96%,56%)] bg-[hsl(43,96%,56%)]/10" : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-md flex-shrink-0" style={{ background: w.color }}>
                          {w.icon}
                        </div>
                        <div className="text-right flex-1 min-w-0">
                          <p className="text-white font-bold text-sm">{w.label}</p>
                          {w.owner && <p className="text-gray-400 text-xs">{w.owner}</p>}
                          {w.phone && <p className="text-[hsl(43,96%,60%)] text-xs font-medium">{w.phone}</p>}
                        </div>
                        {subWallet === w.id && (
                          <div className="w-5 h-5 rounded-full bg-[hsl(43,96%,56%)] flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-[hsl(222,47%,11%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 mb-5 border border-white/10">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>الخطة: {subPlan === "monthly" ? "الشهرية" : "السنوية"}</span>
                      <span>{selectedWallet.label}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black text-white">
                      <span>المبلغ:</span>
                      <span className="text-[hsl(43,96%,60%)]">${price} USD</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">يرجى تحويل المبلغ إلى: {selectedWallet.phone}</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubscribe}
                    className="w-full py-4 rounded-2xl font-black text-lg text-white cursor-pointer shadow-xl"
                    style={{ background: "linear-gradient(135deg, hsl(43,96%,56%), hsl(280,70%,50%))" }}
                  >
                    تأكيد الاشتراك
                  </motion.button>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-10"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-5"
                  >
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Scheherazade New', serif" }}>
                    انتظر طلبك تحت المعالجة
                  </h3>
                  <p className="text-gray-400 text-sm">سيتم التواصل معك قريباً لتأكيد اشتراكك</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
