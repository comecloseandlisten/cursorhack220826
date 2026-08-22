import type { MessageView } from "../types/messages";

const API_BASE = "/api/v1";
const DEMO_SID = "system";
export const DEFAULT_CANVAS_ID = "canvas_default";
export const DIGEST_POLL_MS = 8_000;

export type CanvasSummary = {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
};

export function ensureDemoSession(): void {
  document.cookie = `sid=${DEMO_SID}; path=/; SameSite=Lax`;
}

export function pickCanvasId(canvases: CanvasSummary[]): string {
  if (canvases.some((canvas) => canvas.id === DEFAULT_CANVAS_ID)) {
    return DEFAULT_CANVAS_ID;
  }

  return canvases[0]?.id ?? DEFAULT_CANVAS_ID;
}

export async function loadLiveMessages(): Promise<MessageView[] | null> {
  ensureDemoSession();

  try {
    const canvases = await listCanvases();
    return await listMessages(pickCanvasId(canvases));
  } catch {
    return null;
  }
}

async function listCanvases(): Promise<CanvasSummary[]> {
  const payload = await getJson<{ items?: CanvasSummary[] }>("/canvases");
  return payload.items ?? [];
}

async function listMessages(canvasId: string): Promise<MessageView[]> {
  const query = new URLSearchParams({ canvasId });
  const payload = await getJson<{ items?: MessageView[] }>(`/messages?${query}`);
  return payload.items ?? [];
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}
