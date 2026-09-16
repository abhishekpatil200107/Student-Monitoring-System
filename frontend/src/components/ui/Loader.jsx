import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Enterprise Loader Component
 * Supports inline spinners, card skeletons, and full-screen overlays.
 */
function Loader({
  size = "md",
  text = "",
  fullScreen = false,
  className = "",
}) {
  const sizeMap = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <Loader2
          size={sizeMap[size] || 32}
          className="animate-spin text-indigo-600"
        />
      </div>
      {text && (
        <p className="text-xs font-medium text-slate-500 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="rounded-2xl bg-white p-6 shadow-xl border border-slate-100 flex flex-col items-center">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

export default Loader;
