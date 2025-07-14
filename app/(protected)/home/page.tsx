"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import DateRangePicker from "@/components/date-range-picker";
import { Label } from "recharts";

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
        className="group/toggle size-16 extend-touch-target"
        onClick={toggleTheme}
        title="Toggle theme"
      >
        <Moon
          className={`absolute size-16 transition-all duration-300 ease-out ${
            isDark
              ? "opacity-0 scale-90 rotate-180"
              : "opacity-100 scale-100 rotate-0"
          }`}
        />

        <Sun
          className={`absolute size-16 transition-all duration-300 ease-out ${
            isDark
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-95 -rotate-180"
          }`}
        />

        <Label className="sr-only">Toggle theme</Label>
      </Button>

      <DateRangePicker />
    </div>
  );
}
