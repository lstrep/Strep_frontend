import React, { useState } from "react";
import LiveArea from "./LiveArea/LiveArea";
import "./App.css";
import SensorData, {Sensor}  from "./SensorData/SensorData";
import AlgorithmSelector from "./AlgorithmSelector";
import useSensorData from "./hooks/useSensorData";


export enum LiveAreaTypes {
	TEMPERATURE = "temperature",
	HUMIDITY = "humidity",
}

export enum Algorithm {
	KRIGING = "Kriging",
	IDW = "IDW",
  }

export enum KrigingOption {
	Exponential = "exponential", 
	Spherical = "spherical",
	Gaussian = "gaussian"
}

export enum IDWOption{
	Single = "single",
	Double = "double",
	Trible = "triple"
}

const App: React.FC = () => {
	const [hoveredTemperature, setHoveredTemperature] = useState<string | null>(null);
	const [hoveredHumidity, setHoveredHumidity] = useState<string | null>(null);

	const [selectedAlgorithmTemperature, setSelectedAlgorithmTemperature] = useState<Algorithm>(Algorithm.KRIGING);
	const [selectedAlgorithmHumidity, setSelectedAlgorithmHumidity] = useState<Algorithm>(Algorithm.KRIGING);

	const handleTemperatureHover = (temperature: string) => {
		setHoveredTemperature(temperature);
	};

	const handleHumidityHover = (humidity: string) => {
		setHoveredHumidity(humidity);
	};

	const handleAlgorithmChangeTemperature = (algorithm: Algorithm) => {
		setSelectedAlgorithmTemperature(algorithm);
	  };
	  const handleAlgorithmChangeHumidity = (algorithm: Algorithm) => {
		setSelectedAlgorithmHumidity(algorithm);
	  };

	const [selectedKrigingOptionTemperature, setSelectedKrigingOptionTemperature] = useState<KrigingOption>(KrigingOption.Exponential);
	const handleKrigingOptionChangeTemperature = (option: KrigingOption) => {
		setSelectedKrigingOptionTemperature(option);
	};
	const [selectedKrigingOptionHumidity, setSelectedKrigingOptionHumidity] = useState<KrigingOption>(KrigingOption.Exponential);
	const handleKrigingOptionChangeHumidity = (option: KrigingOption) => {
		setSelectedKrigingOptionHumidity(option);
	};
  

	const [selectedIDWOptionTemperature, setSelectedIDWOptionTemperature] = useState<IDWOption>(IDWOption.Trible);
	const handleIDWOptionChangeTemperature = (option: IDWOption) => {
		setSelectedIDWOptionTemperature(option);
	}
	const [selectedIDWOptionHumidity, setSelectedIDWOptionHumidity] = useState<IDWOption>(IDWOption.Trible);
	const handleIDWOptionChangeHumidity= (option: IDWOption) => {
		setSelectedIDWOptionHumidity(option);
	}

	const { data, error } = useSensorData();
    const [selectedIndex, setSelectedIndex] = useState<number>(999999); // max index number to be sure its on the right

    let rangeTimeStamp = 0;
    let displayTimeStamp: Date | null = null;

    if(data && data.length > 0) {
        const firstData = data[0];
        const lastData = data[data.length - 1];

        if (firstData && firstData.timeStamp && lastData && lastData.timeStamp) {
            rangeTimeStamp = (selectedIndex / (data.length - 1)) *
              (new Date(lastData.timeStamp).getTime() - new Date(firstData.timeStamp).getTime());
        }
        
        if (firstData && firstData.timeStamp) {
            displayTimeStamp = new Date(new Date(firstData.timeStamp).getTime() + rangeTimeStamp);
        }
    }

	const handleScroll = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedIndex(Number(event.target.value));
	  };

	const sensorData: (Sensor | null)[] = Array.from({ length: 6 }, (_, i) => {
		return (
			data
			? [...data]
				.reverse()
				.find(
					(d: Sensor | null) =>
						d &&
						d.name === `sensor${i + 1}` &&
						d.timeStamp &&
						new Date(d.timeStamp).getTime() <=
							(displayTimeStamp ? displayTimeStamp.getTime()-1 : 0)
				) || null
			: null
		);
	});
	
	
	return (
		<div className="App">
			<div className="AreaContainer">
				<div className="estimatedValues">
					{
						<div className="estimatedTemperature">
							Szacowana Temperatura: {hoveredTemperature}°C
							<AlgorithmSelector
							selectedAlgorithm={selectedAlgorithmTemperature}
							handleAlgorithmChange={handleAlgorithmChangeTemperature}
							selectedKrigingOption={selectedKrigingOptionTemperature}
							handleKrigingOptionChange={handleKrigingOptionChangeTemperature}
							selectedIDWOption={selectedIDWOptionTemperature}
							handleIDWOptionChange={handleIDWOptionChangeTemperature}
							/>
						</div>
					}
					{
						<div className="estimatedHumidity">
							Szacowana Wilgotność: {hoveredHumidity}%
							<AlgorithmSelector
							selectedAlgorithm={selectedAlgorithmHumidity}
							handleAlgorithmChange={handleAlgorithmChangeHumidity}
							selectedKrigingOption={selectedKrigingOptionHumidity}
							handleKrigingOptionChange={handleKrigingOptionChangeHumidity}
							selectedIDWOption={selectedIDWOptionHumidity}
							handleIDWOptionChange={handleIDWOptionChangeHumidity}
							/>
						</div>
					}
				</div>
				<LiveArea
					onTemperatureHover={handleTemperatureHover}
					onHumidityHover={handleHumidityHover}
					liveAreaType={LiveAreaTypes.TEMPERATURE}
					algorithm={selectedAlgorithmTemperature}
					krigingOption={selectedKrigingOptionTemperature}
					idwOption={selectedIDWOptionTemperature}
					sensorData={sensorData}
					/>
				<LiveArea
					onTemperatureHover={handleTemperatureHover}
					onHumidityHover={handleHumidityHover}
					liveAreaType={LiveAreaTypes.HUMIDITY}
					algorithm={selectedAlgorithmHumidity}
					krigingOption= {selectedKrigingOptionHumidity}
					idwOption={selectedIDWOptionHumidity}
					sensorData={sensorData}
					/>

				<SensorData 
                sensorData={sensorData} 
                error={error} 
                selectedIndex={selectedIndex}
				onScroll={handleScroll}
				maxScroll={data.length -1}
            />
			</div>
		</div>
	);
};

export default App;
