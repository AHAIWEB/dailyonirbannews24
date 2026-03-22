export interface CardTemplate {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  bgImage?: string;
  borderStyle?: string;
  fontStyle?: "normal" | "serif" | "decorative";
  logoText: string;
  subtitleText: string;
  footerLabel: string;
  footerUrl: string;
}

export interface CardControls {
  titleSize: number;
  quoteSize: number;
  titleX: number;
  titleY: number;
  imageX: number;
  imageY: number;
  imageScale: number;
}

export const DEFAULT_CONTROLS: CardControls = {
  titleSize: 16,
  quoteSize: 12,
  titleX: 0,
  titleY: 0,
  imageX: 0,
  imageY: 0,
  imageScale: 100,
};

export const PRESET_TEMPLATES: CardTemplate[] = [
  {
    id: "belabhumi-default",
    name: "বেলাভূমি ডিফল্ট",
    bgColor: "#0ea5e9",
    textColor: "#ffffff",
    accentColor: "#38bdf8",
    fontStyle: "normal",
    logoText: "বেলাভূমি NEWS",
    subtitleText: "Belabhumi News",
    footerLabel: "বেলাভূমি কণ্ঠ",
    footerUrl: "belabhuminews.lovable.app",
  },
  {
    id: "belabhumi-dark",
    name: "বেলাভূমি ডার্ক",
    bgColor: "#1e293b",
    textColor: "#f1f5f9",
    accentColor: "#0ea5e9",
    fontStyle: "normal",
    logoText: "বেলাভূমি NEWS",
    subtitleText: "Belabhumi News",
    footerLabel: "বেলাভূমি কণ্ঠ",
    footerUrl: "belabhuminews.lovable.app",
  },
  {
    id: "belabhumi-red",
    name: "বেলাভূমি ব্রেকিং",
    bgColor: "#dc2626",
    textColor: "#ffffff",
    accentColor: "#fbbf24",
    fontStyle: "normal",
    logoText: "বেলাভূমি NEWS",
    subtitleText: "BREAKING NEWS",
    footerLabel: "ব্রেকিং নিউজ",
    footerUrl: "belabhuminews.lovable.app",
  },
  {
    id: "hindu-siliguri",
    name: "হিন্দু শিলিগুড়ি",
    bgColor: "#ff6b00",
    textColor: "#ffffff",
    accentColor: "#fbbf24",
    fontStyle: "decorative",
    borderStyle: "4px solid #fbbf24",
    logoText: "হিন্দু শিলিগুড়ি",
    subtitleText: "Hindu Siliguri",
    footerLabel: "হিন্দু শিলিগুড়ি",
    footerUrl: "hindusiliguri.com",
  },
  {
    id: "hindu-orange",
    name: "হিন্দু সাফরন",
    bgColor: "#ea580c",
    textColor: "#fffbeb",
    accentColor: "#f59e0b",
    fontStyle: "serif",
    borderStyle: "3px solid #f59e0b",
    logoText: "হিন্দু শিলিগুড়ি",
    subtitleText: "Hindu Siliguri News",
    footerLabel: "শিলিগুড়ি সংবাদ",
    footerUrl: "hindusiliguri.com",
  },
  {
    id: "green-nature",
    name: "গ্রিন নেচার",
    bgColor: "#166534",
    textColor: "#ecfdf5",
    accentColor: "#4ade80",
    fontStyle: "normal",
    logoText: "বেলাভূমি NEWS",
    subtitleText: "Belabhumi News",
    footerLabel: "পরিবেশ ও প্রকৃতি",
    footerUrl: "belabhuminews.lovable.app",
  },
  {
    id: "elegant-gold",
    name: "এলিগ্যান্ট গোল্ড",
    bgColor: "#1c1917",
    textColor: "#fef3c7",
    accentColor: "#d97706",
    fontStyle: "serif",
    borderStyle: "2px solid #d97706",
    logoText: "বেলাভূমি NEWS",
    subtitleText: "Belabhumi News",
    footerLabel: "বেলাভূমি কণ্ঠ",
    footerUrl: "belabhuminews.lovable.app",
  },
  {
    id: "custom",
    name: "✨ কাস্টম টেম্পলেট",
    bgColor: "#ffffff",
    textColor: "#000000",
    accentColor: "#0ea5e9",
    fontStyle: "normal",
    logoText: "কাস্টম",
    subtitleText: "",
    footerLabel: "",
    footerUrl: "",
  },
];
