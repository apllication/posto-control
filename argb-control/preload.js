const { contextBridge, ipcRenderer } = require("electron");
try {
  contextBridge.exposeInMainWorld("argbAPI", {
    detect: () => ipcRenderer.invoke("detect"),
    apply: (cfg) => ipcRenderer.invoke("apply", cfg),
    ping: () => ipcRenderer.invoke("ping"),
    checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
    onUpdateStatus: (callback) => ipcRenderer.on("update-status", (_, data) => callback(data))
  });
} catch (err) { console.error("[Posto ARGB] Falha ao carregar preload:", err); }
