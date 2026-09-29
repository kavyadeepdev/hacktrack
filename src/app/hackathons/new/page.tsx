import { HackathonForm } from "@/components/hackathon/hackathon-form";

export default function NewHackathonPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Add hackathon</h1>
        <p className="text-sm text-muted-foreground">
          Start in “Reviewing” — update status as you apply and attend.
        </p>
      </div>
      <HackathonForm />
    </div>
  );
}
