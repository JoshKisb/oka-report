import {
    Button,
    Checkbox,
    CircularProgress,
    CircularProgressLabel,
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
    Spacer,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { DatePicker, Input, TreeSelect } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useStore } from "effector-react";
import { saveAs } from "file-saver";
import { flatten } from "lodash";
import moment from "moment";
import { ChangeEvent, useRef, useState } from "react";
import { MdFileDownload, MdFilterList } from "react-icons/md";
import XLSX from "xlsx";
import {
    addRemoveColumn,
    changeCode,
    changePeriod,
    setSelectedOrgUnits,
    setUserOrgUnits,
    toggleColumns,
} from "../../store/Events";
import {
    fetchGroupActivities4Instances,
    fetchRelationships4Instances,
    fetchUnits4Instances,
    processInstances,
} from "../../store/Queries";
import { $columns, $isChecked, $store } from "../../store/Stores";

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
                paging: "false",
                order: "shortName:desc",
                fields: "children[id,name,path,leaf]",
            },
        },
    };
};

const OldDataSetLayerFilter = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [progress, setProgress] = useState<number>(0);
    const [code, setCode] = useState<string>("");
    const {
        isOpen: modalIsOpen,
        onOpen: modalOnOpen,
        onClose: modalOnClose,
    } = useDisclosure();
    const store = useStore($store);
    const btnRef = useRef<any>();
    const engine = useDataEngine();
    const columns = useStore($columns);
    const isChecked = useStore($isChecked);
    const previousQuarter = store.period.subtract(1, "quarter");
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
        const trackedEntitiesQuery = {
            results: {
                resource: "trackedEntityInstances",
                params: {
                    ouMode: "DESCENDANTS",
                    ou: store.selectedOrgUnits.join(";"),
                    fields: ["*"],
                    program: store.selectedProgram,
                    page: 1,
                    totalPages: true,
                    pageSize: 250,
                },
            },
        };

        const {
            results: {
                trackedEntityInstances,
                pager: { pageCount },
            },
        }: any = await engine.query(trackedEntitiesQuery);

        const filteredInstances = trackedEntityInstances.filter(
            (instance: any) =>
                instance.inactive === false && instance.deleted === false
        );

        const indexCases = await fetchRelationships4Instances(
            engine,
            filteredInstances,
            store.selectedOrgUnits.join(";")
        );
        const processedUnits = await fetchUnits4Instances(
            engine,
            filteredInstances
        );
        const groupActivities = await fetchGroupActivities4Instances(
            engine,
            filteredInstances,
            store.selectedOrgUnits.join(";")
        );

        const servedPreviousQuarter = processInstances(
            store.selectedProgram,
            filteredInstances,
            previousQuarter,
            store.sessions,
            indexCases,
            processedUnits,
            {
                rows: [],
                sessionNameIndex: 1,
                participantIndex: 2,
                sessionDateIndex: 3,
            },
            {}
        );
        const processedData = processInstances(
            store.selectedProgram,
            filteredInstances,
            store.period,
            store.sessions,
            indexCases,
            processedUnits,
            groupActivities,
            servedPreviousQuarter
        );
        let changedColumnData = Object.values(processedData).map((d: any) => {
            return columns.map((c) => d[c.id] || "");
        });
        setProgress(progress + (1 / pageCount) * 100);
        if (pageCount > 1) {
            for (let page = 2; page <= pageCount; page++) {
                const newQuery = {
                    results: {
                        resource: "trackedEntityInstances",
                        params: {
                            ouMode: "DESCENDANTS",
                            ou: store.selectedOrgUnits.join(";"),
                            fields: ["*"],
                            program: store.selectedProgram,
                            page,
                            pageSize: 250,
                        },
                    },
                };
                const {
                    results: { trackedEntityInstances },
                }: any = await engine.query(newQuery);
                const filteredInstances = trackedEntityInstances.filter(
                    (instance: any) =>
                        instance.inactive === false &&
                        instance.deleted === false
                );

                const indexCases = await fetchRelationships4Instances(
                    engine,
                    filteredInstances,
                    store.selectedOrgUnits.join(";")
                );
                const processedUnits = await fetchUnits4Instances(
                    engine,
                    filteredInstances
                );
                const groupActivities = await fetchGroupActivities4Instances(
                    engine,
                    filteredInstances,
                    store.selectedOrgUnits.join(";")
                );
                const servedPreviousQuarter = processInstances(
                    store.selectedProgram,
                    filteredInstances,
                    previousQuarter,
                    store.sessions,
                    indexCases,
                    processedUnits,
                    {
                        rows: [],
                        sessionNameIndex: 1,
                        participantIndex: 2,
                        sessionDateIndex: 3,
                    },
                    {}
                );
                const processedData = processInstances(
                    store.selectedProgram,
                    filteredInstances,
                    store.period,
                    store.sessions,
                    indexCases,
                    processedUnits,
                    groupActivities,
                    servedPreviousQuarter
                );
                let allData = Object.values(processedData).map((d: any) => {
                    return columns.map((c) => d[c.id] || "");
                });
                changedColumnData = [...changedColumnData, ...allData];
                setProgress(progress + (page / pageCount) * 100);
            }
        }

        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "SheetJS Tutorial",
            Subject: "Test",
            Author: "Red Stapler",
            CreatedDate: new Date(),
        };

        wb.SheetNames.push("Listing");

        let ws = XLSX.utils.aoa_to_sheet([
            columns.map((c) => c.display),
            ...changedColumnData,
        ]);
        wb.Sheets["Listing"] = ws;

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
        saveAs(
            new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
            "export.xlsx"
        );
        setProgress(0);
        modalOnClose();
    };

    return (
        <Stack direction="row" spacing="30px">
            <Stack direction="row" alignItems="center">
                <Text>Select Organisation:</Text>
                <TreeSelect
                    allowClear={true}
                    treeDataSimpleMode
                    style={{
                        width: "350px",
                    }}
                    // listHeight={700}
                    multiple
                    value={store.selectedOrgUnits}
                    dropdownStyle={{ height: 200, overflow: "scroll" }}
                    placeholder="Please select Organisation Unit(s)"
                    onChange={(value) => setSelectedOrgUnits(value)}
                    loadData={loadOrganisationUnitsChildren}
                    treeData={store.userOrgUnits}
                />
            </Stack>
            <Stack direction="row" alignItems="center">
                <Text>Quarter:</Text>
                <DatePicker
                    picker="quarter"
                    value={store.period}
                    onChange={(value: any) => changePeriod(value)}
                />
            </Stack>
            <Stack direction="row" alignItems="center">
                <Text>Code:</Text>
                <Input
                    value={code}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCode(e.target.value)
                    }
                />
            </Stack>
            <Button onClick={() => changeCode(code)}>Search</Button>
            <Spacer />
            <Stack direction="row" spacing={4}>
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
                            flexDirection="column"
                        >
                            <CircularProgress
                                value={progress}
                                color="green.400"
                            >
                                <CircularProgressLabel>{`${progress.toFixed(
                                    0
                                )}%`}</CircularProgressLabel>
                            </CircularProgress>
                            <Text>Downloading please wait...</Text>
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
                                    toggleColumns(e.target.checked)
                                }
                            >
                                Choose Columns
                            </Checkbox>
                        </DrawerHeader>

                        <DrawerBody>
                            <List spacing={3}>
                                {store.columns.map((c) => (
                                    <ListItem key={c.display}>
                                        <Checkbox
                                            isChecked={c.selected}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                addRemoveColumn({
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

export default OldDataSetLayerFilter;
