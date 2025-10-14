"use client";

import Input from "@/components/input";
import { DownloadIcon, SearchIcon, StarIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

const mods = [
  {
    id: 1,
    name: "Test mod",
    author: "Me",
    downloads: 1,
    category: ["Filter", "Filter 2"],
    // image: "/placeholder.svg",
    description: "This is my mod description, or something maybe please work it works that's crazy, why didn't it work before?",
    version: "1.0.0",
    lastUpdate: "DATE",
    dependencies: [],
    screenshots: []
  },
  {
    id: 2
  },
  {
    id: 3
  },
  {
    id: 4
  },
  {
    id: 5
  },
  {
    id: 6
  }
]

export default function Discover() {

  // We'd get this value from the ModProvider (capablities field)
  const categories = ["Filter"]

  return (
    <div className="h-full flex flex-col pr-4 pl-4">
      <header className="border-b border-border/40 bg-background">
        <div className="pt-6 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-foreground">Discover new mods</h2>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
            placeholder="Search for mods"
            className="pl-9 h-10 text-sm bg-background border-border/40 focus-visible:border-border"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 h-fit flex flex-col overflow-hidden mb-4">
        {/* Scrollable container */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
              gap-4 sm:gap-6
              auto-rows-fr
            "
          >
            {mods.map((mod) => (
              <div
                key={mod.id}
                className="
                  group
                  flex flex-col
                  bg-card/40
                  border border-border/30
                  rounded-2xl
                  overflow-hidden
                  min-h-72
                  hover:shadow-lg hover:border-border/60
                  transition-all duration-300
                  cursor-pointer
                "
              >
                {/* Image Section */}
                <div className="relative aspect-video overflow-hidden bg-muted/30">
                  <img
                    src={"https://placehold.co/600x400"}
                    alt={mod.name ?? "Unknown mod"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-foreground/80">
                    <DownloadIcon className="w-4 h-4 opacity-80" />
                    <span className="font-medium tabular-nums">
                      {mod.downloads ?? "?"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col justify-between flex-1 p-4 sm:p-5">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1 leading-tight group-hover:text-foreground/90 transition-colors">
                      {mod.name ?? "Unknown mod"}
                    </h3>

                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-3 flex-wrap gap-1">
                      <span>By</span>
                      <img
                        src={"https://placehold.co/128x128"}
                        alt={mod.author}
                        className="inline-block w-5 h-5 rounded-full mx-1"
                      />
                      <span className="font-medium text-foreground/80">
                        {mod.author ?? "???"}
                      </span>
                    </div>

                    <div className="mb-2 flex flex-wrap gap-2">
                      {mod.category?.map((category) => (
                        <div
                          key={category}
                          className="text-xs sm:text-sm bg-muted/50 border border-border/40 px-2 py-0.5 rounded"
                        >
                          {category}
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3 text-ellipsis group-hover:text-foreground/90 transition-colors">
                      {mod.description || "No description provided for this mod"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
