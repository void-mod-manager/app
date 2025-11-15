"use client";

import { useCallback, useState } from "react";
import { getTauRPC } from "@/lib/taurpc/useTaurpc";

const Home = () => {
  const [greeted, setGreeted] = useState<string | null>(null);
  const greet = useCallback((): void => {
    const rpc = getTauRPC();
    rpc.greet().then(setGreeted).catch(console.error);
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
