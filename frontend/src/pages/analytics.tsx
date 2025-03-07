import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import api from "@/utils/api";

// Analytics Strucutre
type AnalyticsSummary = {

  byFridge: {
    [key: string]: {
      count: number;
      avgValue: number;
      minValue: number;
      maxValue: number;
    };
  };

  byInstrument: {
    [key: string]: {
      count: number;
      avgValue: number;
      minValue: number;
      maxValue: number;
    };
  };

  byParameter: {
    [key: string]: {
      count: number;
      avgValue: number;
      minValue: number;
      maxValue: number;
    };
  };

  overall: {
    totalRecords: number;
    avgValue: number;
    minValue: number;
    maxValue: number;
  };
};


export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // / Request to Analytics API Endpoint
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get<AnalyticsSummary>('/analytics');
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (

    <div>
    {/* navigation bar */}
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Fridge Analytics</h1>
        
        {/* Overall stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Overall Statistics</h2>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-sm text-gray-500">Total Records</div>
                <div className="text-2xl font-bold">{analytics?.overall.totalRecords}</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-sm text-gray-500">Average Value</div>
                <div className="text-2xl font-bold">{analytics?.overall.avgValue}</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-sm text-gray-500">Min Value</div>
                <div className="text-2xl font-bold">{analytics?.overall.minValue}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-sm text-gray-500">Max Value</div>
                <div className="text-2xl font-bold">{analytics?.overall.maxValue}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fridge  stats*/}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Statistics by Fridge</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Fridge ID</th>
                  <th className="py-2 px-4 text-left">Count</th>
                  <th className="py-2 px-4 text-left">Avg Value</th>
                  <th className="py-2 px-4 text-left">Min Value</th>
                  <th className="py-2 px-4 text-left">Max Value</th>
                </tr>
              </thead>
              <tbody>
                {analytics && Object.keys(analytics.byFridge).map((key) => (
                  <tr key={key} className="border-t">
                    <td className="py-2 px-4">{key}</td>
                    <td className="py-2 px-4">{analytics.byFridge[key].count}</td>
                    <td className="py-2 px-4">{analytics.byFridge[key].avgValue}</td>
                    <td className="py-2 px-4">{analytics.byFridge[key].minValue}</td>
                    <td className="py-2 px-4">{analytics.byFridge[key].maxValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instrument stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Statistics by Instrument</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Instrument Name</th>
                  <th className="py-2 px-4 text-left">Count</th>
                  <th className="py-2 px-4 text-left">Avg Value</th>
                  <th className="py-2 px-4 text-left">Min Value</th>
                  <th className="py-2 px-4 text-left">Max Value</th>
                </tr>
              </thead>
              <tbody>
                {analytics && Object.keys(analytics.byInstrument).map((key) => (
                  <tr key={key} className="border-t">
                    <td className="py-2 px-4">{key}</td>
                    <td className="py-2 px-4">{analytics.byInstrument[key].count}</td>
                    <td className="py-2 px-4">{analytics.byInstrument[key].avgValue}</td>
                    <td className="py-2 px-4">{analytics.byInstrument[key].minValue}</td>
                    <td className="py-2 px-4">{analytics.byInstrument[key].maxValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Parameter stats */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Statistics by Parameter</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Parameter Name</th>
                  <th className="py-2 px-4 text-left">Count</th>
                  <th className="py-2 px-4 text-left">Avg Value</th>
                  <th className="py-2 px-4 text-left">Min Value</th>
                  <th className="py-2 px-4 text-left">Max Value</th>
                </tr>
              </thead>
              <tbody>
                {analytics && Object.keys(analytics.byParameter).map((key) => (
                  <tr key={key} className="border-t">
                    <td className="py-2 px-4">{key}</td>
                    <td className="py-2 px-4">{analytics.byParameter[key].count}</td>
                    <td className="py-2 px-4">{analytics.byParameter[key].avgValue}</td>
                    <td className="py-2 px-4">{analytics.byParameter[key].minValue}</td>
                    <td className="py-2 px-4">{analytics.byParameter[key].maxValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}