import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            ProvacX
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </Link>
          </div>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              <span>📁</span> Projects
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              <span>📊</span> Reports
            </Link>
            <Link
              href="/dashboard/pricing"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              <span>💰</span> Pricing
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              <span>⚙️</span> Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
