import {
    Button,
    Checkbox,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Input,
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
import { DatePicker, TreeSelect } from "antd";
import { useStore } from "effector-react";
import { saveAs } from "file-saver";
import { flatten, fromPairs } from "lodash";
import { ChangeEvent, useRef, useState } from "react";
import { MdFileDownload, MdFilterList } from "react-icons/md";
import XLSX from "xlsx";
import {
    addRemoveColumn3,
    changeCode,
    changePeriod,
    setSelectedOrgUnits,
    setUserOrgUnits,
    toggleColumns3,
} from "../../store/Events";
import { api } from "../../store/Queries";
import { $columns3, $isChecked, $store } from "../../store/Stores";

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

const ComprehensiveLayerFilter = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [code, setCode] = useState<string>("");

    const {
        isOpen: modalIsOpen,
        onOpen: modalOnOpen,
        onClose: modalOnClose,
    } = useDisclosure();
    const store = useStore($store);
    const btnRef = useRef<any>();
    const engine = useDataEngine();
    const filteredColumns = useStore($columns3);
    const isChecked = useStore($isChecked);

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
                term: {
                    ["qtr.keyword"]: store.period.format("YYYY[Q]Q"),
                },
            },
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
                terms: {
                    "bFnIjGJpf9t.keyword": [
                        "1. VSLA Group",
                        "2. Sinovuyo",
                        "5. Stepping Stones",
                        "6. Other (Specify)",
                        "7. Early Childhood Development (ECD)",
                    ],
                },
            },
        ];
        if (store.code) {
            must = [
                ...must,
                {
                    match: {
                        ["ypDUCAS6juy.keyword"]: store.code,
                    },
                },
            ];
        }
        let {
            data: { rows: allRows, columns, cursor: currentCursor },
        } = await api.post("sql", {
            query: `select * from layering2`,
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
        if (currentCursor) {
            do {
                let {
                    data: { rows, cursor },
                } = await api.post("sql", { cursor: currentCursor });
                availableRows = availableRows.concat(
                    rows.map((r: any) => {
                        return fromPairs(
                            columns.map((c: any, i: number) => [c.name, r[i]])
                        );
                    })
                );
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
        let ws = XLSX.utils.aoa_to_sheet([
            filteredColumns.map((c: any) => c.display),
            ...availableRows.map((r: any) =>
                filteredColumns.map((c: any) => r[c.id])
            ),
        ]);
        wb.Sheets["Listing"] = ws;

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
        saveAs(
            new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
            "export.xlsx"
        );
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
                                    toggleColumns3(e.target.checked)
                                }
                            >
                                Choose Columns
                            </Checkbox>
                        </DrawerHeader>
                        <DrawerBody>
                            <List spacing={3}>
                                {store.columns3.map((c) => (
                                    <ListItem key={c.display}>
                                        <Checkbox
                                            isChecked={c.selected}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                addRemoveColumn3({
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

export default ComprehensiveLayerFilter;
