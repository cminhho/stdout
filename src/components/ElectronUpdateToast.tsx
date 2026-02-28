import { useEffect } from "react";
import { toast } from "sonner";

const electronAPI = typeof window !== "undefined" ? window.electronAPI : undefined;

/**
 * Subscribes to Electron updater status and shows an in-app toast when an update
 * is downloaded (silent background). Toast includes a "Restart" action to quit and install.
 */
export function ElectronUpdateToast() {
  useEffect(() => {
    if (!electronAPI?.updater) return;

    const unsub = electronAPI.updater.onStatus((payload) => {
      if (payload.event !== "downloaded") return;

      const version = payload.version ? ` ${payload.version}` : "";
      toast("Update ready", {
        description: `Version${version} downloaded. Restart to install.`,
        action: {
          label: "Restart",
          onClick: () => electronAPI.updater?.quitAndInstall(),
        },
      });
    });

    return unsub;
  }, []);

  return null;
}
