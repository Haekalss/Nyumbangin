export default function LoadingSpinner({ size = 'medium' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Memuat...</p>
      </div>
    </div>
  );
}
