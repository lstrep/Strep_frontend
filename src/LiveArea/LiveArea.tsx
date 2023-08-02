import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import * as kriging from "@sakitam-gis/kriging";
import { useSignalRConnection } from "../hooks/UseSignalRConnection";
import "./LiveArea.css";
import { LiveAreaTypes } from "../App";
import { Algorithm } from "../App";
import { KrigingOption } from "../App";
import { IDWOption } from "../App";
import config from "../config.json";
import { Sensor as SensorData} from "../SensorData/SensorData";

interface Sensor {
	name: string;
	temperature: number | null;
	humidity: number | null;
	position: {
		x: number;
		y: number;
	};
}

function updateSensorPosition(
	sensors: Sensor[],
	index: number,
	newPosition: { x: number; y: number }
): Sensor[] {
	return sensors.map((sensor, i) =>
		i === index ? { ...sensor, position: newPosition } : sensor
	);
}

function getNonNullSensors(sensors: Sensor[]): Sensor[] {
	return sensors.filter(
		(sensor) => sensor.temperature !== null && sensor.humidity !== null
	);
}

interface LiveAreaProps {
	onTemperatureHover: (temperature: string) => void;
	onHumidityHover: (humidity: string) => void;
	liveAreaType: LiveAreaTypes;
	algorithm: Algorithm;
	krigingOption: KrigingOption;
	idwOption: IDWOption;
	sensorData: (SensorData | null)[];
}

const width = config.area.width;
const height = config.area.height;
const accuracy = config.area.accuracy;
const sensorsConfig = config.sensors;

