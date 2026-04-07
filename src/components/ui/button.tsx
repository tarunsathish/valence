"use client";

import { motion } from "framer-motion";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ripple-container";

    const variantClasses = {
      primary:
        "bg-purple-500 text-white hover:bg-purple-400 focus:ring-purple-500 active:scale-[0.98] font-mono",
      secondary:
        "bg-transparent text-purple-500 border-2 border-purple-500 hover:bg-purple-500/10 focus:ring-purple-500 active:scale-[0.98] font-mono",
      ghost:
        "bg-transparent text-gray-400 hover:bg-gray-900 hover:text-purple-500 focus:ring-gray-700 active:scale-[0.98] font-mono",
      danger:
        "bg-red-900/30 text-red-400 border-2 border-red-800 hover:bg-red-900/50 focus:ring-red-500 active:scale-[0.98] font-mono",
    };

    const sizeClasses = {
      sm: "text-sm px-4 py-2 rounded-md",
      md: "text-base px-6 py-3 rounded-lg",
      lg: "text-lg px-8 py-4 rounded-xl",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="spinner -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
