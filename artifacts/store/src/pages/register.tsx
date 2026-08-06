import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { registerMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  // Social login (Google/Facebook via Clerk) is not configured for this store yet.
  const socialLoading: string | null = null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      { data: { name, email, password, phone } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "تم انشاء الحساب بنجاح" });
          setLocation("/products");
        },
        onError: () => {
          toast({ title: "خطا في انشاء الحساب", description: "البريد الالكتروني مستخدم بالفعل", variant: "destructive" });
        },
      }
    );
  };

  const handleGoogleLogin = async () => {
    toast({ title: "غير متاح حالياً", description: "التسجيل عبر جوجل غير مفعّل بعد" });
  };

  const handleFacebookLogin = async () => {
    toast({ title: "غير متاح حالياً", description: "التسجيل عبر فيسبوك غير مفعّل بعد" });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2d4f 40%, #0d1f3c 100%)" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-[hsl(43,96%,56%)] opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-[hsl(43,96%,56%)] rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-yellow-500/20">
            <span className="text-3xl font-black text-[hsl(222,47%,11%)]">ح</span>
          </div>
          <h1 className="text-3xl font-black text-white">انشاء حساب جديد</h1>
          <p className="text-gray-400 mt-1">انضم الى متجر الحكيمي للتخفيضات</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10">
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={socialLoading !== null}
              className="w-full bg-white text-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all disabled:opacity-60 cursor-pointer shadow-lg"
            >
              {socialLoading === "google" ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              التسجيل عبر جوجل
            </button>

            <button
              onClick={handleFacebookLogin}
              disabled={socialLoading !== null}
              className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-60 cursor-pointer shadow-lg"
              style={{ background: "#1877F2" }}
            >
              {socialLoading === "facebook" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              التسجيل عبر فيسبوك
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-400">او بالبريد الالكتروني</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">الاسم الكامل</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-[hsl(43,96%,56%)] outline-none placeholder-gray-500"
                placeholder="ادخل اسمك الكامل" required data-testid="input-name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">البريد الالكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-[hsl(43,96%,56%)] outline-none placeholder-gray-500"
                placeholder="example@email.com" required data-testid="input-email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">رقم الهاتف (اختياري)</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-[hsl(43,96%,56%)] outline-none placeholder-gray-500"
                placeholder="77XXXXXXX" data-testid="input-phone" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">كلمة المرور</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-[hsl(43,96%,56%)] outline-none placeholder-gray-500"
                placeholder="ادخل كلمة المرور" required data-testid="input-password" />
            </div>
            <button type="submit" disabled={registerMutation.isPending}
              className="w-full bg-[hsl(43,96%,56%)] text-[hsl(222,47%,11%)] py-3 rounded-xl font-black text-lg hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-yellow-500/20"
              data-testid="button-register">
              {registerMutation.isPending ? "جاري انشاء الحساب..." : "انشاء الحساب"}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-400">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-[hsl(43,96%,56%)] font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
