import {
	Box,
	Button,
	Heading,
	Spinner,
	Stack,
	Table,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from "@chakra-ui/react";
import { Pagination, PaginationProps } from "antd";
import dayjs from "dayjs";
import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import { setTableHTML, setTableLoading } from "../store/Events";
import { useLayering, useSqlView } from "../store/Queries";
import { $store, $columns } from "../store/Stores";
import { getQuarterDates, innerColumns, otherRows } from "../store/utils";

const DataSetLayerTable = () => {
	const store = useStore($store);
	const [isLoading, setIsLoading] = useState(false);
	const totalRecords = store.totalRecords;
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const targetLevel = 3;
	const filteredColumns = useStore($columns);
	// const isChecked = useStore($isChecked);
	const [org, setOrg] = useState<any[] | null>(null);
	const { updateQuery, fetchView, getAvailableColumns, getTotalRecords } =
		useSqlView();

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

	const loadTable = async (
		start_date: string,
		end_date: string,
		organisation = "Bukesa",
		level = "",
		beneficiary = "",
		pageSize = 10
	) => {
		// setIsLoading(true)
		console.log("updating...", pageSize)
		setTableLoading(true);
		await updateQuery(
			start_date,
			end_date,
			organisation,
			level,
			beneficiary,
			filteredColumns,
			page,
			pageSize
		);
		const table = await fetchView(start_date, end_date, organisation, level);
		setTableLoading(false);
		setTableHTML(table);

		// console.log("table", table)
	};

	const handleLoadTable = async (pageSize: number) => {
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
				console.log("loading table");
		await loadTable(dates.start, dates.end, orgNames, level, store.code, pageSize);
		// loadPagination(dates.start, dates.end, orgNames, level, code);
	};

	const onChange: PaginationProps["onChange"] = (page, pageSize) => {
		console.log({page, pageSize});
		setPage(page);
		setPageSize(pageSize);
		handleLoadTable(pageSize);
	};
	
	
	
	const [query, setQuery] = useState<{ [key: string]: any }>({
		query: `select * from layering`,
		fetch_size: 100,
		filter: {
			bool: {
				must: [
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
				],
			},
		},
	});


	// const { isLoading, isSuccess, isError, error, data } = useLayering(query);
	// useEffect(() => {
	//     if (!store.running) return;
	//     let must: any[] = [
	//         {
	//             term: {
	//                 ["qtr.keyword"]: store.period?.format("YYYY[Q]Q"),
	//             },
	//         },
	//         {
	//             term: {
	//                 inactive: false,
	//             },
	//         },
	//         {
	//             term: {
	//                 deleted: false,
	//             },
	//         },
	//         {
	//             bool: {
	//                 should: [
	//                     {
	//                         terms: {
	//                             ["level1.keyword"]: store.selectedOrgUnits,
	//                         },
	//                     },
	//                     {
	//                         terms: {
	//                             ["level2.keyword"]: store.selectedOrgUnits,
	//                         },
	//                     },
	//                     {
	//                         terms: {
	//                             ["level3.keyword"]: store.selectedOrgUnits,
	//                         },
	//                     },
	//                     {
	//                         terms: {
	//                             ["level4.keyword"]: store.selectedOrgUnits,
	//                         },
	//                     },
	//                     {
	//                         terms: {
	//                             ["level5.keyword"]: store.selectedOrgUnits,
	//                         },
	//                     },
	//                 ],
	//             },
	//         },
	//     ];
	//     if (store.code) {
	//         must = [
	//             ...must,
	//             {
	//                 match: {
	//                     ["HLKc2AKR9jW.keyword"]: store.code,
	//                 },
	//             },
	//         ];
	//     }
	//     // setQuery(() => {
	//     //     return {
	//     //         query: `select * from layering`,
	//     //         fetch_size: 100,
	//     //         filter: {
	//     //             bool: {
	//     //                 must,
	//     //             },
	//     //         },
	//     //     };
	//     // });
	// }, [store.period, store.selectedOrgUnits, store.code, store.running]);

	useEffect(() => {}, [page]);

	return (
		<Stack>
			<Box m="auto" w="100%">
				<Box
					position="relative"
					overflow="auto"
					whiteSpace="nowrap"
					h="calc(100vh - 250px)"
				>
					{store.tableLoading && (
						<Stack
							h="100%"
							alignItems="center"
							justifyContent="center"
							justifyItems="center"
							alignContent="center"
						>
							<Spinner />
						</Stack>
					)}

					<div dangerouslySetInnerHTML={{ __html: store.tableHTML }}></div>

					{/* {false && (
						<Table variant="simple" size="sm">
							<Thead>
								<Tr py={1}>
									{store.columns
										.filter((s) => s.selected)
										.map((column: any, index: number) => (
											<Th
												key={`${column.id}${index}`}
												{...otherRows(index, column.bg)}
											>
												<Heading
													as="h6"
													size="xs"
													textTransform="none"
												>
													{column.display}
												</Heading>
											</Th>
										))}
								</Tr>
							</Thead>
							<Tbody py={10}>
								{data.data.map((record: any) => (
									<Tr key={record.id}>
										{store.columns
											.filter((s) => s.selected)
											.map((column, index: number) => (
												<Td
													{...innerColumns(index)}
													key={`${index}${record.id}${column.id}`}
												>
													{String(record[column.id])}
												</Td>
											))}
									</Tr>
								))}
							</Tbody>
						</Table>
					)} */}
				</Box>
				<div style={{ paddingTop: 10 }}>
					{!!totalRecords && (
						<Pagination
							current={page}
							onChange={onChange}
							total={totalRecords}
							pageSize={pageSize}
							showTotal={(total, range) =>
								`${range[0]}-${range[1]} of ${total} records`
							}
						/>
					)}
				</div>
			</Box>
			{/* <Button
				isDisabled={!data || isLoading || !data.cursor}
				onClick={() => {
					setQuery({ cursor: data.cursor });
				}}
			>
				Load More
			</Button> */}
			{/* {isError && <Box>{error?.message}</Box>} */}
		</Stack>
	);
};

export default DataSetLayerTable;
