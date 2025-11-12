import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  showError?: boolean;
  showSuccess?: boolean;
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ className, error, showError = true, showSuccess = false, ...props }, ref) => {
    const hasError = error && showError;
    const isValid = !error && showSuccess && props.value && String(props.value).trim().length > 0;
    
    return (
      <div className="w-full">
        <Input
          className={cn(
            hasError && "border-destructive focus-visible:ring-destructive",
            isValid && "border-green-500 focus-visible:ring-green-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {hasError && (
          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
            <span>⚠</span>
            <span>{error}</span>
          </p>
        )}
        {isValid && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <span>✓</span>
            <span>Корректно</span>
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";

export { ValidatedInput };