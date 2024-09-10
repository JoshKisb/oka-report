import {
    Button,
    Checkbox,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    List,
    ListItem,
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { TreeSelect } from "antd";
import { GroupBase, Select } from "chakra-react-select";
import { useStore } from "effector-react";
import { saveAs } from "file-saver";
import { flatten, fromPairs, uniq, uniqBy } from "lodash";
import { ChangeEvent, useEffect, useRef } from "react";
import { MdFileDownload, MdFilterList } from "react-icons/md";
import XLSX from "xlsx";
import { Column, Option } from "../../interfaces";
import {
    addRemoveColumn4,
    setColumn4,
    setSelectedOrgUnits,
    setUserOrgUnits,
    toggleColumns4,
} from "../../store/Events";
import { api } from "../../store/Queries";
import {
    $attributes,
    $columns4,
    $elements,
    $isChecked,
    $programs,
    $selectedAttributes,
    $selectedDataElements,
    $selectedProgram,
    $selectedStage,
    $stages,
    $store,
    $withOptions,
    selectedProgramApi,
    selectedStageApi,
} from "../../store/Stores";

function s2ab(s: any) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
}

const createQuery = (parent: any) => {
    return {
        organisations: {
            resource: `organisationUnits.json`,
            params: {
                filter: `id:in:[${parent.id}]`,
                // paging: "false",
                skipPaging: "true",
                order: "shortName:desc",
                fields: "children[id,name,path,leaf]",
            },
        },
    };
};

