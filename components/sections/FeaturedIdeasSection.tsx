import { motion } from "framer-motion";

const ideas = [
  {
    id: 1,
    title: "Solar Roof Share",
    category: "Energy",
    description: "A neighborhood initiative to install shared rooftop solar for apartments and small businesses.",
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Plastic-Free Market",
    category: "Waste",
    description: "An e-commerce concept that connects circular startups with package-free shoppers.",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Urban Bike Library",
    category: "Transportation",
    description: "Shared electric bikes and repair clubs designed to cut car trips and improve air quality.",
    image: "https://images.unsplash.com/photo-1516910817561-2f33c146f4ef?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "Green Workspace Retrofit",
    category: "Sustainability",
    description: "A project to upgrade coworking spaces with sensors, green materials, and waste-reduction systems.",
    image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=900&q=80",
  },
];

export default function FeaturedIdeasSection() {
  return (
    <section className="px-6 py-20 mx-auto max-w-7xl sm:px-10 lg:px-12">
      <div className="mb-12 text-center">
        <p className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">
          Featured ideas
        </p>
        <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Innovative sustainability concepts ready for action.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Explore real projects shaping cleaner streets, smarter buildings, and stronger climate resilience.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {ideas.map((idea, index) => (
          <motion.article
            key={idea.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="group overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src={idea.image}
                alt={idea.title}
                onError={(event) => {
                  const img = event.currentTarget as HTMLImageElement;
                  img.onerror = null;
                  img.src = 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=900&q=80';
                }}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 inline-flex rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-700/20">
                {idea.category}
              </span>
            </div>
            <div className="space-y-5 p-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{idea.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{idea.description}</p>
              </div>
              <button className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-emerald-700">
                View details
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
