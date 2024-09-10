import {
    Spinner,
    Box,
    Center,
    Heading,
    Select,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    Stack,
} from "@chakra-ui/react";
import { useStore } from "effector-react";
import {
    Pagination,
    PaginationContainer,
    PaginationNext,
    PaginationPage,
    PaginationPageGroup,
    PaginationPrevious,
    PaginationSeparator,
    usePagination,
} from "@ajna/pagination";
import { useProgramStage } from "../store/Queries";
import { $financialQuarter, $store } from "../store/Stores";
import { Column } from "../interfaces";
import PreventionLayerFilter from "../components/filters/PreventionLayerFilter";
import { innerColumns, otherRows } from "../store/utils";

const OUTER_LIMIT = 4;
const INNER_LIMIT = 4;

const GroupActivityLayer = () => {
    const store = useStore($store);
    const period = useStore($financialQuarter);
    const {
        pages,
        pagesCount,
        currentPage,
        setCurrentPage,
        isDisabled,
        pageSize,
        setPageSize,
    } = usePagination({
        total: store.total,
        limits: {
            outer: OUTER_LIMIT,
            inner: INNER_LIMIT,
        },
        initialState: {
            pageSize: 20,
            currentPage: 1,
        },
    });
    const { isLoading, isSuccess, isError, error, data } = useProgramStage(
        store.selectedOrgUnits,
        period,
        store.sessions,
        currentPage,
        pageSize
    );

    const handlePageChange = (nextPage: number) => {
        setCurrentPage(nextPage);
    };

    const handlePageSizeChange = (event: any) => {
        const pageSize = Number(event.target.value);
        setPageSize(pageSize);
        setCurrentPage(1);
    };

    return (
        <Stack p="10px">
            <PreventionLayerFilter />
            <Box>
                {isLoading && <Spinner />}
                {isSuccess && (
                    <Box m="auto" w="100%">
                        <Box
                            position="relative"
                            overflow="auto"
                            whiteSpace="nowrap"
                            h="calc(100vh - 280px)"
                        >
                            <Table
                                variant="striped"
                                size="sm"
                                colorScheme="gray"
                                textTransform="none"
                            >
                                <Thead>
                                    <Tr py={1}>
                                        {store.columns2
                                            .filter((s) => s.selected)
                                            .map(
                                                (
                                                    column: Column,
                                                    index: number
                                                ) => (
                                                    <Th
                                                        key={`${column.id}${index}`}
                                                        {...otherRows(
                                                            index,
                                                            column.bg
                                                        )}
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
                                    {data.map((record: any) => (
                                        <Tr key={record.event}>
                                            {store.columns2
                                                .filter((s) => s.selected)
                                                .map(
                                                    (column, index: number) => (
                                                        <Td
                                                            key={`${record.event}${column.id}${index}`}
                                                            {...innerColumns(
                                                                index
                                                            )}
                                                            textAlign={
                                                                index > 7
                                                                    ? "center"
                                                                    : "left"
                                                            }
                                                        >
                                                            {record[column.id]}
                                                        </Td>
                                                    )
                                                )}
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </Box>
                )}
                <Pagination
                    pagesCount={pagesCount}
                    currentPage={currentPage}
                    isDisabled={isDisabled}
                    onPageChange={handlePageChange}
                >
                    <PaginationContainer
                        align="center"
                        justify="space-between"
                        p={4}
                        w="full"
                    >
                        <PaginationPrevious
                            _hover={{
                                bg: "yellow.400",
                            }}
                            bg="yellow.300"
                        >
                            <Text>Previous</Text>
                        </PaginationPrevious>
                        <PaginationPageGroup
                            isInline
                            align="center"
                            separator={
                                <PaginationSeparator
                                    onClick={() =>
                                        console.warn(
                                            "I'm clicking the separator"
                                        )
                                    }
                                    bg="blue.300"
                                    fontSize="sm"
                                    w={14}
                                    jumpSize={11}
                                />
                            }
                        >
                            {pages.map((page: number) => (
                                <PaginationPage
                                    w={14}
                                    bg="red.300"
                                    key={`pagination_page_${page}`}
                                    page={page}
                                    fontSize="sm"
                                    _hover={{
                                        bg: "green.300",
                                    }}
                                    _current={{
                                        bg: "green.300",
                                        fontSize: "sm",
                                        w: 14,
                                    }}
                                />
                            ))}
                        </PaginationPageGroup>
                        <PaginationNext
                            _hover={{
                                bg: "yellow.400",
                            }}
                            bg="yellow.300"
                        >
                            <Text>Next</Text>
                        </PaginationNext>
                    </PaginationContainer>
                </Pagination>
                <Center w="full">
                    <Text>Records per page</Text>
                    <Select
                        ml={3}
                        onChange={handlePageSizeChange}
                        w={40}
                        value={pageSize}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="150">150</option>
                        <option value="200">200</option>
                    </Select>
                </Center>
                {isError && <Box>{error?.message}</Box>}
            </Box>
        </Stack>
    );
};

export default GroupActivityLayer;
