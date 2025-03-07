import { useState, useEffect, useRef, useCallback} from "react";
import api from "@/utils/api"; 


type Fridge = {
  fridge_id: number;
  instrument_name: string;
  parameter_name: string;
  applied_value: number;
  timestamp: number;
};
type FridgeResponse = {
  fridges: Fridge[];
  total: number;
}

export default function Home() {
  // state variables
  //useeffect and api request .then .cache
  const [fridges, setFridges] = useState<Fridge[]>([]); //fridge data
  const [filteredFridges, setFilteredFridges] = useState<Fridge[]>([]); // filtered data
  const [filters, setFilters] = useState({ //filters to be used
    fridgeId: "",
    instrumentName: "",
    parameterName: "",
  });
  const [liveMode, setLiveMode] = useState(false); // is live button on or off
  const [loading, setLoading] = useState(false); //loading data
  const [page, setPage] = useState(1); //what page
  const [hasMore, setHasMore] = useState(true); //is there more data
  const [totalRecords, setTotalRecords] = useState(0); // how many records are there

  // obserber detects if last page is in view
  const observer = useRef<IntersectionObserver | null>(null);
  const lastFridgeElementRef = useCallback((node: HTMLTableRowElement | null) => { //last eleemnt
    if (loading) return;
    if (observer.current) observer.current.disconnect(); //no other observers

    //checks for more data
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !liveMode) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, liveMode]);

  const fetchFridges = useCallback(async (pageNum:number) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', '20');

      if (filters.fridgeId && !isNaN(parseInt(filters.fridgeId))) {
        params.append('fridge_id', filters.fridgeId);
      }
    
      if (filters.instrumentName) params.append('instrument_name', filters.instrumentName);
      if (filters.parameterName) params.append('parameter_name', filters.parameterName);

      const response = await api.get<FridgeResponse>(`/fridges?${params.toString()}`);
      
      setTotalRecords(response.data.total);
      
      if (pageNum === 1) {
        // replace the exisitng data since they are NOT scorlling
        setFridges(response.data.fridges);
      } else {
        // append data since they ARE scrolling
        setFridges(prev => [...prev, ...response.data.fridges]);
      }
      
      // Check if end
      setHasMore(pageNum * 20 < response.data.total);
    } catch (error) {
      console.error("error w frige getching", error);
    } finally {
      setLoading(false);
    }
  }, [filters,page]);

  // intital fetch
  useEffect(() => {
    if (!liveMode) {
      fetchFridges(page);
    }
  }, [page, filters, liveMode, fetchFridges]);

  //if filteres are applied
  useEffect(() => {
    setPage(1);
  }, [filters]);


  //websocket connection
  useEffect(() => {
    if (!liveMode) return;

    //cleras data from the historical data
    // setFridges([]);
    // fetchFridges(1);
    const socket = new WebSocket("ws://localhost:8000/ws");
    

    socket.onopen = () => {
      console.log("connecetd ");
    };

    //when message is recieved add the new data
    socket.onmessage = (event) => {
      console.log("received msg", event.data)
      const newData: Fridge = JSON.parse(event.data);
      setFridges((prevFridges) => [newData, ...prevFridges.slice(0, 99)]);
    };

    socket.onerror = (error) => {
      console.error("error: ", error);
    }

    socket.onclose = () => {
      console.log("connection closed");
    }

    return () => {
      console.log("clsoing connection");
      socket.close();
    }
  }, [liveMode, fetchFridges]);


  // Filter Fridges
  useEffect(() => {
    setFilteredFridges(
      fridges.filter((fridge) => {
        return (
          (filters.fridgeId === "" || 
            fridge.fridge_id.toString().includes(filters.fridgeId)) &&
          (filters.instrumentName === "" || 
            fridge.instrument_name.toLowerCase().includes(filters.instrumentName.toLowerCase())) &&
          (filters.parameterName === "" || 
            fridge.parameter_name.toLowerCase().includes(filters.parameterName.toLowerCase()))
        );
      })
    );
  }, [filters, fridges]);

  const toggleLiveMode = () => {
    if (liveMode){
      setPage(1);
      setTimeout(() => {
        setFridges([]);
        fetchFridges(1);
      }, 10);
    }

    setLiveMode(prev => !prev);
  }

  // if filter val is changed
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  //clear filters
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

        <div className="mt-3 flex justify-between">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Clear Filters
          </button>

          <button
            onClick={toggleLiveMode}
            className={`px-4 py-2 rounded ${
              liveMode 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
              {liveMode ? "Exit Live Mode" : "Enter Live Mode"}
            </button>

        </div>
      </div>
      {liveMode && (
        <div>
          <p className="text-sm font-medium bg-amber-200">
            Live Mode: Real-time updates are being displayed. Infinite scroll is disabled.
          </p>
        </div>
      )}

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
              filteredFridges.map((fridge, index) => (
                <tr key={`${fridge.fridge_id}-${fridge.timestamp}`}
                    ref={index === filteredFridges.length - 1 ? lastFridgeElementRef : null}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>

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
                  {loading ? "Loading data..." : "No fridges match the current filters"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        
      </div>
      {!hasMore && !liveMode && filteredFridges.length > 0 && (
          <div className="text-center my-4 text-gray-500">
            You've reached the end of the data!!
          </div>
        )}
    </div>
  )

}