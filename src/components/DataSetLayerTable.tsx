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
import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import { useLayering, useSqlView } from "../store/Queries";
import { $store } from "../store/Stores";
import { innerColumns, otherRows } from "../store/utils";

const DataSetLayerTable = () => {
    const store = useStore($store);
    const [isLoaded, setIsLoaded] = useState(false);
    const [tableHTML, setTableHTML] = useState("");
    const { updateQuery, fetchView } = useSqlView();
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
                                        ["level1.keyword"]:
                                            store.selectedOrgUnits,
                                    },
                                },
                                {
                                    terms: {
                                        ["level2.keyword"]:
                                            store.selectedOrgUnits,
                                    },
                                },
                                {
                                    terms: {
                                        ["level3.keyword"]:
                                            store.selectedOrgUnits,
                                    },
                                },
                                {
                                    terms: {
                                        ["level4.keyword"]:
                                            store.selectedOrgUnits,
                                    },
                                },
                                {
                                    terms: {
                                        ["level5.keyword"]:
                                            store.selectedOrgUnits,
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });
    const { isLoading, isSuccess, isError, error, data } = useLayering(query);
    useEffect(() => {
        if (!store.running) return;
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
        setQuery(() => {
            return {
                query: `select * from layering`,
                fetch_size: 100,
                filter: {
                    bool: {
                        must,
                    },
                },
            };
        });
    }, [store.period, store.selectedOrgUnits, store.code, store.running]);
    

    const loadTable = async () => {
        await updateQuery('2024-02-01', 'Bukesa');
        const table = await fetchView();
        setTableHTML(table);
    }


    return (
        <Stack>
            <Box m="auto" w="100%">
                <Box
                    position="relative"
                    overflow="auto"
                    whiteSpace="nowrap"
                    h="calc(100vh - 280px)"
                >
                    {isLoading && (
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
                    {!isLoaded && !isLoading && (
                        <Button
                        onClick={() => {
                            loadTable()
                        }}
                    >
                        See Report
                    </Button>
                    )}


                    <div dangerouslySetInnerHTML={{ __html: tableHTML }} ></div>    

                    {false && isSuccess && (
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
                    )}
                </Box>
            </Box>
            <Button
                isDisabled={!data || isLoading || !data.cursor}
                onClick={() => {
                    setQuery({ cursor: data.cursor });
                }}
            >
                Load More
            </Button>
            {isError && <Box>{error?.message}</Box>}
        </Stack>
    );
};

export default DataSetLayerTable;
