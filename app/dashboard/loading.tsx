export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

        <p className="mt-5 text-lg font-semibold text-gray-600">
          Loading Dashboard...
        </p>
      </div>
    </div>
  );
}