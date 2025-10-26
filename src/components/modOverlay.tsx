"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  CheckCheckIcon,
  CoinsIcon,
  DownloadIcon,
  HeartIcon,
  TimerIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import type * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/primitives/button";
import { toHumanReadable } from "@/lib/numbers";
import { cn } from "@/lib/styleUtils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-semibold text-lg leading-none", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

namespace ModOverlay {
  export interface Props {
    name: string;
    authors: {
      name: string;
      image: string;
    }[];
    images: string[];
    description: string;
    dependencies?: {
      image: string;
      name: string;
      installed: boolean;
    }[];
    banner: string;
    version: string;
    downloads: string;
    likes: string;
    supportsDonations?: boolean;
    tags?: string[];

    open?: boolean;
    onOpenChanged?: (open: boolean) => void;
  }
}
// TODO: Move other components out of this file (components/primitives/Dialog)
// TODO: Move categories chip out of here (components/categoryChip)
// TODO: Add styles to styles.css instead of defining them here
function ModOverlay(props: ModOverlay.Props) {
  const { open: openIntent, onOpenChanged, ...rest } = props;

  const [openInternal, setOpenInternal] = useState<boolean>(
    () => openIntent ?? false,
  );

  useEffect(() => {
    if (openIntent === undefined) return;
    setOpenInternal((prev) => {
      if (openIntent !== prev) return openIntent;
      return prev;
    });
  }, [openIntent]);

  const handleOpenChange = (next: boolean) => {
    setOpenInternal(next);
    onOpenChanged?.(next);
  };

  return (
    <Dialog open={openInternal} onOpenChange={handleOpenChange}>
      <DialogTrigger>Trigger</DialogTrigger>
      <DialogContent className="flex max-h-[95vh] min-h-[80vh] w-full min-w-[90vw] max-w-screen flex-col overflow-scroll rounded-xl border border-neutral-800 bg-[#0e0e0f] p-0 font-sans text-white">
        {/* Header */}
        <div className="relative h-56 w-full overflow-hidden rounded-t-xl">
          <Image
            src={props.banner}
            alt={`${props.name}'s banner`}
            fill
            className="object-cover brightness-75"
            style={{ zIndex: 0 }}
          />
          <div className="absolute inset-0 z-10 flex items-center bg-gradient-to-r from-black/70 via-black/40 to-transparent">
            <div className="flex flex-col gap-4 pl-10">
              {/* Title */}
              <DialogTitle className="font-extrabold text-4xl drop-shadow-lg sm:text-5xl">
                {props.name}
              </DialogTitle>
              {/* Authors */}
              <div className="flex items-center gap-3">
                <div className="-space-x-3 flex">
                  {props.authors.map((author) => (
                    <Image
                      src={author.image}
                      key={author.name}
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-white"
                      alt={`${author}'s avatar`}
                    />
                  ))}
                </div>
                <span className="ml-2 font-medium text-base text-white/80">
                  {props.authors.length > 0
                    ? props.authors[props.authors.length - 1].name
                    : ""}{" "}
                  & {props.authors.length - 1} others
                </span>
              </div>
              {/* Tags */}
              <div className="mt-2 flex flex-wrap gap-2">
                {props.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/40 bg-muted/60 px-3 py-1 font-medium text-white/80 text-xs sm:text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-10 px-8 py-8 md:flex-row">
          {/* Left: Cover & Dependencies */}
          <div className="flex flex-1 flex-col gap-6">
            <div className="relative aspect-video max-h-[22rem] w-full overflow-hidden rounded-lg border border-border/40 shadow-lg">
              <Image
                src={props.images[0]}
                fill
                className="max-h-96 object-cover"
                alt="mod cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="relative top-[90%] left-[50%] h-[15px] w-[30px] rounded-sm bg-white"></div>
            </div>
            <div className="rounded-md border border-border/40 bg-neutral-900/70 p-4 text-muted-foreground">
              <p className="mb-1 font-semibold text-base">Dependencies</p>
              {/* Example dependency */}
              <div className="flex flex-col gap-2">
                {props.dependencies?.length === 0 ||
                  (props.dependencies?.length === undefined && (
                    <p>No dependencies!</p>
                  ))}
                {props.dependencies?.map((dep) => (
                  <div
                    className="flex items-center gap-3 rounded border border-border/40 bg-neutral-800/70 px-3 py-2"
                    key={dep.name}
                  >
                    <div className="relative h-[28px] w-[28px] flex-shrink-0 overflow-hidden rounded border border-border/40">
                      <Image
                        src={dep.image}
                        fill
                        className="object-cover object-center"
                        alt={`${dep.name}'s icon`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-white">
                        {dep.name}
                      </span>
                    </div>
                    {dep.installed ? (
                      <CheckCheckIcon className="ml-auto size-5 font-semibold text-xs hover:underline" />
                    ) : (
                      <DownloadIcon className="ml-auto size-5 font-semibold text-xs hover:underline" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right: Description & Stats */}
          <div className="flex w-full flex-col gap-6 md:w-1/2">
            <div className="flex flex-col gap-3 rounded-lg border border-border/40 bg-muted/50 p-5 shadow">
              <h2 className="mb-1 font-bold text-xl">Description</h2>
              <div className="max-h-64 overflow-y-auto pr-2 text-sm text-white/90 leading-relaxed">
                <span>{props.description}</span>
              </div>
            </div>
            <div className="mt-2 flex flex-row gap-4">
              <div className="flex flex-1 flex-col items-start rounded-md border border-border/40 bg-neutral-900/70 p-4">
                <span className="mb-1 flex items-center gap-2 font-medium text-muted-foreground text-sm">
                  <TimerIcon className="size-4" />
                  Version
                </span>
                <p className="font-semibold text-lg">{props.version}</p>
              </div>
              <div className="flex flex-1 flex-col items-start rounded-md border border-border/40 bg-neutral-900/70 p-4">
                <span className="mb-1 flex items-center gap-2 font-medium text-muted-foreground text-sm">
                  <DownloadIcon className="size-4" />
                  Downloads
                </span>
                <p className="font-semibold text-lg">
                  {toHumanReadable(Number(props.downloads))}
                </p>
              </div>
              <div className="flex flex-1 flex-col items-start rounded-md border border-border/40 bg-neutral-900/70 p-4">
                <span className="mb-1 flex items-center gap-2 font-medium text-muted-foreground text-sm">
                  <HeartIcon className="size-4" />
                  Likes
                </span>
                <p className="font-semibold text-lg">{props.likes}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Install Button */}
        <div className="absolute right-8 bottom-8">
          <div className="flex flex-row gap-2">
            {props.supportsDonations ? (
              <Button
                size={"lg"}
                variant={"ghost"}
                className="font-semibold text-muted-foreground"
              >
                <CoinsIcon className="size-5" />
                Donate
              </Button>
            ) : null}
            <Button
              size={"lg"}
              variant={"outline"}
              className="font-semibold shadow-lg"
            >
              <DownloadIcon className="size-5" />
              Install
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  ModOverlay,
};

export default ModOverlay;
