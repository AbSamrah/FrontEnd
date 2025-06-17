import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../helper/apiclient";

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await apiClient.get(`/post/${id}`); // Corrected endpoint
        setPost(response.data);
      } catch (err) {
        setError("Failed to load post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div className="text-center py-16">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-16">{error}</div>;
  if (!post) return <div className="text-center py-16">Post not found.</div>;

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <img
        src={`http://localhost:5117${post.image}`}
        alt={post.title}
        className="w-full h-auto object-cover rounded-lg mb-8"
      />
      <div className="prose lg:prose-xl">{post.body}</div>
    </div>
  );
};

export default BlogPost;
