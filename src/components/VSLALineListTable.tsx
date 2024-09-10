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
import { uniqBy } from "lodash";
import { useEffect, useState } from "react";
import { Column } from "../interfaces";
import { useLayeringVSLA } from "../store/Queries";
import {
    $attributes,
    $columns4,
    $elements,
    $selectedProgram,
    $selectedStage,
    $store,
    $withOptions,
} from "../store/Stores";
import { innerColumns, otherRows } from "../store/utils";
const pageSize = 25;
const VSLALineListTable = () => {
    const store = useStore($store);
    const selectedProgram = useStore($selectedProgram);
    const selectedStage = useStore($selectedStage);
    const withOptions = useStore($withOptions);
    const columns4 = useStore($columns4);
    const [query, setQuery] = useState<{ [key: string]: any }>({
        fetch_size: pageSize,
        field_multi_value_leniency: true,
        filter: {
            bool: {
                must: [
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
                    {
                        exists: {
                            field: "eventDate",
                        },
                    },
                    {
                        term: {
                            deleted: false,
                        },
                    },
                    {
                        range: {
                            eventDate: {
                                gte: "2022-07-01",
                                lte: "2023-06-30",
                            },
                        },
                    },
                ],
            },
        },
    });

    const attributes = useStore($attributes);

    const dataElements = useStore($elements);

    const { isLoading, isSuccess, isError, error, data } = useLayeringVSLA(
        query,
        selectedProgram,
        selectedStage,
        store.selectedOrgUnits,
        attributes,
        dataElements
    );

    useEffect(() => {
        setQuery(() => {
            return {
                fetch_size: pageSize,
                filter: {
                    bool: {
                        must: [
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
                            {
                                exists: {
                                    field: "eventDate",
                                },
                            },
                            {
                                term: {
                                    deleted: false,
                                },
                            },
                        ],
                    },
                },
            };
        });
    }, [store.selectedOrgUnits]);
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
                    {isSuccess && (
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr py={1}>
                                    {uniqBy(columns4, "id").map(
                                        (column: Column, index: number) => (
                                            <Th
                                                key={`${column.id}`}
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
                                        )
                                    )}
                                </Tr>
                            </Thead>
                            <Tbody py={10}>
                                {data.data.map((record: any) => (
                                    <Tr key={record.event}>
                                        {uniqBy(columns4, "id").map(
                                            (column, index: number) => {
                                                const value = record[column.id];
                                                const realValue =
                                                    withOptions[column.id]?.[
                                                        value
                                                    ] || value;
                                                return (
                                                    <Td
                                                        {...innerColumns(index)}
                                                        key={`${record.event}${column.id}`}
                                                    >
                                                        {realValue}
                                                    </Td>
                                                );
                                            }
                                        )}
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
                    setQuery(() => {
                        return {
                            cursor: data.cursor,
                        };
                    });
                }}
            >
                Load More
            </Button>
            {isError && <Box>{error?.message}</Box>}
        </Stack>
    );
};

export default VSLALineListTable;
