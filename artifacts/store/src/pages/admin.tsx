import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";
import {
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListOrders, useUpdateOrderStatus, useListCustomers,
  useGetDashboardStats, useGetRecentOrders,
  getListProductsQueryKey, getListOrdersQueryKey, getListCustomersQueryKey,
  getGetDashboardStatsQueryKey, getGetRecentOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, FileText, Users, Truck,
  Calculator, Megaphone, Settings, Plus, Pencil, Trash2, LogOut, X, Eye,
  Phone, MapPin, Store, Globe, Save, Info, Bell, Search, Image, Upload,
  UserPlus, MessageCircle, Printer, ChevronDown, ChevronRight, BarChart2,
  CheckCircle, XCircle, Clock, Home, Menu, Wallet, RefreshCw, Heart, Bookmark,
  TrendingUp, ShoppingCart, DollarSign, Star,
} from "lucide-react";

type Section =
  | "dashboard" | "products" | "orders" | "invoices"
  | "customers" | "delivery" | "accounting" | "marketing"
  | "settings" | "reports" | "notifications" | "users" | "pages";

const sidebarItems: { key: Section; label: string; icon: any; color: string }[] = [
  { key: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, color: "text-blue-400" },
  { key: "products", label: "المنتجات", icon: Package, color: "text-purple-400" },
  { key: "orders", label: "الطلبات", icon: ShoppingBag, color: "text-green-400" },
  { key: "invoices", label: "الفواتير", icon: FileText, color: "text-yellow-400" },
  { key: "customers", label: "العملاء", icon: Users, color: "text-pink-400" },
  { key: "users", label: "إدارة المستخدمين", icon: UserPlus, color: "text-teal-400" },
  { key: "delivery", label: "التوصيل", icon: Truck, color: "text-cyan-400" },
  { key: "accounting", label: "المحاسبة", icon: Calculator, color: "text-orange-400" },
  { key: "reports", label: "التقارير", icon: BarChart2, color: "text-indigo-400" },
  { key: "marketing", label: "التسويق", icon: Megaphone, color: "text-rose-400" },
  { key: "pages", label: "الصفحات المخصصة", icon: Globe, color: "text-lime-400" },
  { key: "notifications", label: "الإشعارات", icon: Bell, color: "text-amber-400" },
  { key: "settings", label: "الإعدادات", icon: Settings, color: "text-gray-400" },
];

function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const reload = () => {
    try {
      const n = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
      setNotifications(n);
    } catch {}
  };

  useEffect(() => {
    reload();
    const id = setInterval(reload, 3000);
    return () => clearInterval(id);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const n = notifications.map(item => ({ ...item, read: true }));
    localStorage.setItem("admin_notifications", JSON.stringify(n));
    setNotifications(n);
  };

  const clear = () => {
    localStorage.setItem("admin_notifications", "[]");
    setNotifications([]);
  };

  return { notifications, unreadCount, markAllRead, clear, reload };
}

