import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { keepPreviousData } from "@tanstack/react-query";
import { useListProducts } from "@workspace/api-client-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, LogOut, Settings, Home, Heart, Bookmark, X } from "lucide-react";

export default function ProductsPage() {
  const [, setLocation] = useLocation();
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const { data: products, isLoading, isFetching, isError } = useListProducts(
    { category: category || undefined, search: search || undefined, page, limit: pageSize },
    { query: { placeholderData: keepPreviousData } } as any
  );
  const { addItem, totalItems } = useCart();
  const { user, isAdmin, logoutFn } = useAuth();
  const { toast } = useToast();
  const { settings } = useStoreSettings();

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  const categories = [
    { key: "", label: "الكل", icon: settings.catIconAll || "✨" },
    { key: "women", label: "نسائي", icon: settings.catIconWomen || "👠" },
    { key: "men", label: "رجالي", icon: settings.catIconMen || "👞" },
    { key: "youth", label: "شبابي", icon: settings.catIconYouth || "👟" },
    { key: "children", label: "أطفال", icon: settings.catIconChildren || "🧸" },
  ];

  const catLabel = (c: string) =>
    c === "men" ? "رجالي" :
    c === "women" ? "نسائي" :
    c === "youth" ? "شبابي" :
    c === "children" || c === "parents" ? "أطفال" : "أخرى";

  const [liked, setLiked] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem("liked_products");
      return new Set(saved ? JSON.parse(saved) : []);
    } catch { return new Set(); }
  });

  const [saved, setSaved] = useState<Set<number>>(() => {
    try {
      const s = localStorage.getItem("saved_products");
      return new Set(s ? JSON.parse(s) : []);
    } catch { return new Set(); }
  });

  const handleLike = (productId: number) => {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        toast({ title: "تم إلغاء الإعجاب" });
      } else {
        next.add(productId);
        toast({ title: "❤️ تم الإعجاب بالمنتج" });
      }
      localStorage.setItem("liked_products", JSON.stringify([...next]));
      return next;
    });
  };

  const handleSave = (productId: number) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        toast({ title: "تم إزالة المنتج من المحفوظات" });
      } else {
        next.add(productId);
        toast({ title: "🔖 تم حفظ المنتج" });
      }
      localStorage.setItem("saved_products", JSON.stringify([...next]));
      return next;
    });
  };

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity,
    });
    toast({ title: "تمت الاضافة الى السلة", description: product.nameAr });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[hsl(222,47%,11%)] text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.storeName} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 bg-[hsl(43,96%,56%)] rounded-lg flex items-center justify-center shadow-md">
                <span className="text-sm font-black text-[hsl(222,47%,11%)]">ح</span>
              </div>
            )}
            <div>
              <h1 className="text-base font-bold text-[hsl(43,96%,56%)]">{settings.storeName}</h1>
              <p className="text-xs text-gray-400">{settings.storeAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation("/")}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="الصفحة الرئيسية"
            >
              <Home className="w-5 h-5" />
            </button>
            {isAdmin && (
              <button
                onClick={() => setLocation("/admin")}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                data-testid="button-admin"
                title="لوحة التحكم"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setLocation("/cart")}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -left-1 bg-[hsl(43,96%,56%)] text-[hsl(222,47%,11%)] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
            <button
              onClick={() => { logoutFn(); setLocation("/"); }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              data-testid="button-logout"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLocation("/")}
              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer text-gray-300 hover:text-red-400"
              title="خروج"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[hsl(43,96%,56%)] focus:border-transparent outline-none bg-white shadow-sm"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  category === cat.key
                    ? "bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)] shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
                data-testid={`button-category-${cat.key || "all"}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isLoading && !products ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-red-100">
            <p className="text-red-600 text-lg font-bold">تعذر تحميل المنتجات</p>
            <p className="text-gray-500 text-sm mt-2">تحقق من الاتصال ثم حاول مرة أخرى.</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 rounded-xl bg-red-600 text-white font-bold cursor-pointer">إعادة المحاولة</button>
          </div>
        ) : (
          <div className={`relative transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}>
            {isFetching && (
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-8 pointer-events-none">
                <div className="bg-white/90 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <div className="w-4 h-4 border-2 border-[hsl(43,96%,56%)] border-t-transparent rounded-full animate-spin" />
                  جارٍ التحميل...
                </div>
              </div>
            )}
            {products && (products as any[]).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 text-lg font-medium">لا توجد منتجات</p>
                <p className="text-gray-400 text-sm mt-1">جرب البحث بكلمة اخرى</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(products as any[])?.map((product: any, idx: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-100 hover:-translate-y-1 duration-200"
                    data-testid={`card-product-${product.id}`}
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.nameAr}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onLoad={e => { (e.target as HTMLImageElement).style.opacity = "1"; }}
                        style={{ opacity: 0, transition: "opacity 0.3s ease" }}
                        onError={e => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop";
                          (e.target as HTMLImageElement).style.opacity = "1";
                        }}
                      />
                      {product.originalPrice && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-lg shadow">
                          خصم
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-[hsl(222,47%,11%)]/70 text-white text-xs px-2 py-1 rounded-lg">
                        {catLabel(product.category)}
                      </div>

                      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-7">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                        onClick={() => handleLike(product.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all ${
                            liked.has(product.id) ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:text-red-500"
                          }`}
                          title="إعجاب"
                        >
                          <Heart className={`w-4 h-4 ${liked.has(product.id) ? "fill-white" : ""}`} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                        onClick={() => handleSave(product.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all ${
                            saved.has(product.id) ? "bg-blue-500 text-white" : "bg-white text-gray-500 hover:text-blue-500"
                          }`}
                          title="حفظ"
                        >
                          <Bookmark className={`w-4 h-4 ${saved.has(product.id) ? "fill-white" : ""}`} />
                        </motion.button>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleLike(product.id)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-lg transition-all ${
                            liked.has(product.id) ? "bg-red-500 text-white" : "bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${liked.has(product.id) ? "fill-white" : ""}`} />
                          <span>{liked.has(product.id) ? "معجب" : "إعجاب"}</span>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleSave(product.id)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-lg transition-all ${
                            saved.has(product.id) ? "bg-blue-500 text-white" : "bg-white/90 text-gray-700 hover:bg-blue-50 hover:text-blue-500"
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${saved.has(product.id) ? "fill-white" : ""}`} />
                          <span>{saved.has(product.id) ? "محفوظ" : "حفظ"}</span>
                        </motion.button>
                      </div>
                    </div>
                    <div className="p-4">
                      <Link href={`/products/${product.id}`} className="block">
                        <h3 className="font-black text-gray-900 mb-1 truncate text-base hover:text-blue-700">{product.nameAr}</h3>
                      </Link>
                      <p className="text-sm text-gray-400 mb-3 truncate">{product.descriptionAr}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-black text-[hsl(222,47%,20%)]">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-[hsl(43,96%,56%)] text-[hsl(222,47%,11%)] py-2.5 rounded-xl font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
                        data-testid={`button-add-cart-${product.id}`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        اضف الى السلة
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {products && (products as any[]).length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-8" dir="rtl">
                <button
                  type="button"
                  disabled={page === 1 || isFetching}
                  onClick={() => setPage(value => Math.max(1, value - 1))}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 disabled:opacity-40 cursor-pointer"
                >
                  السابق
                </button>
                <span className="px-4 py-2 rounded-xl bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)] font-black">صفحة {page}</span>
                <button
                  type="button"
                  disabled={(products as any[]).length < pageSize || isFetching}
                  onClick={() => setPage(value => value + 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 disabled:opacity-40 cursor-pointer"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="bg-[hsl(222,47%,11%)] text-white mt-12 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[hsl(43,96%,56%)] font-bold text-lg mb-1">{settings.storeName}</p>
          <p className="text-gray-400 text-sm mb-2">{settings.storeAddress}</p>
          <div className="flex justify-center gap-4 text-sm text-gray-400 mb-3">
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="hover:text-[hsl(43,96%,56%)] transition-colors">
              واتساب: {settings.phone}
            </a>
            <span>|</span>
            <a href={`tel:+${settings.whatsapp}`} className="hover:text-[hsl(43,96%,56%)] transition-colors">
              اتصال: {settings.phone}
            </a>
          </div>
          <p className="text-gray-600 text-xs">{settings.copyright}</p>
        </div>
      </footer>

      <a
        href={`https://wa.me/${settings.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
        style={{ background: "#25D366" }}
        title="تواصل معنا عبر واتساب"
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
}
