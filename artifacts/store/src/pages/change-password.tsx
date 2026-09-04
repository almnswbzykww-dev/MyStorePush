import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function ChangePasswordPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && !user) {
    setLocation("/admin-login");
    return null;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: "كلمة المرور قصيرة", description: "استخدم 8 أحرف على الأقل", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "كلمتا المرور غير متطابقتين", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تغيير كلمة المرور");
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: "تم تغيير كلمة المرور بنجاح" });
      setLocation(user?.role === "admin" ? "/admin" : "/products");
    } catch (error) {
      toast({
        title: "تعذر تغيير كلمة المرور",
        description: error instanceof Error ? error.message : "حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[hsl(260,35%,5%)]" dir="rtl">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl p-8 bg-[hsl(260,30%,8%)] border border-white/10 shadow-2xl space-y-5">
        <div>
          <h1 className="text-2xl font-black text-white">تغيير كلمة المرور</h1>
          <p className="text-gray-400 text-sm mt-2">يجب تغيير كلمة المرور الأولية قبل فتح لوحة التحكم.</p>
        </div>
        <input className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="كلمة المرور الحالية" autoComplete="current-password" />
        <input className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="كلمة المرور الجديدة (8 أحرف)" autoComplete="new-password" />
        <input className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" type="password" required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="تأكيد كلمة المرور الجديدة" autoComplete="new-password" />
        <button disabled={submitting} className="w-full py-3 rounded-xl bg-[hsl(43,96%,56%)] text-[hsl(222,47%,11%)] font-black disabled:opacity-60">
          {submitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
        </button>
      </form>
    </div>
  );
}