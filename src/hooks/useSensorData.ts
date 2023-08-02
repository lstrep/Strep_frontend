import { useState, useEffect } from "react";
import axios from "axios";

interface Sensor {
	name: string;
	temperature: number;
	humidity: number;
	timeStamp: string;
}

const useSensorData = () => {
	const [data, setData] = useState<(Sensor | null)[]>([]);
	const [error, setError] = useState<string | null>(null);
    
	useEffect(() => {
		axios
			.get<Sensor[]>(
				//"https://magisterskabackend20230717221909.azurewebsites.net/SensorData"
				"https://localhost:7112/SensorData"
			)
			.then((response) => {
				const sortedData = response.data
					.filter((item) => !isNaN(new Date(item.timeStamp).getTime()))
					.sort(
						(a, b) =>
							new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
					);
				setData(sortedData);
			})
			.catch((e) => {
				setError("Error fetching data: " + e);
			});
	}, []);

	return { data, error };
};

export default useSensorData;