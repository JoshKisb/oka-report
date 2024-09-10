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
import { useStore } from "effector-react";
import { sum } from "lodash";
import { Option } from "../interfaces";
import { ovcMISSections } from "../store/Constants";
import { useOVCHMIS } from "../store/Queries";
import { $store } from "../store/Stores";

type OVCMISTableProps = {
  districts: Option[];
  period: any;
  tableRef: any;
};
const OVCMISTable = ({ districts, period, tableRef }: OVCMISTableProps) => {
  const store = useStore($store);
  const { isLoading, isSuccess, isError, error, data } = useOVCHMIS(
    districts,
    period
  );

  const displayOthers = (
    indicatorId: string,
    other: string,
    data: { [key: string]: number }
  ) => {
    return Object.entries({
      ...store.subCounties,
      total: [
        {
          id: "totals",
          name: "Totals",
          parent: "total",
          pId: "total",
        },
      ],
    })
      .flatMap(([k, values]) => {
        if (
          [...districts, { value: "total", label: "Total" }].findIndex(
            ({ value }) => value === k
          ) !== -1
        ) {
          return values;
        }
        return [];
      })
      .map((s) => {
        if (
          [
            "ind1",
            "ind4",
            "ind5",
            "ind7",
            "ind8",
            "ind11",
            "ind28",
            "ind29",
            "ind48",
            "ind50",
            "ind54",
            "ind59",
          ].indexOf(indicatorId) !== -1
        ) {
          return (
            <Td
              key={s.id}
              colSpan={2}
              border="1px solid gray"
              textAlign="center"
            >
              {data[`${indicatorId}${s.id}${other}`] || 0}
            </Td>
          );
        }
        return [
          { label: "M", id: "Male" },
          { label: "F", id: "Female" },
        ].map((sex) => (
          <Td
            border="1px solid gray"
            textAlign="center"
            key={`${sex.id}${s.id}`}
          >
            {data[`${indicatorId}${s.id}${other}${sex.id}`] || 0}
          </Td>
        ));
      });
  };
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
            <Table ref={tableRef} variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th rowSpan={2} border="1px solid gray">
                    Section
                  </Th>
                  <Th colSpan={3} border="1px solid gray">
                    Name of the Sub-county
                  </Th>
                  {Object.entries({
                    ...store.subCounties,
                    total: [
                      {
                        id: "totals",
                        name: "Totals",
                        parent: "total",
                        pId: "total",
                      },
                    ],
                  })
                    .flatMap(([k, values]) => {
                      if (
                        [
                          ...districts,
                          { value: "total", label: "Total" },
                        ].findIndex(({ value }) => value === k) !== -1
                      ) {
                        return values;
                      }
                      return [];
                    })
                    .map((s) => (
                      <Th
                        key={`${s.id}`}
                        colSpan={2}
                        border="1px solid gray"
                        textAlign="center"
                      >
                        {s.name}
                      </Th>
                    ))}
                </Tr>
                <Tr>
                  <Th colSpan={3} border="1px solid gray">
                    Performance Indicator
                  </Th>
                  {Object.entries({
                    ...store.subCounties,
                    total: [
                      {
                        id: "totals",
                        name: "Totals",
                        parent: "total",
                        pId: "total",
                      },
                    ],
                  })
                    .flatMap(([k, values]) => {
                      if (
                        [
                          ...districts,
                          { value: "total", label: "Total" },
                        ].findIndex(({ value }) => value === k) !== -1
                      ) {
                        return values;
                      }
                      return [];
                    })
                    .map((s) =>
                      ["M", "F"].map((sex) => (
                        <Th border="1px solid gray" key={`${sex}${s.id}`}>
                          {sex}
                        </Th>
                      ))
                    )}
                </Tr>
              </Thead>
              <Tbody>
                {ovcMISSections.map(({ label: l1, indicators, sectionId }) => {
                  return indicators.map(
                    ({ label: l2, others, indicatorId }, indicatorIndex) => {
                      if (others.length > 0) {
                        return others.map(({ label: l3, id }, otherIndex) => {
                          if (indicatorIndex === 0 && otherIndex === 0) {
                            return (
                              <Tr key={`${sectionId}${indicatorId}${l3}`}>
                                <Td
                                  rowSpan={
                                    indicators.length +
                                    sum(
                                      indicators.map(
                                        ({ others }) => others.length
                                      )
                                    ) -
                                    sum(
                                      indicators.map(({ others }) =>
                                        others.length > 0 ? 1 : 0
                                      )
                                    )
                                  }
                                  border="1px solid gray"
                                >
                                  {l1}
                                </Td>
                                <Td
                                  border="1px solid gray"
                                  rowSpan={others.length}
                                  colSpan={2}
                                >
                                  {l2}
                                </Td>
                                <Td border="1px solid gray">{l3}</Td>
                                {displayOthers(indicatorId, id, data)}
                              </Tr>
                            );
                          } else if (otherIndex === 0) {
                            return (
                              <Tr key={`${sectionId}${indicatorId}${l3}`}>
                                <Td
                                  border="1px solid gray"
                                  rowSpan={others.length}
                                  colSpan={2}
                                >
                                  {l2}
                                </Td>
                                <Td border="1px solid gray">{l3}</Td>
                                {displayOthers(indicatorId, id, data)}
                              </Tr>
                            );
                          }
                          return (
                            <Tr key={`${sectionId}${indicatorId}${l3}`}>
                              <Td border="1px solid gray">{l3}</Td>
                              {displayOthers(indicatorId, id, data)}
                            </Tr>
                          );
                        });
                      } else if (indicatorIndex === 0) {
                        return (
                          <Tr key={`${sectionId}${indicatorId}`}>
                            <Td
                              textAlign="center"
                              border="1px solid gray"
                              rowSpan={
                                indicators.length +
                                sum(
                                  indicators.map(({ others }) => others.length)
                                ) -
                                sum(
                                  indicators.map(({ others }) =>
                                    others.length > 0 ? 1 : 0
                                  )
                                )
                              }
                            >
                              {l1}
                            </Td>
                            <Td colSpan={3} border="1px solid gray">
                              {l2}
                            </Td>
                            {displayOthers(indicatorId, "", data)}
                          </Tr>
                        );
                      }

                      return (
                        <Tr key={`${sectionId}${indicatorId}`}>
                          <Td colSpan={3} border="1px solid gray">
                            {l2}
                          </Td>
                          {displayOthers(indicatorId, "", data)}
                        </Tr>
                      );
                    }
                  );
                })}
              </Tbody>
            </Table>
          )}
        </Box>
      </Box>
      {isError && <Box>{error?.message}</Box>}
    </Stack>
  );
};

export default OVCMISTable;
