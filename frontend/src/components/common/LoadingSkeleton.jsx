import React from 'react';

export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse shadow-subtle flex flex-col"
        >
          <div className="aspect-[16/9] bg-slate-200 w-full" />
          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3.5 bg-slate-100 rounded w-full" />
              <div className="h-3.5 bg-slate-100 rounded w-2/3" />
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="h-2 bg-slate-100 rounded w-full" />
              <div className="h-9 bg-slate-200 rounded-xl w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

