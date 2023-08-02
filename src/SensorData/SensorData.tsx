import React, { ChangeEvent, FC } from "react";
import "./SensorData.css";

export interface Sensor {
  name: string;
  temperature: number;
  humidity: number;
  timeStamp: string;
}

interface SensorDataProps {
  sensorData: (Sensor | null)[];
  error: string | null;
  selectedIndex: number;
  onScroll: (event: ChangeEvent<HTMLInputElement>) => void;
  maxScroll: number;
}

const SensorData: FC<SensorDataProps> = ({ sensorData, error, selectedIndex, onScroll, maxScroll }) => {

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="sensor-data-container">
      <h1>Sensor Data</h1>
      <input
        type="range"
        min="0"
        max={maxScroll}
        value={selectedIndex}
        onChange={onScroll}
        className="time-scrollbar"
      />
      <div className="sensor-list">
        {sensorData.map((sensor, i) => (
          <div key={`sensor${i + 1}`} className="sensor-item">
            <h2>Sensor {i + 1}</h2>
            {sensor ? (
              <>
                <p>
                  <strong>Temperature:</strong> {sensor.temperature}
                </p>
                <p>
                  <strong>Humidity:</strong> {sensor.humidity}
                </p>
                <p>
                  <strong>Timestamp:</strong>{" "}
                </p>
                <p>{new Date(sensor.timeStamp).toLocaleString()}</p>
              </>
            ) : (
              <p>No Data</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorData;
