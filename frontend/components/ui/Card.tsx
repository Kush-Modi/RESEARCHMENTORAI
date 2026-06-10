import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverGlow = true,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`relative group overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-6 backdrop-blur-md transition-all duration-300 ${
        hoverGlow
          ? "hover:border-zinc-700/80 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1"
          : ""
      } ${className}`}
      {...props}
    >
      {/* Background glow animation layer on hover */}
      {hoverGlow && (
        <div className="absolute -inset-px bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
