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
import {
  Box,
  Center,
  CircularProgress,
  Heading,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useStore } from "effector-react";
import { $store } from "../store/Stores";
import { useTracker } from "../store/Queries";
import { innerColumns, otherRows } from "../store/utils";

const OUTER_LIMIT = 4;
const INNER_LIMIT = 4;

const OldDataSetLayerTable = () => {
  const store = useStore($store);
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

  const { isLoading, isSuccess, isError, error, data } = useTracker(
    store.selectedProgram,
    store.selectedOrgUnits,
    store.sessions,
    store.period,
    currentPage,
    pageSize,
    store.code
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
    <Box>
      {isLoading && (
        <CircularProgress isIndeterminate color="blue.700" thickness={3} />
      )}
      {isSuccess && data && (
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
                  {store.columns
                    .filter((s) => s.selected)
                    .map((column: any, index: number) => (
                      <Th key={column.id} {...otherRows(index, column.bg)}>
                        <Heading as="h6" size="xs" textTransform="none">
                          {column.display}
                        </Heading>
                      </Th>
                    ))}
                </Tr>
              </Thead>
              <Tbody py={10}>
                {Object.values(data).map((record: any) => (
                  <Tr key={record.trackedEntityInstance}>
                    {store.columns
                      .filter((s) => s.selected)
                      .map((column, index: number) => (
                        <Td
                          {...innerColumns(index)}
                          key={`${record.trackedEntityInstance}${column.id}`}
                        >
                          {record[column.id]}
                        </Td>
                      ))}
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
                onClick={() => console.warn("I'm clicking the separator")}
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
        <Select ml={3} onChange={handlePageSizeChange} w={40} value={pageSize}>
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
  );
};

export default OldDataSetLayerTable;
