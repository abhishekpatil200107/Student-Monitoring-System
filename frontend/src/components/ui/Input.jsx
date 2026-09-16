import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * Enterprise Form Input Field Component
 * Supports icons, floating visual accents, clear error states, helper texts, and smooth focus glow.
 */
function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon = null,
  rightElement = null,
  className = "",
  inputClassName = "",
  ...props
}) {
  const hasLeftIcon = Boolean(Icon);
  const hasRightElement = Boolean(rightElement);

  return (
    <div className={`field-wrapper mb-4 ${error ? "field-error" : ""} ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`field-label ${required ? "field-label-required" : ""}`}
        >
          <span>{label}</span>
        </label>
      )}

      <div
        className={`field-control-container ${
          hasLeftIcon ? "field-has-left-icon" : ""
        } ${hasRightElement ? "field-has-right-icon" : ""}`}
      >
        {Icon && (
          <div className="field-icon-left">
            <Icon size={18} />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`input-premium ${inputClassName} ${error ? "is-invalid" : ""}`}
          {...props}
        />

        {rightElement && (
          <div className="field-icon-right">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <div className="field-helper is-error">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && helperText && (
        <div className="field-helper">
          <span>{helperText}</span>
        </div>
      )}
    </div>
  );
}

export default Input;
