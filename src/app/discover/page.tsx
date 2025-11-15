"use client";

import { SearchIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Input from "@/components/primitives/input";
import ModCard from "@/components/ui/modCard";
import ModOverlay from "@/components/ui/modOverlay";
import PaginationBar from "@/components/ui/paginationBar";
import type {
  DiscoveryMeta,
  ModExtendedMetadata,
  ModSummary,
} from "@/generated/types";
import { getTauRPC } from "@/lib/taurpc/useTaurpc";
import type { DiscoverFilter } from "@/lib/types/discover";
import type { ModTag } from "@/lib/types/mods";

const searchResults = [
  {
    name: "BeardLib Mod",
    author: "BeardLibTeam",
    downloads: "12,345",
    delay: "75",
  },
  {
    name: "Another mod",
    author: "Someone",
    downloads: "8,900",
    delay: "150",
  },
  {
    name: "A cool mod",
    author: "NotNotNotGhoulNotNot",
    downloads: "5,432",
    delay: "225",
  },
];

// Combined mod type
type CombinedMod = ModSummary & ModExtendedMetadata;

const Discover = () => {
  const [mods, setMods] = useState<ModSummary[]>([]);
  const [meta, setMeta] = useState<DiscoveryMeta>();
  // TODO Tags & Filtering
  const [tags, setTag] = useState<ModTag[]>();
  const [filter, setFilter] = useState<DiscoverFilter>();
  const [activeMod, setActiveMod] = useState<ModOverlay.Props | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  async function paginateTo(page: number) {
    setIsLoading(true);
    const rpc = getTauRPC();
    try {
      const mods = await rpc.get_discovery_mods(page);
      setMods(mods.mods);
      setMeta(mods.meta);
    } catch (e) {
      alert("Failed to paginate discovery mods");
      console.error("Pagination failed", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function getFurtherInfo(id: string) {
    const rpc = getTauRPC();
    const base = mods.find((mod) => mod.id === id);
    if (!base) {
      alert("Mod context mismatch");
      return;
    }
    const info = await rpc.get_extended_info(id);
    if (!info) return;

    const merged: CombinedMod = {
      ...info,
      ...(base as ModSummary),
    };

    // Convert merged into an ModOverlay.Props
    const props: ModOverlay.Props = {
      name: merged.name,
      // Until we support multi-user projects
      authors: [{ name: merged.user_name, image: merged.user_avatar }],
      images: merged.carousel_images,
      description: merged.description,
      banner: merged.header_image,
      version:
        merged.version && merged.version.trim() !== ""
          ? merged.version
          : "Unsupported",
      downloads: merged.downloads ?? 0,
      likes: "Unsupported",
      tags: merged.tags ?? [],
      open: true,
    };
    setActiveMod(props);

    console.debug("result after merge", activeMod, base, info);
  }

  useEffect(() => {
    // TODO: handle these in a better way
    const handle = () => {
      console.debug("[debug] Game changed, event received");
    };

    window.addEventListener("gameChanged", handle);

    return () => {
      window.removeEventListener("gameChanged", handle);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const rpc = getTauRPC();
      try {
        const res = await rpc.get_discovery_mods(1);
        setMods(res.mods);
        setMeta(res.meta);
        console.debug("Got meta!", res.meta);
        console.debug("Got mods", res);
      } catch (e) {
        alert("Mod loading failed.");
        console.error("Failed to load mods ", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex h-full flex-col pr-4 pl-4">
      {activeMod?.open && (
        <ModOverlay
          {...activeMod}
          onOpenChanged={(prev: boolean) => {
            console.debug("ModOverlay onOpenChanged", prev);
            if (prev === false) {
              setActiveMod(undefined);
            }
          }}
        />
      )}
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
              autoComplete="off"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />

            {/* AUTOCOMPLETE POPOVER */}
            <div
              className={`absolute right-0 left-0 z-20 mt-2 transition-all duration-300 ${
                isSearchFocused
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "-translate-y-2 pointer-events-none opacity-0"
              }`}
            >
              {/* Example autocomplete result */}
              <div className="pointer-events-auto rounded-md border border-border/40 bg-popover p-2 shadow-lg">
                <div className="flex flex-col gap-2">
                  {/* Animate each item in with staggered fade-in */}
                  {searchResults.map((mod) => (
                    <div
                      key={mod.name}
                      className="flex cursor-pointer items-center gap-2 rounded p-2 transition hover:bg-muted"
                      style={{
                        opacity: isSearchFocused ? 1 : 0,
                        transform: isSearchFocused
                          ? "translateY(0)"
                          : "translateY(8px)",
                        transition: `opacity 300ms ${mod.delay}ms, transform 300ms ${mod.delay}ms`,
                      }}
                    >
                      <Image
                        src="https://placehold.co/32x32"
                        alt="Mod Thumbnail"
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium text-foreground text-sm">
                          {mod.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          by {mod.author} &middot; {mod.downloads} downloads
                        </div>
                      </div>
                    </div>
                  ))}
                  <p
                    className="text-muted-foreground text-xs"
                    style={{
                      opacity: isSearchFocused ? 1 : 0,
                      transform: isSearchFocused
                        ? "translateY(0)"
                        : "translateY(8px)",
                      transition: "opacity 300ms 225ms, transform 300ms 225ms",
                    }}
                  >
                    And 15 more...
                    <br />
                    You can increase the shown amount in the settings!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative mb-4 flex h-fit flex-1 flex-col overflow-hidden">
        {/* Scrollable container */}
        {/* TODO: Turn this into a virtualized grid */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 animate-spin rounded-full border-primary border-t-2 border-b-2" />
                <span className="text-muted-foreground text-sm">
                  Loading mods...
                </span>
              </div>
            </div>
          ) : (
            <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {mods.map((mod, i) => (
                <div
                  key={mod.id}
                  style={{
                    opacity: 1,
                    transform: "translateY(0)",
                    animation: `modFadeIn 400ms ease ${i * 60}ms both`,
                  }}
                  className="will-change-transform"
                >
                  <ModCard
                    name={mod.name}
                    thumbnail={mod.thumbnail_image}
                    username={mod.user_name}
                    avatar={mod.user_avatar}
                    downloads={mod.downloads.toString()}
                    description={mod.description}
                    categories={mod.tags ?? []}
                    onClick={() => getFurtherInfo(mod.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        {meta && (
          <div
            className="absolute right-0 bottom-6 left-0 opacity-45 transition-all duration-250 ease-in-out hover:pointer-events-auto hover:opacity-100"
            style={{
              animation: "modFadeIn 500ms ease 500ms both",
            }}
          >
            <PaginationBar
              currentPage={meta.pagination.current}
              totalPages={meta.pagination.total_pages ?? 1}
              onPaginate={paginateTo}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
