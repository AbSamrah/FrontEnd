import React from "react";
import { Link, useLocation } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const { orderId } = location.state || {};

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <i className="fas fa-check h-6 w-6 text-green-600"></i>
        </div>
        <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
          Payment Successful!
        </h2>
        <p className="mt-2 text-gray-600">
          Thank you for your payment. Your booking is confirmed.
        </p>
        {orderId && (
          <p className="mt-4 text-sm text-gray-500">
            Your Order ID is: <strong>{orderId}</strong>
          </p>
        )}
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
