"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { useMetaColor } from "@/hooks/use-meta-colors";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const { setMetaColor, metaColor } = useMetaColor();

  React.useEffect(() => {
    setMetaColor(metaColor);
  }, [metaColor, setMetaColor]);

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group/toggle extend-touch-target size-8 relative overflow-hidden"
      onClick={toggleTheme}
      title="Toggle theme"
      suppressHydrationWarning
    >
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ease-out ${
          resolvedTheme === "light"
            ? "opacity-0 scale-90 rotate-180"
            : "opacity-100 scale-100 rotate-0"
        }`}
      />

      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ease-out ${
          resolvedTheme === "light"
            ? "opacity-100 scale-105 rotate-0"
            : "opacity-0 scale-95 -rotate-180"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
