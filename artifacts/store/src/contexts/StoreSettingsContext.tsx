import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storeWebsite: string;
  phone: string;
  whatsapp: string;
  email: string;
  currency: string;
  copyright: string;
  about: string;
  logoUrl: string;
  heroImageUrl: string;
  kuraimiOwner: string;
  kuraimiPhone: string;
  jeebOwner: string;
  jeebPhone: string;
  jawaliOwner: string;
  jawaliPhone: string;
  catIconWomen: string;
  catIconMen: string;
  catIconYouth: string;
  catIconChildren: string;
  catIconAll: string;
  catNameWomen: string;
  catNameMen: string;
  catNameYouth: string;
  catNameChildren: string;
  catNameAll: string;
  welcomeBgColor1: string;
  welcomeBgColor2: string;
}

const defaultSettings: StoreSettings = {
  storeName: "متجر الحكيمي للتخفيضات",
  storeAddress: "إب - حبيش، اليمن",
  storeWebsite: "hakeemi.store",
  phone: "771312997",
  whatsapp: "967771312997",
  email: "info@hakeemi.com",
  currency: "USD",
  copyright: "حقوق الطبع والنشر © 8/4/2026 - المبرمج المهندس زكريا فيصل العزعزي",
  about: "متجر الحكيمي للتخفيضات - متجر راقٍ للأحذية الفاخرة في إب حبيش اليمن",
  logoUrl: "",
  heroImageUrl: "",
  kuraimiOwner: "",
  kuraimiPhone: "",
  jeebOwner: "",
  jeebPhone: "",
  jawaliOwner: "",
  jawaliPhone: "",
  catIconWomen: "👠",
  catIconMen: "👞",
  catIconYouth: "👟",
  catIconChildren: "🧸",
  catIconAll: "✨",
  catNameWomen: "نسائي",
  catNameMen: "رجالي",
  catNameYouth: "شبابي",
  catNameChildren: "والدي",
  catNameAll: "الكل",
  welcomeBgColor1: "#0a0520",
  welcomeBgColor2: "#1a0a3d",
};

interface StoreSettingsContextType {
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | null>(null);

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

  useEffect(() => {
    let active = true;
    fetch("/api/store-settings", { credentials: "include" })
      .then(async response => {
        if (!response.ok) throw new Error("تعذر تحميل إعدادات المتجر");
        return response.json() as Promise<Record<string, unknown>>;
      })
      .then(remote => {
        if (active && remote && typeof remote === "object") {
          setSettings(prev => ({ ...prev, ...remote } as StoreSettings));
        }
      })
      .catch(() => {
        // Defaults keep the storefront usable while the API is unavailable.
      });
    return () => { active = false; };
  }, []);

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      void fetch("/api/store-settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).catch(() => undefined);
      return next;
    });
  };

  return (
    <StoreSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const ctx = useContext(StoreSettingsContext);
  if (!ctx) throw new Error("useStoreSettings must be used within StoreSettingsProvider");
  return ctx;
}
