import React from "react";
import { cn } from "../../lib/utils";

const UserAvatar = ({ 
  size = "md", 
  className 
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-20 w-20",
    "3xl": "h-32 w-32"
  };

  return (
    <div className={cn(
      "flex items-center justify-center rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200",
      sizeClasses[size],
      className
    )}>
      {/* User Avatar Image */}
      <img 
        src="https://customer-assets.emergentagent.com/job_ai-hub-clone-1/artifacts/yd6kbe3d_B938D892-C1E0-4E3E-A9F7-CA44E05672E1.png"
        alt="User Avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default UserAvatar;