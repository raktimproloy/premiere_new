const PricingSkeleton = () => {
  return (
    <div className="border-t border-gray-200 pt-4 mb-4">
      <div className="space-y-2 text-sm">
        {/* Property Rate Skeleton */}
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        
        {/* Average Price Skeleton */}
        <div className="flex justify-between text-xs text-gray-500">
          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        
        {/* Blocked Nights Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
      </div>
    </div>
  );
};

export default PricingSkeleton;
