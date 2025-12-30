import React from "react";

interface SkeletonProps {
  className?: string; // Allow tailwind classes directly
  width?: string | number; // Optional specific width
  height?: string | number; // Optional specific height
  variant?: "text" | "circular" | "rectangular" | "rounded"; // Shape variants
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rounded",
}) => {
  const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-800";

  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    ></div>
  );
};

export default Skeleton;
