import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface DashboardLayoutProps {
  userRole: "ADMIN" | "USER";
  children: ReactNode;
}

const adminNav = [
  { label: "Overview", href: "/dashboard/admin" },
  { label: "Idea Moderation", href: "/dashboard/moderation" },
  { label: "User Management", href: "/dashboard/users" },
];

const memberNav = [
  { label: "My Ideas", href: "/dashboard/member" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function DashboardLayout({ userRole, children }: DashboardLayoutProps) {
  const router = useRouter();
  const navItems = userRole === "ADMIN" ? adminNav : memberNav;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:block">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Dashboard
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">
              {userRole === "ADMIN" ? "Admin Console" : "Member Hub"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {userRole === "ADMIN"
                ? "Moderate ideas, manage users, and review performance."
                : "Manage your ideas and personalize your profile."}
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:hidden">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
              <h2 className="mt-3 text-2xl font-black text-slate-900">
                {userRole === "ADMIN" ? "Admin Console" : "Member Hub"}
              </h2>
            </div>
            <div className="grid gap-2">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
