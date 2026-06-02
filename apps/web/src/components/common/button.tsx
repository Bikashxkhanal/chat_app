// Button.tsx

import React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "success"
  | "warning"
  | "popup"
  | "ghost"
  | "image";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  imageSrc?: string;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700",

  secondary:
    "bg-gray-200 text-gray-900 hover:bg-gray-300",

  destructive:
    "bg-red-600 text-white hover:bg-red-700",

  success:
    "bg-green-600 text-white hover:bg-green-700",

  warning:
    "bg-yellow-500 text-black hover:bg-yellow-600",

  popup:
    "bg-purple-600 text-white shadow-lg hover:scale-105 transition-transform",

  ghost:
    "bg-transparent border border-gray-300 hover:bg-gray-100",

  image:
    "p-0 overflow-hidden border-none bg-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  imageSrc,
  disabled,
  children,
  className = "",
  ...props
}) => {
  if (variant === "image") {
    return (
      <button
        disabled={disabled || loading}
        className={`rounded-lg ${variantClasses.image} ${className}`}
        {...props}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt="button"
            className="w-full h-full object-cover"
          />
        )}
      </button>
    );
  }

  return (
    <button
      disabled={disabled || loading}
      className={`
        rounded-lg
        font-medium
        transition-all
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;