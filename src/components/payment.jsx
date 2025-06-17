import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import apiClient from "../helper/apiclient";

const PaymentPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { totalPrice } = location.state || {};
  const [error, setError] = useState(null);

  // Redirect if essential data is missing
  useEffect(() => {
    if (!totalPrice || !bookingId) {
      navigate("/cars");
    }
  }, [bookingId, totalPrice, navigate]);

  // Creates the PayPal order on your server
  const createOrder = async () => {
    try {
      const response = await apiClient.post(
        `/paypal/create-order/${bookingId}`
      );
      if (response.data.orderId) {
        return response.data.orderId;
      }
      throw new Error("Could not retrieve PayPal order ID from server.");
    } catch (err) {
      setError("Failed to create PayPal order. Please try again.");
      return null;
    }
  };

  // Captures the payment after the user approves
  const onApprove = async (data) => {
    try {
      // Endpoint to capture the payment on your server
      await apiClient.post(`/paymenttransaction/${data.orderID}/capture`);
      navigate("/payment-success", { state: { orderId: data.orderID } });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Payment capture failed. Please contact support.";
      setError(errorMessage);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Complete Your Payment
            </h2>
            <div className="text-center mt-4 text-gray-600">
              <p className="text-lg">Total Amount</p>
              <p className="text-4xl font-bold text-blue-600">
                €{totalPrice?.toFixed(2)}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md my-4 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium text-center text-gray-800 mb-4">
              Pay With PayPal
            </h3>

            <div className="h-20 flex items-center justify-center">
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={(err) =>
                  setError("An unexpected error occurred with PayPal.")
                }
                onCancel={() => navigate("/payment-cancel")}
              />
            </div>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-blue-500">
            &larr; Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;