export default function AdminPage() {
  const { user, isAdmin, isLoading, logoutFn } = useAuth();
  const { settings } = useStoreSettings();
  const [, setLocation] = useLocation();
  const [section, setSection] = useState<Section>("dashboard");
  const [showSidebar, setShowSidebar] = useState(false);
  const { notifications, unreadCount } = useNotifications();

  const navigateTo = (s: Section) => {
    setSection(s);
    setShowSidebar(false);
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation("/admin-login");
    }
  }, [isLoading, isAdmin, setLocation]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(145deg, #0a0520, #1a0a3d)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[hsl(43,96%,56%)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[hsl(43,96%,56%)] font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-64 bg-[hsl(222,47%,8%)] text-white transform transition-transform duration-300 lg:translate-x-0 ${showSidebar ? "translate-x-0" : "translate-x-full lg:translate-x-0"} flex flex-col shadow-2xl`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[hsl(43,96%,56%)] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-black text-[hsl(222,47%,11%)]">ح</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-[hsl(43,96%,56%)] text-sm truncate">لوحة التحكم</h2>
              <p className="text-xs text-gray-400 truncate">{user?.name}</p>
            </div>
            <button onClick={() => setShowSidebar(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 cursor-pointer text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <motion.button
              key={item.key}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer relative ${
                section === item.key
                  ? "bg-[hsl(43,96%,56%)] text-[hsl(222,47%,11%)]"
                  : "text-gray-300 hover:bg-white/8"
              }`}
              data-testid={`sidebar-${item.key}`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${section === item.key ? "text-[hsl(222,47%,11%)]" : item.color}`} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.key === "notifications" && unreadCount > 0 && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={() => navigateTo("dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 transition-colors cursor-pointer text-sm"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span>لوحة التحكم</span>
          </button>
          <button
            onClick={() => { window.history.replaceState(null, "", "/products"); setLocation("/products"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 transition-colors cursor-pointer text-sm"
          >
            <ShoppingBag className="w-4 h-4 text-green-400" />
            <span>عرض المتجر</span>
          </button>
          <button
            onClick={() => { window.history.replaceState(null, "", "/"); setLocation("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 transition-colors cursor-pointer text-sm"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span>الصفحة الرئيسية</span>
          </button>
          <button
            onClick={() => { logoutFn(); setLocation("/admin-login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen overflow-hidden flex flex-col">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {sidebarItems.find(i => i.key === section)?.label}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">متجر الحكيمي للتخفيضات</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo("notifications")}
              className="relative p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigateTo("dashboard")}
              className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              title="لوحة التحكم"
            >
              <LayoutDashboard className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {section === "dashboard" && <DashboardSection navigateTo={navigateTo} />}
              {section === "products" && <ProductsSection />}
              {section === "orders" && <OrdersSection />}
              {section === "invoices" && <InvoicesSection />}
              {section === "customers" && <CustomersSection />}
              {section === "delivery" && <DeliverySection />}
              {section === "accounting" && <AccountingSection />}
              {section === "reports" && <ReportsSection />}
              {section === "marketing" && <MarketingSection />}
              {section === "notifications" && <NotificationsSection />}
              {section === "users" && <UsersSection />}
              {section === "pages" && <PagesSection />}
              {section === "settings" && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DashboardSection({ navigateTo }: { navigateTo: (s: Section) => void }) {
  const { data: stats, isLoading } = useGetDashboardStats();
  const { data: recentOrders } = useGetRecentOrders();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const s = stats as any;

  const statCards = [
    {
      label: "اجمالي المنتجات",
      value: s?.totalProducts || 0,
      icon: Package,
      gradient: "from-purple-500 to-purple-700",
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
      section: "products" as Section,
    },
    {
      label: "اجمالي الطلبات",
      value: s?.totalOrders || 0,
      icon: ShoppingBag,
      gradient: "from-green-500 to-green-700",
      bg: "bg-green-50",
      iconColor: "text-green-600",
      section: "orders" as Section,
    },
    {
      label: "اجمالي العملاء",
      value: s?.totalCustomers || 0,
      icon: Users,
      gradient: "from-pink-500 to-pink-700",
      bg: "bg-pink-50",
      iconColor: "text-pink-600",
      section: "customers" as Section,
    },
    {
      label: "الإيرادات",
      value: `$${(s?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-yellow-500 to-yellow-700",
      bg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      section: "accounting" as Section,
    },
    {
      label: "طلبات معلقة",
      value: s?.pendingOrders || 0,
      icon: Clock,
      gradient: "from-orange-500 to-orange-700",
      bg: "bg-orange-50",
      iconColor: "text-orange-600",
      section: "orders" as Section,
    },
    {
      label: "إشعارات جديدة",
      value: unreadCount,
      icon: Bell,
      gradient: "from-red-500 to-red-700",
      bg: "bg-red-50",
      iconColor: "text-red-600",
      section: "notifications" as Section,
    },
    {
      label: "زوار المتجر",
      value: parseInt(typeof window !== "undefined" ? (localStorage.getItem("page_views") || "0") : "0"),
      icon: Eye,
      gradient: "from-blue-500 to-blue-700",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      section: "marketing" as Section,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo(card.section)}
            className={`${card.bg} rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-all cursor-pointer text-right`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-black text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-500" />
            آخر الطلبات
          </h3>
          <div className="space-y-2">
            {(recentOrders as any[])?.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-bold text-gray-900 text-sm">#{order.id} - {order.customerName}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("ar")}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">${order.totalAmount?.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    order.status === "completed" ? "bg-green-100 text-green-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {order.status === "pending" ? "معلق" : order.status === "completed" ? "مكتمل" : order.status === "delivered" ? "موصّل" : order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            روابط سريعة
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "إضافة منتج", icon: Plus, color: "bg-purple-500", section: "products" as Section },
              { label: "الطلبات", icon: ShoppingBag, color: "bg-green-500", section: "orders" as Section },
              { label: "الفواتير", icon: FileText, color: "bg-yellow-500", section: "invoices" as Section },
              { label: "الإعدادات", icon: Settings, color: "bg-gray-500", section: "settings" as Section },
            ].map((item, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigateTo(item.section)}
                className={`${item.color} text-white p-4 rounded-2xl flex flex-col items-center gap-2 cursor-pointer shadow-md`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-sm font-bold">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: products, isLoading } = useListProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", nameAr: "", description: "", descriptionAr: "",
    price: "", originalPrice: "", category: "men", imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [nameLang, setNameLang] = useState<"ar" | "en">("ar");
  const [descLang, setDescLang] = useState<"ar" | "en">("ar");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setForm({ name: "", nameAr: "", description: "", descriptionAr: "", price: "", originalPrice: "", category: "men", imageUrl: "" });
    setEditingProduct(null);
    setShowForm(false);
    setImagePreview("");
  };

  const handleEdit = (product: any) => {
    setForm({
      name: product.name, nameAr: product.nameAr,
      description: product.description, descriptionAr: product.descriptionAr,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      category: product.category, imageUrl: product.imageUrl,
    });
    setEditingProduct(product);
    setShowForm(true);
    setImagePreview(product.imageUrl);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setForm(f => ({ ...f, imageUrl: url }));
      setImagePreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name, nameAr: form.nameAr,
      description: form.description, descriptionAr: form.descriptionAr,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      category: form.category, imageUrl: form.imageUrl,
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "تم تحديث المنتج بنجاح" });
          resetForm();
        },
      });
    } else {
      createProduct.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "تم اضافة المنتج بنجاح" });
          resetForm();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteProduct.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "تم حذف المنتج" });
      },
    });
  };

  const { settings: storeSettings } = useStoreSettings();
  const [activeCat, setActiveCat] = useState<"all" | "men" | "women" | "youth" | "parents">("all");

  const catLabel = (c: string) =>
    c === "men" ? (storeSettings.catNameMen || "رجالي")
    : c === "women" ? (storeSettings.catNameWomen || "نسائي")
    : c === "youth" ? (storeSettings.catNameYouth || "شبابي")
    : (storeSettings.catNameChildren || "والدي");

  const categoryTabs = [
    { key: "all" as const, label: storeSettings.catNameAll || "الكل", icon: "✨" },
    { key: "men" as const, label: storeSettings.catNameMen || "رجالي", icon: storeSettings.catIconMen || "👞" },
    { key: "women" as const, label: storeSettings.catNameWomen || "نسائي", icon: storeSettings.catIconWomen || "👠" },
    { key: "youth" as const, label: storeSettings.catNameYouth || "شبابي", icon: storeSettings.catIconYouth || "👟" },
    { key: "parents" as const, label: storeSettings.catNameChildren || "والدي", icon: storeSettings.catIconChildren || "🧸" },
  ];

  const visibleProducts = activeCat === "all"
    ? (products as any[]) ?? []
    : ((products as any[]) ?? []).filter((p: any) => p.category === activeCat);

  const handleAddInCat = () => {
    resetForm();
    if (activeCat !== "all") setForm(f => ({ ...f, category: activeCat }));
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {categoryTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveCat(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                activeCat === tab.key
                  ? "bg-[hsl(222,47%,11%)] text-[hsl(43,96%,56%)] border-[hsl(43,96%,56%)]/30 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeCat === tab.key ? "bg-[hsl(43,96%,56%)] text-[hsl(222,47%,11%)]" : "bg-gray-100 text-gray-500"
              }`}>
                {tab.key === "all" ? ((products as any[])?.length || 0) : ((products as any[]) ?? []).filter((p: any) => p.category === tab.key).length}
              </span>
            </button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAddInCat}
          className="flex items-center gap-2 bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(43,96%,48%)] text-[hsl(222,47%,11%)] px-5 py-2.5 rounded-xl font-bold cursor-pointer shadow-md flex-shrink-0"
          data-testid="button-add-product"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج {activeCat !== "all" ? `(${categoryTabs.find(t => t.key === activeCat)?.label})` : "جديد"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? "تعديل المنتج" : "اضافة منتج جديد"}
              </h3>
              <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 cursor-pointer text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">اسم المنتج — اختياري</label>
                  <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-bold">
                    <button type="button" onClick={() => setNameLang("ar")} className={`px-3 py-1.5 cursor-pointer transition-all ${nameLang === "ar" ? "bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)]" : "bg-white text-gray-500 hover:bg-gray-50"}`}>عربي</button>
                    <button type="button" onClick={() => setNameLang("en")} className={`px-3 py-1.5 cursor-pointer transition-all ${nameLang === "en" ? "bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)]" : "bg-white text-gray-500 hover:bg-gray-50"}`}>English</button>
                  </div>
                </div>
                <input
                  type="text"
                  value={nameLang === "ar" ? form.nameAr : form.name}
                  onChange={e => setForm(f => nameLang === "ar" ? { ...f, nameAr: e.target.value } : { ...f, name: e.target.value })}
                  placeholder={nameLang === "ar" ? "مثال: حذاء رياضي أنيق" : "e.g. Elegant Sports Shoe"}
                  dir={nameLang === "ar" ? "rtl" : "ltr"}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50 focus:bg-white transition-colors"
                />
                {(form.nameAr || form.name) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {form.nameAr && <span className="ml-3">عربي: {form.nameAr}</span>}
                    {form.name && <span>English: {form.name}</span>}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">وصف المنتج — اختياري</label>
                  <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-bold">
                    <button type="button" onClick={() => setDescLang("ar")} className={`px-3 py-1.5 cursor-pointer transition-all ${descLang === "ar" ? "bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)]" : "bg-white text-gray-500 hover:bg-gray-50"}`}>عربي</button>
                    <button type="button" onClick={() => setDescLang("en")} className={`px-3 py-1.5 cursor-pointer transition-all ${descLang === "en" ? "bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)]" : "bg-white text-gray-500 hover:bg-gray-50"}`}>English</button>
                  </div>
                </div>
                <input
                  type="text"
                  value={descLang === "ar" ? form.descriptionAr : form.description}
                  onChange={e => setForm(f => descLang === "ar" ? { ...f, descriptionAr: e.target.value } : { ...f, description: e.target.value })}
                  placeholder={descLang === "ar" ? "مثال: حذاء جلد مريح للاستخدام اليومي" : "e.g. Comfortable leather shoe for daily use"}
                  dir={descLang === "ar" ? "rtl" : "ltr"}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر المخفض ($)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  required placeholder="20.00"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] focus:border-transparent bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر الاصلي ($) - اختياري</label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.originalPrice}
                  onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                  placeholder="35.00"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] focus:border-transparent bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الفئة - اختياري</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50"
                >
                  <option value="men">رجالي</option>
                  <option value="women">نسائي</option>
                  <option value="youth">شبابي</option>
                  <option value="parents">والدي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة المنتج - اختياري</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFile}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2.5 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl font-medium cursor-pointer hover:bg-gray-100 hover:border-[hsl(43,96%,56%)] transition-all flex items-center justify-center gap-2 text-gray-500 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  اختر صورة من المعرض
                </button>
              </div>
              {imagePreview && (
                <div className="md:col-span-2">
                  <div className="relative inline-block w-full">
                    <img
                      src={imagePreview} alt="معاينة"
                      className="w-full max-h-48 object-contain rounded-xl border border-gray-200 shadow bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(""); setForm(f => ({ ...f, imageUrl: "" })); }}
                      className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="flex items-center gap-2 bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)] px-6 py-2.5 rounded-xl font-bold disabled:opacity-50 cursor-pointer hover:bg-[hsl(222,47%,25%)]"
                  data-testid="button-save-product"
                >
                  <Save className="w-4 h-4" />
                  {editingProduct ? "تحديث المنتج" : "حفظ المنتج"}
                </button>
                <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-medium cursor-pointer hover:bg-gray-300">إلغاء</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(222,47%,18%)] text-white">
                  <th className="text-right py-3 px-4 font-medium">الصورة</th>
                  <th className="text-right py-3 px-4 font-medium">المنتج</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">الفئة</th>
                  <th className="text-right py-3 px-4 font-medium">السعر</th>
                  <th className="text-right py-3 px-4 font-medium">الاجراءات</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">لا توجد منتجات في هذه الفئة</td></tr>
                )}
                {visibleProducts.map((p: any) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={p.imageUrl} alt={p.nameAr}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm"
                        onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop"; }}
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{p.nameAr}</td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 font-medium">
                        {catLabel(p.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-gray-900">${p.price}</span>
                      {p.originalPrice && <span className="text-gray-400 line-through text-xs mr-1">${p.originalPrice}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer transition-colors"
                          data-testid={`button-edit-${p.id}`}
                          title="تعديل"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                          data-testid={`button-delete-${p.id}`}
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: orders } = useListOrders();
  const updateStatus = useUpdateOrderStatus();
  const [search, setSearch] = useState("");

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        const msg = status === "delivered" ? "تم استلام الطلب" :
                    status === "shipped" ? "تم الشحن" :
                    status === "processing" ? "الطلب قيد التجهيز" :
                    status === "completed" ? "تم اكتمال الطلب" :
                    status === "cancelled" ? "تم رفض الطلب" : "تم تحديث حالة الطلب";
        toast({ title: msg });

        const notifications = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
        notifications.unshift({
          id: Date.now(),
          type: "status_update",
          message: `تحديث طلب #${id}: ${msg}`,
          orderId: id,
          time: new Date().toISOString(),
          read: false,
        });
        localStorage.setItem("admin_notifications", JSON.stringify(notifications.slice(0, 50)));
      },
    });
  };

  const filteredOrders = (orders as any[])?.filter(o =>
    !search ||
    o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    String(o.id).includes(search)
  ) || [];

  const statusLabel = (s: string) =>
    s === "pending" ? "معلق" : s === "processing" ? "قيد التجهيز" :
    s === "shipped" ? "تم الشحن" : s === "delivered" ? "تم التوصيل" :
    s === "completed" ? "مكتمل" : s === "cancelled" ? "ملغي" : s;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو رقم الطلب..."
          className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-white"
        />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(222,47%,18%)] text-white">
                {["رقم الطلب", "العميل", "المبلغ", "طريقة الدفع", "الحالة", "التاريخ", "إجراءات", "فاتورة"].map(h => (
                  <th key={h} className="text-right py-3 px-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-[hsl(222,47%,20%)]">#{order.id}</td>
                  <td className="py-3 px-3 font-medium text-gray-900">{order.customerName}</td>
                  <td className="py-3 px-3 font-black text-gray-900">${order.totalAmount?.toFixed(2)}</td>
                  <td className="py-3 px-3 text-gray-500 text-xs">
                    {order.paymentMethod === "jeebpay" ? "جيب" :
                     order.paymentMethod === "kuraimi" ? "كريمي" :
                     order.paymentMethod === "jawali" ? "جوالي" : "استلام"}
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      className={`px-2 py-1 border rounded-lg text-xs font-medium outline-none cursor-pointer ${
                        order.status === "pending" ? "border-yellow-300 bg-yellow-50 text-yellow-700" :
                        order.status === "processing" ? "border-blue-300 bg-blue-50 text-blue-700" :
                        order.status === "shipped" ? "border-cyan-300 bg-cyan-50 text-cyan-700" :
                        order.status === "delivered" ? "border-green-300 bg-green-50 text-green-700" :
                        order.status === "completed" ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                        "border-red-300 bg-red-50 text-red-700"
                      }`}
                    >
                      <option value="pending">معلق</option>
                      <option value="processing">قيد التجهيز</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </td>
                  <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("ar")}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStatusChange(order.id, "shipped")}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer transition-colors"
                        title="موافقة الشحن"
                      >
                        <Truck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, "delivered")}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer transition-colors"
                        title="تأكيد الاستلام"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, "cancelled")}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                        title="رفض الطلب"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Link
                      href={`/invoice/${order.id}`}
                      className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 inline-flex cursor-pointer"
                      title="عرض الفاتورة"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">لا توجد طلبات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InvoicesSection() {
  const { data: orders } = useListOrders();
  const [search, setSearch] = useState("");

  const filtered = (orders as any[])?.filter(o =>
    !search ||
    o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    String(o.id).includes(search) ||
    `INV-${String(o.id).padStart(6, "0")}`.includes(search)
  ) || [];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث برقم الفاتورة أو اسم العميل..."
          className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-white"
        />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(222,47%,18%)] text-white">
                {["رقم الفاتورة", "العميل", "المبلغ", "التاريخ", "الحالة", "عرض وطباعة"].map(h => (
                  <th key={h} className="text-right py-3 px-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[hsl(222,47%,20%)]">
                    INV-{String(order.id).padStart(6, "0")}
                  </td>
                  <td className="py-3 px-4 font-medium">{order.customerName}</td>
                  <td className="py-3 px-4 font-black">${order.totalAmount?.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString("ar")}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      order.status === "completed" ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {order.status === "pending" ? "معلق" : order.status === "completed" ? "مكتمل" : order.status === "delivered" ? "موصّل" : order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/invoice/${order.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        عرض
                      </Link>
                      <Link
                        href={`/invoice/${order.id}`}
                        onClick={() => setTimeout(() => window.print(), 800)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        طباعة
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">لا توجد فواتير</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomersSection() {
  const { data: customers } = useListCustomers();
  const { settings } = useStoreSettings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filtered = (customers as any[])?.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.includes(search)
  ) || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "تم إضافة العميل بنجاح" });
    setShowAddForm(false);
    setNewCustomer({ name: "", email: "", phone: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-white"
          />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(43,96%,48%)] text-[hsl(222,47%,11%)] px-4 py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          إضافة عميل جديد
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-5 shadow-md border border-gray-100"
          >
            <h3 className="font-bold mb-4">إضافة عميل جديد</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text" placeholder="الاسم الكامل" required
                value={newCustomer.name}
                onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50"
              />
              <input
                type="email" placeholder="البريد الالكتروني" required
                value={newCustomer.email}
                onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50"
              />
              <div className="flex gap-2">
                <input
                  type="tel" placeholder="رقم الهاتف"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50"
                />
                <button type="submit" className="px-4 py-2.5 bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)] rounded-xl font-bold cursor-pointer">
                  إضافة
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(222,47%,18%)] text-white">
                {["#", "الاسم", "البريد الالكتروني", "الهاتف", "تاريخ التسجيل", "تواصل"].map(h => (
                  <th key={h} className="text-right py-3 px-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-400 text-xs">{c.id}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{c.name}</td>
                  <td className="py-3 px-4 text-gray-500">{c.email}</td>
                  <td className="py-3 px-4 text-gray-500">{c.phone || "-"}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString("ar")}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {c.phone && (
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                          title="واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="اتصال"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">لا يوجد عملاء</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DeliverySection() {
  const { data: orders } = useListOrders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateStatus = useUpdateOrderStatus();

  const deliveryOrders = (orders as any[])?.filter(o =>
    ["pending", "processing", "shipped", "delivered"].includes(o.status)
  ) || [];

  const stats = [
    { label: "معلق", count: (orders as any[])?.filter(o => o.status === "pending").length || 0, color: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", icon: Clock },
    { label: "قيد التجهيز", count: (orders as any[])?.filter(o => o.status === "processing").length || 0, color: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: RefreshCw },
    { label: "تم الشحن", count: (orders as any[])?.filter(o => o.status === "shipped").length || 0, color: "bg-cyan-50 border-cyan-200", text: "text-cyan-700", icon: Truck },
    { label: "تم التوصيل", count: (orders as any[])?.filter(o => o.status === "delivered").length || 0, color: "bg-green-50 border-green-200", text: "text-green-700", icon: CheckCircle },
  ];

  const handleAction = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        const msg = status === "shipped" ? "تمت موافقة الشحن" :
                    status === "delivered" ? "تم تأكيد الاستلام" : "تم رفض الطلب";
        toast({ title: msg });
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className={`p-5 rounded-2xl border-2 ${s.color}`}
          >
            <div className={`w-10 h-10 rounded-xl ${s.color} border ${s.color.replace("50", "200")} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.text}`} />
            </div>
            <p className={`text-2xl font-black ${s.text}`}>{s.count}</p>
            <p className={`text-sm ${s.text}`}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-cyan-500" />
          طلبات قيد التوصيل
        </h3>
        {deliveryOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">لا توجد طلبات قيد التوصيل</p>
        ) : (
          <div className="space-y-3">
            {deliveryOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900">#{order.id} - {order.customerName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.customerPhone} | ${order.totalAmount?.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    order.status === "processing" ? "bg-blue-100 text-blue-700" :
                    order.status === "shipped" ? "bg-cyan-100 text-cyan-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {order.status === "pending" ? "معلق" : order.status === "processing" ? "قيد التجهيز" :
                     order.status === "shipped" ? "تم الشحن" : "تم التوصيل"}
                  </span>
                  <div className="flex flex-col sm:flex-row gap-1.5 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleAction(order.id, "processing")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer text-xs font-bold shadow-sm transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      وافق على الطلب
                    </button>
                    <button
                      onClick={() => handleAction(order.id, "delivered")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 cursor-pointer text-xs font-bold shadow-sm transition-all"
                    >
                      <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                      تم التوصيل
                    </button>
                    <button
                      onClick={() => handleAction(order.id, "cancelled")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 cursor-pointer text-xs font-bold shadow-sm transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      إلغاء الطلب
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AccountingSection() {
  const { data: stats } = useGetDashboardStats();
  const { data: orders } = useListOrders();
  const s = stats as any;

  const paymentStats = {
    kuraimi: (orders as any[])?.filter(o => o.paymentMethod === "kuraimi").length || 0,
    jeebpay: (orders as any[])?.filter(o => o.paymentMethod === "jeebpay").length || 0,
    jawali: (orders as any[])?.filter(o => o.paymentMethod === "jawali").length || 0,
    cod: (orders as any[])?.filter(o => o.paymentMethod === "cod").length || 0,
  };
  const total = Object.values(paymentStats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "اجمالي الايرادات", value: `$${(s?.totalRevenue || 0).toFixed(2)}`, sub: `${((s?.totalRevenue || 0) * 3.75).toFixed(0)} ر.س`, icon: DollarSign, color: "from-yellow-500 to-yellow-700" },
          { label: "اجمالي الطلبات", value: s?.totalOrders || 0, sub: "طلب", icon: ShoppingCart, color: "from-green-500 to-green-700" },
          { label: "طلبات مكتملة", value: s?.completedOrders || 0, sub: "مكتمل", icon: CheckCircle, color: "from-emerald-500 to-emerald-700" },
          { label: "متوسط الطلب", value: s?.totalOrders ? `$${((s?.totalRevenue || 0) / s.totalOrders).toFixed(2)}` : "$0", sub: "لكل طلب", icon: TrendingUp, color: "from-blue-500 to-blue-700" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-black text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[hsl(43,96%,56%)]" />
          توزيع طرق الدفع
        </h3>
        <div className="space-y-4">
          {[
            { label: "محفظة كريمي", count: paymentStats.kuraimi, color: "bg-green-500", icon: "🏦" },
            { label: "محفظة جيب", count: paymentStats.jeebpay, color: "bg-blue-500", icon: "💳" },
            { label: "محفظة جوالي", count: paymentStats.jawali, color: "bg-red-500", icon: "📱" },
            { label: "الدفع عند الاستلام", count: paymentStats.cod, color: "bg-orange-500", icon: "💵" },
          ].map((item, i) => {
            const pct = total ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </span>
                  <span className="font-bold text-gray-900">{item.count} ({pct}%)</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReportsSection() {
  const { data: orders } = useListOrders();
  const [filterType, setFilterType] = useState<"date" | "customer" | "invoice">("date");
  const [filterValue, setFilterValue] = useState("");

  const filtered = (orders as any[])?.filter(o => {
    if (!filterValue) return true;
    if (filterType === "date") return new Date(o.createdAt).toLocaleDateString("ar").includes(filterValue);
    if (filterType === "customer") return o.customerName?.toLowerCase().includes(filterValue.toLowerCase());
    if (filterType === "invoice") return `INV-${String(o.id).padStart(6, "0")}`.includes(filterValue) || String(o.id).includes(filterValue);
    return true;
  }) || [];

  const totalRevenue = filtered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-500" />
          تصفية التقارير
        </h3>
        <div className="flex gap-3 flex-wrap mb-4">
          {[
            { type: "date" as const, label: "بالتاريخ" },
            { type: "customer" as const, label: "باسم العميل" },
            { type: "invoice" as const, label: "برقم الفاتورة" },
          ].map(f => (
            <button
              key={f.type}
              onClick={() => { setFilterType(f.type); setFilterValue(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                filterType === f.type
                  ? "bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
          placeholder={
            filterType === "date" ? "مثال: 2026 أو 1/1/2026..." :
            filterType === "customer" ? "اسم العميل..." :
            "رقم الفاتورة مثل INV-000001..."
          }
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "عدد الطلبات", value: filtered.length, icon: ShoppingBag, color: "text-green-600 bg-green-50" },
          { label: "إجمالي المبيعات", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-yellow-600 bg-yellow-50" },
          { label: "متوسط الطلب", value: filtered.length ? `$${(totalRevenue / filtered.length).toFixed(2)}` : "$0", icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
        ].map((c, i) => (
          <div key={i} className={`${c.color} rounded-2xl p-4 border border-white shadow-sm`}>
            <c.icon className="w-6 h-6 mb-2" />
            <p className="text-2xl font-black">{c.value}</p>
            <p className="text-sm font-medium opacity-70 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">نتائج التقرير ({filtered.length})</h3>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)] rounded-xl font-bold cursor-pointer text-sm hover:bg-[hsl(222,47%,25%)]"
          >
            <Printer className="w-4 h-4" />
            طباعة التقرير
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                {["الفاتورة", "العميل", "المبلغ", "طريقة الدفع", "الحالة", "التاريخ"].map(h => (
                  <th key={h} className="text-right py-3 px-4 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-[hsl(222,47%,20%)]">INV-{String(order.id).padStart(6, "0")}</td>
                  <td className="py-3 px-4 font-medium">{order.customerName}</td>
                  <td className="py-3 px-4 font-black">${order.totalAmount?.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {order.paymentMethod === "kuraimi" ? "كريمي" : order.paymentMethod === "jeebpay" ? "جيب" : order.paymentMethod === "jawali" ? "جوالي" : "استلام"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      order.status === "completed" ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {order.status === "pending" ? "معلق" : order.status === "completed" ? "مكتمل" : order.status === "delivered" ? "موصّل" : order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString("ar")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MarketingSection() {
  const { settings } = useStoreSettings();
  const likedProducts = JSON.parse(localStorage.getItem("liked_products") || "[]").length;
  const savedProducts = JSON.parse(localStorage.getItem("saved_products") || "[]").length;
  const notifications = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
  const likeNotifs = notifications.filter((n: any) => n.type === "like").length;
  const saveNotifs = notifications.filter((n: any) => n.type === "save").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "إعجابات المنتجات", value: likedProducts + likeNotifs, icon: Heart, color: "from-red-500 to-red-700" },
          { label: "منتجات محفوظة", value: savedProducts + saveNotifs, icon: Bookmark, color: "from-purple-500 to-purple-700" },
          { label: "تفاعلات كلية", value: likedProducts + likeNotifs + savedProducts + saveNotifs, icon: Star, color: "from-yellow-500 to-yellow-700" },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-black text-gray-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-rose-500" />
            قنوات التسويق
          </h3>
          <div className="space-y-3">
            {[
              { label: "واتساب", sub: `+${settings.whatsapp}`, icon: "📱", color: "bg-green-50 border-green-200", href: `https://wa.me/${settings.whatsapp}`, btnColor: "text-green-600" },
              { label: "اتصال مباشر", sub: `+${settings.phone}`, icon: "📞", color: "bg-blue-50 border-blue-200", href: `tel:+${settings.phone}`, btnColor: "text-blue-600" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${item.color}`}>
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.sub}</p>
                </div>
                <a href={item.href} target="_blank" rel="noopener noreferrer"
                  className={`text-sm font-bold ${item.btnColor} hover:underline cursor-pointer`}>
                  فتح ←
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            نصائح تسويقية
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            {[
              "شارك صور المنتجات على واتساب وانستغرام",
              "قدم عروضاً خاصة في المناسبات والاعياد",
              "اطلب من العملاء مشاركة تجربتهم",
              "احرص على الرد السريع على الاستفسارات",
              "استخدم الصور الاحترافية للمنتجات",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                <span className="text-[hsl(43,96%,56%)] font-bold flex-shrink-0">✦</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-500" />
          الموقع والعنوان
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-indigo-100 bg-indigo-50">
            <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-indigo-700 mb-0.5">عنوان المتجر</p>
              <p className="text-gray-700 font-medium text-sm">{settings.storeAddress || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-purple-100 bg-purple-50">
            <Globe className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-purple-700 mb-0.5">الموقع الإلكتروني</p>
              {settings.storeWebsite ? (
                <a href={`https://${settings.storeWebsite}`} target="_blank" rel="noopener noreferrer"
                  className="text-purple-600 text-sm hover:underline font-medium">
                  {settings.storeWebsite}
                </a>
              ) : <p className="text-gray-400 text-sm">—</p>}
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-green-100 bg-green-50">
            <Phone className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-green-700 mb-0.5">رقم الهاتف</p>
              <p className="text-gray-700 font-medium text-sm" dir="ltr">+{settings.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
            <Globe className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-500 mb-0.5">البريد الإلكتروني</p>
              <p className="text-gray-700 font-medium text-sm" dir="ltr">{settings.email || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const { notifications, markAllRead, clear } = useNotifications();

  const iconFor = (type: string) => {
    if (type === "new_order") return <ShoppingBag className="w-4 h-4 text-green-500" />;
    if (type === "like") return <Heart className="w-4 h-4 text-red-500" />;
    if (type === "save") return <Bookmark className="w-4 h-4 text-blue-500" />;
    return <Bell className="w-4 h-4 text-yellow-500" />;
  };

  const bgFor = (type: string) => {
    if (type === "new_order") return "bg-green-50 border-green-200";
    if (type === "like") return "bg-red-50 border-red-200";
    if (type === "save") return "bg-blue-50 border-blue-200";
    return "bg-yellow-50 border-yellow-200";
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 justify-end">
        <button
          onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold cursor-pointer hover:bg-blue-100 text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          تحديد الكل كمقروء
        </button>
        <button
          onClick={clear}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold cursor-pointer hover:bg-red-100 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          مسح الكل
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notif: any, i: number) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 ${bgFor(notif.type)} ${!notif.read ? "shadow-md" : "opacity-70"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgFor(notif.type)}`}>
                  {iconFor(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{notif.message}</p>
                  {notif.orderId && (
                    <Link href={`/invoice/${notif.orderId}`} className="text-blue-500 text-xs hover:underline">
                      عرض الطلب #{notif.orderId}
                    </Link>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.time).toLocaleString("ar")}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function InlineEditField({ label, settingsKey, type = "text", icon: Icon, multiline = false, settings, updateSettings }: {
  label: string; settingsKey: string; type?: string; icon?: any; multiline?: boolean;
  settings: any; updateSettings: (s: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(() => settings[settingsKey] || "");

  const handleEdit = () => {
    setVal(settings[settingsKey] || "");
    setEditing(true);
  };

  const handleSave = () => {
    updateSettings({ ...settings, [settingsKey]: val });
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          {label}
        </label>
        {editing ? (
          multiline ? (
            <textarea
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              rows={2}
              className="w-full px-3 py-2.5 border-2 border-[hsl(43,96%,56%)] rounded-xl outline-none bg-white transition-colors resize-none"
            />
          ) : (
            <input
              type={type}
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full px-3 py-2.5 border-2 border-[hsl(43,96%,56%)] rounded-xl outline-none bg-white transition-colors"
            />
          )
        ) : (
          <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm min-h-[42px] truncate">
            {settings[settingsKey] || <span className="text-gray-400 italic">—</span>}
          </div>
        )}
      </div>
      {editing ? (
        <div className="flex gap-1 pt-7 flex-shrink-0">
          <button onClick={handleSave} className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold text-xs cursor-pointer hover:bg-green-600 whitespace-nowrap shadow-sm">حفظ</button>
          <button onClick={() => setEditing(false)} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs cursor-pointer hover:bg-gray-200 whitespace-nowrap">إلغاء</button>
        </div>
      ) : (
        <button
          onClick={handleEdit}
          className="mt-7 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs cursor-pointer hover:bg-blue-100 font-bold flex items-center gap-1 flex-shrink-0 shadow-sm"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          تعديل
        </button>
      )}
    </div>
  );
}

function SettingsCard({ title, icon: Icon, iconColor, children }: { title: string; icon: any; iconColor: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingsSection() {
  const { settings, updateSettings } = useStoreSettings();
  const { toast } = useToast();
  const [local, setLocal] = useState({ ...settings });
  const logoFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  const handleSaveComplex = () => {
    updateSettings({
      ...settings,
      kuraimiOwner: local.kuraimiOwner,
      kuraimiPhone: local.kuraimiPhone,
      jeebOwner: local.jeebOwner,
      jeebPhone: local.jeebPhone,
      jawaliOwner: local.jawaliOwner,
      jawaliPhone: local.jawaliPhone,
      welcomeBgColor1: local.welcomeBgColor1,
      welcomeBgColor2: local.welcomeBgColor2,
      catIconAll: local.catIconAll,
      catIconWomen: local.catIconWomen,
      catIconMen: local.catIconMen,
      catIconYouth: local.catIconYouth,
      catIconChildren: local.catIconChildren,
      catNameAll: local.catNameAll,
      catNameWomen: local.catNameWomen,
      catNameMen: local.catNameMen,
      catNameYouth: local.catNameYouth,
      catNameChildren: local.catNameChildren,
      adminEmail: (local as any).adminEmail,
      adminPassword: (local as any).adminPassword,
    } as any);
    toast({ title: "تم حفظ الإعدادات بنجاح" });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      updateSettings({ logoUrl: url });
      setLocal(p => ({ ...p, logoUrl: url }));
      if (logoFileRef.current) logoFileRef.current.value = "";
      toast({ title: "✅ تم رفع الشعار بنجاح" });
    };
    reader.readAsDataURL(file);
  };

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      updateSettings({ heroImageUrl: url });
      setLocal(p => ({ ...p, heroImageUrl: url }));
      if (heroFileRef.current) heroFileRef.current.value = "";
      toast({ title: "✅ تم رفع صورة الخلفية بنجاح" });
    };
    reader.readAsDataURL(file);
  };


  return (
    <div className="space-y-5 max-w-3xl">
      <SettingsCard title="معلومات المتجر" icon={Store} iconColor="text-[hsl(43,96%,56%)]">
        <InlineEditField label="اسم المتجر" settingsKey="storeName" icon={Store} settings={settings} updateSettings={updateSettings} />
        <InlineEditField label="عنوان المتجر" settingsKey="storeAddress" icon={MapPin} settings={settings} updateSettings={updateSettings} />
        <InlineEditField label="الموقع الالكتروني" settingsKey="storeWebsite" icon={Globe} settings={settings} updateSettings={updateSettings} />
        <InlineEditField label="البريد الالكتروني" settingsKey="email" type="email" icon={Globe} settings={settings} updateSettings={updateSettings} />
        <InlineEditField label="نبذة عن المتجر" settingsKey="about" icon={Info} multiline settings={settings} updateSettings={updateSettings} />
      </SettingsCard>

      <SettingsCard title="معلومات التواصل" icon={Phone} iconColor="text-green-500">
        <InlineEditField label="رقم الهاتف" settingsKey="phone" type="tel" icon={Phone} settings={settings} updateSettings={updateSettings} />
        <InlineEditField label="رقم واتساب (مع كود الدولة)" settingsKey="whatsapp" icon={Phone} settings={settings} updateSettings={updateSettings} />
        <div className="p-3 bg-green-50 rounded-xl border border-green-200">
          <p className="text-sm text-green-700 font-medium">رابط واتساب:</p>
          <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer"
            className="text-green-600 text-sm hover:underline">
            https://wa.me/{(settings as any).whatsapp}
          </a>
        </div>
      </SettingsCard>

      <SettingsCard title="المحافظ الرقمية" icon={Wallet} iconColor="text-blue-500">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "كريمي", ownerField: "kuraimiOwner" as const, phoneField: "kuraimiPhone" as const, icon: "🏦", color: "border-green-200 bg-green-50" },
            { name: "جيب", ownerField: "jeebOwner" as const, phoneField: "jeebPhone" as const, icon: "💳", color: "border-blue-200 bg-blue-50" },
            { name: "جوالي", ownerField: "jawaliOwner" as const, phoneField: "jawaliPhone" as const, icon: "📱", color: "border-red-200 bg-red-50" },
          ].map(w => (
            <div key={w.name} className={`p-4 rounded-xl border-2 ${w.color}`}>
              <p className="font-bold mb-3 flex items-center gap-2 text-sm">
                <span className="text-xl">{w.icon}</span>
                محفظة {w.name}
              </p>
              <input
                type="text"
                value={(local as any)[w.ownerField] || ""}
                onChange={e => setLocal(p => ({ ...p, [w.ownerField]: e.target.value }))}
                placeholder="اسم صاحب المحفظة"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm mb-2 bg-white"
              />
              <input
                type="tel"
                value={(local as any)[w.phoneField] || ""}
                onChange={e => setLocal(p => ({ ...p, [w.phoneField]: e.target.value }))}
                placeholder="رقم الهاتف"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white"
              />
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="الصور والشعار" icon={Image} iconColor="text-purple-500">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Store className="w-4 h-4 text-gray-400" />
              شعار المتجر
            </p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
              {settings.logoUrl ? (
                <div className="relative mb-3">
                  <img src={settings.logoUrl} alt="الشعار" className="max-w-full max-h-40 object-contain rounded-xl mx-auto shadow" />
                  <button
                    onClick={() => { updateSettings({ ...settings, logoUrl: "" }); setLocal(p => ({ ...p, logoUrl: "" })); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-gray-300 mb-2">
                  <Image className="w-12 h-12 mx-auto" />
                </div>
              )}
              <button
                onClick={() => logoFileRef.current?.click()}
                className="text-sm bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)] px-4 py-2 rounded-lg cursor-pointer font-medium"
              >
                {settings.logoUrl ? "تغيير الشعار" : "رفع شعار"}
              </button>
              <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Image className="w-4 h-4 text-gray-400" />
              صورة خلفية الصفحة الرئيسية
            </p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
              {settings.heroImageUrl ? (
                <div className="relative mb-3">
                  <img src={settings.heroImageUrl} alt="الخلفية" className="max-w-full max-h-40 object-contain rounded-xl mx-auto shadow" />
                  <button
                    onClick={() => { updateSettings({ ...settings, heroImageUrl: "" }); setLocal(p => ({ ...p, heroImageUrl: "" })); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-gray-300 mb-2">
                  <Image className="w-12 h-12 mx-auto" />
                </div>
              )}
              <button
                onClick={() => heroFileRef.current?.click()}
                className="text-sm bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)] px-4 py-2 rounded-lg cursor-pointer font-medium"
              >
                {settings.heroImageUrl ? "تغيير صورة الخلفية" : "رفع صورة الخلفية"}
              </button>
              <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="أيقونات فئات المنتجات" icon={Package} iconColor="text-purple-500">
        <p className="text-sm text-gray-500 mb-1">يمكنك تغيير إيموجي أو رمز كل فئة في صفحة التسوق</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "الكل", field: "catIconAll" as const, color: "border-gray-200 bg-gray-50" },
            { label: "نسائي", field: "catIconWomen" as const, color: "border-pink-200 bg-pink-50" },
            { label: "رجالي", field: "catIconMen" as const, color: "border-blue-200 bg-blue-50" },
            { label: "شبابي", field: "catIconYouth" as const, color: "border-green-200 bg-green-50" },
            { label: "أطفال", field: "catIconChildren" as const, color: "border-yellow-200 bg-yellow-50" },
          ].map(cat => (
            <div key={cat.field} className={`p-3 rounded-xl border-2 ${cat.color} text-center`}>
              <p className="text-xs font-bold text-gray-600 mb-2">{cat.label}</p>
              <div className="text-3xl mb-2">{(local as any)[cat.field] || "✨"}</div>
              <input
                type="text"
                value={(local as any)[cat.field] || ""}
                onChange={e => setLocal(p => ({ ...p, [cat.field]: e.target.value }))}
                placeholder="إيموجي"
                maxLength={4}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg outline-none text-sm bg-white text-center focus:ring-2 focus:ring-[hsl(43,96%,56%)]"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">💡 اكتب أي إيموجي أو رمز في الحقل لتغيير أيقونة الفئة</p>
      </SettingsCard>

      <SettingsCard title="ألوان الصفحة الرئيسية" icon={Image} iconColor="text-rose-500">
        <p className="text-sm text-gray-500 mb-1">تخصيص ألوان خلفية الصفحة الترويجية (عند عدم وجود صورة خلفية)</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اللون الأول (أعلى)</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={local.welcomeBgColor1 || "#0a0520"}
                onChange={e => setLocal(p => ({ ...p, welcomeBgColor1: e.target.value }))}
                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={local.welcomeBgColor1 || "#0a0520"}
                onChange={e => setLocal(p => ({ ...p, welcomeBgColor1: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50"
                placeholder="#0a0520"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اللون الثاني (أسفل)</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={local.welcomeBgColor2 || "#1a0a3d"}
                onChange={e => setLocal(p => ({ ...p, welcomeBgColor2: e.target.value }))}
                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={local.welcomeBgColor2 || "#1a0a3d"}
                onChange={e => setLocal(p => ({ ...p, welcomeBgColor2: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50"
                placeholder="#1a0a3d"
              />
            </div>
          </div>
        </div>
        <div
          className="mt-3 h-14 rounded-xl border border-gray-200 shadow-inner"
          style={{ background: `linear-gradient(145deg, ${local.welcomeBgColor1 || "#0a0520"}, ${local.welcomeBgColor2 || "#1a0a3d"})` }}
        >
          <div className="h-full flex items-center justify-center">
            <span className="text-white/50 text-xs">معاينة مباشرة للخلفية</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { label: "ليلي بنفسجي", c1: "#0a0520", c2: "#1a0a3d" },
            { label: "أزرق داكن", c1: "#050d1a", c2: "#0d1f3c" },
            { label: "أخضر داكن", c1: "#021a0a", c2: "#063320" },
            { label: "أحمر داكن", c1: "#1a0505", c2: "#3d0a0a" },
          ].map((preset, i) => (
            <button
              key={i}
              onClick={() => setLocal(p => ({ ...p, welcomeBgColor1: preset.c1, welcomeBgColor2: preset.c2 }))}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div
                className="w-full h-8 rounded-lg border-2 border-transparent group-hover:border-[hsl(43,96%,56%)] transition-all"
                style={{ background: `linear-gradient(135deg, ${preset.c1}, ${preset.c2})` }}
              />
              <span className="text-xs text-gray-500">{preset.label}</span>
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="أسماء الأقسام" icon={Globe} iconColor="text-lime-500">
        <p className="text-sm text-gray-500 mb-1">يمكنك تخصيص أسماء الأقسام كما تريد — ستنعكس في المتجر ولوحة التحكم</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "اسم قسم الكل", field: "catNameAll" as const, icon: "✨" },
            { label: "اسم القسم الرجالي", field: "catNameMen" as const, icon: "👞" },
            { label: "اسم القسم النسائي", field: "catNameWomen" as const, icon: "👠" },
            { label: "اسم القسم الشبابي", field: "catNameYouth" as const, icon: "👟" },
            { label: "اسم قسم والدي/أطفال", field: "catNameChildren" as const, icon: "🧸" },
          ].map(f => (
            <div key={f.field} className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                <span>{f.icon}</span>{f.label}
              </label>
              <input
                type="text"
                value={(local as any)[f.field] || ""}
                onChange={e => setLocal(p => ({ ...p, [f.field]: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50 focus:bg-white transition-colors text-sm"
              />
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="بيانات حساب المدير" icon={UserPlus} iconColor="text-teal-500">
        <p className="text-sm text-gray-500 mb-1">تعديل البريد الإلكتروني وكلمة مرور الدخول للوحة التحكم</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني للمدير</label>
            <div className="relative">
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                value={(local as any).adminEmail || ""}
                onChange={e => setLocal(p => ({ ...p, adminEmail: e.target.value }))}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50 focus:bg-white transition-colors"
                dir="ltr"
                placeholder="admin@hakeemi.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type="text"
                value={(local as any).adminPassword || ""}
                onChange={e => setLocal(p => ({ ...p, adminPassword: e.target.value }))}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50 focus:bg-white transition-colors font-mono"
                dir="ltr"
                placeholder="123456"
              />
            </div>
          </div>
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
            <p className="text-xs text-teal-700 font-medium">سيتم تطبيق هذه البيانات عند الدخول التالي للوحة التحكم. احفظ الإعدادات أولاً.</p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="حقوق النشر والمعلومات" icon={Info} iconColor="text-gray-500">
        <InlineEditField label="نص حقوق النشر" settingsKey="copyright" icon={Info} settings={settings} updateSettings={updateSettings} />
      </SettingsCard>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">اضغط زر <strong>حفظ</strong> لكل حقل لتطبيق التغيير فوراً. الزر أدناه يحفظ المحافظ والألوان والأيقونات فقط.</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSaveComplex}
        className="flex items-center gap-2 bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(43,96%,48%)] text-[hsl(222,47%,11%)] px-8 py-3.5 rounded-2xl font-black hover:brightness-110 transition-all cursor-pointer shadow-xl shadow-yellow-500/20"
      >
        <Save className="w-5 h-5" />
        حفظ المحافظ والألوان والأيقونات
      </motion.button>
    </div>
  );
}

function UsersSection() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newPw, setNewPw] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    String(u.username || "").includes(search)
  );

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: newUsername, name: newName, password: newPw, role: "admin" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل في إضافة المستخدم");
      setAddSuccess(true);
      await loadUsers();
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess(false);
        setNewUsername(""); setNewName(""); setNewPw("");
      }, 1500);
    } catch (err: any) {
      setAddError(err.message || "حدث خطأ");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل في حذف المستخدم");
      setShowDeleteConfirm(null);
      await loadUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const PERMISSIONS_LIST = [
    { key: "products", label: "إدارة المنتجات", icon: "📦" },
    { key: "orders", label: "إدارة الطلبات", icon: "🛒" },
    { key: "customers", label: "عرض العملاء", icon: "👥" },
    { key: "accounting", label: "المحاسبة", icon: "💰" },
    { key: "reports", label: "التقارير", icon: "📊" },
    { key: "settings", label: "الإعدادات", icon: "⚙️" },
  ];

  const [showPerms, setShowPerms] = useState<number | null>(null);
  const [permsLoading, setPermsLoading] = useState(false);

  const togglePermission = async (userId: number, perm: string, current: string) => {
    let perms: string[] = [];
    try { perms = JSON.parse(current || "[]"); } catch {}
    if (perms.includes("all")) {
      perms = PERMISSIONS_LIST.map(p => p.key);
    }
    if (perms.includes(perm)) {
      perms = perms.filter(p => p !== perm);
    } else {
      perms.push(perm);
    }
    setPermsLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permissions: perms }),
      });
      await loadUsers();
    } catch {}
    setPermsLoading(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو رقم المستخدم..."
            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-white text-sm"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(43,96%,48%)] text-[hsl(222,47%,11%)] px-5 py-2.5 rounded-xl font-bold cursor-pointer shadow-md shadow-yellow-500/20 text-sm"
        >
          <UserPlus className="w-4 h-4" />
          إضافة مستخدم جديد
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[hsl(43,96%,56%)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">لا يوجد مستخدمون</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u, i) => {
            let perms: string[] = [];
            try { perms = JSON.parse(u.permissions || "[]"); } catch {}
            const hasAll = perms.includes("all");
            const isCurrentUser = u.id === currentUser?.id;
            const isExpanded = showPerms === u.id;

            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(222,47%,20%)] to-[hsl(222,47%,35%)] flex items-center justify-center text-[hsl(43,96%,56%)] font-black text-lg flex-shrink-0 shadow-md">
                    {u.username || u.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{u.name}</p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">أنت</span>
                      )}
                      {u.username === 1 && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">مدير رئيسي</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">رقم المستخدم: <span className="font-mono font-bold">{u.username || "—"}</span></p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hasAll ? (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">جميع الصلاحيات</span>
                      ) : perms.length === 0 ? (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">لا توجد صلاحيات</span>
                      ) : perms.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">{PERMISSIONS_LIST.find(pl => pl.key === p)?.label || p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isCurrentUser && (
                      <button
                        onClick={() => setShowPerms(isExpanded ? null : u.id)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                        title="الصلاحيات"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                    {!isCurrentUser && u.username !== 1 && (
                      <button
                        onClick={() => setShowDeleteConfirm(u.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && !hasAll && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 px-4 pb-4 pt-3"
                    >
                      <p className="text-sm font-bold text-gray-700 mb-3">تعديل صلاحيات {u.name}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PERMISSIONS_LIST.map(p => {
                          const active = perms.includes(p.key);
                          return (
                            <button
                              key={p.key}
                              disabled={permsLoading}
                              onClick={() => togglePermission(u.id, p.key, u.permissions)}
                              className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all cursor-pointer text-sm font-medium ${
                                active
                                  ? "border-[hsl(43,96%,56%)] bg-[hsl(43,96%,56%)]/10 text-[hsl(222,47%,15%)]"
                                  : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                              }`}
                            >
                              <span>{p.icon}</span>
                              <span className="text-xs">{p.label}</span>
                              {active && <CheckCircle className="w-3.5 h-3.5 text-[hsl(43,96%,56%)] mr-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDeleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl"
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="font-black text-gray-900 text-lg">حذف المستخدم</h3>
                <p className="text-gray-500 text-sm mt-1">هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium cursor-pointer">إلغاء</button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm!)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "حذف"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-gray-800">إضافة مستخدم جديد</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {addSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-bold text-green-700 text-lg">تمت الإضافة بنجاح!</p>
                </div>
              ) : (
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم المستخدم (رقم كاشير)</label>
                    <input
                      type="number"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      required
                      min="1"
                      placeholder="مثال: 2"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] text-sm"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      required
                      placeholder="اسم الموظف أو المدير"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                    <input
                      type="text"
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      required
                      minLength={4}
                      placeholder="كلمة المرور"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] text-sm font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-700 font-medium">سيتم إنشاء حساب مدير بهذه البيانات. الدخول عبر رقم المستخدم + كلمة المرور.</p>
                  </div>
                  {addError && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      {addError}
                    </div>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      إلغاء
                    </button>
                    <motion.button
                      type="submit"
                      disabled={addLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(43,96%,48%)] text-[hsl(222,47%,11%)] rounded-xl font-black cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                    >
                      {addLoading ? <div className="w-4 h-4 border-2 border-[hsl(222,47%,11%)] border-t-transparent rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      {addLoading ? "جاري الإضافة..." : "إضافة المستخدم"}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CustomPage {
  id: string;
  name: string;
  description: string;
  productIds: number[];
  createdAt: string;
}

function PagesSection() {
  const { data: allProducts } = useListProducts();
  const [pages, setPages] = useState<CustomPage[]>(() => {
    try { return JSON.parse(localStorage.getItem("custom_pages_v1") || "[]"); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [pageName, setPageName] = useState("");
  const [pageDesc, setPageDesc] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  const savePages = (updated: CustomPage[]) => {
    setPages(updated);
    localStorage.setItem("custom_pages_v1", JSON.stringify(updated));
  };

  const handleOpenForm = (page?: CustomPage) => {
    if (page) {
      setEditingPage(page);
      setPageName(page.name);
      setPageDesc(page.description);
      setSelectedIds(page.productIds);
    } else {
      setEditingPage(null);
      setPageName("");
      setPageDesc("");
      setSelectedIds([]);
    }
    setProductSearch("");
    setShowForm(true);
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName.trim()) return;
    if (editingPage) {
      savePages(pages.map(p => p.id === editingPage.id
        ? { ...p, name: pageName.trim(), description: pageDesc.trim(), productIds: selectedIds }
        : p
      ));
    } else {
      const newPage: CustomPage = {
        id: Date.now().toString(),
        name: pageName.trim(),
        description: pageDesc.trim(),
        productIds: selectedIds,
        createdAt: new Date().toISOString(),
      };
      savePages([...pages, newPage]);
    }
    setShowForm(false);
  };

  const handleDeletePage = (id: string) => {
    savePages(pages.filter(p => p.id !== id));
  };

  const toggleProduct = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredProducts = ((allProducts as any[]) ?? []).filter((p: any) =>
    !productSearch || p.nameAr?.includes(productSearch) || p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-800">الصفحات المخصصة</h2>
          <p className="text-sm text-gray-400">أضف صفحات جديدة وخصص المنتجات لكل صفحة</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(43,96%,48%)] text-[hsl(222,47%,11%)] px-5 py-2.5 rounded-xl font-bold cursor-pointer shadow-md text-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة صفحة جديدة
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">{editingPage ? "تعديل الصفحة" : "إضافة صفحة جديدة"}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSavePage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الصفحة *</label>
                <input
                  type="text"
                  value={pageName}
                  onChange={e => setPageName(e.target.value)}
                  required
                  placeholder="مثال: منتجات العروسة، تشكيلة رمضان..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف الصفحة (اختياري)</label>
                <input
                  type="text"
                  value={pageDesc}
                  onChange={e => setPageDesc(e.target.value)}
                  placeholder="وصف قصير عن هذه الصفحة..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر المنتجات <span className="text-xs text-gray-400">({selectedIds.length} مختار)</span>
                </label>
                <div className="relative mb-2">
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="ابحث عن منتج..."
                    className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[hsl(43,96%,56%)] text-sm bg-gray-50"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center py-6 text-gray-400 text-sm">لا توجد منتجات</p>
                  ) : filteredProducts.map((p: any) => (
                    <label key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleProduct(p.id)}
                        className="w-4 h-4 accent-[hsl(43,96%,56%)] cursor-pointer"
                      />
                      <img src={p.imageUrl} alt={p.nameAr} className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=50&h=50&fit=crop"; }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{p.nameAr}</p>
                        <p className="text-xs text-gray-400">${p.price}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 cursor-pointer text-sm">إلغاء</button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(43,96%,48%)] text-[hsl(222,47%,11%)] rounded-xl font-black cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  {editingPage ? "حفظ التعديلات" : "إنشاء الصفحة"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {pages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Globe className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium mb-2">لا توجد صفحات مخصصة بعد</p>
          <p className="text-gray-300 text-sm">أضف صفحتك الأولى بالضغط على الزر أعلاه</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map(page => {
            const pageProds = ((allProducts as any[]) ?? []).filter((p: any) => page.productIds.includes(p.id));
            const isExpanded = expandedPage === page.id;
            return (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 text-base">{page.name}</h3>
                    {page.description && <p className="text-sm text-gray-400 truncate">{page.description}</p>}
                    <p className="text-xs text-gray-300 mt-0.5">
                      {pageProds.length} منتج • {new Date(page.createdAt).toLocaleDateString("ar-YE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedPage(isExpanded ? null : page.id)}
                      className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleOpenForm(page)}
                      className="p-2 hover:bg-blue-50 text-blue-500 rounded-xl cursor-pointer transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="p-2 hover:bg-red-50 text-red-400 rounded-xl cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 px-5 pb-5 pt-4"
                    >
                      {pageProds.length === 0 ? (
                        <p className="text-center py-4 text-gray-400 text-sm">لم يتم إضافة منتجات بعد</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {pageProds.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                              <img
                                src={p.imageUrl} alt={p.nameAr}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=50&h=50&fit=crop"; }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-700 truncate">{p.nameAr}</p>
                                <p className="text-xs text-gray-400">${p.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
