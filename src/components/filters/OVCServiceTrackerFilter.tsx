import { Stack, Text } from "@chakra-ui/react";
import { DatePicker } from "antd";
import { GroupBase, Select } from "chakra-react-select";
import { Dayjs } from "dayjs";
import { useStore } from "effector-react";
import { DistrictOption } from "../../interfaces";
import { $store } from "../../store/Stores";

type OVCServiceTrackerFilterProps = {
  districts: DistrictOption[];
  onDistrictChange: (district: DistrictOption[]) => void;
  period: Dayjs | null;
  onPeriodChange: (period: Dayjs | null) => void;
};

const OVCServiceTrackerFilter = ({
  period,
  districts,
  onPeriodChange,
  onDistrictChange,
}: OVCServiceTrackerFilterProps) => {
  const store = useStore($store);
  return (
    <Stack direction="row" alignItems="center">
      <Text>Districts:</Text>
      <Stack zIndex={10000} w="500px">
        <Select<DistrictOption, true, GroupBase<DistrictOption>>
          isMulti
          options={store.districts}
          isClearable
          size="sm"
          value={store.districts.filter(
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
      {/* <Button onClick={() => onDownload()}>Download</Button> */}
    </Stack>
  );
};

export default OVCServiceTrackerFilter;
