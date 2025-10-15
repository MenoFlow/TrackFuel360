import { useEffect, useState } from "react";

const useCustomTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.classList.add(stored);
    }
  }, []);

  return { theme, setTheme };
};

export default useCustomTheme;
