import { Suspense, lazy, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";

const HeroScene = lazy(() => import("./hero-scene"));

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

/** Lightweight CSS fallback used without WebGL, with reduced motion, or before load. */
function MoleculeFallback() {
  return (
    <div aria-hidden className="relative size-full">
      <div className="absolute inset-0 grid place-items-center">
        <div className="animate-float-soft relative size-56 rounded-full border border-primary/20 sm:size-72">
          <span className="absolute inset-6 rounded-full border border-accent/30" />
          <span className="absolute inset-14 rounded-full bg-hero-gradient opacity-25 blur-2xl" />
          <span className="absolute -top-2 start-1/2 size-5 -translate-x-1/2 rounded-full bg-accent/70" />
          <span className="absolute bottom-4 start-2 size-4 rounded-full bg-primary/60" />
          <span className="absolute bottom-8 end-1 size-3 rounded-full bg-accent/60" />
        </div>
      </div>
    </div>
  );
}

export function Hero3D() {
  const [mode, setMode] = useState<"pending" | "fallback" | "low" | "high">("pending");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !hasWebGL()) {
      setMode("fallback");
      return;
    }
    const smallScreen = window.matchMedia("(max-width: 768px)").matches;
    const lowCores = (navigator.hardwareConcurrency ?? 4) <= 4;
    // Defer the scene so hero text paints first (LCP stays fast).
    const id = window.setTimeout(
      () => setMode(smallScreen || lowCores ? "low" : "high"),
      400,
    );
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="relative h-[280px] w-full sm:h-[380px] lg:h-[460px]">
      {mode === "pending" || mode === "fallback" ? (
        <MoleculeFallback />
      ) : (
        <ClientOnly fallback={<MoleculeFallback />}>
          <Suspense fallback={<MoleculeFallback />}>
            <HeroScene quality={mode === "high" ? "high" : "low"} />
          </Suspense>
        </ClientOnly>
      )}
    </div>
  );
}