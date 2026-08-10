import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { getFullImageUrl } from "../api/axios";

export default function FocalPointEditor({ image, initialFocalPoint, onSave, onCancel }) {
  const [focalPoint, setFocalPoint] = useState(initialFocalPoint || { x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const imageContainerRef = useRef(null);

  useEffect(() => {
    if (initialFocalPoint) {
      setFocalPoint(initialFocalPoint);
    }
  }, [initialFocalPoint]);

  const updateFocalPoint = (clientX, clientY) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setFocalPoint({ x: Math.round(x), y: Math.round(y) });
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    updateFocalPoint(e.clientX, e.clientY);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      updateFocalPoint(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  const resetToCenter = () => {
    setFocalPoint({ x: 50, y: 50 });
  };

  const imageUrl = getFullImageUrl(image);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 lg:p-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-surface-container-lowest w-full max-w-[1400px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-full h-[95vh] border border-outline-variant/20"
      >
        <div className="p-6 md:px-8 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Image Focal Point</h2>
            <p className="text-sm text-on-surface-variant mt-1.5 font-medium">
              Click or drag to select the most important area of the image. This ensures it's never cropped out on different devices.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-highest flex items-center justify-center text-on-surface transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-10 overflow-y-auto min-h-0 flex-grow bg-surface-container-lowest">
          
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">Original Image</h3>
            <div className="relative w-full flex-grow bg-surface-container-high rounded-2xl overflow-hidden shadow-inner border border-outline-variant/30 flex items-center justify-center min-h-[300px]">
              <div
                ref={imageContainerRef}
                className="relative cursor-crosshair touch-none select-none max-w-full max-h-full"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <img
                  src={imageUrl}
                  alt="Original"
                  className="max-w-full max-h-[60vh] object-contain block pointer-events-none"
                  draggable={false}
                />
                
                {/* Focal Point Marker */}
                <div
                  className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-[4px] border-white bg-primary shadow-[0_0_15px_rgba(0,0,0,0.3)] pointer-events-none flex items-center justify-center transition-all duration-75"
                  style={{ left: `${focalPoint.x}%`, top: `${focalPoint.y}%` }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Coordinates & Reset */}
            <div className="flex items-center justify-between w-full mt-5 shrink-0">
              <div className="flex gap-4">
                <div className="bg-surface-container px-5 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface shadow-sm">
                  X: {focalPoint.x}%
                </div>
                <div className="bg-surface-container px-5 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface shadow-sm">
                  Y: {focalPoint.y}%
                </div>
              </div>
              <button
                type="button"
                onClick={resetToCenter}
                className="text-sm font-bold text-primary hover:bg-primary/20 flex items-center gap-2 transition-colors bg-primary/10 px-5 py-2.5 rounded-xl border border-primary/20"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                Reset to Center
              </button>
            </div>
          </div>

          {/* Previews Area */}
          <div className="w-full lg:w-[480px] shrink-0 flex flex-col gap-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface border-b border-outline-variant/30 pb-3">
              Responsive Previews
            </h3>
            
            <div className="flex flex-col gap-8 overflow-y-auto pr-2 pb-4">
              {/* Desktop Preview */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">desktop_windows</span> Desktop</span>
                  <span>16:9 Landscape</span>
                </div>
                <div className="w-full aspect-video rounded-2xl overflow-hidden border-[3px] border-outline-variant/40 bg-surface-container shadow-md">
                  <img
                    src={imageUrl}
                    alt="Desktop Preview"
                    className="w-full h-full object-cover transition-all duration-75"
                    style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Tablet Preview */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">tablet_mac</span> Tablet</span>
                    <span>4:3</span>
                  </div>
                  <div className="w-full aspect-4/3 rounded-2xl overflow-hidden border-[3px] border-outline-variant/40 bg-surface-container shadow-md">
                    <img
                      src={imageUrl}
                      alt="Tablet Preview"
                      className="w-full h-full object-cover transition-all duration-75"
                      style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
                    />
                  </div>
                </div>

                {/* Mobile Preview */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">smartphone</span> Mobile</span>
                    <span>9:16</span>
                  </div>
                  <div className="w-[180px] max-w-full aspect-[9/16] rounded-2xl overflow-hidden border-[3px] border-outline-variant/40 bg-surface-container shadow-md mx-auto">
                    <img
                      src={imageUrl}
                      alt="Mobile Preview"
                      className="w-full h-full object-cover transition-all duration-75"
                      style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:px-8 border-t border-outline-variant/30 flex justify-end gap-4 bg-surface-container-low shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3.5 rounded-full font-bold text-sm text-on-surface bg-surface-container hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(focalPoint)}
            className="px-8 py-3.5 rounded-full font-bold text-sm text-on-primary bg-primary hover:bg-primary/90 transition-colors shadow-lg flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            Save Focal Point
          </button>
        </div>
      </motion.div>
    </div>
  );
}
