"use client";

import React, { useRef, useState } from "react";
import { Camera, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfilePhotoUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  name?: string | null;
}

export default function ProfilePhotoUploader({ value, onChange, name }: ProfilePhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const compressAndUpload = async (file: File) => {
    // 1. File Validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported format. Use JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB.");
      return;
    }

    setIsUploading(true);
    try {
      // 2. Image Compression using HTML5 Canvas
      const compressedBlob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Max dimensions for profile picture
            const maxDim = 512;
            let width = img.width;
            let height = img.height;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("Canvas compression failed"));
                }
              },
              "image/jpeg",
              0.85
            );
          };
        };
        reader.onerror = (err) => reject(err);
      });

      // 3. Upload to server
      const uploadFormData = new FormData();
      uploadFormData.append("file", compressedBlob, "avatar.jpg");

      const response = await fetch("/api/users/me/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      toast.success("Photo uploaded successfully!");
      onChange(data.avatar);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      compressAndUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove your profile picture?")) return;
    setIsUploading(true);
    try {
      const response = await fetch("/api/users/me/upload", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove image");
      }

      toast.success("Photo removed!");
      onChange(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const initials = name ? name.charAt(0).toUpperCase() : "D";

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        onClick={triggerFileInput}
        className="relative group cursor-pointer w-24 h-24 rounded-full flex items-center justify-center overflow-hidden font-bold text-3xl text-black border border-[#00E5FF]/30 bg-gradient-to-br from-[#00E5FF] to-[#FF2BD6] shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-transform duration-200 hover:scale-105"
      >
        {value ? (
          <img src={value} alt="Preview" className="object-cover w-full h-full" />
        ) : (
          initials
        )}
        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-[#00E5FF]" />
          {value ? "Replace" : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={isUploading}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
      />
    </div>
  );
}