const LiveArea: React.FC<LiveAreaProps> = ({
	onTemperatureHover,
	onHumidityHover,
	liveAreaType,
	algorithm,
	krigingOption,
	idwOption,
	sensorData
}) => {
	const refAreaType = useRef<SVGSVGElement>(null);
	const [sensors, setSensors] = useState<Sensor[]>(sensorsConfig);
	const { connection } = useSignalRConnection();

	useEffect(() => {
		const updateSensors = () => {
			const updatedSensors = sensors.map(sensor => {
				if(sensorData.every(x => x?.temperature != null && x.humidity != null )){
					const matchingData = sensorData.find((data) => data?.name === sensor?.name)
					if(matchingData !== undefined && matchingData !== null)
					{
						sensor.temperature = matchingData?.temperature ?? 0;
						sensor.humidity = matchingData?.humidity ?? 0;
					}

				}
				return sensor;
			  });
	
		  setSensors(updatedSensors);
		};
	
		updateSensors();
	  }, [sensorData]);
	
	useEffect(() => {
		if (connection && connection.start) {
			connection
				.start()
				.then(() => {
					connection.on("UpdateMatrix", (matrix: any) => {
						setSensors((prevSensors) =>
							prevSensors.map((sensor) =>
								sensor.name === matrix.name
									? {
											...sensor,
											id: sensor.name,
											temperature: matrix.temperature,
											humidity: matrix.humidity,
											// eslint-disable-next-line no-mixed-spaces-and-tabs
									  }
									: sensor
							)
						);
					});
					console.log("Connection successful");
				})
				.catch((e) => console.log("Connection failed: ", e));
		} else {
			console.log("connection or connection.start is undefined");
		}
	}, [connection]);

	useEffect(() => {
		const svg = d3.select(refAreaType.current);
		svg.selectAll("*").remove(); // Clear SVG contents

		const constrainPosition = (position: any) => {
			return {
				x: Math.max(0, Math.min(width, position.x)),
				y: Math.max(0, Math.min(height, position.y)),
			};
		};

		const nonNullSensors = getNonNullSensors(sensors);
		const numRows = width / accuracy;
		const numCols = height / accuracy;

		const gridSizeX = width / numRows;
		const gridSizeY = height / numCols;

		const values = nonNullSensors.map((sensor) => {
			switch (liveAreaType) {
				case LiveAreaTypes.TEMPERATURE:
					return sensor.temperature;
				case LiveAreaTypes.HUMIDITY:
					return sensor.humidity;
			}
		});

		const getAreaText = (sensor: Sensor) => {
			switch (liveAreaType) {
				case LiveAreaTypes.TEMPERATURE:
					return `${Number(sensor.temperature).toFixed(2)}°C`;
				case LiveAreaTypes.HUMIDITY:
					return `${Number(sensor.humidity).toFixed(2)}%`;
			}
		};

		const drawSensorsTemperature = (
			sensors: Sensor[],
			svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
		) => {
			sensors.forEach((sensor, index) => {
				const dragSensor = d3.drag().on("drag", (event) => {
					const newPosition = constrainPosition({
						x: event.x - width / 2 + width / 2,
						y: event.y - height / 2 + height / 2,
					});
					setSensors((prevSensors) =>
						updateSensorPosition(prevSensors, index, newPosition)
					);
				});

				svg
					.append("text")
					.attr("x", width / 2 - width / 2 + sensor.position.x + 20)
					.attr("y", height / 2 - height / 2 + sensor.position.y)
					.text(`${sensor.name}: ${getAreaText(sensor)}`)
					.attr("class", "sensor-text");

				svg
					.append("circle")
					.data([sensor])
					.attr("cx", width / 2 - width / 2 + sensor.position.x + 10)
					.attr("cy", height / 2 - height / 2 + sensor.position.y + 10)
					.attr("r", 5)
					.attr("class", "sensor-circle")
					.call(dragSensor);
			});
		};

		const allSame = values.every((val, _, arr) => val === arr[0]);
		if (allSame || nonNullSensors.length < 3 || nonNullSensors === null) {
			svg
				.append("rect")
				.attr("width", width)
				.attr("height", height)
				.attr("x", width / 2 - width / 2)
				.attr("y", height / 2 - height / 2)
				.style("stroke", "black")
				.style("fill", "white")
				.style("stroke-width", 3);

			drawSensorsTemperature(nonNullSensors, svg);

			return;
		}

		const minValues = (liveAreaType: LiveAreaTypes) => {
			switch (liveAreaType) {
				case LiveAreaTypes.TEMPERATURE:
					return d3.min(nonNullSensors, (sensor: Sensor) => sensor.temperature);

				case LiveAreaTypes.HUMIDITY:
					return d3.min(nonNullSensors, (sensor: Sensor) => sensor.humidity);
			}
		};

		const maxValues = (liveAreaType: LiveAreaTypes) => {
			switch (liveAreaType) {
				case LiveAreaTypes.TEMPERATURE:
					return d3.max(nonNullSensors, (sensor: Sensor) => sensor.temperature);

				case LiveAreaTypes.HUMIDITY:
					return d3.max(nonNullSensors, (sensor: Sensor) => sensor.humidity);
			}
		};

		const colorScale = d3
			.scaleSequentialLog()
			.domain([
				minValues(liveAreaType) * 0.8,
				maxValues(liveAreaType) * 1.2,
			])
			.interpolator(
				d3.piecewise(d3.interpolateRgb.gamma(1.2), liveAreaType === LiveAreaTypes.TEMPERATURE ? ["blue","yellow", "red"] : ["white", "blue", "black"])
			);
			for (let i = 0; i < numRows - 1; i++) {
				for (let j = 0; j < numCols - 1; j++) {
				let predictedValue = 0;
				if (algorithm === Algorithm.KRIGING) {
					predictedValue = krigingPredictValue(i, j, values, sensors);
				} else if(algorithm === Algorithm.IDW){
					predictedValue = idwInterpolation(i, j, values, sensors);
				}
				
				svg
					.append("rect")
					.attr("x", width / 2 - width / 2 + i * gridSizeX)
					.attr("y", height / 2 - height / 2 + j * gridSizeY)
					.attr("width", gridSizeX)
					.attr("height", gridSizeY)
					.style("fill", colorScale(predictedValue))
					.style("stroke-width", 0)
					.on("mouseover", () => {
				switch (liveAreaType) {
						case LiveAreaTypes.TEMPERATURE:
						return onTemperatureHover(predictedValue.toFixed(2));
						case LiveAreaTypes.HUMIDITY:
						return onHumidityHover(predictedValue.toFixed(2));
				}
				});
			}
		}

		svg
			.append("rect")
			.attr("width", width)
			.attr("height", height)
			.attr("x", width / 2 - width / 2)
			.attr("y", height / 2 - height / 2)
			.style("stroke", "black")
			.style("fill", "none")
			.style("stroke-width", 3);

		drawSensorsTemperature(nonNullSensors, svg);
	}, [sensors, connection, onTemperatureHover, liveAreaType, onHumidityHover]);

	function krigingPredictValue(
		i: number, 
		j: number, 
		values: any,
		sensors: Sensor[] ): number {

		const lons = getNonNullSensors(sensors).map((sensor) => sensor.position.x / accuracy);
		const lats = getNonNullSensors(sensors).map((sensor) => sensor.position.y / accuracy);
		const variogram = kriging.train(values, lons, lats, krigingOption, 0, 100);
		return kriging.predict(i, j, variogram);
	}

	interface Point {
		x: number;
		y: number;
	}
	
	interface Sensor {
		name: string;
		temperature: number | null;
		humidity: number | null;
		position: Point;
	}
	
	function idwInterpolation(i: number, j: number, values: (number | null)[], sensors: Sensor[]): number {
		let numerator = 0;
		let denominator = 0;
		const point = { x: i*accuracy, y: j*accuracy };
	
		for (let k = 0; k < sensors.length; k++) {
			const sensor = sensors[k];
			const value = values[k];
			
			if (value === null) 
				continue;

			const dist = distance(point, sensor.position);

			if (dist === 0) 
				return value;

			let weight = 0;
			switch(idwOption)
			{
				case IDWOption.Single:
					weight = 1.0 / (dist);
					break;

				case IDWOption.Double:
					weight = 1.0 / (dist *dist);
					break;

				case IDWOption.Trible:
					weight = 1.0 / (dist *dist * dist);
					break;
			}
		
			numerator += weight * value;
			denominator += weight;
		}
	
		if (denominator === 0) {
			return 0; 
		}
	
		return numerator / denominator;
	}

	function distance(a: Point, b: Point) {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		return Math.sqrt(dx * dx + dy * dy);
	}


	return (
		<>
			<svg
				ref={refAreaType}
				width={width}
				height={height}
				className="AreaSvg"
			/>
		</>
	);
};

export default LiveArea;
