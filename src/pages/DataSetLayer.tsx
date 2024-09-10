import { Stack } from "@chakra-ui/react";
import DataSetLayerTable from "../components/DataSetLayerTable";
import DataSetLayerFilter from "../components/filters/DataSetLayerFilter";
const DataSetLayer = () => {
  return (
    <Stack p="10px">
      <DataSetLayerFilter />
      <DataSetLayerTable />
    </Stack>
  );
};
export default DataSetLayer;
