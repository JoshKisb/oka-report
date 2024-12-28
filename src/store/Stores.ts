import dayjs from "dayjs";
import { combine, createApi, createEvent } from "effector";
import { Dictionary, every } from "lodash";
import { Column, Option, Store } from "../interfaces";
import { columns, columns2, columns3, columns4 } from "./Constants";
import { domain } from "./Domains";
import {
    addRemoveColumn,
    addRemoveColumn2,
    addRemoveColumn3,
    addRemoveColumn4,
    changeCode,
    changePeriod,
    changeRelationshipTypes,
    changeTotal,
    setTotalRecords,
    setColumn4,
    setColumn,
    setCurrentProgram,
    setCurrentStage,
    setDistricts,
    setProgram,
    setPrograms,
    setSelectedOrgUnits,
    setSessions,
    setSubCounties,
    setUserOrgUnits,
    toggleColumns,
    toggleColumns2,
    toggleColumns3,
    toggleColumns4,
    setRunning,
    setTableHTML,
    setTableLoading,
} from "./Events";
import { calculateQuarter, calculateStandardQuarter, getFiscalQuarter } from "./utils";

const { fiscalYear, quarter } = getFiscalQuarter(new Date());
// console.log("Quarter", getFiscalQuarter(new Date("2024-12-01")))
export const $store = domain
    .createStore<Store>({
        loading: false,
        running: true,
        selectedOrgUnits: [],
        userOrgUnits: [],
        relationshipTypes: [],
        selectedProgram: "RDEklSXCD4C",
        program: {},
        total: 0,
        totalRecords: 0,
        period: dayjs(calculateStandardQuarter(fiscalYear, quarter)[0]),
        columns: columns,
        columns2: columns2,
        columns3: columns3,
        columns4: [],
        sessions: {},
        code: "",
        subCounties: {},
        districts: [],
        currentProgram: "",
        currentStage: "",
        programs: [],
        tableHTML: "",
        tableLoading: false,
    })
    .on(setUserOrgUnits, (state, userOrgUnits) => {
        return { ...state, userOrgUnits };
    })
    .on(setRunning, (state, running) => {
        return { ...state, running };
    })
    .on(setSelectedOrgUnits, (state, selectedOrgUnits) => {
        return { ...state, selectedOrgUnits };
    })
    .on(changeRelationshipTypes, (state, relationshipTypes) => {
        return { ...state, relationshipTypes };
    })
    .on(setProgram, (state, program) => {
        return { ...state, program };
    })
    .on(setTableHTML, (state, tableHTML) => {
        return { ...state, tableHTML };
    })
    .on(setTableLoading, (state, tableLoading) => {
        return { ...state, tableLoading };
    })
    .on(changeTotal, (state, total) => {
        return { ...state, total };
    })
    .on(setTotalRecords, (state, totalRecords) => {
        return { ...state, totalRecords };
    })
    .on(changePeriod, (state, period) => {
        return { ...state, period };
    })
    .on(setColumn, (state, columns) => {
        return { ...state, columns };
    })
    .on(addRemoveColumn, (state, { id, value }) => {
        const processed = state.columns.map((column) => {
            if (id === column.id) {
                return { ...column, selected: value };
            }
            return column;
        });
        return { ...state, columns: processed };
    })
    .on(addRemoveColumn2, (state, { id, value }) => {
        const processed = state.columns2.map((column) => {
            if (id === column.id) {
                return { ...column, selected: value };
            }
            return column;
        });
        return { ...state, columns2: processed };
    })
    .on(addRemoveColumn3, (state, { id, value }) => {
        const processed = state.columns3.map((column) => {
            if (id === column.id) {
                return { ...column, selected: value };
            }
            return column;
        });
        return { ...state, columns3: processed };
    })
    .on(addRemoveColumn4, (state, { id, value }) => {
        const processed = state.columns4.map((column) => {
            if (id === column.id) {
                return { ...column, selected: value };
            }
            return column;
        });
        return { ...state, columns4: processed };
    })
    .on(toggleColumns, (state, value) => {
        const processed = state.columns.map((column) => {
            return { ...column, selected: value };
        });
        return { ...state, columns: processed };
    })
    .on(toggleColumns2, (state, value) => {
        const processed = state.columns2.map((column) => {
            return { ...column, selected: value };
        });
        return { ...state, columns2: processed };
    })
    .on(toggleColumns3, (state, value) => {
        const processed = state.columns3.map((column) => {
            return { ...column, selected: value };
        });
        return { ...state, columns2: processed };
    })
    .on(toggleColumns4, (state, value) => {
        const processed = state.columns4.map((column) => {
            return { ...column, selected: value };
        });
        return { ...state, columns4: processed };
    })
    .on(setSessions, (state, sessions) => {
        return { ...state, sessions };
    })
    .on(changeCode, (state, code) => {
        return { ...state, code };
    })
    .on(setSubCounties, (state, subCounties) => {
        return { ...state, subCounties };
    })
    .on(setDistricts, (state, districts) => {
        return { ...state, districts };
    })
    .on(setCurrentProgram, (state, currentProgram) => {
        return { ...state, currentProgram };
    })
    .on(setCurrentStage, (state, currentStage) => {
        return { ...state, currentStage };
    })
    .on(setColumn4, (state, columns4) => {
        return { ...state, columns4 };
    })
    .on(setPrograms, (state, programs) => {
        return { ...state, programs };
    });

