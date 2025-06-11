import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full" aria-hidden="true">
      <div className="space-y-4">
        {/* Company name */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Status badge */}
        <Skeleton className="h-5 w-20" />
        
        {/* Address */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Industry */}
        <Skeleton className="h-4 w-1/2" />
        
        {/* Button */}
        <Skeleton className="h-9 w-full mt-4" />
      </div>
    </div>
  );
};

export const SearchBarSkeleton: React.FC = () => {
  return (
    <div className="space-y-4" aria-hidden="true">
      {/* Search input */}
      <Skeleton className="h-10 w-full" />
      
      {/* Filter row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      
      {/* Button */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
};

export const CardSkeletonGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

export default {
  Card: CardSkeleton,
  SearchBar: SearchBarSkeleton,
  CardGrid: CardSkeletonGrid
}; 