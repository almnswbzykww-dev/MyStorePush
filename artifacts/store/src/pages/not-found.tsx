import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const goBack = () => window.history.length > 1 ? window.history.back() : setLocation("/");
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">الصفحة غير موجودة</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
             الرابط الذي طلبته غير متوفر أو تم نقله.
          </p>
           <button onClick={goBack} className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer">
             <ArrowRight className="w-4 h-4" /> رجوع
           </button>
        </CardContent>
      </Card>
    </div>
  );
}
