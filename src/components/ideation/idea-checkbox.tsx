"use client";

interface IdeaCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

/**
 * B3 — per-idea checkbox. Checked = Implemented, unchecked = back to
 * draft. 44px touch target for mobile.
 */
export function IdeaCheckbox({ checked, onChange, label }: IdeaCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className="size-5 min-h-[44px] min-w-[44px] shrink-0 accent-current"
    />
  );
}
