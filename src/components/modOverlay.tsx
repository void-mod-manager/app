"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import Image from "next/image";
import type * as React from "react";
import { useState } from "react";
// import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/styleUtils";
import { Card, CardContent } from "./card";

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-lg",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("font-semibold text-lg", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return <AlertDialogPrimitive.Action className={cn(className)} {...props} />;
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel className={cn(className)} {...props} />;
}

const ModOverlay = () => {
  const [open, setOpen] = useState(true);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>Trigger</AlertDialogTrigger>
      <AlertDialogContent className="flex min-h-[85vh] min-w-[90vw] flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#0e0e0f] p-0 font-sans text-white">
        {/* Header */}
        <div
          className="overlay-blur-before relative h-48 w-full overflow-hidden rounded-md"
          style={{
            "--overlay-image-url": `url(https://storage.modworkshop.net/mods/images/DKOio49b4b8qQe0PpmsJnvq1i96kfrWfhwq0b7fn.webp)`,
          }}
        >
          <div className="flex h-full w-full items-center">
            {/*Container*/}
            <div className="flex flex-col gap-2 pl-8 backdrop-blur-3xl">
              {/*Title*/}
              <h1 className="font-bold text-5xl">Ghostface DLC</h1>
              {/*Authors*/}
              <div className="flex gap-2 align-middle">
                <div className="-space-x-4 flex flex-row">
                  <img
                    src={
                      "https://storage.modworkshop.net/users/images/avatar_31157.jpg"
                    }
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <img
                    src={
                      "https://storage.modworkshop.net/users/images/avatar_55826.png"
                    }
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <img
                    src={
                      "https://storage.modworkshop.net/users/images/thumbnail_pyMh1U95zK74s4MHF7bgwY2edR2Zkv9H4FE8e6eZ.webp"
                    }
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <img
                    src={
                      "https://storage.modworkshop.net/users/images/thumbnail_sRnkf2T698NONHeH0iIK10oumOXD2bpRkXWCM3Pv.webp"
                    }
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                </div>

                <p>NeTheQ_ & 3 others</p>
              </div>
            </div>
            {/*</div>*/}
          </div>
        </div>

        {/*Content*/}
        <div className="mt-8 grid max-h-96 w-full grid-cols-2 gap-14 p-2 pr-8 pl-8">
          <div className="max-h-96">
            <img
              src={
                "https://storage.modworkshop.net/mods/images/YQ1pRPgFdHINtzbJQLS5yWUNO9SAN0K2qcMlIAeE.webp"
              }
              className="h-full w-full rounded-lg object-cover"
            />
          </div>
          <div className="flex flex-col gap-2 rounded-lg border border-border/40 bg-muted/50 p-3">
            <h2 className="font-bold text-2xl">Description</h2>
            <span>
              This is where the description should go, this is a scrolling
              container
            </span>
          </div>
        </div>
        <AlertDialogAction>
          {/*<div className="absolute right-10 bottom-8 rounded-md bg-white pr-4 pl-4 font-medium text-3xl text-black">*/}
          {/*<p>Install</p>*/}
          {/*</div>*/}
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

export default ModOverlay;
