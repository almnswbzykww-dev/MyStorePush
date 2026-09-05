import { useRoute, Link, useLocation } from "wouter";
import { useGetProduct } from "@workspace/api-client-react";
import { ArrowRight, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetailPage() {
  const [, params] = useRoute("/products/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const { data: product, isLoading, isError } = useGetProduct(id, { query: { enabled: Number.isInteger(id) && id > 0 } } as any);
  const { addItem } = useCart();
  const { toast } = useToast();

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else setLocation("/products");
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 text-center" dir="rtl">
        <p className="text-red-600 font-bold text-lg">تعذر العثور على المنتج</p>
        <button onClick={goBack} className="px-5 py-2 rounded-xl bg-slate-900 text-yellow-400 font-bold cursor-pointer">العودة</button>
      </div>
    );
  }

  const addToCart = () => {
    addItem({ productId: product.id, name: product.name, nameAr: product.nameAr, price: product.price, imageUrl: product.imageUrl });
    toast({ title: "تمت الإضافة إلى السلة", description: product.nameAr });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={goBack} className="flex items-center gap-2 text-slate-700 font-bold cursor-pointer">
            <ArrowRight className="w-5 h-5" /> رجوع
          </button>
          <Link href="/cart" className="flex items-center gap-2 bg-slate-900 text-yellow-400 px-4 py-2 rounded-xl font-bold">
            <ShoppingCart className="w-4 h-4" /> السلة
          </Link>
        </div>
        <section className="bg-white rounded-3xl shadow-lg overflow-hidden grid md:grid-cols-2">
          <div className="aspect-square bg-gray-100">
            <img src={product.imageUrl} alt={product.nameAr} className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="p-7 md:p-10 flex flex-col justify-center">
            <span className="text-sm text-gray-500 mb-3">{product.category}</span>
            <h1 className="text-3xl font-black text-slate-900 mb-3">{product.nameAr}</h1>
            <p className="text-gray-600 leading-8 mb-6">{product.descriptionAr || product.description || "منتج مميز من متجر الحكيمي."}</p>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-black text-slate-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && <span className="text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>}
            </div>
            <p className={`mb-5 font-bold ${product.inStock && product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}`}>
              {product.inStock && product.stockQuantity > 0 ? `متوفر (${product.stockQuantity} قطعة)` : "غير متوفر حاليًا"}
            </p>
            <button onClick={addToCart} disabled={!product.inStock || product.stockQuantity < 1} className="w-full py-3 rounded-xl bg-yellow-400 text-slate-900 font-black disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" /> أضف إلى السلة
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}