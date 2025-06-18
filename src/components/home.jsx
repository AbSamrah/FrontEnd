import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../helper/apiclient";
import "../style/home.css"; // Home page specific styles

const Home = () => {
  const [featuredTrips, setFeaturedTrips] = useState([]);

  useEffect(() => {
    const fetchFeaturedTrips = async () => {
      try {
        const response = await apiClient.get("/trips");
        setFeaturedTrips(response.data);
      } catch (error) {
        console.error("Failed to fetch featured trips:", error);
      }
    };

    fetchFeaturedTrips();
  }, []);

  return (
    <div className="text-gray-800">
      {/* Hero Section */}
      <header className="hero-section h-screen flex items-center justify-center pt-16">
        <div className="bg-black bg-opacity-40 absolute inset-0"></div>
        <div className="container mx-auto px-6 text-center text-white relative">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-down">
            Your Adventure Awaits
          </h1>
          <p className="text-lg md:text-xl mb-8 animate-fade-in-up">
            Discover breathtaking destinations and create unforgettable
            memories.
          </p>

          <div className="search-card max-w-4xl mx-auto p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="text-left">
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-white"
                >
                  Destination
                </label>
                <input
                  type="text"
                  id="destination"
                  placeholder="e.g., Paris, France"
                  className="mt-1 w-full p-2 rounded-md text-gray-800"
                />
              </div>
              <div className="text-left">
                <label
                  htmlFor="checkin"
                  className="block text-sm font-medium text-white"
                >
                  Check-in
                </label>
                <input
                  type="date"
                  id="checkin"
                  className="mt-1 w-full p-2 rounded-md text-gray-800"
                />
              </div>
              <div className="text-left">
                <label
                  htmlFor="checkout"
                  className="block text-sm font-medium text-white"
                >
                  Check-out
                </label>
                <input
                  type="date"
                  id="checkout"
                  className="mt-1 w-full p-2 rounded-md text-gray-800"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md w-full md:mt-6">
                <i className="fas fa-search mr-2"></i>Search
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTrips.map((trip) => (
              <div
                key={trip.id}
                className="feature-card bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <img
                  src="https://placehold.co/600x400/e2e8f0/4a5568?text=Trip+Image"
                  alt={trip.slug}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{trip.slug}</h3>
                  <p className="text-gray-600 mb-4">{trip.description}</p>
                  <Link
                    to={`/trips/${trip.id}`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Explore <i className="fas fa-arrow-right ml-1"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
