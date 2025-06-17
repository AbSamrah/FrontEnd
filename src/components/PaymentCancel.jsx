import React from "react";
import { Link } from "react-router-dom";

const PaymentCancel = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
          <i className="fas fa-exclamation-triangle h-6 w-6 text-yellow-600"></i>
        </div>
        <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
          Payment Cancelled
        </h2>
        <p className="mt-2 text-gray-600">
          Your payment process was not completed. You can try again from your
          bookings page.
        </p>
        <div className="mt-6">
          <Link
            to="/cars"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Back to Cars
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
