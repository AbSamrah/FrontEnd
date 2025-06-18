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
