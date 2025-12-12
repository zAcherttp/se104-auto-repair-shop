import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`fade-in flex animate-in items-center justify-center transition-all duration-300 ${className}`}
    >
      <Loader2 className="animate-spin" />
    </div>
  );
}
