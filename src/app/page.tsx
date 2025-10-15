"use client";

import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

const Home = () => {
  const [greeted, setGreeted] = useState<string | null>(null);
  const greet = useCallback((): void => {
    invoke<string>("greet").then(setGreeted).catch(console.error);
  }, []);

  return (
    <main>
      <p>"{greeted ?? "Press the button"}"</p>
      <button type="button" onClick={greet}>
        Greet
      </button>
    </main>
  );
};

export default Home;
