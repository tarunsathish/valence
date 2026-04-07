"use client";

import { motion } from "framer-motion";
import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = true, className = "", ...props }, ref) => {
    const Component = hover ? motion.div : "div";

    return (
      <Component
        ref={ref}
        {...(hover
          ? {
              whileHover: { y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" },
              transition: { duration: 0.2 },
            }
          : {})}
        className={`rounded-xl border border-gray-800 bg-black/50 p-6 backdrop-blur-sm transition-all ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = "Card";
