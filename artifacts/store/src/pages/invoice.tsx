import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Printer, ArrowRight, Edit, Save, X } from "lucide-react";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";

const currencySymbols: Record<string, string> = {
  USD: "$",
  SAR: "ر.س",
  YER: "ر.ي",
};

const exchangeRates: Record<string, number> = {
  USD: 1,
  SAR: 3.75,
  YER: 250,
};

const paymentLabels: Record<string, string> = {
  jeebpay: "محفظة جيب",
  kuraimi: "محفظة كريمي",
  jawali: "محفظة جوالي",
  cod: "الدفع عند الاستلام",
};

export default function InvoicePage() {
  const [match, params] = useRoute("/invoice/:id");
  const orderId = params?.id ? parseInt(params.id, 10) : 0;
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: ["getOrder", orderId] as any },
  });
  const { settings } = useStoreSettings();
  const [editing, setEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<any[]>([]);

  const now = new Date();
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-[hsl(43,96%,56%)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">لم يتم العثور على الطلب</p>
      </div>
    );
  }

  const o = order as any;
  const symbol = currencySymbols[o.currency] || "$";
  const rate = exchangeRates[o.currency] || 1;
  const date = new Date(o.createdAt);

  const displayItems = editing ? editedItems : (o.items || []);

  const handleEditStart = () => {
    setEditedItems(o.items?.map((item: any) => ({ ...item })) || []);
    setEditing(true);
  };

  const handleEditSave = () => {
    setEditing(false);
  };

  const editTotal = editing
    ? editedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    : o.totalAmount;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-page { box-shadow: none; margin: 0; padding: 20px; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <div className="no-print flex justify-between items-center mb-4 flex-wrap gap-3">
          <Link href="/products" className="flex items-center gap-1 text-[hsl(222,47%,20%)] font-medium hover:underline">
            <span>العودة للمتجر</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex gap-2">
            {!editing ? (
              <button
                onClick={handleEditStart}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                تعديل الفاتورة
              </button>
            ) : (
              <>
                <button
                  onClick={handleEditSave}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  حفظ التعديلات
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 bg-gray-400 text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  إلغاء
                </button>
              </>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-[hsl(222,47%,20%)] text-[hsl(43,96%,56%)] px-6 py-2 rounded-lg font-bold hover:bg-[hsl(222,47%,25%)] transition-colors cursor-pointer"
              data-testid="button-print"
            >
              <Printer className="w-4 h-4" />
              طباعة الفاتورة
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl print-page" id="invoice">
          <div className="bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(222,47%,20%)] rounded-t-xl p-8 text-white text-center">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.storeName} className="w-20 h-20 mx-auto rounded-xl object-cover mb-4 border-2 border-[hsl(43,96%,56%)]" />
            ) : (
              <div className="w-20 h-20 mx-auto bg-[hsl(43,96%,56%)] rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl font-black text-[hsl(222,47%,11%)]">ح</span>
              </div>
            )}
            <h1 className="text-3xl font-black text-[hsl(43,96%,56%)] mb-1">{settings.storeName}</h1>
            <div className="flex items-center justify-center gap-6 text-gray-300 text-sm mt-3 flex-wrap">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[hsl(43,96%,56%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {settings.storeAddress}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[hsl(43,96%,56%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {settings.phone}
              </span>
              {settings.storeWebsite && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-[hsl(43,96%,56%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {settings.storeWebsite}
                </span>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-xs">التاريخ</p>
                <p className="text-[hsl(43,96%,56%)] font-bold text-sm">{date.toLocaleDateString("ar")}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">اليوم</p>
                <p className="text-[hsl(43,96%,56%)] font-bold text-sm">{days[date.getDay()]}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">الوقت</p>
                <p className="text-[hsl(43,96%,56%)] font-bold text-sm">{date.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-500 text-xs">رقم الفاتورة</p>
                <p className="text-2xl font-black text-[hsl(222,47%,11%)]">INV-{String(o.id).padStart(6, "0")}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">حالة الطلب</p>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  o.status === "completed" ? "bg-green-100 text-green-700" :
                  o.status === "delivered" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {o.status === "pending" ? "قيد المعالجة" :
                   o.status === "completed" ? "مكتمل" :
                   o.status === "delivered" ? "تم التوصيل" :
                   o.status === "processing" ? "قيد التجهيز" :
                   o.status === "shipped" ? "تم الشحن" : o.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-xl p-4">
              {[
                { label: "اسم العميل", value: o.customerName },
                { label: "رقم الهاتف", value: o.customerPhone },
                { label: "البريد الالكتروني", value: o.customerEmail },
                { label: "العنوان", value: o.customerAddress },
                { label: "طريقة الدفع", value: paymentLabels[o.paymentMethod] || o.paymentMethod },
                { label: "العملة", value: o.currency },
              ].map((row, i) => (
                <div key={i}>
                  <p className="text-gray-500 text-xs">{row.label}</p>
                  <p className="font-bold text-gray-900 text-sm">{row.value}</p>
                </div>
              ))}
            </div>

            <table className="w-full mb-6 rounded-xl overflow-hidden border border-gray-100">
              <thead>
                <tr className="bg-[hsl(222,47%,11%)] text-[hsl(43,96%,56%)]">
                  <th className="py-3 px-3 text-right text-sm">#</th>
                  <th className="py-3 px-3 text-right text-sm">اسم الصنف</th>
                  <th className="py-3 px-3 text-center text-sm">الكمية</th>
                  <th className="py-3 px-3 text-center text-sm">السعر</th>
                  <th className="py-3 px-3 text-left text-sm">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item: any, i: number) => (
                  <tr key={item.id || i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="py-3 px-3">
                      {editing ? (
                        <input
                          type="text"
                          value={item.productName}
                          onChange={e => {
                            const next = [...editedItems];
                            next[i] = { ...next[i], productName: e.target.value };
                            setEditedItems(next);
                          }}
                          className="w-full px-2 py-1 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[hsl(43,96%,56%)]"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{item.productName}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {editing ? (
                        <input
                          type="number"
                          value={item.quantity}
                          min={1}
                          onChange={e => {
                            const next = [...editedItems];
                            next[i] = { ...next[i], quantity: parseInt(e.target.value) || 1 };
                            setEditedItems(next);
                          }}
                          className="w-16 px-2 py-1 border rounded-lg text-sm text-center outline-none focus:ring-1 focus:ring-[hsl(43,96%,56%)]"
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {editing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={e => {
                            const next = [...editedItems];
                            next[i] = { ...next[i], price: parseFloat(e.target.value) || 0 };
                            setEditedItems(next);
                          }}
                          className="w-20 px-2 py-1 border rounded-lg text-sm text-center outline-none focus:ring-1 focus:ring-[hsl(43,96%,56%)]"
                        />
                      ) : (
                        `$${item.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="py-3 px-3 text-left font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-[hsl(43,96%,56%)] pt-4 bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>المجموع (بالدولار)</span>
                <span>${editTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-black text-[hsl(222,47%,11%)]">
                <span>المبلغ الاجمالي ({o.currency})</span>
                <span className="text-[hsl(43,96%,56%)]">{symbol} {(editTotal * rate).toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-[hsl(43,96%,56%)] font-bold mb-1">شكرا لتسوقكم من {settings.storeName}</p>
              <p className="text-gray-400 text-sm">{settings.storeAddress} | {settings.phone}</p>
              <p className="text-gray-300 text-xs mt-2">{settings.copyright}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
