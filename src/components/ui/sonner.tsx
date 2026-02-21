import { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";
import { useSettings } from "@/hooks/useSettings";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function useResolvedTheme(): "light" | "dark" {
  const { theme } = useSettings();
  const [resolved, setResolved] = useState<"light" | "dark">(() => {
    if (theme === "light") return "light";
    if (theme === "dark" || theme === "deep-dark") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (theme === "light") {
      setResolved("light");
      return;
    }
    if (theme === "dark" || theme === "deep-dark") {
      setResolved("dark");
      return;
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setResolved(mq.matches ? "dark" : "light");
    const handler = () => setResolved(mq.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return resolved;
}

const Toaster = ({ ...props }: ToasterProps) => {
  const resolvedTheme = useResolvedTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-md group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton: "group-[.toast]:rounded-md group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-sm",
          cancelButton: "group-[.toast]:rounded-md group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
