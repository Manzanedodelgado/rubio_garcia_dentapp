import React from "react";
import { cn } from "../../lib/utils";

const ToothAvatar = ({ 
  size = "md", 
  color = "blue",
  className 
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-20 w-20"
  };

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    emerald: "bg-emerald-100 text-emerald-600 border-emerald-200",
    purple: "bg-purple-100 text-purple-600 border-purple-200",
    indigo: "bg-indigo-100 text-indigo-600 border-indigo-200",
    rose: "bg-rose-100 text-rose-600 border-rose-200",
    orange: "bg-orange-100 text-orange-600 border-orange-200",
    teal: "bg-teal-100 text-teal-600 border-teal-200",
    cyan: "bg-cyan-100 text-cyan-600 border-cyan-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200"
  };

  return (
    <div className={cn(
      "flex items-center justify-center rounded-full border-2",
      sizeClasses[size],
      colorClasses[color],
      className
    )}>
      {/* Tooth SVG Icon */}
      <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-3/5 h-3/5"
      >
        <path d="M12 2C10.5 2 9.17 2.84 8.5 4.15C7.83 5.46 8 7.07 8.5 8.5C9 9.93 9.5 11.36 9.5 12.79C9.5 14.22 9 15.65 8.5 17.08C8 18.51 7.83 20.12 8.5 21.43C9.17 22.74 10.5 23.58 12 23.58C13.5 23.58 14.83 22.74 15.5 21.43C16.17 20.12 16 18.51 15.5 17.08C15 15.65 14.5 14.22 14.5 12.79C14.5 11.36 15 9.93 15.5 8.5C16 7.07 16.17 5.46 15.5 4.15C14.83 2.84 13.5 2 12 2Z" />
      </svg>
    </div>
  );
};

export default ToothAvatar;