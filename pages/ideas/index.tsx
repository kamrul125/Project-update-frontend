import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import API from "../../utils/api";
import IdeaCard from "../../components/IdeaCard";
import SearchSuggestions from "../../components/SearchSuggestions";

const categoryTabs = ["All", "Energy", "Waste", "Transportation", "Sustainability"];

export default function ExploreIdeas() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIdeas, setTotalIdeas] = useState(0);

  const handleSuggestionSelect = (value: string) => {
    setSearchQuery(value);
    setDebouncedSearch(value);
    setCurrentPage(1);
  };

  // Debounce search
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
          console.error(e);
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
      params.append("limit", "12"); // 4 per row, 3 rows

      const res = await API.get(`/ideas?${params.toString()}`);
      const data = res.data?.data || res.data?.result || res.data || [];
      const finalData = Array.isArray(data) ? data : [];
      setIdeas(finalData);
      setTotalPages(res.data?.totalPages || 1);
      setTotalIdeas(res.data?.total || finalData.length);
    } catch (err) {
      console.error("API Error:", err);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sortBy, currentPage]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this idea?")) {
      try {
        await API.delete(`/ideas/${id}`);
        setIdeas((prev) => prev.filter((idea) => idea.id !== id));
        setTotalIdeas((prev) => prev - 1);
      } catch (err) {
        alert("Unable to delete the idea.");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="grow">
        <section className="px-6 py-12 mx-auto max-w-7xl sm:px-10 lg:px-12">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Explore Ideas
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-400">
              Discover innovative eco-friendly ideas and support sustainable projects.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-700 dark:bg-slate-900"
            />
            <SearchSuggestions query={searchQuery} onSelect={handleSuggestionSelect} />
          </div>

          {/* Filters and Sorting */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              {categoryTabs.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === category
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="newest">Newest</option>
                <option value="most_voted">Most Voted</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {totalIdeas} ideas found
            </p>
          </div>

          {/* Ideas Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-80 rounded-4xl bg-slate-200/70 animate-pulse dark:bg-slate-800/70" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <div className="col-span-full rounded-4xl border border-dashed border-slate-300 bg-white p-16 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
                  <p className="text-xl font-black">No ideas found.</p>
                  <p className="mt-3 text-sm">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      currentPage === page
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}