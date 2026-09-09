"use client";

import { useState } from "react";
import axios from "axios";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset || "");

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
      );
      onChange(res.data.secure_url);
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      alert("Failed to upload image. Verify Cloudinary credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {value ? (
        <div className="relative h-40 w-40 rounded-2xl overflow-hidden border border-slate-100 group shadow-lg">
          <Image src={value} alt="Upload" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="p-3 bg-red-600 rounded-xl text-white hover:bg-red-500 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        <label className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50">
          {loading ? (
            <Loader2 className="animate-spin text-blue-600" size={28} />
          ) : (
            <>
              <ImagePlus className="text-slate-400" size={28} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Upload Image
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            disabled={loading || disabled}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
