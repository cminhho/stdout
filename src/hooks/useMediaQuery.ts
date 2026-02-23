import { useEffect, useState } from "react";

/**
 * Subscribes to a media query and returns whether it matches.
 * Useful for responsive layout (e.g. side-by-side vs stacked).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const m = window.matchMedia(query);
    const handler = () => setMatches(m.matches);
    handler();
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** Common breakpoint (min-width: 1024px). Use for two-panel side-by-side vs stacked. */
export const MEDIA_LG = "(min-width: 1024px)";

/** Convenience hook: true when viewport is lg or wider. */
export function useIsLg(): boolean {
  return useMediaQuery(MEDIA_LG);
}
