import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-4 bg-white p-6 rounded-lg shadow-md">
        <div className="flex mb-4 gap-2 items-center">
          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">!</div>
          <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Did you forget to add the page to the router?
        </p>
      </div>
    </div>
  );
}
