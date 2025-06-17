import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../helper/apiclient";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get("/post"); // Corrected endpoint
        setPosts(response.data);
      } catch (err) {
        setError("Failed to load blog posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="text-center py-16">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-16">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.summary}</p>
            <Link
              to={`/blog/${post.id}`}
              className="text-blue-600 hover:underline"
            >
              Read More
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
