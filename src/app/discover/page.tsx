"use client";

import { invoke } from "@tauri-apps/api/core";
import { DownloadIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Input from "@/components/input";
import ModOverlay from "@/components/modOverlay";

type ModType = {
  id: number;
  name: string;
  description: string;
  short_description: string;
  thumbnail_image: string;
  user_avatar: string;
  user_name: string;
  downloads: number;
  views: number;
};

const Discover = () => {
  // We'd get this value from the ModProvider (capablities field)
  const [mods, setMods] = useState<ModType[]>([]);
  const _categories = ["Filter"];

  useEffect(() => {
    const handle = () => {
      console.debug("[debug] Game changed, event recieved");
    };

    window.addEventListener("gameChanged", handle);

    return () => {
      window.removeEventListener("gameChanged", handle);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const mods = await invoke<ModType[]>("get_discovery_mods");
      setMods(mods);
      console.debug("Got mods", mods);
    })();
  }, []);

  return (
    <div className="flex h-full flex-col pr-4 pl-4">
      <ModOverlay />
      <header className="border-border/40 border-b bg-background">
        <div className="space-y-4 pt-6 pb-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-foreground text-xl">
              Discover new mods
            </h2>
          </div>
          <div className="relative">
            <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for mods"
              className="h-10 border-border/40 bg-background pl-9 text-sm focus-visible:border-border"
            />
          </div>
        </div>
      </header>

      <div className="mb-4 flex h-fit flex-1 flex-col overflow-hidden">
        {/* Scrollable container */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
          <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {mods.map((mod) => (
              <div
                key={mod.id}
                className="group flex min-h-72 cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/40 transition-all duration-300 hover:border-border/60 hover:shadow-lg"
              >
                {/* Image Section */}
                <div className="relative aspect-video overflow-hidden bg-muted/30">
                  <Image
                    src={mod.thumbnail_image ?? "https://placehold.co/600x400"}
                    alt={mod.name ?? "Unknown mod"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    // for nextjs happiness
                    width={0}
                    height={0}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-foreground/80 text-xs backdrop-blur-sm">
                    <DownloadIcon className="h-4 w-4 opacity-80" />
                    <span className="font-medium tabular-nums">
                      {mod.downloads ?? "?"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                  <div>
                    <h3 className="mb-1 font-semibold text-base text-foreground leading-tight transition-colors group-hover:text-foreground/90 sm:text-lg">
                      {mod.name ?? "Unknown mod"}
                    </h3>

                    <div className="mb-3 flex flex-wrap items-center gap-1 text-muted-foreground text-xs sm:text-sm">
                      <span>By</span>
                      <Image
                        src={
                          mod.thumbnail_image ?? "https://placehold.co/128x128"
                        }
                        alt={mod.user_name ?? "Unknown Author"}
                        className="mx-1 inline-block h-5 w-5 rounded-full"
                        // for nextjs happiness
                        width={0}
                        height={0}
                      />
                      <span className="font-medium text-foreground/80">
                        {mod.user_name ?? "???"}
                      </span>
                    </div>

                    <div className="mb-2 flex flex-wrap gap-2">
                      {/*{mod.category?.map((category) => (*/}
                      <div
                        // key={category}
                        className="rounded border border-border/40 bg-muted/50 px-2 py-0.5 text-xs sm:text-sm"
                      >
                        Category
                      </div>
                      {/*))}*/}
                    </div>

                    <p className="line-clamp-3 text-ellipsis text-muted-foreground text-sm transition-colors group-hover:text-foreground/90">
                      {mod.description ||
                        "No description provided for this mod"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
