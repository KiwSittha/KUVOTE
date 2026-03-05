import React from "react";

export default function Avatar({ 
  name = "User", 
  initials = "U", 
  size = "md",
  className = "" 
}) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-semibold ${sizeClasses[size]} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
