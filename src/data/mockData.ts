export interface Post {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  label: string;
  author: string;
  authorTitle?: string;
  authorImage?: string;
  date: string;
  isVideo?: boolean;
}

const images = [
  "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
];

const portraitImages = [
  "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=500&fit=crop",
];

const titles = [
  "সরকারের নতুন নীতিমালা ঘোষণা: অর্থনৈতিক সংস্কারে জোর",
  "জাতীয় নির্বাচন কমিশনের গুরুত্বপূর্ণ সিদ্ধান্ত প্রকাশ",
  "আন্তর্জাতিক সম্মেলনে বাংলাদেশের প্রতিনিধিদল",
  "শিক্ষা খাতে বাজেট বরাদ্দ বৃদ্ধির পরিকল্পনা",
  "প্রযুক্তি খাতে নতুন বিনিয়োগের সুযোগ তৈরি হচ্ছে",
  "স্বাস্থ্যসেবায় ডিজিটাল রূপান্তর: নতুন যুগের সূচনা",
  "ক্রিকেটে বাংলাদেশের ঐতিহাসিক জয়",
  "কৃষি খাতে আধুনিকায়নের নতুন পদক্ষেপ",
  "বিদ্যুৎ উৎপাদনে নবায়নযোগ্য শক্তির ব্যবহার বাড়ছে",
  "পরিবেশ সংরক্ষণে জাতীয় কর্মসূচি গ্রহণ",
  "রাজধানীতে নতুন মেট্রোরেল সম্প্রসারণ প্রকল্প",
  "বৈদেশিক মুদ্রার রিজার্ভ বৃদ্ধি পেয়েছে",
  "সামাজিক নিরাপত্তা কর্মসূচি সম্প্রসারণ করা হবে",
  "দেশের পর্যটন শিল্পে নতুন সম্ভাবনা",
  "তরুণ উদ্যোক্তাদের জন্য বিশেষ ঋণ সুবিধা ঘোষণা",
];

const excerpts = [
  "দেশের অর্থনৈতিক উন্নয়নে নতুন গতি আনতে সরকার বেশ কিছু গুরুত্বপূর্ণ সিদ্ধান্ত নিয়েছে।",
  "জাতীয় পর্যায়ে এই সিদ্ধান্ত ব্যাপক প্রভাব ফেলবে বলে মনে করছেন বিশ্লেষকরা।",
  "আন্তর্জাতিক মঞ্চে বাংলাদেশের অবস্থান আরও শক্তিশালী হচ্ছে।",
];

const authors = [
  { name: "মোহাম্মদ আলী", title: "সিনিয়র সংবাদদাতা", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { name: "ফাতেমা বেগম", title: "বিশেষ প্রতিনিধি", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
  { name: "রহিম উদ্দিন", title: "রাজনৈতিক বিশ্লেষক", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
  { name: "শাহানা পারভীন", title: "কলামিস্ট", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
  { name: "কামাল হোসেন", title: "স্টাফ রিপোর্টার", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
];

export function generatePosts(label: string, count: number, usePortrait = false): Post[] {
  return Array.from({ length: count }, (_, i) => ({
    id: Math.random() * 10000,
    title: titles[(i + label.length) % titles.length],
    excerpt: excerpts[i % excerpts.length],
    image: usePortrait
      ? portraitImages[i % portraitImages.length]
      : images[i % images.length],
    label,
    author: authors[i % authors.length].name,
    authorTitle: authors[i % authors.length].title,
    authorImage: authors[i % authors.length].image,
    date: "০১ মার্চ ২০২৬",
  }));
}

export const breakingNews = [
  "সরকারের নতুন নীতিমালা ঘোষণা হয়েছে",
  "জাতীয় সংসদে গুরুত্বপূর্ণ বিল উত্থাপন",
  "আন্তর্জাতিক সম্মেলনে বাংলাদেশের সাফল্য",
  "অর্থনৈতিক প্রবৃদ্ধি ৭ শতাংশ ছাড়িয়েছে",
  "নতুন শিক্ষানীতি অনুমোদন করেছে মন্ত্রিসভা",
];

export const divisions = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];
export const districts = ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "মানিকগঞ্জ", "মুন্সীগঞ্জ"];
export const upazilas = ["সাভার", "ধামরাই", "কেরানীগঞ্জ", "নবাবগঞ্জ"];
