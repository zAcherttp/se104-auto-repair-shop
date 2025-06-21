"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useMetaColor() {
  const { resolvedTheme } = useTheme();
  const [metaColor, setMetaColorState] = useState("#ffffff");

  useEffect(() => {
    const newMetaColor = resolvedTheme === "dark" ? "#0a0a0a" : "#ffffff";
    setMetaColorState(newMetaColor);
  }, [resolvedTheme]);

  const setMetaColor = (color: string) => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", color);
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.getElementsByTagName("head")[0].appendChild(meta);
    }
  };

  return { metaColor, setMetaColor };
}
