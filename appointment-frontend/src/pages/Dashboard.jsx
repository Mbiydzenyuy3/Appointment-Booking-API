import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import apiFetch from "../services/api.js";
import { toast } from "react-toastify";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await apiFetch.get("/providers");
        setProviders(response.data);
      } catch (error) {
        toast.error("Failed to fetch providers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Available Service Providers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div
              key={provider._id}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-lg font-semibold">{provider.name}</h3>
              <p className="text-gray-600 mb-4">{provider.specialty}</p>
              <a
                href={`/book/${provider._id}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Book Appointment
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
