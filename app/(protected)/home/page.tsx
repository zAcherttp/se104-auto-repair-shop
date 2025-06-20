"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function Page() {
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = React.useCallback(() => {
    setIsDark(!isDark);
  }, [isDark]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button
        variant="ghost"
        size="icon"
        className="group/toggle extend-touch-target"
        onClick={toggleTheme}
        title="Toggle theme"
      >
        <span
          className={`transition-all duration-300 ${
            isDark ? "opacity-0 scale-95 rotate-180" : "opacity-100 rotate-0"
          }`}
        >
          <Moon />
        </span>

        <span
          className={`absolute transition-all duration-300 ${
            isDark ? "opacity-100 rotate-0" : "opacity-0 scale-105 -rotate-180"
          }`}
        >
          <Sun />
        </span>
        <span className="sr-only">Toggle theme</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="group/toggle extend-touch-target size-8 relative overflow-hidden"
        onClick={toggleTheme}
        title="Toggle theme"
      >
        {/* Moon icon */}
        <Moon
          className={`absolute inset-0 m-auto transition-all duration-500 ease-in-out transform ${
            isDark
              ? "opacity-0 scale-75 rotate-90"
              : "opacity-100 scale-100 rotate-0"
          }`}
        />

        {/* Sun icon */}
        <Sun
          className={`absolute inset-0 m-auto transition-all duration-500 ease-in-out transform ${
            isDark
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-75 -rotate-90"
          }`}
        />

        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
