import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  headline: string;
  source?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, headline, source }: ImageModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${headline.slice(0, 50)}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-5xl w-full max-h-[95vh] overflow-hidden rounded-xl shadow-2xl bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <img
            src={imageUrl}
            alt={headline}
            className="max-h-[85vh] object-contain rounded-md"
          />
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold text-white">{headline}</p>
            {source && <p className="text-sm text-gray-300 mt-1">{source}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
