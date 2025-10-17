"use client";

import { useViewManager } from "@/lib/viewSystem/useViewManager";
import { View } from "@/lib/viewSystem/View";
import React, { useEffect, useState } from "react";

async function getCurrentGame(): Promise<string> {
  return "a";
}

export interface Mod {
  name: string;
}

export async function fetchModsForGame(name: string): Promise<Mod[]> {
  await new Promise((r) => setTimeout(r, Math.random() * 150));
  if (Math.random() < 0.2) {
    throw new Error(`Failed to fetch mods for game: ${name}`);
  }
  const count = Math.floor(Math.random() * 10);
  return Array.from({ length: count }, () => ({
    name: `mod_${Math.random().toString(36).slice(2, 8)}`,
  }));
}

const VIEWS = ["modSelect", "missingMods", "loading"] as const;
type ViewName = (typeof VIEWS)[number];

export default function DebugPage() {
  const { showView, isActive } = useViewManager<ViewName>("loading", VIEWS);
  const [mods, setMods] = useState<Mod[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const game = await getCurrentGame();
        const loadedMods = await fetchModsForGame(game);
        if (cancelled) return;

        if (loadedMods.length > 0) {
          setMods(loadedMods);
          showView("modSelect");
        } else {
          setMods([]);
          showView("missingMods");
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Unknown error fetching mods";
        setError(message);
        setMods(null);
        showView("missingMods");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showView]);

  return (
    <>
      <View name="loading" isActive={isActive}>
        <div>
          <p>Loading mods...</p>
        </div>
      </View>

      <View name="modSelect" isActive={isActive}>
        <div>
          <p>Mod select view</p>
          {mods && mods.length > 0 ? (
            <ul>
              {mods.map((m) => (
                <li key={m.name}>{m.name}</li>
              ))}
            </ul>
          ) : (
            <p>No mods loaded.</p>
          )}
        </div>
      </View>

      <View name="missingMods" isActive={isActive}>
        <div>
          {error ? (
            <>
              <p>Failed to load mods.</p>
              <pre style={{ color: "red" }}>{error}</pre>
            </>
          ) : mods?.length === 0 ? (
            <p>No mods found for this game.</p>
          ) : (
            <p>Mods unavailable.</p>
          )}
        </div>
      </View>
    </>
  );
}
