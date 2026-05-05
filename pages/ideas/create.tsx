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

  const getAuthHeader = () => {
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("accessToken")) : null;
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        const dbData = res.data?.data || res.data || [];
        
        // যদি DB থেকে কোনো ক্যাটাগরি না আসে, তবে আমরা ড্রপডাউন খালি রাখবো না
        setCategories(dbData);
        if (dbData.length > 0) {
          setCategory(dbData[0].id);
        }
      } catch (err: any) {
        console.error("Fetch Error:", err.message);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category && categories.length > 0) {
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

  // ক্যাটাগরির নামের সাথে ইমোজি যোগ করার ফাংশন
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
              <select 
                className="w-full p-5 font-bold text-gray-800 border-none cursor-pointer bg-gray-50 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none appearance-none" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required
              >
                {categories.length > 0 ? (
                  <>
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name} {getEmoji(cat.name)}</option>
                    ))}
                  </>
                ) : (
                  <option value="">Loading Categories...</option>
                )}
              </select>
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
              <p className="text-[10px] text-gray-400 italic mt-1 ml-1">
                *If no link is provided, a professional eco-friendly image will be used.
              </p>
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

            {/* Submit Button */}
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