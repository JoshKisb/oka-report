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
import { useLayering2 } from "../store/Queries";
import { $store } from "../store/Stores";
import { innerColumns, otherRows } from "../store/utils";

const ComprehensiveLayerTable = () => {
  const store = useStore($store);
  const [query, setQuery] = useState<{ [key: string]: any }>({
    query: `select * from layering2`,
    fetch_size: 100,
    filter: {
      bool: {
        must: [
          {
            term: {
              ["qtr.keyword"]: store.period.format("YYYY[Q]Q"),
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
          {
            terms: {
              "bFnIjGJpf9t.keyword": [
                "1. VSLA Group",
                "2. Sinovuyo",
                "5. Stepping Stones",
                "6. Other (Specify)",
                "7. Early Childhood Development (ECD)",
              ],
            },
          },
        ],
      },
    },
  });
  const { isLoading, isSuccess, isError, error, data } = useLayering2(query);
  useEffect(() => {
    let must: any[] = [
      {
        term: {
          ["qtr.keyword"]: store.period.format("YYYY[Q]Q"),
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
      {
        terms: {
          "bFnIjGJpf9t.keyword": [
            "1. VSLA Group",
            "2. Sinovuyo",
            "5. Stepping Stones",
            "6. Other (Specify)",
            "7. Early Childhood Development (ECD)",
          ],
        },
      },
    ];
    if (store.code) {
      must = [
        ...must,
        {
          match: {
            ["ypDUCAS6juy.keyword"]: store.code,
          },
        },
      ];
    }
    setQuery({
      query: `select * from layering2`,
      fetch_size: 100,
      filter: {
        bool: {
          must,
        },
      },
    });
  }, [store.period, store.selectedOrgUnits, store.code]);
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
                  {store.columns3
                    .filter((s) => s.selected)
                    .map((column: any, index: number) => (
                      <Th key={`${column.id}`} {...otherRows(index, column.bg)}>
                        <Heading as="h6" size="xs" textTransform="none">
                          {column.display}
                        </Heading>
                      </Th>
                    ))}
                </Tr>
              </Thead>
              <Tbody py={10}>
                {data.data.map((record: any) => (
                  <Tr key={record.id}>
                    {store.columns3
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

export default ComprehensiveLayerTable;
