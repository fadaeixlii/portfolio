"use client"; // canvas + mouse tracking + requestAnimationFrame

import { useEffect, useRef } from "react";

// Ochre accent in RGB (approximation of oklch(0.68 0.09 65))
const AR = 196;
const AG = 160;
const AB = 100;

interface Projected {
  x: number;
  y: number;
  z: number;
  size: number;
}

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Fibonacci sphere — evenly distributed points on a sphere surface
    const N = 200;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts: { theta: number; phi: number }[] = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      pts.push({ theta: Math.acos(y), phi: golden * i });
    }

    let baseRotY = prefersReduced ? 0.8 : 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Smooth mouse interpolation (faster tracking)
      const mc = mouseCurrent.current;
      const mt = mouseTarget.current;
      mc.x += (mt.x - mc.x) * 0.08;
      mc.y += (mt.y - mc.y) * 0.08;

      if (!prefersReduced) baseRotY += 0.0018;

      const rotY = baseRotY + mc.x * 0.8;
      const rotX = 0.45 + mc.y * 0.5;

      const radius = Math.min(w, h) * 0.42;
      // Desktop: sphere biased to the right. Mobile: centered
      const cx = w > 640 ? w * 0.62 : w * 0.5;
      const cy = h * 0.48;
      const persp = 900;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Project all points to 2D
      const proj: Projected[] = [];
      for (const p of pts) {
        let x = Math.sin(p.theta) * Math.cos(p.phi) * radius;
        let y = Math.cos(p.theta) * radius;
        let z = Math.sin(p.theta) * Math.sin(p.phi) * radius;

        // Y rotation
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // X rotation
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const s = persp / (persp + z2);
        proj.push({
          x: x1 * s + cx,
          y: y1 * s + cy,
          z: z2,
          size: Math.max(1, 3 * s),
        });
      }

      // Ambient glow behind sphere
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.4);
      glow.addColorStop(0, `rgba(${AR},${AG},${AB},0.07)`);
      glow.addColorStop(0.6, `rgba(${AR},${AG},${AB},0.03)`);
      glow.addColorStop(1, `rgba(${AR},${AG},${AB},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Draw connections between nearby projected points
      const maxConn = radius * 0.38;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < proj.length; i++) {
        for (let j = i + 1; j < proj.length; j++) {
          const dx = proj[i].x - proj[j].x;
          const dy = proj[i].y - proj[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxConn) {
            const avgZ = (proj[i].z + proj[j].z) * 0.5;
            const depth = (avgZ + radius) / (radius * 2);
            const fade = 1 - d / maxConn;
            const a = fade * depth * 0.14;
            ctx.strokeStyle = `rgba(${AR},${AG},${AB},${a})`;
            ctx.beginPath();
            ctx.moveTo(proj[i].x, proj[i].y);
            ctx.lineTo(proj[j].x, proj[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw points back-to-front
      proj.sort((a, b) => a.z - b.z);
      for (const p of proj) {
        const depth = (p.z + radius) / (radius * 2);
        const a = 0.12 + depth * 0.7;
        ctx.fillStyle = `rgba(${AR},${AG},${AB},${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow on front-facing points
        if (depth > 0.7) {
          const ga = (depth - 0.7) * 0.3;
          ctx.fillStyle = `rgba(${AR},${AG},${AB},${ga})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!prefersReduced) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseTarget.current.x = (e.clientX - r.left) / r.width - 0.5;
      mouseTarget.current.y = (e.clientY - r.top) / r.height - 0.5;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
