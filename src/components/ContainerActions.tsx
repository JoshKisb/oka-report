import { useState, useEffect } from 'react';
import { Button } from '@chakra-ui/react';
import { serverapi, api } from "../store/Queries";
import { useStore } from 'effector-react';
import { $store } from "../store/Stores";
import { setRunning } from '../store/Events';


const ContainerActions = () => {
	const store = useStore($store);
	const [isRunning, setIsRunning] = useState<boolean | undefined>();
	const [isLoadingRunReport, setIsLoadingRunReport] = useState(false);
	const [isLoadingStopReport, setIsLoadingStopReport] = useState(false);
	const [isLoadingStartUpdate, setIsLoadingStartUpdate] = useState(false);

	useEffect(() => {
		checkStatus();
	}, []);

	const checkStatus = async () => {
		try {
			const res = await serverapi.post("/check-report");
			if (res.data.status === 'running') {
				setIsRunning(true);
				setRunning(true);
			} else if (res.data.status === 'stopped') {
				setIsRunning(false);
				setRunning(false)
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleRunReport = async () => {
		setIsLoadingRunReport(true);
		try {
			await serverapi.post("/run-report");
			checkStatus();
		} catch (e) {
			console.log(e);
		} finally {
			setIsLoadingRunReport(false);
		}
	};

	const handleStopReport = async () => {
		setIsLoadingStopReport(true);
		try {
			await serverapi.post("/stop-report");
			checkStatus();
		} catch (e) {
			console.log(e);
		} finally {
			setIsLoadingStopReport(false);
		}
	};

	const handleStartUpdate = async () => {
		setIsLoadingStartUpdate(true);
		try {
			await serverapi.post("/run-update");
		} catch (e) {
			console.log(e);
		} finally {
			setIsLoadingStartUpdate(false);
		}
	};

	return (
		<>
			{!isRunning ? (
				<Button
					colorScheme="blue"
					size="sm"
					onClick={handleRunReport}
					isLoading={isLoadingRunReport}
				>
					Run Report
				</Button>
			) : (
				<Button
					colorScheme="red"
					size="sm"
					onClick={handleStopReport}
					isLoading={isLoadingStopReport}
				>
					Stop Report
				</Button>
			)}
			<Button
				colorScheme="blue"
				size="sm"
				onClick={handleStartUpdate}
				isLoading={isLoadingStartUpdate}
			>
				Start Update
			</Button>
		</>
	);
};

export default ContainerActions;