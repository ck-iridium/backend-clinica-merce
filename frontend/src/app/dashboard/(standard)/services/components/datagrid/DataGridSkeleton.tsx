"use client"
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export function DataGridSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex gap-4">
        <Skeleton className="w-24 h-10 rounded-xl" />
        <Skeleton className="w-24 h-10 rounded-xl" />
        <Skeleton className="w-24 h-10 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-stone-50">
            <Skeleton className="w-6 h-6 rounded-md" />
            <Skeleton className="w-1/4 h-6 rounded-lg" />
            <Skeleton className="w-20 h-6 rounded-lg" />
            <Skeleton className="w-16 h-8 rounded-lg" />
            <Skeleton className="w-10 h-6 rounded-full" />
            <Skeleton className="w-16 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
