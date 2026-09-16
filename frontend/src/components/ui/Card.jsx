import React from "react";

/**
 * Enterprise High-Level Card Component
 * Supports glassmorphism, hover elevation, structured headers, and clean surfaces.
 */
function Card({
  children,
  title,
  subtitle,
  action,
  variant = "default",
  hoverable = true,
  className = "",
  padding = "md",
  ...props
}) {
  const variantClasses = {
    default: "bg-white border border-slate-200/90 shadow-sm",
    glass: "card-glass",
    flat: "bg-slate-50 border border-slate-200/70",
    gradient: "bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm",
  };

  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverEffect = hoverable
    ? "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
    : "";

  return (
    <div
      className={`rounded-2xl ${variantClasses[variant] || variantClasses.default} ${
        paddingClasses[padding] || paddingClasses.md
      } ${hoverEffect} ${className}`.trim()}
      {...props}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            {title && (
              <h3 className="text-lg font-bold tracking-tight text-slate-800">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-xs font-medium text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
