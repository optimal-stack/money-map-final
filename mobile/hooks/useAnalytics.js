import { useCallback, useState } from "react";
import { API_URL } from "../constants/api";

export const useAnalytics = (userId) => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(
    async (period = "month") => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/analytics/dashboard/${userId}?period=${period}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch analytics: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const fetchCategoryBreakdown = useCallback(
    async (period = "all") => {
      if (!userId) return;

      try {
        const response = await fetch(
          `${API_URL}/analytics/category-breakdown/${userId}?period=${period}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch category breakdown: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        return data;
      } catch (err) {
        console.error("Error fetching category breakdown:", err);
        throw err;
      }
    },
    [userId]
  );

  const fetchSpendingTrends = useCallback(
    async (period = "month") => {
      if (!userId) return;

      try {
        const response = await fetch(
          `${API_URL}/analytics/trends/${userId}?period=${period}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch trends: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        return data;
      } catch (err) {
        console.error("Error fetching trends:", err);
        throw err;
      }
    },
    [userId]
  );

  const fetchMonthlyComparison = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_URL}/analytics/monthly-comparison/${userId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch monthly comparison: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching monthly comparison:", err);
      throw err;
    }
  }, [userId]);

  return {
    analytics,
    isLoading,
    error,
    fetchAnalytics,
    fetchCategoryBreakdown,
    fetchSpendingTrends,
    fetchMonthlyComparison,
  };
};

