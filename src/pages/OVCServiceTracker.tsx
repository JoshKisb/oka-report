import { Stack } from "@chakra-ui/react";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import OVCServiceTrackerFilter from "../components/filters/OVCServiceTrackerFilter";
import OVCServiceTrackerTable from "../components/OVCServiceTrackerTable";
import { DistrictOption } from "../interfaces";

const OVCServiceTracker = () => {
  const [period, setPeriod] = useState<Dayjs | null>(dayjs());
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  return (
    <Stack p="10px">
      <OVCServiceTrackerFilter
        period={period}
        onPeriodChange={setPeriod}
        districts={districts}
        onDistrictChange={setDistricts}
      />
      <OVCServiceTrackerTable districts={districts} period={period} />
    </Stack>
  );
};

export default OVCServiceTracker;
