"use client";

import React, { useRef, useEffect } from "react";

interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  citations: number[];
}

export const CitationNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Use a ref instead of state so the render loop always sees
  // the current hover without re-running the entire effect.
  const hoveredRef = useRef<Node | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    // Set up hi-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    let cssW = container.clientWidth;
    let cssH = container.clientHeight;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    ctx.scale(dpr, dpr);

    const papers = [
      { id: 1,  label: "Attention Is All You Need",                          citations: [2, 3, 4, 10, 11] },
      { id: 2,  label: "BERT: Pre-training Deep Bidirectional Transformers", citations: [1, 3, 5] },
      { id: 3,  label: "Language Models are Few-Shot Learners (GPT-3)",      citations: [1, 2, 4, 12] },
      { id: 4,  label: "LLaMA: Open Foundation Language Models",             citations: [1, 3, 12, 13] },
      { id: 5,  label: "Deep Residual Learning (ResNet)",                    citations: [1, 6, 7] },
      { id: 6,  label: "Generative Adversarial Nets (GANs)",                citations: [5, 8] },
      { id: 7,  label: "Swin Transformer",                                  citations: [1, 5, 9] },
      { id: 8,  label: "DALL-E: Zero-Shot Text-to-Image",                   citations: [1, 6, 9] },
      { id: 9,  label: "Learning Transferable Visual Models (CLIP)",         citations: [1, 7, 8] },
      { id: 10, label: "Adam: Stochastic Optimization",                     citations: [1, 5, 11] },
      { id: 11, label: "Layer Normalization",                                citations: [1, 10] },
      { id: 12, label: "InstructGPT",                                       citations: [3, 4, 13] },
      { id: 13, label: "Direct Preference Optimization (DPO)",              citations: [4, 12] },
      { id: 14, label: "GraphSAGE",                                         citations: [15, 16] },
      { id: 15, label: "Node2Vec",                                          citations: [14, 16] },
      { id: 16, label: "Semi-Supervised GCNs",                              citations: [14, 15] },
    ];

    // Spread nodes across the full canvas area with generous spacing
    const nodes: Node[] = papers.map((paper, idx) => {
      const cols = 4;
      const rows = Math.ceil(papers.length / cols);
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cellW = cssW / cols;
      const cellH = cssH / rows;
      return {
        id: paper.id,
        label: paper.label,
        x: cellW * (col + 0.5) + (Math.random() - 0.5) * cellW * 0.45,
        y: cellH * (row + 0.5) + (Math.random() - 0.5) * cellH * 0.35,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: 5 + Math.random() * 3,
        citations: paper.citations,
      };
    });

    let mouseX = -9999;
    let mouseY = -9999;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Find hovered node — generous hit area
      let found: Node | null = null;
      for (const node of nodes) {
        const d = Math.hypot(node.x - mouseX, node.y - mouseY);
        if (d < node.radius + 28) {
          found = node;
          break;
        }
      }
      hoveredRef.current = found;
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
      hoveredRef.current = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!container) return;
      cssW = container.clientWidth;
      cssH = container.clientHeight;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", handleResize);

    // ---------- render loop ----------
    let time = 0;
    const render = () => {
      time += 0.004;
      ctx.clearRect(0, 0, cssW, cssH);

      const hovered = hoveredRef.current;
      const breathAlpha = 0.06 + Math.sin(time * 3) * 0.025;

      // ---- edges ----
      nodes.forEach((node) => {
        node.citations.forEach((tid) => {
          const target = nodes.find((n) => n.id === tid);
          if (!target || node.id >= target.id) return;

          const edgeHit =
            hovered &&
            (hovered.id === node.id || hovered.id === target.id);

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);

          if (edgeHit) {
            ctx.strokeStyle = "rgba(37, 99, 235, 0.55)";
            ctx.lineWidth = 2;
          } else {
            ctx.strokeStyle = `rgba(245, 245, 242, ${breathAlpha})`;
            ctx.lineWidth = 0.7;
          }
          ctx.stroke();
        });
      });

      // ---- nodes ----
      nodes.forEach((node) => {
        // physics
        node.x += node.vx;
        node.y += node.vy;

        const pad = 50;
        if (node.x < pad || node.x > cssW - pad) node.vx *= -1;
        if (node.y < pad || node.y > cssH - pad) node.vy *= -1;
        node.x = Math.max(pad, Math.min(cssW - pad, node.x));
        node.y = Math.max(pad, Math.min(cssH - pad, node.y));

        // gentle mouse pull
        const dm = Math.hypot(node.x - mouseX, node.y - mouseY);
        if (dm < 200) {
          const a = Math.atan2(mouseY - node.y, mouseX - node.x);
          const f = (200 - dm) * 0.0004;
          node.x += Math.cos(a) * f;
          node.y += Math.sin(a) * f;
        }

        const isNeighbor =
          hovered &&
          (hovered.id === node.id ||
            hovered.citations.includes(node.id) ||
            node.citations.includes(hovered.id));

        const isHoveredSelf = hovered && hovered.id === node.id;

        // draw dot
        ctx.beginPath();
        const drawRadius = isHoveredSelf ? node.radius + 3 : node.radius;
        ctx.arc(node.x, node.y, drawRadius, 0, Math.PI * 2);

        if (isHoveredSelf) {
          ctx.fillStyle = "#2563EB";
          ctx.shadowColor = "#2563EB";
          ctx.shadowBlur = 20;
        } else if (isNeighbor) {
          ctx.fillStyle = "rgba(37, 99, 235, 0.7)";
          ctx.shadowColor = "#2563EB";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = `rgba(245, 245, 242, ${0.3 + Math.sin(time * 2 + node.id) * 0.1})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // ---- labels ----
        if (isHoveredSelf) {
          // Dark pill background behind hovered label for readability
          const text = node.label;
          ctx.font = "600 13px Satoshi, system-ui, sans-serif";
          ctx.textAlign = "center";
          const m = ctx.measureText(text);
          const px = 10, py = 5;
          const lx = node.x;
          const ly = node.y - drawRadius - 14;

          ctx.fillStyle = "rgba(11, 11, 11, 0.85)";
          ctx.beginPath();
          const bx = lx - m.width / 2 - px;
          const by = ly - 12 - py;
          const bw = m.width + px * 2;
          const bh = 16 + py * 2;
          ctx.roundRect(bx, by, bw, bh, 4);
          ctx.fill();

          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(text, lx, ly);
        } else if (isNeighbor) {
          const text =
            node.label.length > 24
              ? node.label.substring(0, 22) + "…"
              : node.label;
          ctx.font = "500 11px Satoshi, system-ui, sans-serif";
          ctx.textAlign = "center";
          const m = ctx.measureText(text);
          const px = 8, py = 4;
          const lx = node.x;
          const ly = node.y - drawRadius - 10;

          ctx.fillStyle = "rgba(11, 11, 11, 0.7)";
          ctx.beginPath();
          const bx = lx - m.width / 2 - px;
          const by = ly - 11 - py;
          const bw = m.width + px * 2;
          const bh = 14 + py * 2;
          ctx.roundRect(bx, by, bw, bh, 3);
          ctx.fill();

          ctx.fillStyle = "rgba(245, 245, 242, 0.85)";
          ctx.fillText(text, lx, ly);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []); // no dependencies — runs once, hover tracked via ref

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
