import { DownloadIcon } from "lucide-react";
import Image from "next/image";
import { toHumanReadable } from "@/lib/numbers";
import FilterTag from "./filterTag";

// biome-ignore lint/correctness/noUnusedVariables: Is used
namespace ModCard {
  export interface Props {
    name: string;
    thumbnail: string;
    downloads: string;
    description: string;
    username: string;
    avatar: string;

    categories?: string[];

    onClick?: () => void;
  }
}

function handleScrolling(e: React.WheelEvent<HTMLDivElement>) {
  const container = e.currentTarget;
  // Only handle horizontal scrolling
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
    container.scrollLeft += e.deltaY;
    e.preventDefault();
  }
}

function ModCard(props: ModCard.Props) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Because filterTag is already a button, making this a button would cause a hydration error
    <div
      className="group flex min-h-72 cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/40 text-left transition-all duration-300 hover:border-border/60 hover:shadow-lg"
      tabIndex={0}
      role="button"
      onClick={() => {
        props.onClick?.();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          props.onClick?.();
        }
      }}
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden bg-muted/30">
        <Image
          src={props.thumbnail}
          alt={props.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          // for nextjs happiness
          width={0}
          height={0}
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-foreground/80 text-xs backdrop-blur-sm">
          <DownloadIcon className="h-4 w-4 opacity-80" />
          <span className="font-medium tabular-nums">
            {toHumanReadable(Number(props.downloads))}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="mb-1 font-semibold text-base text-foreground leading-tight transition-colors group-hover:text-foreground/90 sm:text-lg">
            {props.name}
          </h3>

          <div className="mb-3 flex flex-wrap items-center gap-1 text-muted-foreground text-xs sm:text-sm">
            <span>By</span>
            <Image
              src={props.avatar}
              alt={props.username}
              className="mx-1 inline-block h-5 w-5 rounded-full"
              // for nextjs happiness
              width={0}
              height={0}
            />
            <span className="font-medium text-foreground/80">
              {props.username}
            </span>
          </div>

          {props.categories && (
            <div
              className="no-scrollbar relative flex w-full gap-2 overflow-x-scroll"
              onWheel={handleScrolling}
            >
              {props.categories.map((name) => (
                <FilterTag key={name} name={name} />
              ))}
            </div>
          )}

          <p className="line-clamp-3 text-ellipsis text-muted-foreground text-sm transition-colors group-hover:text-foreground/90">
            {props.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ModCard;
