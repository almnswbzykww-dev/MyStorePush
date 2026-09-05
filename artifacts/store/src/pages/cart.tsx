import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateOrder } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from "lucide-react";

const currencies = [
  { value: "USD", label: "دولار امريكي", symbol: "$", flag: "🇺🇸" },
  { value: "SAR", label: "ريال سعودي", symbol: "ر.س", flag: "🇸🇦" },
  { value: "YER", label: "ريال يمني", symbol: "ر.ي", flag: "🇾🇪" },
];

const exchangeRates: Record<string, number> = {
  USD: 1,
  SAR: 3.75,
  YER: 250,
};

export default function CartPage() {
  const [, setLocation] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings } = useStoreSettings();
  const createOrder = useCreateOrder();

  const [currency, setCurrency] = useState("USD");
  const [paymentMethod, setPaymentMethod] = useState("kuraimi");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderDone, setOrderDone] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [showEmailSuggest, setShowEmailSuggest] = useState(false);

  const rate = exchangeRates[currency] || 1;
  const currencyInfo = currencies.find(c => c.value === currency)!;
  const convertedTotal = totalPrice * rate;

  const paymentMethods = [
    { value: "kuraimi", label: "محفظة كريمي", icon: "🏦", color: "#1a6e3c", owner: settings.kuraimiOwner, phone: settings.kuraimiPhone || settings.phone },
    { value: "jeebpay", label: "محفظة جيب", icon: "💳", color: "#0066cc", owner: settings.jeebOwner, phone: settings.jeebPhone || settings.phone },
    { value: "jawali", label: "محفظة جوالي", icon: "📱", color: "#e63946", owner: settings.jawaliOwner, phone: settings.jawaliPhone || settings.phone },
    { value: "cod", label: "الدفع عند الاستلام", icon: "💵", color: "#f59e0b", owner: "", phone: "" },
  ];

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else setLocation("/products");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "السلة فارغة", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      {
        data: {
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          currency,
          paymentMethod,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      {
        onSuccess: (order: any) => {
          clearCart();
          setCreatedOrderId(order?.id ?? null);
          setOrderDone(true);
        },
        onError: () => {
          toast({ title: "حدث خطأ أثناء تقديم الطلب", variant: "destructive" });
        },
      }
    );
  };

  if (orderDone) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" dir="rtl"
        style={{ background: "linear-gradient(135deg, #050d1a 0%, #0d1f3c 35%, #1a2d4f 65%)" }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="text-center max-w-sm w-full"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-28 h-28 mx-auto rounded-full bg-[hsl(43,96%,56%)]/20 border-4 border-[hsl(43,96%,56%)] flex items-center justify-center mb-6 shadow-2xl shadow-yellow-500/30"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <svg className="w-12 h-12 text-[hsl(43,96%,56%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
          </motion.div>
          <h2 className="text-3xl font-black text-[hsl(43,96%,56%)] mb-2" style={{ fontFamily: "'Scheherazade New', serif" }}>
            طلبك تحت المعالجة
          </h2>
          <p className="text-white text-xl font-bold mb-2">يرجى الانتظار</p>
          <p className="text-gray-300 mb-8">سيتم التواصل معك قريباً لتأكيد طلبك وترتيب التوصيل</p>
           {createdOrderId && (
             <p className="text-yellow-300 font-bold mb-5">رقم طلبك: #{createdOrderId}</p>
           )}
          <div className="flex flex-col gap-3">
             {createdOrderId && (
               <button onClick={() => setLocation(`/invoice/${createdOrderId}`)} className="px-8 py-3.5 rounded-2xl font-black text-lg text-[hsl(222,47%,11%)] cursor-pointer shadow-xl bg-white">
                 عرض الفاتورة وإعادة طباعتها
               </button>
             )}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setLocation("/products")}
              className="px-8 py-3.5 rounded-2xl font-black text-lg text-[hsl(222,47%,11%)] cursor-pointer shadow-xl"
              style={{ background: "linear-gradient(135deg, hsl(43,96%,56%), hsl(43,96%,45%))" }}
            >
              متابعة التسوق
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.02 }}
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              className="px-8 py-3 rounded-2xl font-bold text-white cursor-pointer flex items-center justify-center gap-2"
              style={{ background: "#25D366" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              تواصل مع المتجر
            </motion.a>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4" dir="rtl">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">السلة فارغة</h2>
          <p className="text-gray-500 mb-6">لم تقم باضافة اي منتجات بعد</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products" className="bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)] px-8 py-3 rounded-xl font-bold inline-block text-center">
              تصفح المنتجات
            </Link>
            <button onClick={goBack} className="border border-gray-300 text-gray-600 px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-gray-50 transition-colors">
              رجوع
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <header className="bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(222,47%,18%)] text-white py-4 px-4 shadow-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-sm font-medium border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">رجوع</span>
          </button>

          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="w-9 h-9 bg-[hsl(43,96%,56%)] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-[hsl(222,47%,11%)]" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-[hsl(43,96%,56%)]">سلة التسوق</h1>
              <p className="text-xs text-gray-400">{items.length} منتج في السلة</p>
            </div>
          </div>

          <Link href="/products" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-sm font-medium whitespace-nowrap">
            <span className="hidden sm:inline">متابعة التسوق</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5">
        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-3">
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-center shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                  data-testid={`cart-item-${item.productId}`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.nameAr}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 truncate text-sm sm:text-base">{item.nameAr}</h3>
                    <p className="text-[hsl(222,47%,20%)] font-bold text-base sm:text-lg">${item.price}</p>
                    <p className="text-gray-400 text-xs">المجموع: ${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all cursor-pointer"
                        data-testid={`button-decrease-${item.productId}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-black text-gray-900 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[hsl(43,96%,56%)] flex items-center justify-center hover:brightness-110 active:scale-90 transition-all cursor-pointer"
                        data-testid={`button-increase-${item.productId}`}
                      >
                        <Plus className="w-3 h-3 text-[hsl(222,47%,11%)]" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer transition-colors"
                      data-testid={`button-remove-${item.productId}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(222,47%,18%)] rounded-2xl p-4 sm:p-5 text-white">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">عدد المنتجات</span>
                <span className="font-bold">{items.reduce((a, b) => a + b.quantity, 0)} قطعة</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-300 text-sm">المجموع الكلي</span>
                <span className="text-[hsl(43,96%,56%)] font-black text-xl">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-gray-100">
                <h2 className="text-base sm:text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[hsl(43,96%,56%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  بيانات الطلب
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">الاسم الكامل *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[hsl(43,96%,56%)] focus:border-transparent outline-none text-sm bg-gray-50 focus:bg-white transition-colors"
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">رقم الهاتف *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[hsl(43,96%,56%)] focus:border-transparent outline-none text-sm bg-gray-50 focus:bg-white transition-colors"
                      data-testid="input-customer-phone"
                      dir="ltr"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-600 mb-1">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => { setCustomerEmail(e.target.value); setShowEmailSuggest(false); }}
                      onFocus={() => setShowEmailSuggest(true)}
                      onBlur={() => setTimeout(() => setShowEmailSuggest(false), 150)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[hsl(43,96%,56%)] focus:border-transparent outline-none text-sm bg-gray-50 focus:bg-white transition-colors"
                      data-testid="input-customer-email"
                      dir="ltr"
                    />
                    <AnimatePresence>
                      {showEmailSuggest && settings.email && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                        >
                          <button
                            type="button"
                            onMouseDown={() => { setCustomerEmail(settings.email); setShowEmailSuggest(false); }}
                            className="w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-[hsl(222,47%,20%)] flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-[hsl(43,96%,56%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700" dir="ltr">{settings.email}</span>
                          </button>
                          {user?.email && user.email !== settings.email && (
                            <button
                              type="button"
                              onMouseDown={() => { setCustomerEmail(user.email); setShowEmailSuggest(false); }}
                              className="w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3 border-t border-gray-100"
                            >
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-700" dir="ltr">{user.email}</span>
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">العنوان *</label>
                    <textarea
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      required
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[hsl(43,96%,56%)] focus:border-transparent outline-none resize-none text-sm bg-gray-50 focus:bg-white transition-colors"
                      data-testid="input-customer-address"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-gray-100">
                <h2 className="text-base sm:text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[hsl(43,96%,56%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  العملة
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {currencies.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCurrency(c.value)}
                      className={`flex flex-col items-center p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
                        currency === c.value ? "border-[hsl(43,96%,56%)] bg-[hsl(43,96%,56%)]/10" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl mb-1">{c.flag}</span>
                      <span className="text-xs font-bold text-gray-700">{c.value}</span>
                      <span className="text-xs text-gray-500">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-gray-100">
                <h2 className="text-base sm:text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[hsl(43,96%,56%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  طريقة الدفع
                </h2>
                <div className="space-y-2">
                  {paymentMethods.map(pm => (
                    <label
                      key={pm.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === pm.value ? "border-[hsl(43,96%,56%)] bg-[hsl(43,96%,56%)]/8" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.value}
                        checked={paymentMethod === pm.value}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="hidden"
                        data-testid={`radio-payment-${pm.value}`}
                      />
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm flex-shrink-0" style={{ background: pm.color + "20", border: `2px solid ${pm.color}30` }}>
                        {pm.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{pm.label}</p>
                        {pm.owner && <p className="text-gray-500 text-xs truncate">{pm.owner}</p>}
                        {pm.phone && <p className="text-xs font-medium truncate" style={{ color: pm.color }}>{pm.phone}</p>}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === pm.value ? "border-[hsl(43,96%,56%)] bg-[hsl(43,96%,56%)]" : "border-gray-300"}`}>
                        {paymentMethod === pm.value && <div className="w-2 h-2 rounded-full bg-[hsl(222,47%,11%)]" />}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(222,47%,18%)] rounded-2xl p-4 sm:p-5 shadow-xl">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>المجموع (بالدولار)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-white mb-4">
                  <span>المجموع الكلي</span>
                  <span className="text-[hsl(43,96%,56%)]">{currencyInfo.symbol} {convertedTotal.toFixed(2)}</span>
                </div>
                <motion.button
                  type="submit"
                  disabled={createOrder.isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[hsl(43,96%,56%)] text-[hsl(222,47%,11%)] py-4 rounded-xl font-black text-lg hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2"
                  data-testid="button-checkout"
                >
                  {createOrder.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[hsl(222,47%,11%)] border-t-transparent rounded-full animate-spin" />
                      جاري تقديم الطلب...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      اتمام الطلب
                    </>
                  )}
                </motion.button>
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full mt-2 py-3 rounded-xl font-bold text-gray-300 hover:text-white border border-white/10 hover:bg-white/10 transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  رجوع إلى التسوق
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
