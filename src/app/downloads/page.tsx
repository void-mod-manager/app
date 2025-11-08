"use client";

import { invoke } from "@tauri-apps/api/core";
import {
  ClockIcon,
  DownloadIcon,
  ListIcon,
  PauseIcon,
  PlayIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/primitives/button";
import Input from "@/components/primitives/input";

type DownloadStatus =
  | "queued"
  | "active"
  | "paused"
  | "completed"
  | "failed"
  | "canceled";

interface DownloadItem {
  id: string;
  name: string;
  progress: number; // 0 - 100
  status: DownloadStatus;
  sizeBytes?: number;
  downloadedBytes?: number;
  speedBytesPerSec?: number;
  etaSeconds?: number;
  error?: string;
  enqueuedAt: number;
  startedAt?: number;
  finishedAt?: number;
}

const MAX_CONCURRENT = 3;
const PROGRESS_TICK_MS = 800;

function formatBytes(n?: number): string {
  if (!n || n <= 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let idx = 0;
  let val = n;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val.toFixed(val >= 10 ? 0 : 1)} ${units[idx]}`;
}

function formatEta(sec?: number): string {
  if (!sec || sec <= 0) return "-";
  if (sec < 60) return `${Math.ceil(sec)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m${s > 0 ? ` ${s}s` : ""}`;
}

function generateDisplayName(id: string) {
  return `Mod_${id.slice(0, 6)}`;
}

const DownloadsPage = () => {
  const [queued, setQueued] = useState<DownloadItem[]>([]);
  const [active, setActive] = useState<DownloadItem[]>([]);
  const [completed, setCompleted] = useState<DownloadItem[]>([]);
  const [failed, setFailed] = useState<DownloadItem[]>([]);
  const [newId, setNewId] = useState("");
  const [autoStart, setAutoStart] = useState(true);
  const tickRef = useRef<number | null>(null);

  // Promote queued downloads to active respecting concurrency
  const promote = useCallback(() => {
    setQueued((prevQueued) => {
      if (prevQueued.length === 0) return prevQueued;
      let startedCount = 0;
      setActive((prevActive) => {
        if (prevActive.length >= MAX_CONCURRENT) return prevActive;
        const needed = MAX_CONCURRENT - prevActive.length;
        const toStart = prevQueued.slice(0, needed).map((d) => ({
          ...d,
          status: "active" as const,
          startedAt: Date.now(),
          sizeBytes:
            d.sizeBytes ?? 10 * 1024 * 1024 + Math.random() * 150 * 1024 * 1024,
        }));
        startedCount = toStart.length;
        toStart.forEach((item) => {
          invoke("download_mod", { id: item.id }).catch((e) => {
            console.error(
              "Failed to initiate backend download for",
              item.id,
              e,
            );
          });
        });
        return [...prevActive, ...toStart];
      });
      return prevQueued.slice(startedCount);
    });
  }, []);

  // Simulation tick for progress
  useEffect(() => {
    tickRef.current = window.setInterval(() => {
      setActive((prev) => {
        const still: DownloadItem[] = [];
        const completedNow: DownloadItem[] = [];
        for (const item of prev) {
          if (item.status !== "active") {
            still.push(item);
            continue;
          }
          const speed =
            item.speedBytesPerSec ?? 200_000 + Math.random() * 1_250_000;
          const downloaded =
            (item.downloadedBytes ?? 0) + speed * (PROGRESS_TICK_MS / 1000);
          const size = item.sizeBytes ?? 100 * 1024 * 1024;
          const progress = Math.min(100, (downloaded / size) * 100);
          const eta = speed > 0 ? (size - downloaded) / speed : undefined;
          const updated: DownloadItem = {
            ...item,
            progress,
            speedBytesPerSec: speed,
            downloadedBytes: Math.min(downloaded, size),
            etaSeconds: eta && eta > 0 ? eta : 0,
          };
          if (progress >= 100) {
            completedNow.push({
              ...updated,
              status: "completed",
              finishedAt: Date.now(),
              progress: 100,
            });
          } else {
            still.push(updated);
          }
        }
        if (completedNow.length > 0) {
          setCompleted((prevC) => [...completedNow, ...prevC]);
        }
        return still;
      });
    }, PROGRESS_TICK_MS);
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
      }
    };
  }, []);

  // Finished items are handled inside the progress tick; removed separate effect.

  // Auto-promote when autoStart enabled
  useEffect(() => {
    if (autoStart && active.length < MAX_CONCURRENT && queued.length > 0) {
      promote();
    }
  }, [queued, active, autoStart, promote]);

  const totalActiveSpeed = useMemo(
    () => active.reduce((acc, d) => acc + (d.speedBytesPerSec ?? 0), 0),
    [active],
  );

  const handleQueue = () => {
    if (newId.trim() === "") return;
    const id = newId.trim();
    setQueued((prev) => [
      {
        id,
        name: generateDisplayName(id),
        progress: 0,
        status: "queued",
        enqueuedAt: Date.now(),
      },
      ...prev,
    ]);
    setNewId("");
  };

  const pause = (id: string) => {
    setActive((prev) =>
      prev.map((d) =>
        d.id === id && d.status === "active" ? { ...d, status: "paused" } : d,
      ),
    );
  };
  const resume = (id: string) => {
    setActive((prev) =>
      prev.map((d) =>
        d.id === id && d.status === "paused" ? { ...d, status: "active" } : d,
      ),
    );
  };
  const cancel = (id: string) => {
    setActive((prev) => {
      const target = prev.find((d) => d.id === id);
      const removed = prev.filter((d) => d.id !== id);
      if (target) {
        setFailed((f) => [
          {
            ...target,
            status: "canceled",
            finishedAt: Date.now(),
          },
          ...f,
        ]);
      }
      return removed;
    });
    setQueued((prev) => prev.filter((d) => d.id !== id));
  };

  const startManually = (id: string) => {
    setQueued((prevQueued) => {
      const target = prevQueued.find((q) => q.id === id);
      if (!target) return prevQueued;
      if (active.length >= MAX_CONCURRENT) return prevQueued; // concurrency limit
      setActive((prevActive) => [
        ...prevActive,
        {
          ...target,
          status: "active",
          startedAt: Date.now(),
          sizeBytes:
            target.sizeBytes ??
            10 * 1024 * 1024 + Math.random() * 250 * 1024 * 1024,
        },
      ]);
      // Fire backend download call
      invoke("download_mod", { id }).catch((e) =>
        console.error("Failed to start backend download", id, e),
      );
      return prevQueued.filter((q) => q.id !== id);
    });
  };

  return (
    <div className="flex h-full flex-col pr-4 pl-4">
      <header className="border-border/40 border-b bg-background">
        <div className="space-y-4 pt-6 pb-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-medium text-foreground text-xl">
              <DownloadIcon className="h-5 w-5" />
              Downloads
            </h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-muted-foreground text-xs">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                />
                Auto start queued
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => promote()}
                disabled={
                  active.length >= MAX_CONCURRENT || queued.length === 0
                }
              >
                Promote
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter mod ID to enqueue"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              className="h-10 border-border/40 bg-background text-sm focus-visible:border-border"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleQueue();
                }
              }}
              autoComplete="off"
            />
            <Button
              variant="default"
              size="lg"
              disabled={!newId.trim()}
              onClick={handleQueue}
            >
              Queue
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto py-4">
        {/* Active Downloads */}
        <section
          className="rounded-xl border border-border/30 bg-card/40 p-4 shadow-sm"
          style={{ animation: "modFadeIn 400ms ease 0ms both" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">
              Active ({active.length}/{MAX_CONCURRENT})
            </h3>
            <span className="text-muted-foreground text-xs">
              Aggregate speed: {formatBytes(totalActiveSpeed)}/s
            </span>
          </div>
          {active.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No active downloads.
            </p>
          ) : (
            <ul className="space-y-3">
              {active.map((d) => {
                const pct = d.progress;
                return (
                  <li
                    key={d.id}
                    className="group rounded-lg border border-border/40 bg-muted/20 p-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-col">
                        <span className="font-medium text-foreground text-sm">
                          {d.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatBytes(d.downloadedBytes)} /{" "}
                          {formatBytes(d.sizeBytes)} &middot;{" "}
                          {formatBytes(d.speedBytesPerSec)}/s &middot; ETA:{" "}
                          {formatEta(d.etaSeconds)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {d.status === "active" ? (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Pause"
                            onClick={() => pause(d.id)}
                          >
                            <PauseIcon className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Resume"
                            onClick={() => resume(d.id)}
                          >
                            <PlayIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Cancel"
                          onClick={() => cancel(d.id)}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className={`h-full rounded-full bg-primary transition-all`}
                        style={{
                          width: `${pct}%`,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Queued Downloads */}
        <section
          className="rounded-xl border border-border/30 bg-card/40 p-4 shadow-sm"
          style={{ animation: "modFadeIn 400ms ease 60ms both" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-foreground text-lg">
              <ListIcon className="h-4 w-4" />
              Queue ({queued.length})
            </h3>
            <span className="text-muted-foreground text-xs">
              Oldest queued:{" "}
              {queued.length > 0
                ? `${Math.round(
                    (Date.now() - queued[queued.length - 1].enqueuedAt) / 1000,
                  )}s ago`
                : "-"}
            </span>
          </div>
          {queued.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No items in queue. Enter an ID above to add one.
            </p>
          ) : (
            <ul className="space-y-2">
              {queued.map((d, i) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/15 px-3 py-2"
                  style={{
                    animation: `modFadeIn 400ms ease ${i * 40}ms both`,
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{d.name}</span>
                    <span className="text-muted-foreground text-xs">
                      Waiting &middot; Enqueued{" "}
                      {Math.round((Date.now() - d.enqueuedAt) / 1000)}s ago
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => startManually(d.id)}
                      disabled={active.length >= MAX_CONCURRENT}
                      aria-label="Start now"
                    >
                      <PlayIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => cancel(d.id)}
                      aria-label="Remove"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Completed / Failed */}
        <section
          className="rounded-xl border border-border/30 bg-card/40 p-4 shadow-sm"
          style={{ animation: "modFadeIn 400ms ease 120ms both" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-foreground text-lg">
              <ClockIcon className="h-4 w-4" />
              History
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setCompleted([]);
                setFailed([]);
              }}
              disabled={completed.length === 0 && failed.length === 0}
            >
              Clear
            </Button>
          </div>
          {completed.length === 0 && failed.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No completed or failed downloads yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {completed.length > 0 && (
                <div>
                  <p className="mb-1 font-medium text-foreground text-sm">
                    Completed ({completed.length})
                  </p>
                  <ul className="space-y-1">
                    {completed.slice(0, 15).map((c) => (
                      <li
                        className="flex items-center justify-between rounded-md bg-green-500/10 px-2 py-1 text-xs"
                        key={c.id}
                      >
                        <span className="truncate">
                          {c.name} &middot; {formatBytes(c.sizeBytes)}
                        </span>
                        <span className="font-medium text-green-500">Done</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {failed.length > 0 && (
                <div>
                  <p className="mb-1 font-medium text-foreground text-sm">
                    Canceled / Failed ({failed.length})
                  </p>
                  <ul className="space-y-1">
                    {failed.slice(0, 15).map((f) => (
                      <li
                        className="flex items-center justify-between rounded-md bg-red-500/10 px-2 py-1 text-xs"
                        key={f.id}
                      >
                        <span className="truncate">
                          {f.name}{" "}
                          {f.error ? (
                            <span className="text-red-400">
                              &middot; {f.error}
                            </span>
                          ) : null}
                        </span>
                        <span className="font-medium text-red-500">
                          {f.status === "canceled" ? "Canceled" : "Failed"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DownloadsPage;
