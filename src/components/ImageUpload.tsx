import { useState, useRef } from 'react';
import { Image as ImageIcon, X, UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageUploadProps {
  onImageSelect: (base64: string | null) => void;
  className?: string;
}

export function ImageUpload({ onImageSelect, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onImageSelect(base64);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setPreview(null);
    onImageSelect(null);
  };

  return (
    <div className={cn("relative", className)}>
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center p-4 h-32 rounded-xl border-2 border-dashed transition-all cursor-pointer",
            isDragging 
              ? "border-brand bg-brand/10" 
              : "border-white/10 hover:border-white/20 hover:bg-white/5"
          )}
        >
          <UploadCloud className="w-8 h-8 text-slate-500 mb-2" />
          <span className="text-xs text-slate-400 font-medium">
            Drag screenshot or click to upload
          </span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative h-32 rounded-xl overflow-hidden border border-white/10 group">
          <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={removeImage}
              className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
