import { useParams, Link } from "react-router-dom";
import { generatePosts } from "@/data/mockData";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import SidebarTabs from "@/components/news/SidebarTabs";
import SidebarWidget from "@/components/news/SidebarWidget";
import { Clock, Share2, Facebook, Twitter, MessageCircle, Printer, ChevronRight, ThumbsUp, ThumbsDown, Reply } from "lucide-react";
import { useState } from "react";
import UrlPreview from "@/components/news/UrlPreview";

const postBody = `
<p>দেশের অর্থনৈতিক উন্নয়নে নতুন গতি আনতে সরকার বেশ কিছু গুরুত্বপূর্ণ সিদ্ধান্ত নিয়েছে। বিশেষজ্ঞদের মতে, এই পদক্ষেপগুলো দেশের সামগ্রিক প্রবৃদ্ধিতে ইতিবাচক ভূমিকা রাখবে।</p>

<p>জাতীয় পর্যায়ে এই সিদ্ধান্ত ব্যাপক প্রভাব ফেলবে বলে মনে করছেন বিশ্লেষকরা। সরকারি কর্মকর্তারা জানিয়েছেন, আগামী অর্থবছর থেকে এই নীতিমালা কার্যকর হবে।</p>

<h2>প্রধান পদক্ষেপসমূহ</h2>

<p>সরকার নিম্নলিখিত পদক্ষেপগুলো গ্রহণ করেছে:</p>

<ul>
<li>শিল্প খাতে বিনিয়োগ সহজীকরণ</li>
<li>রপ্তানি বাণিজ্যে নতুন প্রণোদনা প্যাকেজ</li>
<li>ক্ষুদ্র ও মাঝারি শিল্প উদ্যোক্তাদের জন্য বিশেষ ঋণ সুবিধা</li>
<li>ডিজিটাল অবকাঠামো উন্নয়নে বিশেষ বরাদ্দ</li>
</ul>

<blockquote>
"এই পদক্ষেপগুলো বাস্তবায়ন হলে আগামী পাঁচ বছরে দেশের জিডিপি প্রবৃদ্ধি ৮ শতাংশে পৌঁছাবে" — অর্থনীতিবিদ ড. মোহাম্মদ ইউনুস
</blockquote>

<h2>বিশেষজ্ঞদের মতামত</h2>

<p>অর্থনীতিবিদরা মনে করেন, সরকারের এই সিদ্ধান্ত সময়োপযোগী। তবে এর সফল বাস্তবায়নের জন্য সুশাসন ও স্বচ্ছতা নিশ্চিত করতে হবে। পাশাপাশি দুর্নীতি রোধে কার্যকর পদক্ষেপ নিতে হবে।</p>

<p>এদিকে বিরোধী দল এই নীতিমালার কিছু বিষয়ে আপত্তি জানিয়েছে। তারা বলেছে, জনগণের প্রকৃত উন্নয়নে আরও ব্যাপক পরিকল্পনা দরকার।</p>

<h2>ভবিষ্যৎ পরিকল্পনা</h2>

<p>সরকার জানিয়েছে, আগামীতে আরও কিছু সংস্কারমূলক পদক্ষেপ নেওয়া হবে। বিশেষ করে শিক্ষা ও স্বাস্থ্য খাতে বিনিয়োগ বাড়ানো হবে। পাশাপাশি তথ্যপ্রযুক্তি খাতে তরুণ উদ্যোক্তাদের উৎসাহিত করতে বিশেষ কর্মসূচি হাতে নেওয়া হবে।</p>
`;

