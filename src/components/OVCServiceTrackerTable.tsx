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
import { fromPairs, groupBy, sum } from "lodash";
import { useRef } from "react";
import { utils, write } from "xlsx";
import { DistrictOption, Filters } from "../interfaces";
import { useOVCServiceTracker } from "../store/Queries";
import { $store } from "../store/Stores";
import { ovcTrackerFreezes, s2ab, secondHeader } from "../store/utils";

const OVCServiceTrackerTable = ({ districts, period }: Filters) => {
  const store = useStore($store);
  const reportDistricts = districts.length > 0 ? districts : store.districts;
  const { isLoading, isSuccess, isError, error, data } = useOVCServiceTracker(
    reportDistricts,
    period
  );
  const ref = useRef<any>(null);

  const getValue = (data: { [key: string]: number }, key: string) => {
    if (data[key]) {
      return data[key];
    }
    return 0;
  };

  const calculatePercentage = (numerator: number, denominator: number) => {
    if (denominator !== 0) {
      return (numerator * 100) / denominator;
    }
    return 0;
  };

  const findColor = (value: number) => {
    if (value >= 75) {
      return "#02B050";
    }
    if (value >= 50) {
      return "yellow";
    }
    return "#C00001";
  };

  const findFontColor3 = (value: number) => {
    if (value >= 75) {
      return "";
    }
    if (value >= 50) {
      return "";
    }
    return "white";
  };

  const findColor3 = (value: number) => {
    if (value < 0) {
      return "#C00001";
    }
    return "#02B050";
  };

  const findColor2 = (value: number) => {
    if (value >= 95) {
      return "#02B050";
    }
    if (value >= 90) {
      return "yellow";
    }
    return "#C00001";
  };

  const findFontColor = (value: number) => {
    if (value >= 95) {
      return "";
    }
    if (value >= 90) {
      return "";
    }
    return "white";
  };

  const findFontColor2 = (value: number) => {
    if (value < 0) {
      return "white";
    }
    return "";
  };

  const groupedDistricts = groupBy(reportDistricts, "ip");

  const displayData = (
    data: { [key: string]: number },
    district: DistrictOption,
    isLast: boolean = false,
    begin = 1
  ) => {
    return (
      <>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          bg={isLast ? "#002060" : "#A5A5A5"}
          color={isLast ? "white" : ""}
        >
          {getValue(data, `${district.value}`).toLocaleString()}
        </Td>
        <Td border="1px solid #0270C0" textAlign="right">
          {getValue(data, `OVC_SERV${district.value}`).toLocaleString()}
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          color={findFontColor3(
            calculatePercentage(
              getValue(data, `OVC_SERV${district.value}`),
              getValue(data, `${district.value}`)
            )
          )}
          bg={findColor(
            calculatePercentage(
              getValue(data, `OVC_SERV${district.value}`),
              getValue(data, `${district.value}`)
            )
          )}
        >
          {calculatePercentage(
            getValue(data, `OVC_SERV${district.value}`),
            getValue(data, `${district.value}`)
          ).toFixed(0)}
          %
        </Td>
        <Td border="1px solid #0270C0" textAlign="right">
          {getValue(
            data,
            `G06XnwYXVPu.EVrTtYEJfeN${district.value}`
          ).toLocaleString()}
        </Td>
        <Td border="1px solid #0270C0" textAlign="right">
          {getValue(data, `OVC_SERV${district.value}`).toLocaleString()}
        </Td>
        <Td
          textAlign="right"
          border="1px solid #0270C0"
          color={findFontColor3(
            calculatePercentage(
              getValue(data, `OVC_SERV${district.value}`),
              getValue(data, `G06XnwYXVPu.EVrTtYEJfeN${district.value}`)
            )
          )}
          bg={findColor(
            calculatePercentage(
              getValue(data, `OVC_SERV${district.value}`),
              getValue(data, `G06XnwYXVPu.EVrTtYEJfeN${district.value}`)
            )
          )}
        >
          {calculatePercentage(
            getValue(data, `OVC_SERV${district.value}`),
            getValue(data, `G06XnwYXVPu.EVrTtYEJfeN${district.value}`)
          ).toFixed(0)}
          %
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          bg={isLast ? "#002060" : "#A5A5A5"}
          color={isLast ? "white" : ""}
        >
          {(
            getValue(data, `G06XnwYXVPu.uBYxpV8iADb${district.value}`) +
            getValue(data, `G06XnwYXVPu.h4tlGMjEc0Y${district.value}`)
          ).toLocaleString()}
        </Td>
        <Td border="1px solid #0270C0" textAlign="right">
          {getValue(data, `PREV${district.value}`)}
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          color={findFontColor3(
            calculatePercentage(
              getValue(data, `PREV${district.value}`),
              getValue(data, `G06XnwYXVPu.uBYxpV8iADb${district.value}`) +
                getValue(data, `G06XnwYXVPu.h4tlGMjEc0Y${district.value}`)
            )
          )}
          bg={findColor(
            calculatePercentage(
              getValue(data, `PREV${district.value}`),
              getValue(data, `G06XnwYXVPu.uBYxpV8iADb${district.value}`) +
                getValue(data, `G06XnwYXVPu.h4tlGMjEc0Y${district.value}`)
            )
          )}
        >
          {calculatePercentage(
            getValue(data, `PREV${district.value}`),
            getValue(data, `G06XnwYXVPu.uBYxpV8iADb${district.value}`) +
              getValue(data, `G06XnwYXVPu.h4tlGMjEc0Y${district.value}`)
          ).toFixed(0)}
          %
        </Td>
        <Td border="1px solid #0270C0" textAlign="right">
          {(
            getValue(data, `OVC_SERV${district.value}`) +
            getValue(data, `PREV${district.value}`)
          ).toLocaleString()}
        </Td>
        <Td
          whiteSpace="nowrap"
          border="1px solid #0270C0"
          textAlign="right"
          color={findFontColor3(
            calculatePercentage(
              getValue(data, `OVC_SERV${district.value}`) +
                getValue(data, `PREV${district.value}`),
              getValue(data, `G06XnwYXVPu.uBYxpV8iADb${district.value}`) +
                getValue(data, `G06XnwYXVPu.h4tlGMjEc0Y${district.value}`) +
                getValue(data, `G06XnwYXVPu.EVrTtYEJfeN${district.value}`)
            )
          )}
          bg={findColor(
            calculatePercentage(
              getValue(data, `OVC_SERV${district.value}`) +
                getValue(data, `PREV${district.value}`),
              getValue(data, `G06XnwYXVPu.uBYxpV8iADb${district.value}`) +
                getValue(data, `G06XnwYXVPu.h4tlGMjEc0Y${district.value}`) +
                getValue(data, `G06XnwYXVPu.EVrTtYEJfeN${district.value}`)
            )
          )}
        >
          {calculatePercentage(
            getValue(data, `OVC_SERV${district.value}`) +
              getValue(data, `PREV${district.value}`),
            getValue(data, `G06XnwYXVPu.uBYxpV8iADb${district.value}`) +
              getValue(data, `G06XnwYXVPu.h4tlGMjEc0Y${district.value}`) +
              getValue(data, `G06XnwYXVPu.EVrTtYEJfeN${district.value}`)
          ).toFixed(0)}
          %
        </Td>
        <Td border="1px solid #0270C0" textAlign="right">
          {getValue(data, `child${district.value}`).toLocaleString()}
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          whiteSpace="nowrap"
          color={findFontColor3(
            calculatePercentage(
              getValue(data, `child${district.value}`),
              getValue(data, `OVC_SERV${district.value}`)
            )
          )}
          bg={findColor(
            calculatePercentage(
              getValue(data, `child${district.value}`),
              getValue(data, `OVC_SERV${district.value}`)
            )
          )}
        >
          {calculatePercentage(
            getValue(data, `child${district.value}`),
            getValue(data, `OVC_SERV${district.value}`)
          ).toFixed(0)}
          %
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          bg={isLast ? "#002060" : "#A5A5A5"}
          color={isLast ? "white" : ""}
        >
          {getValue(data, `tracker${district.value}`).toLocaleString()}
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          bg={isLast ? "#002060" : "#A5A5A5"}
          color={isLast ? "white" : ""}
        >
          {getValue(data, `art${district.value}`).toLocaleString()}
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          bg={isLast ? "#002060" : "#A5A5A5"}
          color={isLast ? "white" : ""}
        >
          {getValue(data, `eligible${district.value}`).toLocaleString()}
        </Td>
        <Td border="1px solid #0270C0" textAlign="right">
          {getValue(data, `vlt${district.value}`).toLocaleString()}
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          color={findFontColor(
            calculatePercentage(
              getValue(data, `vlt${district.value}`),
              getValue(data, `eligible${district.value}`)
            )
          )}
          bg={findColor2(
            calculatePercentage(
              getValue(data, `vlt${district.value}`),
              getValue(data, `eligible${district.value}`)
            )
          )}
        >
          {calculatePercentage(
            getValue(data, `vlt${district.value}`),
            getValue(data, `eligible${district.value}`)
          ).toFixed(0)}
          %
        </Td>
        <Td border="1px solid #0270C0" textAlign="right">
          {getValue(data, `vlr${district.value}`).toLocaleString()}
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          color={findFontColor(
            calculatePercentage(
              getValue(data, `vlr${district.value}`),
              getValue(data, `eligible${district.value}`)
            )
          )}
          bg={findColor2(
            calculatePercentage(
              getValue(data, `vlr${district.value}`),
              getValue(data, `eligible${district.value}`)
            )
          )}
        >
          {calculatePercentage(
            getValue(data, `vlr${district.value}`),
            getValue(data, `eligible${district.value}`)
          ).toFixed(0)}
          %
        </Td>
        <Td border="1px solid #0270C0" textAlign="right">
          {getValue(data, `sup${district.value}`).toLocaleString()}
        </Td>
        <Td border="1px solid #0270C0" textAlign="right">
          {getValue(data, `vls${district.value}`).toLocaleString()}
        </Td>
        <Td
          color={findFontColor(
            calculatePercentage(
              getValue(data, `vls${district.value}`),
              getValue(data, `vlr${district.value}`)
            )
          )}
          border="1px solid #0270C0"
          textAlign="right"
          bg={findColor2(
            calculatePercentage(
              getValue(data, `vls${district.value}`),
              getValue(data, `vlr${district.value}`)
            )
          )}
        >
          {calculatePercentage(
            getValue(data, `vls${district.value}`),
            getValue(data, `vlr${district.value}`)
          ).toFixed(0)}
          %
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          bg={isLast ? "#002060" : "#A5A5A5"}
          color={isLast ? "white" : ""}
        >
          {getValue(data, `notServed${district.value}`).toLocaleString()}
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          bg={isLast ? "#002060" : "#A5A5A5"}
          color={isLast ? "white" : ""}
        >
          {getValue(data, `noVL${district.value}`).toLocaleString()}
        </Td>
        <Td
          border="1px solid #0270C0"
          textAlign="right"
          bg={findColor3(
            getValue(data, `tracker${district.value}`) -
              getValue(data, `diff${district.value}`)
          )}
          color={findFontColor2(
            getValue(data, `tracker${district.value}`) -
              getValue(data, `diff${district.value}`)
          )}
        >
          {(
            getValue(data, `tracker${district.value}`) -
            getValue(data, `diff${district.value}`)
          ).toLocaleString()}
        </Td>
      </>
    );
  };

  const findValue = (key: string, districts: DistrictOption[]) => {
    const allKeys = districts.map((district) => `${key}${district.value}`);
    return sum(allKeys.map((key) => data[key] || 0));
  };

  const calculateSummaries = () => {
    const calculated = Object.entries(groupedDistricts).flatMap(
      ([key, districts]) => {
        return [
          "",
          "OVC_SERV",
          "G06XnwYXVPu.uBYxpV8iADb",
          "G06XnwYXVPu.h4tlGMjEc0Y",
          "PREV",
          "G06XnwYXVPu.EVrTtYEJfeN",
          "child",
          "tracker",
          "art",
          "eligible",
          "vlt",
          "vlr",
          "vls",
          "diff",
          "noVL",
          "notServed",
          "sup",
        ].map((v) => [`${v}${key}`, findValue(v, districts)]);
      }
    );
    const partnerSummaries = fromPairs(calculated);

    const overallTotals = [
      "",
      "OVC_SERV",
      "G06XnwYXVPu.uBYxpV8iADb",
      "G06XnwYXVPu.h4tlGMjEc0Y",
      "PREV",
      "G06XnwYXVPu.EVrTtYEJfeN",
      "child",
      "tracker",
      "art",
      "eligible",
      "vlt",
      "vlr",
      "vls",
      "diff",
      "noVL",
      "notServed",
      "sup",
    ].map((v) => [`${v}Total`, findValue(v, reportDistricts)]);

    return {
      ...partnerSummaries,
      ...fromPairs(overallTotals),
    };
  };

  const download = () => {
    const el2 = ref.current;
    const ws = utils.table_to_sheet(el2);
    let wb = utils.book_new();
    wb.Props = {
      Title: "SheetJS Tutorial",
      Subject: "Test",
      Author: "Red Stapler",
      CreatedDate: new Date(),
    };

    wb.SheetNames.push("Listing");
    wb.Sheets["Listing"] = ws;
    const wbout = write(wb, { bookType: "xlsx", type: "binary" });
    saveAs(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
      "export.xlsx"
    );
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
            <Stack>
              {/* <Pdf
                targetRef={ref}
                filename="div-blue.pdf"
                options={{
                  orientation: "landscape",
                  unit: "in",
                  format: [23.4, 33.1],
                }}
              >
                {({ toPdf }: any) => <Button onClick={toPdf}>Download</Button>}
              </Pdf> */}

              {/* <DownloadTableExcel
                filename="users table"
                sheet="users"
                currentTableRef={ref.current}
              > */}
              {/* <Button onClick={() => download()}>Download</Button> */}
              {/* </DownloadTableExcel> */}

              <Table ref={ref} id="ovc-tracker-table">
                <Thead bg="#002060">
                  <Tr h="48px">
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      rowSpan={2}
                      textAlign="center"
                      {...ovcTrackerFreezes(0)}
                    >
                      Partner
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      rowSpan={2}
                      textAlign="center"
                      {...ovcTrackerFreezes(1)}
                    >
                      District/Division
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      rowSpan={2}
                      textAlign="center"
                      {...ovcTrackerFreezes(2)}
                    >
                      # To be served in current quarter
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      rowSpan={2}
                      textAlign="center"
                      {...ovcTrackerFreezes(3)}
                    >
                      # Served in both quarters
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      rowSpan={2}
                      textAlign="center"
                      {...ovcTrackerFreezes(4)}
                    >
                      %
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      colSpan={3}
                      textAlign="center"
                      {...ovcTrackerFreezes(5)}
                    >
                      Comprehensive (COMP)
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      colSpan={3}
                      textAlign="center"
                      {...ovcTrackerFreezes(6)}
                    >
                      Prevention (PREV)
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      colSpan={2}
                      textAlign="center"
                      {...ovcTrackerFreezes(7)}
                    >
                      COMP &amp; PREV
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      textAlign="center"
                      colSpan={2}
                      {...ovcTrackerFreezes(8)}
                    >
                      Children
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      colSpan={10}
                      textAlign="center"
                      {...ovcTrackerFreezes(9)}
                    >
                      Viral Load Status among CLHIV with VL Trackers Served
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      colSpan={2}
                      textAlign="center"
                      {...ovcTrackerFreezes(10)}
                    >
                      &nbsp;&nbsp;
                    </Th>
                    <Th
                      color="white"
                      border="1px solid #0270C0"
                      rowSpan={2}
                      textAlign="center"
                      {...ovcTrackerFreezes(11)}
                    >
                      Difference btn previous quarter CLHIV and current quarter
                      CLHIV served with trackers
                    </Th>
                  </Tr>
                  <Tr h="50px" maxH="50px">
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      COMP Target
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      COMP OVC_SERV
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      %
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      PREV Target
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      PREV Served
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      %
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      Beneficiaries Served
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      %
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      # of children among the COMP OVC_SERV
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      %
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      # of CLHIV (With Trackers) served
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      # of CLHIV on ART
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      # Eligible for VL
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      Viral Load Test Done (VLT)
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      %
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      Received Viral Load Results (VLR)
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      %
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      CLHIV Unsuppressed
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      Virally Suppressed (VLS)
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      %
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      # of Active CLHIV Not YET served
                    </Th>
                    <Th
                      color="white"
                      textAlign="center"
                      border="1px solid #0270C0"
                      {...secondHeader()}
                    >
                      # of CLHIV served but without VL TRACKERS
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(groupedDistricts).map(
                    ([ip, availableDistricts]) => {
                      return availableDistricts.map((district, index) => {
                        if (index === 0) {
                          return (
                            <Tr
                              key={`${district.value}`}
                              textTransform="uppercase"
                            >
                              <Td
                                border="1px solid #0270C0"
                                rowSpan={availableDistricts.length}
                                position="sticky"
                                w="200px"
                                minWidth="200px"
                                maxWidth="200px"
                                left="0px"
                                zIndex={100000}
                                bg="white"
                              >
                                {ip}
                              </Td>
                              <Td
                                border="1px solid #0270C0"
                                position="sticky"
                                w="200px"
                                minWidth="200px"
                                maxWidth="200px"
                                left="200px"
                                bg="white"
                                zIndex={100000}
                              >
                                {district.label}
                              </Td>
                              {displayData(data, district)}
                            </Tr>
                          );
                        }

                        return (
                          <Tr
                            key={`${district.value}`}
                            textTransform="uppercase"
                          >
                            <Td
                              border="1px solid #0270C0"
                              position="sticky"
                              w="200px"
                              minWidth="200px"
                              maxWidth="200px"
                              left="200px"
                              zIndex={100000}
                              bg="white"
                            >
                              {district.label}
                            </Td>
                            {displayData(data, district, false, 0)}
                          </Tr>
                        );
                      });
                    }
                  )}

                  {Object.entries({
                    ...groupedDistricts,
                    Total: [{ label: "Total", value: "total", ip: "Total" }],
                  }).map(([ip], ipIndex) => {
                    if (ipIndex === 0) {
                      return (
                        <Tr key={`${ip}`}>
                          <Td
                            rowSpan={Object.keys(groupedDistricts).length + 1}
                            border="1px solid #0270C0"
                            bg="#002060"
                            color="white"
                            position="sticky"
                            w="200px"
                            minWidth="200px"
                            maxWidth="200px"
                            left="0px"
                            zIndex={100000}
                          >
                            OVERALL
                          </Td>
                          <Td
                            border="1px solid #0270C0"
                            bg="#002060"
                            color="white"
                            position="sticky"
                            w="200px"
                            minWidth="200px"
                            maxWidth="200px"
                            left="200px"
                            zIndex={100000}
                          >
                            {ip}
                          </Td>
                          {displayData(
                            calculateSummaries(),
                            {
                              label: ip,
                              value: ip,
                              ip,
                            },
                            true
                          )}
                        </Tr>
                      );
                    }
                    return (
                      <Tr key={`${ip}`}>
                        <Td
                          border="1px solid #0270C0"
                          bg="#002060"
                          color="white"
                          position="sticky"
                          w="200px"
                          minWidth="200px"
                          maxWidth="200px"
                          left="200px"
                          zIndex={100000}
                        >
                          {ip}
                        </Td>
                        {displayData(
                          calculateSummaries(),
                          {
                            label: ip,
                            value: ip,
                            ip,
                          },
                          true,
                          0
                        )}
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Stack>
          )}
        </Box>
      </Box>
      {isError && <Box>{error?.message}</Box>}
    </Stack>
  );
};

export default OVCServiceTrackerTable;
