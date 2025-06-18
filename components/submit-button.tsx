import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  text: string;
  isDisabled: boolean;
  className?: string;
}

export default function SubmitButton({
  text,
  isDisabled,
  className = "",
}: SubmitButtonProps) {
  return (
    <Button type="submit" className={`w-30 ${className}`} disabled={isDisabled}>
      <span
        className={`transition-all duration-300 ${
          isDisabled ? "opacity-0 blur-md scale-95" : "opacity-100 blur-0"
        }`}
      >
        {text}
      </span>

      <span
        className={`absolute transition-all duration-200 ${
          isDisabled ? "opacity-100 blur-0" : "opacity-0 blur-md scale-105"
        }`}
      >
        <Loader2 className="animate-spin" />
      </span>
    </Button>
  );
}
