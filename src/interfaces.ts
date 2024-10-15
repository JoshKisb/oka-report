import { Dayjs } from "dayjs";
import { OptionBase } from "chakra-react-select";
export interface Column {
    display: string;
    id: string;
    selected: boolean;
    bg?: string;
    type?: string;
}
export interface Store {
    loading: boolean;
    running: boolean;
    selectedOrgUnits: string[];
    userOrgUnits: any[];
    relationshipTypes: any[];
    selectedProgram: string;
    program: any;
    total: number;
    period: Dayjs | null | undefined;
    columns: Column[];
    columns2: Column[];
    columns3: Column[];
    columns4: Column[];
    sessions: { [key: string]: string[] };
    code: string;
    subCounties: { [key: string]: any[] };
    districts: DistrictOption[];
    currentProgram: string;
    currentStage: string;
    programs: any[];
    tableHTML: string;
    tableLoading: boolean;
}

export interface ColumnProps {
    id: string;
    value: boolean;
}

export interface Option extends OptionBase {
    label: string;
    value: string;
}

export interface DistrictOption extends OptionBase {
    label: string;
    value: string;
    ip: string;
}

export interface Filters {
    districts: DistrictOption[];
    partners?: Option[];
    period: any;
}

export interface TdProps extends OptionBase {
    key: string;
    accessor: string;
    textAlign: "right" | "left";
    color: string;
    bg: string;
    label: any;
    rowSpan: number;
    colSpan: number;
}
