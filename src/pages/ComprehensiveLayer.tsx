import { Stack } from "@chakra-ui/react";
import React from "react";
import ComprehensiveLayerTable from "../components/ComprehensiveLayerTable";
import ComprehensiveLayerFilter from "../components/filters/ComprehensiveLayerFilter";
const ComprehensiveLayer = () => {
  return (
    <Stack p="10px">
      <ComprehensiveLayerFilter />
      <ComprehensiveLayerTable />
    </Stack>
  );
};
export default ComprehensiveLayer;
