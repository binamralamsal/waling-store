import { useTheme } from "next-themes";

import { createAnimation } from "@/lib/theme-animations";

const styleId = "theme-transition-styles";

export function useAnimatedThemeSwitcher() {
  const { setTheme, ...values } = useTheme();

  function updateStyles(css: string) {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }

  function changeTheme(theme: "light" | "dark" | "system") {
    const animation = createAnimation("circle", "center");

    updateStyles(animation.css);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      setTheme(theme);
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }

  return { changeTheme, ...values };
}
