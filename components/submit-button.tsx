import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type React from "react";
import { Button, type buttonVariants } from "@/components/ui/button";

interface SubmitButtonProps {
  children: React.ReactNode;
  disabled: boolean;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  onClick?: () => void | Promise<void>;
  type?: "button" | "submit";
}

export default function SubmitButton({
  children,
  disabled,
  className = "",
  variant = "default",
  onClick,
  type = "submit",
}: SubmitButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      className={`w-30 ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span
        className={`transition-all duration-300 ${
          disabled ? "scale-95 opacity-0 blur-md" : "opacity-100 blur-0"
        }`}
      >
        {children}
      </span>

      <span
        className={`absolute transition-all duration-200 ${
          disabled ? "opacity-100 blur-0" : "scale-105 opacity-0 blur-md"
        }`}
      >
        <Loader2 className="animate-spin" />
      </span>
    </Button>
  );
}
