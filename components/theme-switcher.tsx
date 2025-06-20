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
      className="group/toggle extend-touch-target size-8"
      onClick={toggleTheme}
      title="Toggle theme"
    >
      <span
        className={`transition-all duration-300 ${
          resolvedTheme === "dark"
            ? "opacity-0 scale-95 rotate-180"
            : "opacity-100 rotate-0"
        }`}
      >
        <Moon />
      </span>

      <span
        className={`absolute transition-all duration-300 ${
          resolvedTheme === "dark"
            ? "opacity-100 rotate-0"
            : "opacity-0 scale-105 -rotate-180"
        }`}
      >
        <Sun />
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
