import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center transition-all duration-300 animate-in fade-in ${className}`}
    >
      <Loader2 className="animate-spin" />
    </div>
  );
}
