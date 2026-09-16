import React from "react";

/**
 * Enterprise Status Badge Component
 * Features status dots, pulsating live indicators, and crisp semantic styling.
 */
function Badge({
  children,
  color = "emerald",
  dot = true,
  pulse = false,
  className = "",
  size = "md",
}) {
  const colorMap = {
    // Modern semantic
    indigo: "badge-indigo",
    emerald: "badge-emerald",
    amber: "badge-amber",
    rose: "badge-rose",
    sky: "badge-sky",
    slate: "badge-slate",

    // Backward compatibility aliases
    green: "badge-emerald",
    red: "badge-rose",
    blue: "badge-indigo",
    orange: "badge-amber",
    purple: "badge-indigo",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const badgeClass = colorMap[color] || "badge-indigo";

  return (
    <span
      className={`badge-premium ${badgeClass} ${sizeClasses[size] || sizeClasses.md} ${className}`.trim()}
    >
      {dot && (
        <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
          {pulse && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          )}
          <span className="badge-dot" />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
