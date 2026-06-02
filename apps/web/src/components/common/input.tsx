// Input.tsx

import React, { useState } from "react";

type InputVariant = "default" | "filled" | "outlined";
type InputSize = "sm" | "md" | "lg";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  variant?: InputVariant;
  inputSize?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const variantClasses: Record<InputVariant, string> = {
  default:
    "border border-gray-300 bg-white focus:border-blue-500",

  filled:
    "bg-gray-100 border border-transparent focus:border-blue-500",

  outlined:
    "border-2 border-gray-400 bg-transparent focus:border-blue-600",
};

const sizeClasses: Record<InputSize, string> = {
  sm: "h-9 text-sm px-3",
  md: "h-11 text-base px-4",
  lg: "h-14 text-lg px-5",
};

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  success,
  variant = "default",
  inputSize = "md",
  leftIcon,
  rightIcon,
  loading = false,
  className = "",
  type = "text",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const actualType =
    type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  const stateClass = error
    ? "border-red-500"
    : success
    ? "border-green-500"
    : "";

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {leftIcon}
          </div>
        )}

        <input
          type={actualType}
          className={`
            w-full
            rounded-lg
            outline-none
            transition-all
            ${variantClasses[variant]}
            ${sizeClasses[inputSize]}
            ${stateClass}
            ${leftIcon ? "pl-10" : ""}
            ${
              rightIcon || type === "password"
                ? "pr-10"
                : ""
            }
            ${className}
          `}
          {...props}
        />

        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            ...
          </div>
        )}

        {!loading && type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() =>
              setShowPassword((prev) => !prev)
            }
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        )}

        {!loading &&
          rightIcon &&
          type !== "password" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}

      {!error && success && (
        <p className="mt-1 text-sm text-green-500">
          {success}
        </p>
      )}

      {!error && !success && helperText && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};