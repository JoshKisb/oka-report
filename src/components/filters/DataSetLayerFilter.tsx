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
	FormControl,
	FormLabel,
	HStack,
	List,
	ListItem,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
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
import { flatten, flattenDeep, fromPairs } from "lodash";
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
			resource: `organisationUnits/aXmBzv61LbM.json?includeDescendants=true`,
			params: {
				// filter: `:in:[${parent.id}]`,
				// filter: `level:in:[5,4]`,
				// level: 1,
				maxLevel: 5,
				paging: "false",
				order: "name:asc",
				fields: "id,name,leaf,level,parent[id]",
			},
		},
	};
};

const processOrgUnits = (units: any[], level = 1): any[] => {
	return units.map((unit: any) => ({
		id: unit.id,
		value: unit.id,
		label: unit.name,
		isLeaf: unit.leaf,
		level: unit.level,
		children: unit.children ? processOrgUnits(unit.children, level + 1) : [],
	}));
};

const buildTreeOptimized = (units: any[]) => {
	const unitMap = new Map();

	// Build the map and initialize children arrays
	units.forEach((unit) => {
		unitMap.set(unit.id, { ...unit, children: [] });
	});

	let rootUnits: any[] = [];

	// Link units to their parents as we build the tree
	units.forEach((unit) => {
		if (unit.parent && unitMap.has(unit.parent.id)) {
			// Add to parent's children
			unitMap.get(unit.parent.id).children.push(unitMap.get(unit.id));
		} else {
			// Root level unit
			rootUnits.push(unitMap.get(unit.id));
		}
	});

	return rootUnits;
};

const DataSetLayerFilter = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [code, setCode] = useState<string>("");
	const [fetchedOrgs, setFetchedOrgs] = useState<any[]>([]);
	const store = useStore($store);
	const btnRef = useRef<any>(null);
	const engine = useDataEngine();
	const filteredColumns = useStore($columns);
	const isChecked = useStore($isChecked);
	const [org, setOrg] = useState<any[] | null>(null);
	const { updateQuery, fetchView, getAvailableColumns, getTotalRecords } =
		useSqlView();
	const targetLevel = 3;

	const getOrgUnitsAtTargetLevel = (unit: any, currentLevel: number) => {
		// If the current level is less than the target level, look for children
		if (currentLevel < targetLevel) {
			const children = store.userOrgUnits.filter(
				(child) => child.parent?.id === unit.id
			); // Get immediate children

			// Recursively check the next level to find children of children
			let result: any = [];
			children.forEach((child) => {
				// If the child is at the target level, add it to the result
				if (child.level === targetLevel) {
					result.push(child); // Add the child at the target level
				} else {
					// Continue to search for children at the next level
					result = result.concat(
						getOrgUnitsAtTargetLevel(child, currentLevel + 1)
					);
				}
			});

			return result;
		} else {
			return [unit];
		}
	};

	const loadOrganisationUnitsChildren = async (parent: any) => {
		try {
			const {
				organisations: { organisationUnits },
			}: any = await engine.query(createQuery(parent));
			const found = processOrgUnits(buildTreeOptimized(organisationUnits));
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
			// const all = flattenDeep(found.map((org: any) => [org, ...org.children]));
			// const allorgs = [...all];
			setUserOrgUnits(organisationUnits);
			setSelectedOrgUnits([found?.[0].id]);
			// console.log({ orgs: found, selected: [organisationUnits?.[0].id] });
			setFetchedOrgs(found);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		// const dates = getQuarterDates(store.period || dayjs())
		getAvailableColumns(store.period);
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

	const loadTable = async (
		start_date: string,
		end_date: string,
		organisation = "Bukesa",
		level = "",
		beneficiary = ""
	) => {
		// setIsLoading(true)

		setTableLoading(true);
		await updateQuery(
			start_date,
			end_date,
			organisation,
			level,
			beneficiary,
			filteredColumns
		);
		const table = await fetchView(start_date, end_date, organisation, level);
		setTableLoading(false);
		setTableHTML(table);

		// console.log("table", table)
	};

	const loadPagination = async (
		start_date: string,
		end_date: string,
		organisation = "Bukesa",
		level = "",
		beneficiary = ""
	) => {
		await getTotalRecords(
			start_date,
			end_date,
			organisation,
			level,
			beneficiary
		);
	};

	const handleLoadTable = async () => {
		const dates = getQuarterDates(store.period || dayjs());

		const selectedOrg = store.selectedOrgUnits?.[0];
		const org = store.userOrgUnits.find((org) => org.id == selectedOrg);
		// console.log("org", store.selectedOrgUnits, org, dates, code);

		const orgUnits = getOrgUnitsAtTargetLevel(org, org.level);
		// console.log("Organization Units at Target Level:", orgUnits);
		const orgNames = orgUnits.map((unit: any) => `'${unit.name}'`).join(", ");
		const level =
			org.level == 5
				? "parish"
				: org.level == 4
				? "subcounty/division"
				: "district";
		await loadTable(dates.start, dates.end, orgNames, level, code);
		loadPagination(dates.start, dates.end, orgNames, level, code);
	};

	// useEffect(() => {
	// 	if (!store.running) return;

	//     if (store.period) {

	//         const dates = getQuarterDates(store.period || dayjs())

	//         console.log("org", store.selectedOrgUnits);
	//         loadTable(dates.start, store.selectedOrgUnits?.[0]);
	//     }
	// }, [store.period, store.selectedOrgUnits, store.code, store.running]);

	return (
		<>
			<Stack direction="row" alignItems="end">
				<FormControl>
					<FormLabel>Select Organisation:</FormLabel>
					<TreeSelect
						allowClear={true}
						// treeDataSimpleMode
						showSearch
						style={{
							width: "350px",
						}}
						// listHeight={700}
						// optionFilterProp="label"
						treeNodeFilterProp="label"
						value={store.selectedOrgUnits}
						dropdownStyle={{ height: 200, overflow: "scroll" }}
						placeholder="Please select Organisation Unit(s)"
						onChange={handleOrgUnitChange}
						// loadData={loadOrganisationUnitsChildren}
						treeData={fetchedOrgs}
					/>
					{/* {fetchedOrgs.map(org => <Select.Option value={org.value} key={org.id}>{org.title}</Select.Option>)} */}
					{/* </TreeSelect> */}
				</FormControl>
				<FormControl>
					<FormLabel>Quarter:</FormLabel>
					<DatePicker
						picker="quarter"
						value={store.period}
						onChange={(value) => changePeriod(value)}
						style={{
							height: "auto",
							width: "100%",
						}}
					/>
				</FormControl>
				<FormControl>
					<FormLabel>Code:</FormLabel>
					<Input
						value={code}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setCode(e.target.value);
							changeCode(e.target.value);
						}}
					/>
				</FormControl>
				<Stack direction="row" alignItems="end">
					<Button
						colorScheme="teal"
						variant="solid"
						onClick={() => {
							handleLoadTable();
						}}
					>
						View Report
					</Button>
				</Stack>
				<Stack direction="column">
					<Stack direction="row" justifyContent="end">
						<AdminProvider>
							<ContainerActions />
						</AdminProvider>
					</Stack>
					<Stack direction="row">
						<Button
							leftIcon={<MdFilterList />}
							colorScheme="blue"
							size="sm"
							onClick={onOpen}
						>
							Show columns
						</Button>
						<ReportDownloadButton code={code} />
						

						
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
			</Stack>
		</>
	);
};

export default DataSetLayerFilter;
