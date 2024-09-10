import { useState, useRef } from "react";
import { Stack } from "@chakra-ui/react";
import { useDownloadExcel } from "react-export-table-to-excel";
import dayjs, { Dayjs } from "dayjs";
import OVCMISReportFilter from "../components/filters/OVCMISReportFilter";
import OVCMISTable from "../components/OVCMISTable";
import { DistrictOption, Option } from "../interfaces";
import { useStore } from "effector-react";
import { $store } from "../store/Stores";
const OVCMISReport = () => {
  const store = useStore($store);
  const [period, setPeriod] = useState<Dayjs | null>(dayjs());
  const [districts, setDistricts] = useState<DistrictOption[]>(() => {
    if (store.districts.length > 0) {
      return store.districts.slice(0, 1);
    }
    return [];
  });
  const tableRef = useRef(null);
  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: "Users table",
    sheet: "Users",
  });
  return (
    <Stack spacing="20px" p="10px">
      <OVCMISReportFilter
        districts={districts}
        onDistrictChange={setDistricts}
        period={period}
        onPeriodChange={setPeriod}
        onDownload={onDownload}
      />
      <OVCMISTable districts={districts} period={period} tableRef={tableRef} />
    </Stack>
  );
};

export default OVCMISReport;
