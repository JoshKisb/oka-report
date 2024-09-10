import {
  Input,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Text,
  Box,
  Button,
  Spacer,
} from "@chakra-ui/react";
import dayjs, { Dayjs } from "dayjs";

import { DatePicker } from "antd";
import { GroupBase, Select } from "chakra-react-select";
import { useStore } from "effector-react";
import { Option, DistrictOption } from "../../interfaces";
import { $store } from "../../store/Stores";

type OVCMISReportFilterProps = {
  districts: DistrictOption[];
  onDistrictChange: (selected: DistrictOption[]) => void;
  period: Dayjs | null;
  onPeriodChange: (period: Dayjs) => void;
  onDownload: () => boolean;
};

const OVCMISReportFilter = ({
  districts,
  onDistrictChange,
  period,
  onPeriodChange,
  onDownload,
}: OVCMISReportFilterProps) => {
  const store = useStore($store);
  return (
    <Stack direction="row" alignItems="center">
      <Text>District:</Text>
      <Stack zIndex={10000} w="300px">
        <Select<DistrictOption, true, GroupBase<DistrictOption>>
          isMulti
          options={store.districts}
          isClearable
          size="sm"
          value={districts.filter(
            (d) =>
              districts.findIndex((district) => district.value === d.value) !==
              -1
          )}
          onChange={(e) =>
            onDistrictChange(
              e.map((x) => {
                return { value: x.value, label: x.label, ip: x.ip };
              })
            )
          }
        />
      </Stack>
      <Text>Quarter:</Text>
      <DatePicker
        picker="quarter"
        value={period}
        onChange={(value: any) => onPeriodChange(value)}
      />
      {/* <Spacer />
      <Button onClick={() => onDownload()}>Download</Button> */}
    </Stack>
  );
};

export default OVCMISReportFilter;
