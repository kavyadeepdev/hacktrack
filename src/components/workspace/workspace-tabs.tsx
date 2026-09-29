"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface WorkspaceTab {
  slug: string;
  label: string;
  href: string;
}

export function workspaceTabs(hackathonId: string): WorkspaceTab[] {
  const base = `/workspace/${hackathonId}`;
  return [
    { slug: "overview", label: "Overview", href: base },
    { slug: "schedule", label: "Schedule", href: `${base}/schedule` },
    { slug: "resources", label: "Resources", href: `${base}/resources` },
    { slug: "submissions", label: "Submissions", href: `${base}/submissions` },
    { slug: "outcomes", label: "Outcomes", href: `${base}/outcomes` },
    { slug: "ideate", label: "Ideate", href: `${base}/ideate` },
  ];
}

/**
 * B15 — workspace tab shell bar. Underline tabs, active tab primary-blue.
 * Client component (needs pathname); layout passes `hackathonId`.
 */
export function WorkspaceTabs({ hackathonId }: { hackathonId: string }) {
  const pathname = usePathname();
  const tabs = workspaceTabs(hackathonId);

  function isActive(tab: WorkspaceTab): boolean {
    if (tab.slug === "overview") return pathname === tab.href;
    return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
  }

  return (
    <nav
      aria-label="Workspace sections"
      className="flex gap-1 overflow-x-auto border-b"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.slug}
          href={tab.href}
          aria-current={isActive(tab) ? "page" : undefined}
          className={cn(
            "inline-flex min-h-[44px] shrink-0 items-center border-b-2 px-3 text-sm",
            isActive(tab)
              ? "border-[#006BFF] font-semibold text-[#006BFF]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
