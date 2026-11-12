"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

interface CinematicHeroProps {
  title?: string;
  subtitle?: string;
}

export function CinematicHero({
  title = "TIME IS EVERYTHING.",
  subtitle = "Exceptional watches. Timeless stories.",
}: CinematicHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  const TOTAL_FRAMES = 120;

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const images: HTMLImageElement[] = [];
    let count = 0;

    // Preload first 20 frames immediately, rest lazily
    const loadFrame = (index: number) => {
      const img = new Image();
      const paddedIndex = String(index).padStart(3, "0");
      img.src = `/sequence/frame-${paddedIndex}.webp`;
      img.onload = () => {
        count++;
        setLoadedCount(count);
        if (index === 0 && canvasRef.current) {
          renderFrame(0);
        }
      };
      return img;
    };

    // Load initial batch
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      images.push(loadFrame(i));
    }
    framesRef.current = images;

    const renderFrame = (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = framesRef.current[index];
      if (!img || !img.complete) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Maintain aspect ratio with contained luxury fit
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = height * 0.85;
        drawWidth = drawHeight * imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawWidth = width * 0.85;
        drawHeight = drawWidth / imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
    };

    let animationFrameId = 0;

    const handleScroll = () => {
      if (mediaQuery.matches) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollProgress = Math.max(
        0,
        Math.min(1, -rect.top / (rect.height - window.innerHeight)),
      );

      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(scrollProgress * (TOTAL_FRAMES - 1)),
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        renderFrame(frameIndex);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => renderFrame(currentFrameRef.current), { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", () => renderFrame(currentFrameRef.current));
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[220vh] bg-[#08090B]">
      {/* Sticky Cinematic Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between items-center px-6 py-12 md:py-16">
        
        {/* Subtle Background Radial Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(183,155,108,0.06)_0%,transparent_70%)]" />

        {/* Top Spacer for Fixed Header */}
        <div className="h-16" />

        {/* Central Watch Canvas or Static Image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {reducedMotion ? (
            <img
              src="/watches/daytona.webp"
              alt="Luxury Swiss Chronograph"
              className="max-h-[60vh] max-w-[85vw] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            />
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full max-w-5xl max-h-[75vh] object-contain"
            />
          )}
        </div>

        {/* Foreground Content: Title & Subtitle */}
        <div className="relative z-20 text-center max-w-4xl mx-auto mt-6 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B79B6C]/30 bg-[#14171A]/70 backdrop-blur-md mb-6">
            <Sparkles size={12} className="text-[#B79B6C]" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#F4F1EA] font-medium font-sans-ui">
              Haute Horlogerie • Windhoek
            </span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white font-normal uppercase leading-[1.05] mb-6">
            {title}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#A8A59E] font-editorial italic max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Bottom CTA Row & Scroll Cue */}
        <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 pointer-events-auto border-t border-white/[0.06] pt-6">
          <div className="flex items-center gap-4">
            <Link href="/collection" className="btn-gold">
              <span>Explore Collection</span>
              <ArrowUpRight size={15} />
            </Link>
            <Link href="/sell" className="btn-ghost-luxury">
              <span>Sell Your Watch</span>
            </Link>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs tracking-widest text-[#A8A59E] uppercase font-sans-ui">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B79B6C] animate-pulse" />
            <span>Scroll To Experience Timepiece</span>
            <ArrowDown size={14} className="text-[#B79B6C]" />
          </div>
        </div>
      </div>
    </div>
  );
}
