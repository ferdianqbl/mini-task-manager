import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        role="checkbox"
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "peer h-5 w-5 shrink-0 rounded border border-border bg-[#0F172A]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-all duration-200 cursor-pointer",
          checked && "bg-primary border-primary text-primary-foreground",
          className,
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
      </button>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
