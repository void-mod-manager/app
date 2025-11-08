"use client";
import Sidebar from "@/components/sidebar";
import "@/styles/globals.css";
import { listen } from "@tauri-apps/api/event";
import { hash } from "crypto";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/primitives/sonner";

interface downloadObject {
  name: string;
  progress: number;
  state: "in_progress" | "queued" | "finished";
  promise: Promise<void>;
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // hashmap
  const [downloads, setDownloads] = useState<Record<string, downloadObject>>(
    {},
  );

  useEffect(() => {
    listen<{ mod_id: string; filename: string }>("download_started", (e) => {
      const { mod_id, filename } = e.payload;
      const hashKey = `${filename}-${mod_id}`;
      const promise = new Promise<void>((resolve) => resolve());
      toast.promise<void>(() => promise, {
        loading: `Starting download for ${mod_id}`,
        success: `Download completed for ${mod_id}`,
        error: `Failed to start download for ${mod_id}`,
      });

      setDownloads((prev) => ({
        ...prev,
        [hashKey]: {
          name: filename,
          progress: 0,
          state: "in_progress",
          promise,
        },
      }));
      console.debug(`Download started for ${filename}`);
    });

    // Listener for download completion
    listen<{ mod_id: string; filename: string }>("download_finished", (e) => {
      toast(`Download finished for ${e.payload.filename}`);

      // Use the filename + id as our hash
      const hashKey = `${e.payload.filename}-${e.payload.mod_id}`;
      setDownloads((prev) => {
        const prevDownload = prev[hashKey];
        if (!prevDownload) return prev; // If not found, do nothing

        // Complete the download from the map by updating its state and progress
        return {
          ...prev,
          [hashKey]: {
            ...prevDownload,
            progress: 100,
            state: "finished",
          },
        };
      });
      console.debug(`Download finished for ${e.payload.filename}`);
    });
  }, []);

  // In here we create listeners for the download handler, so we can always respond to events

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="flex h-screen bg-background text-foreground">
          <Toaster richColors expand />
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 pr-0 pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
