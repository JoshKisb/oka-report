import {
	Button,
	Checkbox,
	CircularProgress,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	HStack,
	List,
	ListItem,
	Modal,
	ModalBody,
	ModalContent,
	ModalOverlay,
	// Select,
	Spacer,
	Stack,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { DatePicker, Input, TreeSelect, Select } from "antd";
import dayjs from "dayjs";
import { useStore } from "effector-react";
import { saveAs } from "file-saver";
import { flatten, fromPairs } from "lodash";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import { MdFileDownload, MdFilterList } from "react-icons/md";
import XLSX from "xlsx";
import { AdminProvider } from "../../context/AdminContext";
import {
	addRemoveColumn,
	changeCode,
	changePeriod,
	setSelectedOrgUnits,
	setTableHTML,
	setTableLoading,
	setUserOrgUnits,
	toggleColumns,
} from "../../store/Events";
import { api, useSqlView } from "../../store/Queries";
import { $columns, $isChecked, $store } from "../../store/Stores";
import { getQuarterDates, s2ab } from "../../store/utils";
import ContainerActions from "../ContainerActions";
import ReportDownloadButton from "../ReportDownloadButton";

const createQuery = (parent: any) => {
	return {
		organisations: {
			resource: `organisationUnits.json`,
			params: {
				// filter: `:in:[${parent.id}]`,
				filter: `level:in:[5,4]`,
				// level: 5,
				paging: "false",
				order: "name:asc",
				fields: "id,name,path,leaf",
			},
		},
	};
};

const DataSetLayerFilter = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [code, setCode] = useState<string>("");
	const [fetchedOrgs, setFetchedOrgs] = useState<any[]>([]);
	const {
		isOpen: modalIsOpen,
		onOpen: modalOnOpen,
		onClose: modalOnClose,
	} = useDisclosure();
	const store = useStore($store);
	const btnRef = useRef<any>();
	const engine = useDataEngine();
	const filteredColumns = useStore($columns);
	const isChecked = useStore($isChecked);
	const [org, setOrg] = useState<any[] | null>(null);
	const { updateQuery, fetchView } = useSqlView();

	const loadOrganisationUnitsChildren = async (parent: any) => {
		try {
			const {
				organisations: { organisationUnits },
			}: any = await engine.query(createQuery(parent));
			const found = organisationUnits.map((child: any) => {
				// return unit.children
				// .map((child: any) => {
				return {
					id: child.id,
					// pId: parent.id,
					value: child.id,
					label: child.name,
					isLeaf: true, //child.leaf,
					// level: child.level,
				};
			});
			// .sort((a: any, b: any) => {
			// 	if (a.title > b.title) {
			// 		return 1;
			// 	}
			// 	if (a.title < b.title) {
			// 		return -1;
			// 	}
			// 	return 0;
			// });
			// });
			const all = flatten(found);
			const allorgs = [...all];
			setUserOrgUnits(allorgs);
			console.log({ orgs: found });
			setFetchedOrgs(found);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		loadOrganisationUnitsChildren({});
	}, []);

	const handleOrgUnitChange = (value: any) => {
		console.log("val", value);

		setSelectedOrgUnits([value]);
		// const selected = value.map((v: any) => {
		// 	const uorg = allOrganisations.current?.find(o => o.id == v);
		// 	if (!uorg) return null;
		// 	return ({id: uorg.id, level: uorg.level});
		// });
		setOrg(value);
	};

	const download = async () => {
		let must: any[] = [
			{
				term: {
					["qtr.keyword"]: store.period?.format("YYYY[Q]Q"),
				},
			},
			{
				term: {
					inactive: false,
				},
			},
			{
				term: {
					deleted: false,
				},
			},
			{
				bool: {
					should: [
						{
							terms: {
								["level1.keyword"]: store.selectedOrgUnits,
							},
						},
						{
							terms: {
								["level2.keyword"]: store.selectedOrgUnits,
							},
						},
						{
							terms: {
								["level3.keyword"]: store.selectedOrgUnits,
							},
						},
						{
							terms: {
								["level4.keyword"]: store.selectedOrgUnits,
							},
						},
						{
							terms: {
								["level5.keyword"]: store.selectedOrgUnits,
							},
						},
					],
				},
			},
		];
		if (store.code) {
			must = [
				...must,
				{
					match: {
						["HLKc2AKR9jW.keyword"]: store.code,
					},
				},
			];
		}
		let {
			data: { rows: allRows, columns, cursor: currentCursor },
		} = await api.post("sql", {
			query: `select ${filteredColumns
				.map((c) => c.id)
				.join(", ")} from layering`,
			filter: {
				bool: {
					must,
				},
			},
		});

		const processedColumns = fromPairs(
			filteredColumns.map((c) => [c.id, c.display])
		);
		if (currentCursor) {
			do {
				let {
					data: { rows, cursor },
				} = await api.post("sql", { cursor: currentCursor });
				allRows = allRows.concat(rows);
				currentCursor = cursor;
			} while (!!currentCursor);
		}

		let wb = XLSX.utils.book_new();
		wb.Props = {
			Title: "SheetJS Tutorial",
			Subject: "Test",
			Author: "Red Stapler",
			CreatedDate: new Date(),
		};

		wb.SheetNames.push("Listing");
		let ws = XLSX.utils.aoa_to_sheet([
			columns.map((c: any) => processedColumns[c.name] || c.name),
			...allRows,
		]);
		wb.Sheets["Listing"] = ws;

		const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
		saveAs(
			new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
			"export.xlsx"
		);
		modalOnClose();
	};

	const loadTable = async (start_date: string, end_date: string, organisation = 'Bukesa') => {
		// await updateQuery('2024-02-01', 'Bukesa');
        // setIsLoading(true)

		setTableLoading(true)
		const level = /division\s*$/i.test(organisation) ? "division" : "parish";
		const table = await fetchView(start_date, end_date, organisation, level);
		setTableLoading(false);
        setTableHTML(table);

		// console.log("table", table)

	};

	const handleLoadTable = () => {
		const dates = getQuarterDates(store.period || dayjs())

		const selectedOrg = store.selectedOrgUnits?.[0];
		const org = store.userOrgUnits.find(org => org.id == selectedOrg);
		console.log("org", store.selectedOrgUnits, org, dates);
		loadTable(dates.start, dates.end, org.label);
	}

	// useEffect(() => {
	// 	if (!store.running) return;

    //     if (store.period) {

    //         const dates = getQuarterDates(store.period || dayjs())

    //         console.log("org", store.selectedOrgUnits);
    //         loadTable(dates.start, store.selectedOrgUnits?.[0]);
    //     }
	// }, [store.period, store.selectedOrgUnits, store.code, store.running]);


	return (
		<Stack direction="column">
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
			>
				<Stack direction="row" alignItems="center">
					<AdminProvider>
						<ContainerActions />
					</AdminProvider>
				</Stack>
				<Stack direction="row" spacing={4}>
					<Button
						leftIcon={<MdFilterList />}
						colorScheme="blue"
						size="sm"
						onClick={onOpen}
					>
						Show columns
					</Button>
					<ReportDownloadButton code={code} />
					{/* <Button
						rightIcon={<MdFileDownload />}
						colorScheme="blue"
						variant="outline"
						size="sm"
						onClick={() => {
							// modalOnOpen();
							// download();
						}}
					>
						Download
					</Button> */}

					<Modal isOpen={modalIsOpen} onClose={modalOnClose} isCentered>
						<ModalOverlay />
						<ModalContent bg="none" boxShadow="none" textColor="white">
							<ModalBody
								display="flex"
								alignItems="center"
								alignContent="center"
								justifyItems="center"
								justifyContent="center"
								boxShadow="none"
								flexDirection="column"
							>
								<CircularProgress isIndeterminate />
								<Text>Downloading please wait...</Text>
							</ModalBody>
						</ModalContent>
					</Modal>
					<Drawer
						size="sm"
						isOpen={isOpen}
						placement="right"
						onClose={onClose}
						finalFocusRef={btnRef}
					>
						<DrawerOverlay />
						<DrawerContent>
							<DrawerCloseButton />
							<DrawerHeader>
								<Checkbox
									isChecked={isChecked}
									onChange={(e: ChangeEvent<HTMLInputElement>) =>
										toggleColumns(e.target.checked)
									}
								>
									Choose Columns
								</Checkbox>
							</DrawerHeader>

							<DrawerBody>
								<List spacing={3}>
									{store.columns.map((c) => (
										<ListItem key={c.display}>
											<Checkbox
												isChecked={c.selected}
												onChange={(
													e: ChangeEvent<HTMLInputElement>
												) =>
													addRemoveColumn({
														value: e.target.checked,
														id: c.id,
													})
												}
											>
												{c.display}
											</Checkbox>
										</ListItem>
									))}
								</List>
							</DrawerBody>
						</DrawerContent>
					</Drawer>
				</Stack>
			</Stack>
			<Stack direction="row" spacing="30px">
				<Stack direction="row" alignItems="center">
					<Text>Select Organisation:</Text>
					<Select
						allowClear={true}
						// treeDataSimpleMode
						showSearch
						style={{
							width: "350px",
						}}
						// listHeight={700}
						optionFilterProp="label"
						value={store.selectedOrgUnits}
						dropdownStyle={{ height: 200, overflow: "scroll" }}
						placeholder="Please select Organisation Unit(s)"
						onChange={handleOrgUnitChange}
						// loadData={loadOrganisationUnitsChildren}
						options={fetchedOrgs}
					/>
					{/* {store.userOrgUnits.map(org => <Select.Option value={org.value} key={org.id}>{org.title}</Select.Option>)} */}
					{/* </Select> */}
				</Stack>
				<Stack direction="row" alignItems="center">
					<Text>Quarter:</Text>
					<DatePicker
						picker="quarter"
						value={store.period}
						onChange={(value) => changePeriod(value)}
					/>
				</Stack>
				<Stack direction="row" alignItems="center">
					<Text>Code:</Text>
					<Input
						value={code}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setCode(e.target.value)
						}
					/>
				</Stack>

				<Button onClick={() => changeCode(code)}>Search</Button>
				<Spacer />
				<Button
					onClick={() => {
						handleLoadTable();
					}}
				>
					See Report
				</Button>
			</Stack>
		</Stack>
	);
};

export default DataSetLayerFilter;
