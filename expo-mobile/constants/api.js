// ─── UPDATE THIS TO YOUR PC'S LOCAL IP ADDRESS ───────────────────────────────
// Run `ipconfig` in cmd and look for "IPv4 Address" under your WiFi adapter
// Example: const PC_IP = '192.168.1.100';
const PC_IP = '10.250.93.150';
// ─────────────────────────────────────────────────────────────────────────────

export const BACKEND_URL = `http://${PC_IP}:5000`;
export const AI_URL = `http://${PC_IP}:8000`;
