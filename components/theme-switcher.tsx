"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { useMetaColor } from "@/hooks/use-meta-colors";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

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
      className="group/toggle extend-touch-target relative size-8 overflow-hidden"
      onClick={toggleTheme}
      title="Toggle theme"
      suppressHydrationWarning
    >
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ease-out ${
          resolvedTheme === "light"
            ? "rotate-180 scale-90 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />

      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ease-out ${
          resolvedTheme === "light"
            ? "rotate-0 scale-105 opacity-100"
            : "-rotate-180 scale-95 opacity-0"
        }`}
      />
      <Label className="sr-only">Toggle theme</Label>
    </Button>
  );
}
