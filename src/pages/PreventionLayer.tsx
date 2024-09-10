import { Stack } from "@chakra-ui/react";
import PreventionLayerTable from "../components/PreventionLayerTable";
import PreventionLayerFilter from "../components/filters/PreventionLayerFilter";
const PreventionLayer = () => {
  return (
    <Stack p="10px">
      <PreventionLayerFilter />
      <PreventionLayerTable />
    </Stack>
  );
};
export default PreventionLayer;
