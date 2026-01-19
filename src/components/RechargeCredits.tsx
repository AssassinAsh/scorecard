"use client";

import { useState } from "react";
import { rechargeCredits } from "@/app/actions/profile";
import ConfirmationModal from "./ConfirmationModal";

export default function RechargeCredits() {
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const creditsNumber = parseInt(credits);

    if (isNaN(creditsNumber) || creditsNumber <= 0) {
      setError("Please enter a valid number of credits");
      setIsLoading(false);
      return;
    }

    const result = await rechargeCredits(email, creditsNumber);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.message || "Credits recharged successfully");
      setEmail("");
      setCredits("");
    }

    setIsLoading(false);
    setShowModal(false);
  };

  const handleRechargeClick = () => {
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!credits.trim() || parseInt(credits) <= 0) {
      setError("Please enter a valid number of credits");
      return;
    }

    setShowModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Recharge Credits
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Add credits to any user account by entering their email address.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-600 dark:text-green-400">
            {success}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="recharge-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            User Email
          </label>
          <input
            id="recharge-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="recharge-credits"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Credits to Add
          </label>
          <input
            id="recharge-credits"
            type="number"
            min="1"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder="10"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleRechargeClick}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? "Processing..." : "Recharge"}
        </button>
      </div>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        title="Confirm Credit Recharge"
        message={`Are you sure you want to add ${credits} credits to ${email}?`}
        confirmText="Confirm Recharge"
        confirmStyle="success"
        isLoading={isLoading}
      />
    </div>
  );
}