const VSLALineFilter = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: modalIsOpen,
        onOpen: modalOnOpen,
        onClose: modalOnClose,
    } = useDisclosure();
    const store = useStore($store);
    const stages = useStore($stages);
    const programs = useStore($programs);
    const btnRef = useRef<any>();
    const engine = useDataEngine();
    const isChecked = useStore($isChecked);
    const selectedProgram = useStore($selectedProgram);
    const selectedStage = useStore($selectedStage);
    const columns4 = useStore($columns4);
    const withOptions = useStore($withOptions);
    const attributes = useStore($attributes);

    const elements = useStore($elements);
    const allColumns = fromPairs(
        columns4.map(({ id, display }) => [id, display])
    );

    const loadOrganisationUnitsChildren = async (parent: any) => {
        try {
            const {
                organisations: { organisationUnits },
            }: any = await engine.query(createQuery(parent));
            const found = organisationUnits.map((unit: any) => {
                return unit.children
                    .map((child: any) => {
                        return {
                            id: child.id,
                            pId: parent.id,
                            value: child.id,
                            title: child.name,
                            isLeaf: child.leaf,
                        };
                    })
                    .sort((a: any, b: any) => {
                        if (a.title > b.title) {
                            return 1;
                        }
                        if (a.title < b.title) {
                            return -1;
                        }
                        return 0;
                    });
            });
            const all = flatten(found);
            setUserOrgUnits([...store.userOrgUnits, ...all]);
        } catch (e) {
            console.log(e);
        }
    };

    const download = async () => {
        let must: any[] = [
            {
                bool: {
                    should: [
                        {
                            terms: {
                                ["level1.keyword"]: store.selectedOrgUnits,
                            },
                        },
                        {
                            terms: {
                                ["level2.keyword"]: store.selectedOrgUnits,
                            },
                        },
                        {
                            terms: {
                                ["level3.keyword"]: store.selectedOrgUnits,
                            },
                        },
                        {
                            terms: {
                                ["level4.keyword"]: store.selectedOrgUnits,
                            },
                        },
                        {
                            terms: {
                                ["level5.keyword"]: store.selectedOrgUnits,
                            },
                        },
                    ],
                },
            },
            {
                exists: {
                    field: "eventDate",
                },
            },
            {
                term: {
                    deleted: false,
                },
            },
            {
                range: {
                    eventDate: {
                        gte: "2022-07-01",
                        lte: "2023-06-30",
                    },
                },
            },
        ];
        let {
            data: { rows: allRows, columns, cursor: currentCursor },
        } = await api.post("sql", {
            query: `select ${elements.join(
                ","
            )} from ${selectedStage.toLowerCase()}`,
            fetch_size: 500,
            field_multi_value_leniency: true,
            filter: {
                bool: {
                    must,
                },
            },
        });
        let availableRows = allRows.map((r: any) => {
            return fromPairs(
                columns.map((c: any, i: number) => [c.name, r[i]])
            );
        });

        const instances = uniq(
            availableRows.map((d: any) => d.trackedEntityInstance)
        );
        const query2 = {
            query: `select ${attributes.join(
                ","
            )} from ${selectedProgram.toLowerCase()}`,
            filter: {
                terms: {
                    [`trackedEntityInstance.keyword`]: instances,
                },
            },
        };

        const {
            data: { columns: columns1, rows: rows1 },
        } = await api.post("sql", query2);

        const results = fromPairs<Object>(
            rows1
                .map((r: any) => {
                    return fromPairs(
                        columns1.map((c: any, i: number) => [c.name, r[i]])
                    );
                })
                .map(({ trackedEntityInstance, ...rest }: any) => {
                    return [trackedEntityInstance, rest];
                })
        );

        availableRows = availableRows.map((d: any) => {
            return {
                ...d,
                ...results[d.trackedEntityInstance],
            };
        });

        if (currentCursor) {
            do {
                let {
                    data: { rows, cursor },
                } = await api.post("sql", { cursor: currentCursor });

                let currentRows = rows.map((r: any) => {
                    return fromPairs(
                        columns.map((c: any, i: number) => [c.name, r[i]])
                    );
                });

                const instances = uniq(
                    currentRows.map((d: any) => d.trackedEntityInstance)
                );
                const query2 = {
                    query: `select  ${attributes.join(
                        ","
                    )} from ${selectedProgram.toLowerCase()}`,
                    filter: {
                        terms: {
                            [`trackedEntityInstance.keyword`]: instances,
                        },
                    },
                };

                const {
                    data: { columns: columns1, rows: rows1 },
                } = await api.post("sql", query2);

                const results = fromPairs<Object>(
                    rows1
                        .map((r: any) => {
                            return fromPairs(
                                columns1.map((c: any, i: number) => [
                                    c.name,
                                    r[i],
                                ])
                            );
                        })
                        .map(({ trackedEntityInstance, ...rest }: any) => {
                            return [trackedEntityInstance, rest];
                        })
                );

                currentRows = currentRows.map((d: any) => {
                    return {
                        ...d,
                        ...results[d.trackedEntityInstance],
                    };
                });
                availableRows = availableRows.concat(currentRows);
                currentCursor = cursor;
            } while (!!currentCursor);
        }

        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "SheetJS Tutorial",
            Subject: "Test",
            Author: "Red Stapler",
            CreatedDate: new Date(),
        };

        wb.SheetNames.push("Listing");
        let ws = XLSX.utils.json_to_sheet(
            availableRows.map((d: any) => {
                return fromPairs(
                    Object.entries(d).map(([key, value]) => {
                        const realValue =
                            withOptions[key]?.[value as any] || value;
                        return [allColumns[key] || key, realValue];
                    })
                );
            })
        );
        wb.Sheets["Listing"] = ws;
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
        saveAs(
            new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
            "export.xlsx"
        );
        modalOnClose();
    };

    const findColumns = () => {
        let columns: Column[] = [];
        const program = store.programs.find(
            ({ id }: any) => id === selectedProgram
        );
        if (program) {
            columns = [
                ...columns,
                ...program.programTrackedEntityAttributes.map(
                    ({ trackedEntityAttribute }: any) => {
                        const display = trackedEntityAttribute.name;
                        const id = trackedEntityAttribute.id;
                        return {
                            id,
                            display,
                            selected: true,
                            type: "attribute",
                        } as Column;
                    }
                ),
                {
                    display: "trackedEntityInstance",
                    selected: true,
                    id: "trackedEntityInstance",
                    type: "attribute",
                },
                {
                    display: "enrollmentDate",
                    selected: true,
                    id: "enrollmentDate",
                    type: "attribute",
                },
                {
                    display: "incidentDate",
                    selected: true,
                    id: "incidentDate",
                    type: "attribute",
                },
                {
                    display: "District",
                    id: "district",
                    selected: true,
                    type: "attribute",
                },
                {
                    display: "Sub-county",
                    id: "subCounty",
                    selected: true,
                    type: "attribute",
                },
                {
                    display: "Parish",
                    id: "orgUnitName",
                    selected: true,
                    type: "attribute",
                },
            ];
            const stage = program.programStages.find(
                ({ id }: any) => id === selectedStage
            );

            if (stage) {
                columns = [
                    ...columns,
                    {
                        display: "trackedEntityInstance",
                        id: "trackedEntityInstance",
                        selected: true,
                        type: "de",
                    },
                    {
                        display: "id",
                        id: "id",
                        selected: true,
                        type: "de",
                    },
                    {
                        display: "event",
                        id: "event",
                        selected: true,
                        type: "de",
                    },
                    {
                        display: "eventDate",
                        id: "eventDate",
                        selected: true,
                        type: "de",
                    },
                    {
                        display: "dueDate",
                        id: "dueDate",
                        selected: true,
                        type: "de",
                    },
                    ...stage.programStageDataElements
                        .map(({ dataElement }: any) => {
                            const display = dataElement.name;
                            const id = dataElement.id;
                            return {
                                id,
                                display,
                                selected: true,
                                type: "de",
                            } as Column;
                        })
                        .filter(({ id }: Column) => id !== "RmeBuTeLsfg"),
                ];
            }
        }
        return columns;
    };

    useEffect(() => {
        if (stages.length > 0) {
            const stage = stages[0];
            selectedStageApi.set(stage.value);
            setColumn4(findColumns());
        }
    }, [selectedProgram]);
    useEffect(() => {
        selectedStageApi.set(selectedStage);
        setColumn4(findColumns());
    }, [selectedStage]);

    return (
        <Stack direction="row" spacing="30px" alignItems="center" w="100%">
            <Stack direction="row" flex={1} alignItems="center">
                <Text>Program</Text>
                <Stack zIndex={10000} flex={1}>
                    <Select<Option, false, GroupBase<Option>>
                        options={programs}
                        isClearable
                        value={programs.find(
                            ({ value }) => value === selectedProgram
                        )}
                        onChange={(value) => {
                            selectedProgramApi.set(value?.value || "");
                        }}
                    />
                </Stack>
            </Stack>
            <Stack direction="row" flex={1} alignItems="center">
                <Text>Program Stage</Text>
                <Stack zIndex={10000} flex={1}>
                    <Select<Option, false, GroupBase<Option>>
                        options={stages}
                        isClearable
                        value={stages.find(
                            (d: any) => d.value === selectedStage
                        )}
                        onChange={(e) => {
                            selectedStageApi.set(e?.value || "");
                        }}
                    />
                </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" flex={1}>
                <Text>Select Organisation:</Text>
                <TreeSelect
                    allowClear={true}
                    treeDataSimpleMode
                    style={{
                        flex: 1,
                    }}
                    multiple
                    value={store.selectedOrgUnits}
                    dropdownStyle={{ height: 200, overflow: "scroll" }}
                    placeholder="Please select Organisation Unit(s)"
                    onChange={(value) => {
                        setSelectedOrgUnits(value);
                    }}
                    loadData={loadOrganisationUnitsChildren}
                    treeData={store.userOrgUnits}
                />
            </Stack>
            <Stack
                direction="row"
                spacing={4}
                flex={1}
                justifyContent="flex-end"
            >
                <Button
                    leftIcon={<MdFilterList />}
                    colorScheme="blue"
                    size="sm"
                    onClick={onOpen}
                >
                    Show columns
                </Button>
                <Button
                    rightIcon={<MdFileDownload />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        modalOnOpen();
                        download();
                    }}
                >
                    Download
                </Button>
                <Modal isOpen={modalIsOpen} onClose={modalOnClose} isCentered>
                    <ModalOverlay />
                    <ModalContent bg="none" boxShadow="none" textColor="white">
                        <ModalBody
                            display="flex"
                            alignItems="center"
                            alignContent="center"
                            justifyItems="center"
                            justifyContent="center"
                            boxShadow="none"
                        >
                            <Text fontSize="xl">Downloading...</Text>
                        </ModalBody>
                    </ModalContent>
                </Modal>
                <Drawer
                    size="sm"
                    isOpen={isOpen}
                    placement="right"
                    onClose={onClose}
                    finalFocusRef={btnRef}
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>
                            <Checkbox
                                isChecked={isChecked}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    toggleColumns4(e.target.checked)
                                }
                            >
                                Choose Columns
                            </Checkbox>
                        </DrawerHeader>
                        <DrawerBody>
                            <List spacing={3}>
                                {uniqBy(store.columns4, "id").map((c: any) => (
                                    <ListItem key={c.display}>
                                        <Checkbox
                                            isChecked={c.selected}
                                            isDisabled={
                                                [
                                                    "trackedEntityInstance",
                                                    "id",
                                                    "event",
                                                ].indexOf(c.id) !== -1
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                addRemoveColumn4({
                                                    value: e.target.checked,
                                                    id: c.id,
                                                })
                                            }
                                        >
                                            {c.display}
                                        </Checkbox>
                                    </ListItem>
                                ))}
                            </List>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </Stack>
        </Stack>
    );
};

export default VSLALineFilter;
