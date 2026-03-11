import React from "react";

export default function ImageUploadBox({
  label,
  preview,
  onChange
}) {
  return (
    <div className="w-full text-center space-y-3">
      
      <p className="font-medium text-slate-700">{label}</p>

      <label className="cursor-pointer block">
        <div className="w-full aspect-square border-2 border-dashed rounded-2xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition relative overflow-hidden">
          
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <span className="text-4xl font-bold">+</span>
              <span className="text-sm">อัปโหลดรูป</span>
            </div>
          )}

        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
      </label>
    </div>
  );
}