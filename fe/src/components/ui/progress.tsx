import * as React from "react";
import { cn } from "../../lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800",
          className,
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-out"
          style={{
            transform: `translateX(-${100 - Math.min(Math.max(value || 0, 0), 100)}%)`,
          }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
