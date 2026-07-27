import React from "react";

export const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse bg-surface-container-high/60 rounded-xl ${className}`}
      {...props}
    />
  );
};

export const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4 bg-surface rounded-2xl border border-outline-variant/20">
      <div className="flex gap-4 pb-3 border-b border-outline-variant/20">
        {[...Array(cols)].map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1 rounded-md" />
        ))}
      </div>
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="flex gap-4 items-center py-2.5">
          {[...Array(cols)].map((_, c) => (
            <Skeleton key={c} className="h-6 flex-1 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="p-5 bg-surface rounded-2xl border border-outline-variant/20 space-y-3">
      <Skeleton className="w-1/3 h-4 rounded-md" />
      <Skeleton className="w-1/2 h-8 rounded-lg" />
      <Skeleton className="w-full h-3 rounded-md" />
    </div>
  );
};

export default Skeleton;
