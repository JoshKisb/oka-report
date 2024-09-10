import { Stack } from "@chakra-ui/react";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import IndicatorReportFilter from "../components/filters/IndicatorReportFilter";
import IndicatorReportTable from "../components/IndicatorReportTable";
import { DistrictOption, Option } from "../interfaces";
import { useStore } from "effector-react";
import { $store } from "../store/Stores";

const IndicatorReport = () => {
  const [period, setPeriod] = useState<Dayjs | null>(dayjs());
  const store = useStore($store);
  const [districts, setDistricts] = useState<DistrictOption[]>(() => {
    if (store.districts.length > 0) {
      return store.districts.slice(0, 1);
    }
    return [];
  });
  return (
    <Stack p="10px">
      <IndicatorReportFilter
        period={period}
        onPeriodChange={setPeriod}
        districts={districts}
        onDistrictChange={setDistricts}
      />
      <IndicatorReportTable districts={districts} period={period} />
    </Stack>
  );
};

export default IndicatorReport;
