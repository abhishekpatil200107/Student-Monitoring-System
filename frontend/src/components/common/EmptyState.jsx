import React from "react";
import { Inbox } from "lucide-react";
import Button from "../ui/Button";

/**
 * Enterprise Empty State Component
 * Visually engaging placeholder when lists or records have no entries.
 */
function EmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "There are currently no items to display.",
  actionText = null,
  onAction = null,
  actionIcon = null,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-sm">
        <Icon size={32} />
      </div>

      <h3 className="text-lg font-bold text-slate-800 tracking-tight">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-slate-500 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <div className="mt-6">
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            icon={actionIcon}
          >
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
