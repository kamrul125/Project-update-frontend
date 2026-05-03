import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import API from "../../utils/api";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1497215728101-856f4ea42174";

export default function IdeaDetails() {
  const router = useRouter();
  const { id: queryId, edit } = router.query; 
  const id = typeof queryId === "string" ? queryId : "";

  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // ✅ এডিট ফর্মে ইমেজ (image) স্টেট যোগ করা হয়েছে
  const [editData, setEditData] = useState({ title: "", description: "", image: "" });
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [relatedIdeas, setRelatedIdeas] = useState<any[]>([]);
  const [votes, setVotes] = useState(0);
  const [isVoted, setIsVoted] = useState(false);

  const getAuthHeader = () => {
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("accessToken")) : null;
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) setCurrentUser(JSON.parse(user));
    }
  }, []);

  const fetchIdeaDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res: any = await API.get(`/ideas/${id}`);
      const ideaData = res.data?.data || res.data;
      setIdea(ideaData);
      setComments(ideaData?.comments || []);
      setVotes(ideaData.voteCount || 0);
      // ✅ ফেচ করার সময় ইমেজ ডাটা সেট করা
      setEditData({ 
        title: ideaData.title, 
        description: ideaData.description,
        image: ideaData.image || "" 
      });

      // Fetch related ideas
      if (ideaData.category?.name) {
        try {
          const relatedRes = await API.get(`/ideas?category=${ideaData.category.name}&limit=4`);
          const relatedData = relatedRes.data?.data || [];
          setRelatedIdeas(relatedData.filter((i: any) => i.id !== id));
        } catch (err) {
          console.error("Related ideas fetch error:", err);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (router.isReady && id) {
      fetchIdeaDetails();
      if (edit === "true") setIsEditMode(true);
    }
  }, [id, router.isReady, fetchIdeaDetails, edit]);

  const handleUpdateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ✅ এখন editData এর সাথে ইমেজও সার্ভারে যাবে
      const res = await API.patch(`/ideas/${id}`, editData, getAuthHeader());
      if (res.data.success) {
        alert("Idea updated successfully! ✅");
        setIsEditMode(false);
        fetchIdeaDetails();
        router.push(`/ideas/${id}`, undefined, { shallow: true });
      }
    } catch (err) {
      alert("Update failed!");
    }
  };

  const handleVote = async () => {
    if (!currentUser) {
      alert("Please login to vote.");
      return;
    }
    try {
      const res = await API.post(`/votes/${id}`, { type: "UPVOTE" }, getAuthHeader());
      if (res.data?.success) {
        if (isVoted) {
          setVotes((prev) => prev - 1);
          setIsVoted(false);
        } else {
          setVotes((prev) => prev + 1);
          setIsVoted(true);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("Please login to vote.");
      } else {
        alert("Vote failed.");
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser) {
      alert("Please login to comment.");
      return;
    }

    try {
      const res = await API.post(
        `/comments/${id}`,
        { content: newComment },
        getAuthHeader()
      );

      if (res.data?.success) {
        const addedComment = res.data?.data;
        setComments((prev) => [addedComment, ...prev]);
        setNewComment("");
      } else {
        alert("Failed to post comment.");
      }
    } catch (err) {
      console.error("Comment submit error:", err);
      alert("Failed to post comment.");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen font-black text-emerald-600 animate-pulse text-2xl tracking-tighter">LOADING IDEA...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="w-full max-w-4xl px-6 py-12 mx-auto grow">
        
        {isEditMode ? (
          <div className="bg-white shadow-2xl rounded-4xl p-8 md:p-12 border border-indigo-50 animate-in fade-in zoom-in-95">
            <h1 className="text-3xl font-black text-gray-900 mb-10">Edit Your Idea</h1>
            <form onSubmit={handleUpdateIdea} className="space-y-8">
              
              {/* 🖼️ Image URL Input & Preview Section */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Idea Image URL</label>
                <input 
                  type="text" 
                  value={editData.image}
                  onChange={(e) => setEditData({...editData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-800 mb-4"
                />
                {editData.image && (
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-gray-100 shadow-inner bg-gray-50">
                    <img src={editData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-black/50 text-white text-[8px] px-2 py-1 rounded-full backdrop-blur-sm font-bold uppercase tracking-widest">Live Preview</div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Title</label>
                <input 
                  type="text" 
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Description</label>
                <textarea 
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows={8}
                  className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed font-medium text-gray-600"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="px-12 py-5 bg-gray-900 text-white text-[11px] font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-xl uppercase tracking-widest">SAVE CHANGES</button>
                <button type="button" onClick={() => setIsEditMode(false)} className="px-8 py-5 text-gray-400 text-[11px] font-black hover:text-rose-500 uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          /* 👁️ View Mode */
          <>
            <div className="bg-white shadow-2xl rounded-4xl mb-10 overflow-hidden border border-gray-100">
              <img src={idea?.image || DEFAULT_IMAGE} className="object-cover w-full h-100" alt={idea?.title} />
              <div className="p-8 md:p-14">
                <div className="flex justify-between items-start mb-8 gap-4">
                  <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">{idea?.title}</h1>
                  {currentUser?.id === idea?.userId && (
                    <button onClick={() => setIsEditMode(true)} className="shrink-0 px-6 py-3 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-2xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest border border-indigo-100 shadow-sm">Edit Idea</button>
                  )}
                </div>
                <p className="text-lg text-gray-500 leading-relaxed whitespace-pre-line font-medium">{idea?.description}</p>

                {/* Voting Section */}
                <div className="mt-8 flex items-center gap-4">
                  <button 
                    onClick={handleVote} 
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all ${isVoted ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}
                  >
                    <span className="text-sm font-black">👍 Vote</span>
                    <span className="text-lg font-black">{votes}</span>
                  </button>
                  <div className="text-sm text-gray-500">
                    Category: <span className="font-semibold text-emerald-600">{idea?.category?.name || "General"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 💬 Comment Input Box */}
            <div className="bg-white p-8 md:p-10 rounded-4xl shadow-xl mb-10 border border-emerald-50">
              <h3 className="mb-6 text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="text-2xl">💬</span> Share your thoughts
              </h3>
              <form onSubmit={handleAddComment} className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="আপনার মতামত লিখুন..."
                  className="flex-1 p-5 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
                />
                <button type="submit" className="px-10 py-5 font-black text-white bg-emerald-600 rounded-2xl hover:bg-gray-900 transition-all shadow-lg text-[11px] tracking-widest">POST</button>
              </form>
            </div>

            {/* 📜 Comments List */}
            <div className="bg-white p-8 md:p-12 rounded-4xl shadow-xl border border-gray-100">
              <h3 className="mb-10 text-2xl font-black text-gray-900">Comments <span className="text-emerald-500">({comments.length})</span></h3>
              <div className="space-y-8">
                {comments.length > 0 ? comments.map((c) => (
                  <div key={c.id} className="p-7 border border-gray-50 rounded-[30px] bg-gray-50/40 hover:bg-white hover:border-emerald-50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700">
                          {c.user?.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-black text-[11px] text-gray-800 uppercase tracking-widest">{c.user?.name || "Member"}</span>
                      </div>
                    </div>
                    <p className="leading-relaxed text-gray-600 font-medium text-sm">{c.content || c.text || c.comment}</p>
                  </div>
                )) : (
                  <p className="text-center py-10 font-bold text-gray-300 italic text-lg">No comments yet. Be the first! ✨</p>
                )}
              </div>
            </div>

            {/* Related Items */}
            {relatedIdeas.length > 0 && (
              <div className="bg-white p-8 md:p-12 rounded-4xl shadow-xl border border-gray-100 mt-10">
                <h3 className="mb-8 text-2xl font-black text-gray-900">Related Ideas</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {relatedIdeas.slice(0, 4).map((relatedIdea) => (
                    <Link key={relatedIdea.id} href={`/ideas/${relatedIdea.id}`} className="group block">
                      <div className="rounded-4xl border border-gray-100 bg-gray-50 p-6 transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-900">
                        <div className="aspect-4/3 mb-4 overflow-hidden rounded-2xl bg-gray-100">
                          <img src={relatedIdea.image || DEFAULT_IMAGE} alt={relatedIdea.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 dark:text-gray-50 line-clamp-2">{relatedIdea.title}</h4>
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{relatedIdea.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs font-semibold text-emerald-600">{relatedIdea.category?.name}</span>
                          <span className="text-xs text-gray-400">👍 {relatedIdea.voteCount || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}