const mockComments = [
  { id: 1, name: "আবদুল করিম", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face", text: "চমৎকার প্রতিবেদন। এই ধরনের বিশ্লেষণমূলক লেখা আরও চাই।", date: "০১ মার্চ ২০২৬, ১০:৩০", likes: 12, dislikes: 1 },
  { id: 2, name: "নাসরিন আক্তার", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face", text: "সরকারের এই পদক্ষেপ সত্যিই প্রশংসনীয়। তবে বাস্তবায়ন নিয়ে আমি কিছুটা সন্দিহান।", date: "০১ মার্চ ২০২৬, ১১:১৫", likes: 8, dislikes: 3 },
  { id: 3, name: "রফিকুল ইসলাম", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face", text: "খুবই তথ্যবহুল। ধন্যবাদ বাংলাখবরকে।", date: "০১ মার্চ ২০২৬, ১২:০০", likes: 5, dislikes: 0 },
];

export default function PostPage() {
  const { id } = useParams();
  const post = generatePosts("জাতীয়", 1)[0];
  const relatedPosts = generatePosts("সম্পর্কিত", 4);
  const [commentText, setCommentText] = useState("");

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">জাতীয়</span>
        </div>
      </div>

      <div className="container mx-auto mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <article className="lg:col-span-8">
            {/* Post Header */}
            <div className="bg-card rounded shadow-sm p-4 md:p-6">
              <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-sm font-semibold uppercase">
                জাতীয়
              </span>
              <h1 className="text-xl md:text-3xl font-black text-foreground leading-relaxed mt-3">
                সরকারের নতুন নীতিমালা ঘোষণা: অর্থনৈতিক সংস্কারে জোর দেওয়া হবে আগামী অর্থবছর থেকে
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mt-4 pb-4 border-b border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <img src={post.authorImage} alt={post.author} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="font-semibold text-foreground block">{post.author}</span>
                    <span className="text-primary">{post.authorTitle}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ০১ মার্চ ২০২৬, ০৯:৩০</span>
                <span>আপডেট: ০১ মার্চ ২০২৬, ১২:৪৫</span>
              </div>

              {/* Share buttons */}
              <div className="flex items-center gap-2 mt-3 mb-4">
                <span className="text-xs text-muted-foreground mr-1">শেয়ার:</span>
                <button className="w-8 h-8 rounded-full bg-news-blue flex items-center justify-center text-primary-foreground hover:opacity-80 transition-opacity">
                  <Facebook className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:opacity-80 transition-opacity">
                  <Twitter className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-news-green flex items-center justify-center text-primary-foreground hover:opacity-80 transition-opacity">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:opacity-80 transition-opacity">
                  <Printer className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:opacity-80 transition-opacity">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Featured image */}
              <div className="rounded overflow-hidden aspect-video mb-6">
                <img
                  src="https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=900&h=500&fit=crop"
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center -mt-4 mb-6">ছবি: সংগৃহীত</p>

              {/* Post body */}
              <div
                className="prose prose-sm md:prose-base max-w-none text-foreground leading-[2] 
                  [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2
                  [&_p]:mb-4 [&_p]:text-sm [&_p]:md:text-base
                  [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:mb-4 [&_ul]:space-y-1 [&_li]:text-sm
                  [&_blockquote]:border-r-4 [&_blockquote]:border-primary [&_blockquote]:bg-muted [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:rounded-l [&_blockquote]:italic [&_blockquote]:text-sm [&_blockquote]:my-6"
                dangerouslySetInnerHTML={{ __html: postBody }}
              />

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground">ট্যাগ:</span>
                {["অর্থনীতি", "সংস্কার", "সরকার", "বাজেট", "বিনিয়োগ"].map(tag => (
                  <a key={tag} href="#" className="text-[11px] bg-muted text-muted-foreground px-2.5 py-1 rounded hover:bg-primary hover:text-primary-foreground transition-colors">
                    {tag}
                  </a>
                ))}
              </div>
            </div>

            {/* URL Preview */}
            <UrlPreview />

            {/* Author box */}
            <div className="bg-card rounded shadow-sm p-4 md:p-6 mt-4">
              <h3 className="text-sm font-bold text-foreground mb-4 border-b border-border pb-2">লেখক সম্পর্কে</h3>
              <div className="flex gap-4">
                <img src={post.authorImage} alt={post.author} className="w-20 h-20 rounded-full object-cover border-2 border-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">{post.author}</h4>
                  <span className="text-xs text-primary font-medium">{post.authorTitle}</span>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    ১৫ বছরের বেশি সময় ধরে সাংবাদিকতায় নিয়োজিত। জাতীয় ও আন্তর্জাতিক বিষয়ে বিশেষ দক্ষতা রয়েছে। একাধিক পুরস্কার প্রাপ্ত।
                  </p>
                  <div className="flex gap-2 mt-2">
                    <a href="#" className="text-muted-foreground hover:text-primary"><Facebook className="w-4 h-4" /></a>
                    <a href="#" className="text-muted-foreground hover:text-primary"><Twitter className="w-4 h-4" /></a>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            <div className="bg-card rounded shadow-sm p-4 md:p-6 mt-4">
              <h3 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">সম্পর্কিত সংবাদ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map(rp => (
                  <Link to={`/post/${rp.id}`} key={rp.id} className="post-card flex gap-3 group">
                    <div className="w-28 h-20 rounded overflow-hidden shrink-0">
                      <img src={rp.image} alt={rp.title} className="w-full h-full object-cover post-image" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-3">
                        {rp.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground mt-1 block">{rp.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-card rounded shadow-sm p-4 md:p-6 mt-4">
              <h3 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">
                মন্তব্য ({mockComments.length})
              </h3>

              {/* Comment form */}
              <div className="mb-6 p-4 bg-muted rounded">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="আপনার মন্তব্য লিখুন..."
                  className="w-full bg-card border border-border rounded p-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-xs font-semibold hover:opacity-90 transition-opacity">
                    মন্তব্য করুন
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-4">
                {mockComments.map(comment => (
                  <div key={comment.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                    <img src={comment.image} alt={comment.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{comment.name}</span>
                        <span className="text-[10px] text-muted-foreground">{comment.date}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{comment.text}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <ThumbsUp className="w-3 h-3" /> {comment.likes}
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <ThumbsDown className="w-3 h-3" /> {comment.dislikes}
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Reply className="w-3 h-3" /> উত্তর
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <SidebarTabs
              tabs={[
                { label: "আলোচিত", postLabel: "আলোচিত", count: 7 },
                { label: "স্পট লাইট", postLabel: "স্পট লাইট", count: 7 },
              ]}
            />
            <SidebarTabs
              title="জনপ্রিয়"
              tabs={[
                { label: "জনপ্রিয়", postLabel: "জনপ্রিয়", count: 7 },
              ]}
            />
            <SidebarWidget label="জটিল" title="জটিল" />
            <div className="bg-muted rounded flex items-center justify-center h-[250px] text-xs text-muted-foreground">
              বিজ্ঞাপন — ৩০০×২৫০
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
