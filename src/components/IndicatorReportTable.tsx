import {
    Box,
    Spinner,
    Stack,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import React from "react";
import { Filters } from "../interfaces";
import { indicatorReportColumns } from "../store/Constants";
import { useIndicatorReport } from "../store/Queries";

const IndicatorReportTable = ({ districts, period }: Filters) => {
    const { isLoading, isSuccess, isError, error, data } = useIndicatorReport(
        districts,
        period
    );
    return (
        <Stack>
            <Box m="auto" w="100%">
                <Box
                    position="relative"
                    overflow="auto"
                    // whiteSpace="nowrap"
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
                            <Thead bg="#002060">
                                <Tr>
                                    <Th
                                        color="white"
                                        border="1px solid #0270C0"
                                        colSpan={3}
                                    ></Th>
                                    <Th
                                        color="white"
                                        border="1px solid #0270C0"
                                        colSpan={3}
                                        textAlign="center"
                                    >
                                        Quarter 1(Oct-Dec )
                                    </Th>
                                    <Th
                                        color="white"
                                        border="1px solid #0270C0"
                                        colSpan={3}
                                        textAlign="center"
                                    >
                                        Quarter 2(Jan-Mar )
                                    </Th>
                                    <Th
                                        color="white"
                                        border="1px solid #0270C0"
                                        colSpan={3}
                                        textAlign="center"
                                    >
                                        Quarter 3(April-June )
                                    </Th>
                                    <Th
                                        color="white"
                                        border="1px solid #0270C0"
                                        colSpan={3}
                                        textAlign="center"
                                    >
                                        Quarter 4(July-Sept )
                                    </Th>
                                    <Th
                                        color="white"
                                        border="1px solid #0270C0"
                                        colSpan={3}
                                        textAlign="center"
                                    >
                                        Annual(Oct - Sept)
                                    </Th>
                                </Tr>
                                <Tr>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        AMELP Ref No
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Indicator
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Disagg
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Target
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Actual
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        %
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Target
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Actual
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        %
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Target
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Actual
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        %
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Target
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Actual
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        %
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Target
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        Actual
                                    </Th>
                                    <Th
                                        textAlign="center"
                                        color="white"
                                        border="1px solid #0270C0"
                                    >
                                        %
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {indicatorReportColumns(period, data).map(
                                    ({ columns, key: rowKey }) => {
                                        return (
                                            <Tr key={rowKey}>
                                                {columns.map(
                                                    (
                                                        {
                                                            key,
                                                            label,
                                                            rowSpan,
                                                            colSpan,
                                                            color,
                                                            bg,
                                                            textAlign,
                                                        },
                                                        index
                                                    ) => (
                                                        <Td
                                                            {...{
                                                                rowSpan,
                                                                colSpan,
                                                            }}
                                                            key={`${rowKey}${key}`}
                                                            border="1px solid #0270C0"
                                                            bg={bg}
                                                            color={color}
                                                            textAlign={
                                                                textAlign
                                                            }
                                                        >
                                                            {label}
                                                        </Td>
                                                    )
                                                )}
                                            </Tr>
                                        );
                                    }
                                )}
                            </Tbody>
                        </Table>
                    )}
                </Box>
            </Box>
            {isError && <Box>{error?.message}</Box>}
        </Stack>
    );
};

export default IndicatorReportTable;
