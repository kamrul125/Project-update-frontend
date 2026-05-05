import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import API from "../../utils/api";
import IdeaCard from "../../components/IdeaCard";
import SearchSuggestions from "../../components/SearchSuggestions";

export default function ExploreIdeas() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIdeas, setTotalIdeas] = useState(0);

  // Fetch dynamic categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        const data = res.data?.data || [];
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSuggestionSelect = (value: string) => {
    setSearchQuery(value);
    setDebouncedSearch(value);
    setCurrentPage(1);
  };

  // Debounce search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setCurrentUser(JSON.parse(userData));
        } catch (e) {
          console.error("User session error:", e);
        }
      }
    }
  }, []);

  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      params.append("sort", sortBy);
      params.append("page", currentPage.toString());
      params.append("limit", "12");

      const res = await API.get(`/ideas?${params.toString()}`);
      const data = res.data?.data || res.data?.result || res.data || [];
      const finalData = Array.isArray(data) ? data : [];
      
      setIdeas(finalData);
      setTotalPages(res.data?.totalPages || 1);
      setTotalIdeas(res.data?.total || finalData.length);
    } catch (err) {
      console.error("Fetch Error:", err);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sortBy, currentPage]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this idea from the platform?")) {
      try {
        await API.delete(`/ideas/${id}`);
        setIdeas((prev) => prev.filter((idea) => idea.id !== id));
        setTotalIdeas((prev) => prev - 1);
      } catch (err) {
        alert("Operation failed. You might not have permission to delete this.");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <main className="grow">
        <section className="px-6 py-16 mx-auto max-w-7xl sm:px-10 lg:px-12">
          
          <div className="mb-12 border-l-4 border-emerald-500 pl-6">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-slate-50 sm:text-5xl uppercase">
              Global <span className="text-emerald-600">Eco-Vault</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
              Explore a curated collection of sustainable innovations. Join the movement toward a greener future.
            </p>
          </div>

          {/* Search System */}
          <div className="relative mb-10 group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by keywords, tags, or technology..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-3xl border-2 border-slate-100 bg-white pl-14 pr-6 py-5 text-sm font-bold shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <SearchSuggestions query={searchQuery} onSelect={handleSuggestionSelect} />
          </div>

          {/* Filter Toolbar */}
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {["All", ...categories.map(c => c.name)].map((category) => (
                <button
                  key={category}
                  onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                  className={`rounded-2xl px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                    selectedCategory === category
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-300 dark:bg-slate-900 dark:border-slate-800"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 self-end lg:self-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort Matrix</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border-2 border-slate-100 bg-white px-4 py-2 text-xs font-bold focus:border-emerald-500 outline-none dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="newest">Latest Submissions</option>
                <option value="most_voted">Community Favorites</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-8 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Found <span className="text-emerald-600">{totalIdeas}</span> Results
            </p>
          </div>

          {/* Grid Engine */}
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-96 rounded-[40px] bg-white border border-slate-100 animate-pulse dark:bg-slate-900 dark:border-slate-800" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {ideas.length > 0 ? (
                  ideas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      currentUser={currentUser || undefined}
                      onDelete={handleDelete}
                      onEdit={(id) => router.push(`/ideas/${id}?edit=true`)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200 dark:bg-slate-900/50 dark:border-slate-800">
                    <div className="text-4xl mb-4">🌱</div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Innovations Found</h3>
                    <p className="mt-2 text-slate-500 font-medium tracking-tight">Try refining your filters or explore a different category.</p>
                  </div>
                )}
              </div>

              {/* Pagination Interface */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center">
                  <nav className="flex items-center gap-1 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-3 rounded-2xl hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${
                          currentPage === page
                            ? "bg-emerald-600 text-white shadow-md scale-110"
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-2xl hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}