export const $columns = $store.map((state) => {
    return state.columns.filter((c) => c.selected);
});

export const $columns2 = $store.map((state) => {
    return state.columns2.filter((c) => c.selected);
});

export const $attributes = $store.map((state) => {
    return state.columns4
        .filter((c) => c.selected && c.type === "attribute")
        .map(({ id }) => id);
});
export const $elements = $store.map((state) => {
    return state.columns4
        .filter((c) => c.selected && c.type === "de")
        .map(({ id }) => id);
});

export const $selectedProgram = domain.createStore<string>("");
export const $selectedStage = domain.createStore<string>("");

export const selectedProgramApi = createApi($selectedProgram, {
    set: (_, program: string) => program,
});
export const selectedStageApi = createApi($selectedStage, {
    set: (_, stage: string) => stage,
});

export const $programs = $store.map((state) => {
    return state.programs.map(({ id, name }) => {
        const a: Option = {
            value: id,
            label: name,
        };
        return a;
    });
});

export const $stages = combine(
    $store,
    $selectedProgram,
    (store, selectedProgram) => {
        const program = store.programs.find(
            ({ id }: any) => id === selectedProgram
        );
        if (program) {
            return program.programStages.map(({ id, name }: any) => {
                const a: Option = {
                    value: id,
                    label: name,
                };
                return a;
            });
        }

        return [];
    }
);

export const $selectedAttributes = combine(
    $store,
    $selectedProgram,
    (store, selectedProgram) => {
        const program = store.programs.find(
            ({ id }: any) => id === selectedProgram
        );
        if (program) {
            return program.programTrackedEntityAttributes.map(
                ({ trackedEntityAttribute }: any) => {
                    const display = trackedEntityAttribute.name;
                    const id = trackedEntityAttribute.id;
                    return {
                        id,
                        display,
                        selected: true,
                    } as Column;
                }
            );
        }

        return [];
    }
);

export const $selectedDataElements = combine(
    $store,
    $selectedProgram,
    $selectedStage,
    (store, selectedProgram, selectedStage) => {
        const program = store.programs.find(
            ({ id }: any) => id === selectedProgram
        );
        if (program) {
            const stage = program.programStages.find(
                ({ id }: any) => id === selectedStage
            );

            if (stage) {
                return stage.programStageDataElements.map(
                    ({ dataElement }: any) => {
                        const display = dataElement.name;
                        const id = dataElement.id;
                        return {
                            id,
                            display,
                            selected: true,
                        } as Column;
                    }
                );
            }
        }

        return [];
    }
);
export const $columns4 = $store.map((state) => {
    return state.columns4.filter((c) => c.selected);
});
export const $columns3 = $store.map((state) => {
    return state.columns3.filter((c) => c.selected);
});

export const $isChecked = $store.map((state) => {
    return every(state.columns.map((c) => c.selected));
});

export const $financialQuarter = $store.map((state) => {
    if (!state.period) return null;
    const computation = calculateQuarter(
        state.period.year(),
        1
        // state.period.quarter()
    );
    return computation;
});

export const $withOptions = domain.createStore<Dictionary<Dictionary<string>>>(
    {}
);

export const withOptionsApi = createApi($withOptions, {
    set: (_, value: Dictionary<Dictionary<string>>) => value,
});
