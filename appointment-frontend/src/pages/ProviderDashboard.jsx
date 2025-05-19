// src/pages/ProviderDashboard.jsx
export default function ProviderDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-4">
        Provider Dashboard
      </h1>
      <p className="text-lg text-gray-700">
        Welcome, {user?.email || "Provider"}!
      </p>
    </div>
  );
}
