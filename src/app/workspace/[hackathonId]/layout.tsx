"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  Send,
  Trophy,
} from "lucide-react";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";
import { workspaceTabs } from "@/components/workspace/workspace-tabs";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  schedule: CalendarDays,
  resources: FolderOpen,
  submissions: Send,
  outcomes: Trophy,
  ideate: Lightbulb,
};

/**
 * B15 (desktop-first) — workspace shell. Full-width app frame with a left
 * section rail (screenshots 2–3), center content, and per-page right rails.
 * Below `lg` the rail collapses to the horizontal tab bar.
 */
export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = use(params);
  const pathname = usePathname();
  const tabs = workspaceTabs(hackathonId);

  function isActive(href: string, slug: string): boolean {
    if (slug === "overview") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-6">
      <nav className="flex items-center gap-2 text-sm" aria-label="Back">
        <a
          href={`/hackathons/${hackathonId}`}
          className="inline-flex h-[44px] items-center rounded underline-offset-4 hover:underline"
        >
          ← Back to hackathon
        </a>
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <a
          href="/timeline"
          className="inline-flex h-[44px] items-center rounded underline-offset-4 hover:underline"
        >
          Timeline
        </a>
      </nav>

      <div className="mt-2 flex gap-6">
        <aside
          aria-label="Workspace sections"
          className="hidden w-60 shrink-0 lg:block"
        >
          <div className="sticky top-6 space-y-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Workspace</h1>
              <p className="text-sm text-muted-foreground">
                Plan deadlines, collect resources, ship the submission.
              </p>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = ICONS[tab.slug] ?? LayoutDashboard;
                const active = isActive(tab.href, tab.slug);
                return (
                  <Link
                    key={tab.slug}
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium",
                      active
                        ? "bg-[#006BFF]/10 text-[#006BFF]"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1 lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight">Workspace</h1>
            <p className="text-sm text-muted-foreground">
              Plan deadlines, collect resources, ship the submission.
            </p>
          </div>
          <div className="lg:hidden">
            <WorkspaceTabs hackathonId={hackathonId} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
