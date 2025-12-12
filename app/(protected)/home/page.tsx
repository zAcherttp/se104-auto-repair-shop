"use client";

import { Moon, Sun } from "lucide-react";
import * as React from "react";
import { Label } from "recharts";
import DateRangePicker from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = React.useCallback(() => {
    setIsDark(!isDark);
  }, [isDark]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button
        variant="ghost"
        size="icon"
        className="group/toggle extend-touch-target size-16"
        onClick={toggleTheme}
        title="Toggle theme"
      >
        <Moon
          className={`absolute size-16 transition-all duration-300 ease-out ${
            isDark
              ? "rotate-180 scale-90 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        />

        <Sun
          className={`absolute size-16 transition-all duration-300 ease-out ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-180 scale-95 opacity-0"
          }`}
        />

        <Label className="sr-only">Toggle theme</Label>
      </Button>

      <DateRangePicker />
    </div>
  );
}
