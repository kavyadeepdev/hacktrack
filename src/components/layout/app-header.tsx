import Link from "next/link";
import { Trophy } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="size-4" />
          </span>
          HackTrack
        </Link>
        <Link
          href="/hackathons/new"
          className="inline-flex min-h-[40px] items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          + Add
        </Link>
      </div>
    </header>
  );
}
