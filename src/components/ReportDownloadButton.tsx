import { useState, useEffect } from "react";
import {
	Button,
	Box,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
	FormControl,
	FormLabel,
	Input,
} from "@chakra-ui/react";
import { MdFileDownload } from "react-icons/md";
import { serverapi } from "../store/Queries";
import { $store } from "../store/Stores";
import { useStore } from "effector-react";
import dayjs, { Dayjs } from "dayjs";
import { getQuarterDates } from "../store/utils";

function buildOrgQueryString(
	orgs: string | string[],
	code: string,
	period: any,
	startRecord: number | undefined | null = null,
	endRecord: number | undefined | null = null
) {
	let params = "";
	if (Array.isArray(orgs) && orgs.length > 0) {
		params = params + `?org=${encodeURIComponent(JSON.stringify(orgs))}`;
	} else if (typeof orgs === "string") {
		params = params + `?org=${orgs}`;
	}

	if (!!code && typeof code === "string") {
		params += !!params ? "&" : "?";
		params += `code=${code}`;
	}

	if (!!period) {
		params += !!params ? "&" : "?";
		const { start, end } = getQuarterDates(period);
		const periodObject = `{"start":"${start}","end":"${end}"}`;
		const encodedPeriod = encodeURIComponent(periodObject);
		params += `period=${encodedPeriod}`;
	}

	if (!!startRecord) {
		params += !!params ? "&" : "?";
		params += `startRecord=${startRecord}`;
	}

	if (!!endRecord) {
		params += !!params ? "&" : "?";
		params += `endRecord=${endRecord}`;
	}
	return params;
}

type ReportDownloadButtonProps = {
	code: string;
};

const ReportDownloadButton: React.FC<ReportDownloadButtonProps> = ({
	code,
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [start, setStart] = useState(null);
	const [end, setEnd] = useState(null);
	const [error, setError] = useState<string | null>(null);
	const store = useStore($store);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const handleDownloadReport = async () => {
		// const orgunit = store.selectedOrgUnits;
		const selectedOrg = store.selectedOrgUnits?.[0];
		const org = store.userOrgUnits.find((org) => org.id == selectedOrg);
		// console.log("org", store.selectedOrgUnits, org);
		// const code = store.code;
		const period = store.period;
		setIsLoading(true);
		setError(null);
		try {
			const response = await serverapi.get(
				`/download-report${buildOrgQueryString([org?.name], code, period, start, end)}`,
				{ responseType: "blob" }
			);
			// const response = await serverapi.get(`/download-report?level={}&org={}`, { responseType: 'blob' });

			// Create a URL for the downloaded file
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "ovc-report.csv");

			link.click();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error downloading report:", error);
			setError("There was an error downloading the report.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// Clear error message after 5 seconds
		const timer = setTimeout(() => setError(null), 5000);
		return () => clearTimeout(timer);
	}, [error]);

	return (
		<>
			<div>
				<Button
					rightIcon={<MdFileDownload />}
					colorScheme="blue"
					variant="outline"
					size="sm"
					isLoading={isLoading}
					onClick={onOpen}
				>
					{isLoading ? "Downloading..." : "Download Report"}
				</Button>
				{error && (
					<Box color="red.500" mt={2}>
						{error}
					</Box>
				)}
			</div>
			<Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Download OVC Report</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Text fontWeight="light" mb="1rem">
							Specify the range of records to include in the report.
							Leave fields blank to include all available records.
						</Text>
						<FormControl>
							<FormLabel htmlFor="start">Start Record</FormLabel>
							<Input
								id="start"
								type="number"
								value={start}
								onChange={(event) => setStart(event.target.value)}
								placeholder="Enter starting record number"
							/>
						</FormControl>
						<FormControl mt={4}>
							<FormLabel htmlFor="end">End Record</FormLabel>
							<Input
								id="end"
								type="number"
								value={end}
								onChange={(event) => setEnd(event.target.value)}
								placeholder="Enter ending record number"
							/>
						</FormControl>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={onClose}>
							Close
						</Button>
						<Button
							variant="solid"
							colorScheme="blue"
							onClick={() => {
								onClose();
								handleDownloadReport();
							}}
						>
							Download Report
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ReportDownloadButton;
