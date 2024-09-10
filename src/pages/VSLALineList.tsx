import { Stack } from "@chakra-ui/react";
import React from "react";
import VSLALineFilter from "../components/filters/VSLALineFilter";
import VSLALineListTable from "../components/VSLALineListTable";

export default function VSLALineList() {
    return (
        <Stack p="10px">
            <VSLALineFilter />
            <VSLALineListTable />
        </Stack>
    );
}
