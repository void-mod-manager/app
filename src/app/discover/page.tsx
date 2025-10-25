"use client";

import { invoke } from "@tauri-apps/api/core";
import { DownloadIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Input from "@/components/input";
import ModOverlay from "@/components/modOverlay";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination";

interface ModType {
  id: string;
  name: string;
  description: string;
  short_description: string;
  thumbnail_image: string;
  user_avatar: string;
  user_name: string;
  downloads: string;
  views: number;
}

interface ExtendedMod extends ModType {
  // Add extra fields here
  header_image: string;
  caoursel_images: string[];
  installed: boolean;
  version?: string;
}

interface ModTag {
  id: string;
  name: string;
}

interface DiscoverFilter {
  page?: number;
  pageSize?: number;
  tags?: ModTag[];
  sort?: string;
}

interface DiscoveryMeta {
  game_id: string;
  pagination: PaginationMeta;
  applied_tags: string[];
  available_tags?: string[];
}

interface PaginationMeta {
  current: number;
  page_size: number;
  total_pages: number;
  total_items: number;
}

interface DiscoverResult {
  mods: ModType[];
  meta: DiscoveryMeta;
}

const Discover = () => {
  const [mods, setMods] = useState<ModType[]>([]);
  const [meta, setMeta] = useState<DiscoveryMeta>();
  const [tags, setTag] = useState<ModTag[]>();
  const [filter, setFilter] = useState<DiscoverFilter>();
  const [activeMod, setActiveMod] = useState<ModOverlay.Props | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  async function paginateTo(page: number) {
    setIsLoading(true);
    const mods = await invoke<DiscoverResult>("get_discovery_mods", {
      page,
    });
    setMods(mods.mods);
    setMeta(mods.meta);
    setIsLoading(false);
  }

  async function getFurtherInfo(id: string) {
    const base = mods.find((mod) => mod.id === id);
    if (!base) {
      alert("Mod context mismatch");
      return;
    }
    const info = await invoke<Partial<ExtendedMod>>("get_extended_info", {
      id,
    }).catch((e) => {
      console.error("Failed ", e);
    });
    if (!info) return;

    const merged: ExtendedMod = {
      ...info,
      ...(base as ExtendedMod),
    };

    // Convert merged into an ModOverlay.Props
    const props: ModOverlay.Props = {
      name: merged.name,
      // Until we support multi-user projects
      authors: [{ name: merged.user_name, image: merged.user_avatar }],
      images: merged.caoursel_images,
      description: merged.description,
      banner: merged.header_image,
      version:
        merged.version && merged.version.trim() !== ""
          ? merged.version
          : "Unsupported",
      downloads: merged.downloads ?? "-1",
      likes: "Unsupported",
      open: true,
    };
    setActiveMod(props);

    console.debug("result after merge", activeMod, base, info);
  }

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
      const mods = await invoke<DiscoverResult>("get_discovery_mods");
      setMods(mods.mods);
      setMeta(mods.meta);
      console.debug("Got meta!", mods.meta);
      console.debug("Got mods", mods);
      setIsLoading(false);
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
            />
          </div>
        </div>
      </header>

      <div className="relative mb-4 flex h-fit flex-1 flex-col overflow-hidden">
        {/* Scrollable container */}
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
              {mods.map((mod) => (
                // This'll get fixed once we move ModCards into their own component
                // biome-ignore lint/a11y/noStaticElementInteractions: STFU BRUH
                // biome-ignore lint/a11y/useKeyWithClickEvents: STFU
                <div
                  key={mod.id}
                  className="group flex min-h-72 cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/40 transition-all duration-300 hover:border-border/60 hover:shadow-lg"
                  onClick={() => {
                    getFurtherInfo(mod.id);
                  }}
                >
                  {/* Image Section */}
                  <div className="relative aspect-video overflow-hidden bg-muted/30">
                    <Image
                      src={
                        mod.thumbnail_image ?? "https://placehold.co/600x400"
                      }
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
                            mod.thumbnail_image ??
                            "https://placehold.co/128x128"
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
                        {/*TODO: Move to its own component*/}
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
          )}

          {/*<div className="w-full p-2">*/}
          {/*</div>*/}
        </div>

        {/*Hacked together pagination because I'm tried*/}
        {meta && (
          <div className="absolute right-0 bottom-6 left-0 opacity-45 transition-all duration-250 ease-in-out hover:pointer-events-auto hover:opacity-100">
            <Pagination className="absolute bottom-0 left-[35%] mx-auto w-fit rounded-xl border border-border/30 bg-background/95 p-2 shadow-lg">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-label="Previous page"
                    className={`rounded-full px-3 py-2 transition-colors ${
                      meta.pagination.current === 1
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-muted/30"
                    }`}
                    onClick={() => {
                      if (meta.pagination.current > 1) {
                        paginateTo(meta.pagination.current - 1);
                      }
                    }}
                    tabIndex={meta.pagination.current === 1 ? -1 : 0}
                  />
                </PaginationItem>
                {Array.from(
                  { length: meta.pagination.total_pages },
                  (_, i) => i + 1,
                ).map((page, _, __) => {
                  // Only show first, last, current, and neighbors for brevity
                  const showPage =
                    page === 1 ||
                    page === meta.pagination.total_pages ||
                    Math.abs(page - meta.pagination.current) <= 1;
                  if (!showPage) {
                    // Only show ellipsis once between gaps
                    if (
                      page === meta.pagination.current - 2 ||
                      page === meta.pagination.current + 2
                    ) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis className="mx-1 text-muted-foreground" />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === meta.pagination.current}
                        href="#"
                        onClick={() => paginateTo(page)}
                        className={`rounded-full px-3 py-2 transition-colors ${
                          page === meta.pagination.current
                            ? "bg-primary font-bold text-primary-foreground shadow"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-label="Next page"
                    className={`rounded-full px-3 py-2 transition-colors ${
                      meta.pagination.current === meta.pagination.total_pages
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-muted/30"
                    }`}
                    onClick={async () => {
                      if (
                        meta.pagination.current < meta.pagination.total_pages
                      ) {
                        paginateTo(meta.pagination.current + 1);
                      }
                    }}
                    tabIndex={
                      meta.pagination.current === meta.pagination.total_pages
                        ? -1
                        : 0
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
