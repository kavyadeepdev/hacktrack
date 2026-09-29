"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PrizeInput({
  prize,
  amount,
  onPrizeChange,
  onAmountChange,
}: {
  prize: string;
  amount: string;
  onPrizeChange: (value: string) => void;
  onAmountChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="prize-text">Prize (text)</Label>
        <Input
          id="prize-text"
          placeholder="e.g. 1st place, $2,000 + credits"
          value={prize}
          onChange={(e) => onPrizeChange(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="prize-amount">Prize amount</Label>
        <Input
          id="prize-amount"
          inputMode="decimal"
          placeholder="e.g. 2000"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
      </div>
    </div>
  );
}
