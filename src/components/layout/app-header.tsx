import Link from "next/link";
import { Trophy } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex min-h-[44px] items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="size-4" />
          </span>
          HackTrack
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-1 sm:flex">
          <Link
            href="/teams"
            className="inline-flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Teams
          </Link>
          <Link
            href="/timeline"
            className="inline-flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Timeline
          </Link>
        </nav>
        <div className="flex items-center gap-1 sm:hidden">
          <Link
            href="/teams"
            className="inline-flex min-h-[44px] items-center rounded-md px-2 text-sm font-medium text-muted-foreground"
          >
            Teams
          </Link>
          <Link
            href="/timeline"
            className="inline-flex min-h-[44px] items-center rounded-md px-2 text-sm font-medium text-muted-foreground"
          >
            Timeline
          </Link>
        </div>
        <Link
          href="/hackathons/new"
          className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          + Add
        </Link>
      </div>
    </header>
  );
}
