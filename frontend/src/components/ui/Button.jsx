import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Enterprise Attractive Button Component
 * Supports multiple variants, sizes, icon slots, loading spinners, and micro-interactions.
 */
function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = "left",
  className = "",
  onClick,
  ...props
}) {
  // Variant styles mapped to our enhanced CSS design system
  const variantStyles = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    ghost: "btn-ghost",
    danger: "btn-danger",
    success: "btn-success",
    glow: "btn-glow",
  };

  const sizeStyles = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  const appliedVariant = variantStyles[variant] || variantStyles.primary;
  const appliedSize = sizeStyles[size] || sizeStyles.md;
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${appliedVariant} ${appliedSize} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={size === "sm" || size === "xs" ? 14 : 18} />
          <span>{typeof children === "string" ? "Processing..." : children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon size={size === "sm" || size === "xs" ? 14 : 18} className="shrink-0" />
          )}
          {children}
          {Icon && iconPosition === "right" && (
            <Icon size={size === "sm" || size === "xs" ? 14 : 18} className="shrink-0" />
          )}
        </>
      )}
    </button>
  );
}

export default Button;
