export function LoadingSpinner() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
} 