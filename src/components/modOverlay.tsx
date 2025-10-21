"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import {
  CheckCheckIcon,
  CoinsIcon,
  Download,
  DownloadIcon,
  HeartIcon,
  TimerIcon,
} from "lucide-react";
import Image from "next/image";
import type * as React from "react";
import { useState } from "react";
// import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/styleUtils";
import { Button } from "./button";

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
      <AlertDialogContent className="flex max-h-[95vh] min-h-[80vh] w-full min-w-[90vw] max-w-screen flex-col overflow-scroll rounded-xl border border-neutral-800 bg-[#0e0e0f] p-0 font-sans text-white">
        {/* Header */}
        <div className="relative h-56 w-full overflow-hidden rounded-t-xl">
          <Image
            src="https://storage.modworkshop.net/mods/images/DKOio49b4b8qQe0PpmsJnvq1i96kfrWfhwq0b7fn.webp"
            alt="mod banner"
            fill
            className="object-cover brightness-75"
            style={{ zIndex: 0 }}
          />
          <div className="absolute inset-0 z-10 flex items-center bg-gradient-to-r from-black/70 via-black/40 to-transparent">
            <div className="flex flex-col gap-4 pl-10">
              {/* Title */}
              <h1 className="font-extrabold text-4xl drop-shadow-lg sm:text-5xl">
                Ghostface DLC
              </h1>
              {/* Authors */}
              <div className="flex items-center gap-3">
                <div className="-space-x-3 flex">
                  <Image
                    src="https://storage.modworkshop.net/users/images/avatar_31157.jpg"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-white"
                    alt="avatar 31157"
                  />
                  <Image
                    src="https://storage.modworkshop.net/users/images/avatar_55826.png"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-white"
                    alt="avatar 55826"
                  />
                  <Image
                    src="https://storage.modworkshop.net/users/images/thumbnail_pyMh1U95zK74s4MHF7bgwY2edR2Zkv9H4FE8e6eZ.webp"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-white"
                    alt="avatar"
                  />
                  <Image
                    src="https://storage.modworkshop.net/users/images/thumbnail_sRnkf2T698NONHeH0iIK10oumOXD2bpRkXWCM3Pv.webp"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-white"
                    alt="avatar"
                  />
                </div>
                <span className="ml-2 font-medium text-base text-white/80">
                  NeTheQ_ & 3 others
                </span>
              </div>
              {/* Tags */}
              <div className="mt-2 flex flex-wrap gap-2">
                {["Lua", "Port", "Retexture", "QoL"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/40 bg-muted/60 px-3 py-1 font-medium text-white/80 text-xs sm:text-sm"
                  >
                    {tag}
                  </span>
                ))}
                <span className="rounded-full border border-border/40 bg-muted/60 px-3 py-1 font-medium text-white/80 text-xs sm:text-sm">
                  ... View more (16)
                </span>
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
                src="https://storage.modworkshop.net/mods/images/YQ1pRPgFdHINtzbJQLS5yWUNO9SAN0K2qcMlIAeE.webp"
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
                <div className="flex items-center gap-3 rounded border border-border/40 bg-neutral-800/70 px-3 py-2">
                  <div className="relative h-[28px] w-[28px] flex-shrink-0 overflow-hidden rounded border border-border/40">
                    <Image
                      src="https://modworkshop.net/assets/no-preview.webp"
                      fill
                      className="object-cover object-center"
                      alt="Example Dependency"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-white">
                      SuperBLT
                    </span>
                  </div>
                  <CheckCheckIcon className="ml-auto size-5 font-semibold text-xs hover:underline" />
                </div>
                <div className="flex items-center gap-3 rounded border border-border/40 bg-neutral-800/70 px-3 py-2">
                  <div className="relative h-[28px] w-[28px] flex-shrink-0 overflow-hidden rounded border border-border/40">
                    <Image
                      src="https://storage.modworkshop.net/mods/images/11_1593725256_a753bab2112510a83a93624a59778c2a.png"
                      fill
                      className="object-cover object-center"
                      alt="Example Dependency"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-white">
                      BeardLib
                    </span>
                  </div>
                  <DownloadIcon className="ml-auto size-5 font-semibold text-xs hover:underline" />
                </div>
              </div>
            </div>
          </div>
          {/* Right: Description & Stats */}
          <div className="flex w-full flex-col gap-6 md:w-1/2">
            <div className="flex flex-col gap-3 rounded-lg border border-border/40 bg-muted/50 p-5 shadow">
              <h2 className="mb-1 font-bold text-xl">Description</h2>
              <div className="max-h-64 overflow-y-auto pr-2 text-sm text-white/90 leading-relaxed">
                <span>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                  eu nulla sit amet enim volutpat maximus nec eget orci. Donec
                  hendrerit felis urna, id elementum felis ornare non. Duis odio
                  ipsum, rutrum ac dignissim in, viverra vel leo. Cras vitae
                  augue eget lectus imperdiet tempus vitae non nulla. Interdum
                  et malesuada fames ac ante ipsum primis in faucibus. Phasellus
                  eu feugiat turpis, at scelerisque nibh. Donec sodales lectus
                  quis est volutpat, ut pharetra dui finibus. Proin malesuada
                  purus in tristique suscipit. Suspendisse potenti. Mauris orci
                  ante, aliquet et ipsum nec, fringilla aliquet mi. Donec
                  lobortis aliquam enim, sit amet mattis nulla eleifend a.
                  Vestibulum malesuada justo sit amet ex sodales, ultricies
                  euismod enim bibendum. Aliquam sem felis, elementum vitae
                  pharetra sed, congue id sapien. Nam et nisi eu est maximus
                  pulvinar. Nunc in accumsan erat. Integer rutrum ante est.
                  Integer ut ultrices massa. Ut sodales faucibus est eu
                  porttitor. Nunc a placerat leo. Etiam ullamcorper arcu purus,
                  non imperdiet urna porta ac. Suspendisse vulputate tempus mi,
                  in accumsan diam bibendum non. Sed volutpat dictum euismod. Ut
                  eleifend lorem eu posuere aliquam. Quisque tincidunt nisl et
                  sodales sollicitudin. Nulla sit amet finibus ipsum. Donec quis
                  quam a tortor consequat pretium. Aenean cursus ultrices nisl
                  non viverra. Aenean tempor pellentesque ultrices. Fusce
                  aliquet at odio tempus interdum. Fusce fermentum sollicitudin
                  malesuada. Suspendisse ornare dui vel consectetur consequat.
                  Suspendisse congue nec mi tempus placerat. Aliquam ac posuere
                  elit. Pellentesque habitant morbi tristique senectus et netus
                  et malesuada fames ac turpis egestas. Vestibulum in imperdiet
                  velit. Integer euismod ex fringilla sem mollis, vitae viverra
                  nibh malesuada. Pellentesque venenatis cursus purus, a dictum
                  leo tristique eu. Maecenas eu mattis massa. In hac habitasse
                  platea dictumst. Nullam vehicula id nulla sagittis
                  sollicitudin. Praesent pulvinar neque quis ultrices sodales.
                  Sed pharetra risus eget sapien feugiat tempor. Nam neque mi,
                  commodo in dictum vitae, vehicula sit amet nulla. Nunc
                  sagittis augue ac massa dapibus, mattis gravida nisi sagittis.
                  Suspendisse ex nisi, pulvinar eget est vel, gravida dignissim
                  sem. In sodales, tortor non varius dapibus, odio ligula semper
                  ante, a elementum velit enim eget tellus. Praesent sed massa
                  elit. Sed sit amet libero cursus, blandit lacus at,
                  condimentum enim. In dapibus vulputate purus, ut congue velit
                  venenatis ac. Fusce condimentum venenatis est, at aliquet
                  tellus consectetur non. Vestibulum orci sem, scelerisque quis
                  sollicitudin ut, malesuada in turpis. Fusce sit amet leo eget
                  ante feugiat ultrices nec vitae nulla. Duis rhoncus, ligula
                  feugiat lobortis fermentum, odio mi consectetur enim, at
                  fermentum neque dui in risus. Mauris at posuere mauris.
                  Praesent viverra mi vitae neque tempor fringilla. Donec congue
                  purus ac massa fringilla ornare. Aenean orci tortor, eleifend
                  ut dignissim non, feugiat venenatis nulla. Sed et est et dui
                  vulputate eleifend. Nunc gravida nec nulla ac finibus. In
                  tempor lorem a semper molestie. Integer venenatis mi eu augue
                  auctor, mattis luctus libero maximus. Pellentesque ligula
                  metus, molestie eu vestibulum ut, suscipit sed eros. Curabitur
                  finibus turpis vitae eros euismod blandit. Quisque eget nisl
                  ullamcorper, consequat lectus eget, venenatis sem. Vestibulum
                  in felis quis mi tincidunt ultricies. Vestibulum pharetra
                  semper rutrum. Praesent luctus risus id augue gravida
                  sagittis. Mauris eu nibh vitae ex sodales lobortis nec at
                  magna. Quisque quis ligula faucibus, dignissim lorem in,
                  luctus ex. Proin tincidunt ante odio, quis aliquam neque
                  vestibulum et. Nunc ac maximus dui. Nulla vel erat nec leo
                  pharetra molestie eget sit amet erat. Cras eros purus, aliquet
                  eget purus eget, malesuada gravida nibh. Vestibulum ornare
                  interdum augue, ut venenatis erat malesuada congue. Nullam
                  ullamcorper, felis eget bibendum dictum, magna neque egestas
                  enim, maximus lacinia lacus arcu non enim. Integer a nisi
                  varius, rhoncus tortor eu, fringilla ligula. Quisque eu enim
                  nec orci scelerisque imperdiet vitae eu metus. Vestibulum nec
                  suscipit leo. Vestibulum tempus justo tellus, ac sodales eros
                  viverra in. Suspendisse eget diam ac urna mollis lacinia.
                  Aliquam at urna ex. Donec lobortis sem in leo dictum volutpat.
                  Quisque pellentesque facilisis consequat. Maecenas vitae dui
                  facilisis, aliquet elit vel, euismod lorem. Mauris rutrum
                  metus in suscipit hendrerit. Ut tortor mi, ullamcorper a
                  fermentum ac, posuere in tortor. Aliquam erat volutpat. Duis
                  sagittis accumsan mi a auctor. Aliquam aliquet orci id sapien
                  mattis congue. Nam lobortis consectetur nisl, in facilisis
                  ligula ultrices a. Fusce nisl ligula, bibendum sit amet dui
                  in, pretium ullamcorper massa. Nam risus velit, gravida et
                  enim vitae, vulputate scelerisque nibh. Vivamus eu neque
                  consectetur, dapibus leo vel, gravida dui. Vivamus a magna
                  urna. In sagittis commodo vulputate. Aliquam erat volutpat.
                  Integer interdum porta diam in pretium. Proin eget ornare sem.
                  Aenean dolor lectus, commodo a nibh a, maximus mollis diam.
                  Phasellus a tortor eget mi elementum tempor quis nec augue.
                  Maecenas iaculis ac arcu pulvinar tincidunt. Curabitur sit
                  amet nibh lorem. Fusce dictum consequat elit, non auctor diam
                  ornare et. Nulla viverra enim nisi, sit amet dignissim dolor
                  hendrerit quis. Suspendisse euismod mauris quis turpis
                  vestibulum luctus. Fusce vehicula dignissim blandit. Quisque
                  condimentum, sapien sed rhoncus tempor, metus tortor dignissim
                  dolor, eu ultricies ipsum dolor blandit velit. Etiam at dui
                  vitae tortor ultricies tempus at eget tortor. Phasellus
                  sollicitudin commodo metus, pretium tincidunt nibh rhoncus in.
                  Sed iaculis nibh a lorem elementum blandit eget eu dui. Morbi
                  id urna purus. Maecenas vestibulum est quis hendrerit
                  malesuada. Praesent eget quam volutpat, feugiat ex vitae,
                  laoreet metus. Cras eu pharetra metus. Morbi quis iaculis
                  dolor. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit.{" "}
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-row gap-4">
              <div className="flex flex-1 flex-col items-start rounded-md border border-border/40 bg-neutral-900/70 p-4">
                <span className="mb-1 flex items-center gap-2 font-medium text-muted-foreground text-sm">
                  <TimerIcon className="size-4" />
                  Version
                </span>
                <p className="font-semibold text-lg">1.2.3</p>
              </div>
              <div className="flex flex-1 flex-col items-start rounded-md border border-border/40 bg-neutral-900/70 p-4">
                <span className="mb-1 flex items-center gap-2 font-medium text-muted-foreground text-sm">
                  <DownloadIcon className="size-4" />
                  Downloads
                </span>
                <p className="font-semibold text-lg">12</p>
              </div>
              <div className="flex flex-1 flex-col items-start rounded-md border border-border/40 bg-neutral-900/70 p-4">
                <span className="mb-1 flex items-center gap-2 font-medium text-muted-foreground text-sm">
                  <HeartIcon className="size-4" />
                  Likes
                </span>
                <p className="font-semibold text-lg">1</p>
              </div>
            </div>
          </div>
        </div>
        {/* Install Button */}
        <div className="absolute right-8 bottom-8">
          <div className="flex flex-row gap-2">
            <Button
              size={"lg"}
              variant={"ghost"}
              className="font-semibold text-muted-foreground"
            >
              <CoinsIcon className="size-5" />
              Donate
            </Button>
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
