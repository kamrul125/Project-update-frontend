import { useEffect, useState } from "react";
import API from "../../utils/api";
import { useRouter } from "next/router";

export default function CreateIdea() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  // ডিফল্ট ৪টি ক্যাটাগরি যা আমরা সবসময় দেখাতে চাই
  const staticCategories = [
    { id: "energy-id", name: "Energy" },
    { id: "waste-id", name: "Waste" },
    { id: "transportation-id", name: "Transportation" },
    { id: "sustainability-id", name: "Sustainability" }
  ];

  const getAuthHeader = () => {
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("accessToken")) : null;
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFetchingCategories(true);
        const res = await API.get("/categories");
        const dbData = res.data?.data || res.data || [];
        
        // এপিআই থেকে ডেটা আসলে সেটার সাথে আমাদের স্ট্যাটিক ক্যাটাগরিগুলো মিলিয়ে ফেলবো
        // যাতে কোনো ডুপ্লিকেট না হয় (নামের ভিত্তিতে চেক করে)
        if (Array.isArray(dbData) && dbData.length > 0) {
          const combined = [...staticCategories];
          dbData.forEach((dbCat: any) => {
            const exists = combined.some(c => c.name.toLowerCase() === dbCat.name.toLowerCase());
            if (!exists) {
              combined.push(dbCat);
            } else {
              // যদি ডাটাবেসে এই নামে ক্যাটাগরি থাকে, তবে স্ট্যাটিক ID-র বদলে ডাটাবেসের ID ব্যবহার করা ভালো
              const index = combined.findIndex(c => c.name.toLowerCase() === dbCat.name.toLowerCase());
              combined[index].id = dbCat.id;
            }
          });
          setCategories(combined);
        } else {
          setCategories(staticCategories);
        }
      } catch (err: any) {
        console.error("Fetch Error:", err.message);
        setCategories(staticCategories);
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      alert("Please select a category!");
      return;
    }

    setLoading(true);
    try {
      const ideaData = {
        title: title.trim(),
        description: description.trim(),
        categoryId: category,
        image: image.trim() !== "" 
          ? image.trim() 
          : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000",
      };

      const response = await API.post("/ideas", ideaData, getAuthHeader());
      
      if (response.data.success || response.status === 201) {
        alert("🎉 Green Vision Shared Successfully!");
        router.push("/dashboard/member");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to share your idea!";
      alert(`❌ Error: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const getEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("waste")) return "♻️";
    if (n.includes("energy")) return "⚡";
    if (n.includes("transportation")) return "🚗";
    if (n.includes("sustainability") || n.includes("eco")) return "🌱";
    return "🌍";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex items-center justify-center px-4 py-16 font-sans grow">
        <div className="w-full max-w-2xl p-10 bg-white border border-gray-100 shadow-2xl rounded-[2.5rem] md:p-12">
          
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-4xl font-black text-gray-900">
              Create New <span className="text-green-600">Idea</span>
            </h1>
            <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
              Share your vision for a greener world
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Idea Title</label>
              <input 
                type="text" 
                placeholder="Enter your idea name..." 
                className="w-full p-5 font-bold text-gray-800 border-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>

            {/* Category Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Category</label>
              <div className="relative">
                <select 
                  className="w-full p-5 font-bold text-gray-800 border-none cursor-pointer bg-gray-50 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none appearance-none" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {fetchingCategories ? (
                    <option disabled>Loading...</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {getEmoji(cat.name)}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Image URL (Optional)</label>
              <input 
                type="text" 
                placeholder="https://example.com/image.jpg" 
                className="w-full p-5 font-bold text-gray-800 border-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" 
                value={image} 
                onChange={(e) => setImage(e.target.value)} 
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Description</label>
              <textarea 
                placeholder="Describe your idea in detail..." 
                rows={6} 
                className="w-full p-5 font-bold text-gray-800 border-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none leading-relaxed" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-5 text-lg font-black text-white bg-green-600 rounded-2xl shadow-xl hover:bg-gray-900 transition-all uppercase tracking-widest ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Processing..." : "Post My Idea 🚀"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}