import { useSyncExternalStore } from "react";

import { SIDEBAR_MOBILE_BREAKPOINT_PX } from "@/contexts/settingsStore";

const MOBILE_MEDIA = `(max-width: ${SIDEBAR_MOBILE_BREAKPOINT_PX - 1}px)`;

function subscribe(callback: () => void) {
  const mq = window.matchMedia(MOBILE_MEDIA);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return typeof window !== "undefined" ? window.matchMedia(MOBILE_MEDIA).matches : false;
}

function getServerSnapshot() {
  return false;
}

/** True when viewport width < SIDEBAR_MOBILE_BREAKPOINT_PX (768px). */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
