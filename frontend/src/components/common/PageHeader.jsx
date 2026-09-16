import React from "react";

/**
 * Enterprise Page Header Component
 * Provides clean title, category eyebrow, description, and action button slot.
 */
function PageHeader({
  title,
  subtitle,
  eyebrow,
  children,
  className = "",
}) {
  return (
    <div
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">{subtitle}</p>
        )}
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
