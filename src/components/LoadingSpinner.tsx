export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}
