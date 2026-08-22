import { useEffect, useState } from "react";

type HealthState =
  | { phase: "loading" }
  | { phase: "ready"; api: string; database: string }
  | { phase: "error"; message: string };

type HealthPayload = {
  status?: unknown;
  database?: unknown;
  mongo?: unknown;
};

const HEALTHY_VALUES = new Set(["ok", "healthy", "connected", "ready", "up"]);

function readStatus(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (value && typeof value === "object" && "status" in value) {
    return readStatus((value as { status?: unknown }).status, fallback);
  }

  return fallback;
}

function formatStatus(status: string): string {
  const words = status.replaceAll(/[_-]+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function StatusItem({ label, value }: { label: string; value: string }) {
  const isHealthy = HEALTHY_VALUES.has(value.toLowerCase());

  return (
    <div className="status-item">
      <dt>{label}</dt>
      <dd>
        <span className={`status-dot ${isHealthy ? "healthy" : "warning"}`} aria-hidden="true" />
        {formatStatus(value)}
      </dd>
    </div>
  );
}

export function App() {
  const [attempt, setAttempt] = useState(0);
  const [health, setHealth] = useState<HealthState>({ phase: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function checkHealth() {
      setHealth({ phase: "loading" });

      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as HealthPayload;

        if (!response.ok && typeof payload.status !== "string") {
          throw new Error(`Health check returned HTTP ${response.status}`);
        }

        setHealth({
          phase: "ready",
          api: readStatus(payload.status, "reachable"),
          database: readStatus(payload.database ?? payload.mongo, "unknown"),
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setHealth({
          phase: "error",
          message: error instanceof Error ? error.message : "Health check failed",
        });
      }
    }

    void checkHealth();
    return () => controller.abort();
  }, [attempt]);

  return (
    <main>
      <section className="health-panel" aria-labelledby="health-title">
        <header>
          <p className="eyebrow">Runtime check</p>
          <h1 id="health-title">System health</h1>
          <p className="summary">Live connectivity results from the application health endpoint.</p>
        </header>

        <div className="health-result" aria-live="polite">
          {health.phase === "loading" && (
            <div className="loading-state" role="status">
              <span className="loading-mark" aria-hidden="true" />
              Checking API and database…
            </div>
          )}

          {health.phase === "ready" && (
            <dl className="status-list">
              <StatusItem label="API" value={health.api} />
              <StatusItem label="Database" value={health.database} />
            </dl>
          )}

          {health.phase === "error" && (
            <div className="error-state" role="alert">
              <div>
                <strong>Health check unavailable</strong>
                <p>{health.message}</p>
              </div>
              <button type="button" onClick={() => setAttempt((current) => current + 1)}>
                Retry
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
