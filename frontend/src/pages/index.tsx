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

  useEffect(() => {
    api.get("/fridges")
      .then((response)=> {
        setFridges(response.data.fridges);
      })
      .catch ((error) => {
        console.log(error);
      })
  }, []);

  return (
    <div>
      <h1>Fridges</h1>
      <table>
        <thead>
          <tr>
            <th>Fridge ID</th>
            <th>Instrument Name</th>
            <th>Parameter Name</th>
            <th>Applied Value</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {fridges?.map((fridge) => (
            <tr key={fridge.fridge_id}>
              <td>{fridge.fridge_id}</td>
              <td>{fridge.instrument_name}</td>
              <td>{fridge.parameter_name}</td>
              <td>{fridge.applied_value}</td>
              <td>{fridge.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

}
