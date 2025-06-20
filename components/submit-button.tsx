import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { VariantProps } from "class-variance-authority";

interface SubmitButtonProps {
  children: React.ReactNode;
  disabled: boolean;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export default function SubmitButton({
  children,
  disabled,
  className = "",
  variant = "default",
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      className={`w-30 ${className}`}
      disabled={disabled}
    >
      <span
        className={`transition-all duration-300 ${
          disabled ? "opacity-0 blur-md scale-95" : "opacity-100 blur-0"
        }`}
      >
        {children}
      </span>

      <span
        className={`absolute transition-all duration-200 ${
          disabled ? "opacity-100 blur-0" : "opacity-0 blur-md scale-105"
        }`}
      >
        <Loader2 className="animate-spin" />
      </span>
    </Button>
  );
}
