import { useState, useEffect } from "react";
import api from "@/utils/api"; 

type Fridge = {
  fridge_id: number;
  instrument_name: string;
  parameter_name: string;
  applied_value: number;
  timestamp: number;
};

export default function Home() {
  // state variables
  //useeffect and api request .then .cache
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [filteredFridges, setFilteredFridges] = useState<Fridge[]>([]);
  const [filters, setFilters] = useState({
    fridgeId: "",
    instrumentName: "",
    parameterName: "",
  });

  // Get fridge data
  useEffect(() => {
    api.get("/fridges")
      .then((response)=> {
        setFridges(response.data.fridges);
      })
      .catch ((error) => {
        console.log(error);
      })
  }, []);

  // Filter Fridges
  useEffect(() => {
    setFilteredFridges(
      fridges.filter((fridge) => {
        return (
          fridge.fridge_id.toString().includes(filters.fridgeId) &&
          fridge.instrument_name.includes(filters.instrumentName) &&
          fridge.parameter_name.includes(filters.parameterName)
        );
      })
    );
  }, [filters, fridges]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      fridgeId: "",
      instrumentName: "",
      parameterName: "",
    })
  }
  return (
    <div>
      <div className="w-full mb-4 p-4 bg-gray-50 shadow-sm">
        <h2 className="text-2xl font-semibold">Filter Fridges</h2>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div>
            <label className="text-gray-700">
              Fridge ID
            </label>
            <input
              type="text"
              name="fridgeId"
              value={filters.fridgeId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Filter by fridge ID"
            />
          </div>
          <div>
            <label className="text-gray-700">
              Instrument Name
            </label>
            <input
              type="text"
              name="instrumentName"
              value={filters.instrumentName}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Filter by instrument name"
            />
          </div>
          <div>
            <label className="text-gray-700">
              Parameter Name
            </label>
            <input
              type="text"
              name="parameterName"
              value={filters.parameterName}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Filter by parameter name"
            />
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Clear Filters
          </button>
        </div>
      </div>
    
      <div className = "flex justify-center">
        <table className="w-4/5 border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th>Fridge ID</th>
              <th>Instrument Name</th>
              <th>Parameter Name</th>
              <th>Applied Value</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
          {filteredFridges.length > 0 ? (
              filteredFridges.map((fridge) => (
                <tr key={`${fridge.fridge_id}-${fridge.timestamp}`}>
                  <td className="border p-2">{fridge.fridge_id}</td>
                  <td className="border p-2">{fridge.instrument_name}</td>
                  <td className="border p-2">{fridge.parameter_name}</td>
                  <td className="border p-2">{fridge.applied_value}</td>
                  <td className="border p-2">{new Date(fridge.timestamp).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="border p-4 text-center">
                  No fridges match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

}

