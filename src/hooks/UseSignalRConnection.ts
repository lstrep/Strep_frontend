import { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";

export const useSignalRConnection = () => {
	const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

	useEffect(() => {
		const newConnection = new signalR.HubConnectionBuilder()
//			.withUrl("https://magisterskabackend20230717221909.azurewebsites.net/matrixhub")
			.withUrl("https://localhost:7112/matrixhub")
			.withAutomaticReconnect()
			.build();

		setConnection(newConnection);
	}, []);

	const startConnection = () => {
		if (connection) {
			return connection.start();
		}
	};

	return { connection, startConnection };
};
