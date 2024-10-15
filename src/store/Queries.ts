import { Column, DistrictOption } from "./../interfaces";
import { useDataEngine } from "@dhis2/app-runtime";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import dayjs, { Dayjs } from "dayjs";

import {
    differenceInMonths,
    differenceInYears,
    isBefore,
    isWithinInterval,
    parseISO,
} from "date-fns";
import {
    every,
    fromPairs,
    groupBy,
    has,
    max,
    maxBy,
    sortBy,
    sum,
    times,
    uniq,
} from "lodash";
import moment from "moment";
import axios from "axios";
import { useQuery } from "react-query";
const kampalaDivisions = [
    { label: "CENTRAL", value: "QT7n2EnRLbh" },
    { label: "KAWEMPE", value: "y1j39xhbozk" },
    { label: "MAKINDYE", value: "eoEtIOqm90L" },
    { label: "NAKAWA", value: "I6oe4U5UT5d" },
    { label: "RUBAGA", value: "CSJ23GHbZAo" },
];
import {
    changeTotal,
    setColumn4,
    setCurrentProgram,
    setCurrentStage,
    setDistricts,
    setPrograms,
    setSelectedOrgUnits,
    setSessions,
    setSubCounties,
    setUserOrgUnits,
} from "./Events";
import {
    calculateQuarter,
    findQuarters,
    indicatorReportQueries,
    ovcTrackerIndicators,
    ovcTrackerPreventionIndicators,
} from "./utils";
import { Option } from "../interfaces";
import { districts, indicatorReportColumns } from "./Constants";
import { selectedProgramApi, selectedStageApi, withOptionsApi } from "./Stores";

dayjs.extend(quarterOfYear);

const computePercentage = (numerator: number, denominator: number) => {
    if (denominator !== 0) {
        return numerator / denominator;
    }
    return 0;
};

const risks: { [key: string]: string } = {
    "Child of Non suppressed HIV+ Caregiver": "Child of HIV+ Caregiver",
    "Child of suppressed HIV+ Caregiver": "Child of HIV+ Caregiver",
    "Adolescent (9-14 yrs)": "Siblings of Index Child",
    "Malnourished (0-5 Yrs)": "Siblings of Index Child",
};

export const api = axios.create({
    baseURL: "https://ovckla.org/layer/api/wal",
    // baseURL: "https://data.icyd.hispuganda.org/api/wal/",
    // baseURL: "http://localhost:3030/",
});

export const serverapi = axios.create({
    baseURL: "https://ovckla.org/server-api",
})

const prevConditions = [
    {
        term: {
            "Completed MOH Journeys": 1,
        },
    },
    {
        term: {
            "Completed NMN Boys": 1,
        },
    },
    {
        term: {
            "Completed NMN Boys New Curriculum": 1,
        },
    },
    {
        term: {
            "Completed NMN Girls": 1,
        },
    },
];
const processRows = (ind: string, rows: any[][]) => {
    return fromPairs(
        rows.map((row: string[]) => [
            `${ind}${row.slice(0, -1).join("")}`,
            Number(row[row.length - 1]),
        ])
    );
};

const convertIndicators = (
    fromIndicators: string[],
    toIndicators: string[],
    quarters: string[],
    data: any
) => {
    let results = {};
    quarters.forEach((quarter) => {
        fromIndicators.forEach((indicator, index) => {
            const value = data[`${indicator}${quarter}`] || 0;
            const toIndicator = toIndicators[index];
            results = { ...results, [`${toIndicator}${quarter}`]: value };
        });
    });

    return results;
};
const getTotal = (ind: string, rows: any[][]) => {
    if (rows.length > 0) {
        const first = rows[0];
        if (first.length === 4) {
            return fromPairs(
                Object.entries(
                    groupBy(
                        rows,
                        (row) => `${row[row.length - 3]}${row[row.length - 2]}`
                    )
                ).map(([key, value]) => {
                    return [
                        `${ind}totals${key}`,
                        sum(value.map((vrow) => vrow[vrow.length - 1])),
                    ];
                })
            );
        }

        if (first.length === 3) {
            return fromPairs(
                Object.entries(groupBy(rows, (row) => row[row.length - 2])).map(
                    ([key, value]) => {
                        return [
                            `${ind}totals${key}`,
                            sum(value.map((vrow) => vrow[vrow.length - 1])),
                        ];
                    }
                )
            );
        }
        return {
            [`${ind}totals`]: sum(rows.map((row) => row[row.length - 1])),
        };
    }
    return {};
};

let realColumns: any[] = [];

const findAgeGroup = (age: number) => {
    if (age <= 0) {
        return "< 1";
    }

    if (age > 0 && age <= 4) {
        return "1 - 4";
    }
    if (age > 4 && age <= 9) {
        return "5 - 9";
    }
    if (age > 9 && age <= 14) {
        return "10 - 14";
    }
    if (age > 14 && age <= 17) {
        return "15 - 17";
    }
    if (age > 17 && age <= 20) {
        return "18 - 20";
    }
    if (age > 20 && age <= 24) {
        return "21 - 24";
    }
    if (age >= 25) {
        return "25+";
    }
};
const mapping: any = {
    "MOE Journeys Plus": "Completed MOE Journeys Plus",
    "MOH Journeys curriculum": "Completed MOH Journeys",
    "No means No sessions (Boys)": "Completed NMN Boys",
    "No means No sessions (Girls)": "Completed NMN Girls",
    "No means No sessions (Boys) New Curriculum":
        "Completed NMN Boys New Curriculum",

    SINOVUYO: "Completed SINOVUYO",
    ECD: "Completed ECD",
    "Saving and Borrowing": "Completed Saving and Borrowing",
    "SPM Training": "Completed SPM Training",
    "Financial Literacy": "Completed Financial Literacy",
    "VSLA Methodology": "Completed VSLA Methodology",
};
const mapping2: any = {
    "MOE Journeys Plus": 18,
    "MOH Journeys curriculum": 22,
    "No means No sessions (Boys)": 4,
    "No means No sessions (Girls)": 4,
    "No means No sessions (Boys) New Curriculum": 8,
    SINOVUYO: 14,

    ECD: 8,
    "Saving and Borrowing": 6,
    "SPM Training": 5,
    "Financial Literacy": 4,
    "VSLA Methodology": 7,
};

const hadASession = (
    allSessions: string[][],
    participantIndex: number,
    sessionNameIndex: number,
    sessionDateIndex: number,
    participant: string,
    startDate: Date,
    endDate: Date,
    sessions: string[]
) => {
    return !!allSessions.find((row: string[]) => {
        return (
            row[participantIndex] === participant &&
            sessions.indexOf(row[sessionNameIndex]) !== -1 &&
            isWithinInterval(parseISO(row[sessionDateIndex]), {
                start: startDate,
                end: endDate,
            })
        );
    });
};

const fetchTargets = async (
    engine: any,
    dataElements: string[],
    organisationUnits: string[],
    periods: string[]
) => {
    const query = `analytics.json?dimension=dx:${dataElements.join(
        ";"
    )}&dimension=ou:${organisationUnits.join(";")}&filter=pe:${periods.join(
        ";"
    )}&skipRounding=true&skipMeta=true`;

    const { analytics } = await engine.query({
        analytics: {
            resource: query,
        },
    });
    return analytics;
};

const fetchTargets2 = async (
    engine: any,
    dataElements: string[],
    organisationUnits: string[],
    periods: string[]
) => {
    const query = `analytics.json?dimension=dx:${dataElements.join(
        ";"
    )}&filter=ou:${organisationUnits.join(";")}&dimension=pe:${periods.join(
        ";"
    )}&skipRounding=true&skipMeta=true`;

    const { analytics } = await engine.query({
        analytics: {
            resource: query,
        },
    });
    return analytics;
};

const hasCompleted = (
    allSessions: string[][],
    participantIndex: number,
    sessionNameIndex: number,
    sessionDateIndex: number,
    participant: string,
    endDate: Date,
    sessions: string[],
    value: number
) => {
    const doneSessions = allSessions
        .filter((row: string[]) => {
            return (
                row[participantIndex] === participant &&
                sessions.indexOf(row[sessionNameIndex]) !== -1 &&
                parseISO(row[sessionDateIndex]).getTime() <= endDate.getTime()
            );
        })
        .map((row: string[]) => row[sessionNameIndex]);
    return doneSessions.length >= value;
};

const hasCompletedWithin = (
    allSessions: string[][],
    participantIndex: number,
    sessionNameIndex: number,
    sessionDateIndex: number,
    participant: string,
    startDate: Date,
    endDate: Date,
    sessions: string[],
    value: number
) => {
    const doneSessions = allSessions
        .filter((row: string[]) => {
            return (
                row[participantIndex] === participant &&
                sessions.indexOf(row[sessionNameIndex]) !== -1 &&
                isWithinInterval(parseISO(row[sessionDateIndex]), {
                    start: startDate,
                    end: endDate,
                })
            );
        })
        .map((row: string[]) => row[sessionNameIndex]);

    return doneSessions.length >= value;
};

const isAtSchool = (
    age: number,
    homeVisitValue: string,
    enrollmentValue: string
) => {
    if (age >= 6 && age <= 17) {
        if (homeVisitValue) {
            return homeVisitValue;
        }

        if (enrollmentValue === "Yes") {
            return "No";
        }
        if (enrollmentValue === "No") {
            return "Yes";
        }
    } else if (enrollmentValue) {
        if (enrollmentValue === "Yes") {
            return "No";
        }
        if (enrollmentValue === "No") {
            return "Yes";
        }
    }
    return "NA";
};

const mostCurrentEvent = (events: any[]) => {
    return maxBy(events, "eventDate");
};

const eventsBeforePeriod = (events: any[], programStage: string, end: Date) => {
    return events.filter((e: any) => {
        return (
            e.programStage === programStage &&
            isBefore(parseISO(e.eventDate), end)
        );
    });
};

const eventsWithinPeriod = (
    events: any[],
    programStage: string,
    start: Date,
    end: Date
) => {
    return events.filter((e: any) => {
        return (
            e.eventDate &&
            e.programStage === programStage &&
            isWithinInterval(parseISO(e.eventDate), { start, end })
        );
    });
};

const findAnyEventValue = (events: any[], dataElement: string) => {
    const sortedEvents = sortBy(events, (e: any) => e.eventDate).reverse();
    const event = sortedEvents.find(
        ({ [dataElement]: de }: any) => de !== null && de !== undefined
    );
    if (event) {
        return event[dataElement];
    }
    return null;
};

const allValues4DataElement = (
    events: any[],
    dataElement: string,
    value: string
) => {
    if (events.length > 0) {
        return events.every((e: any) => e[dataElement] === value);
    }

    return true;
};

const anyEventWithDataElement = (
    events: any[],
    dataElement: string,
    value: string
) => {
    if (events.length === 0) {
        return false;
    }
    const processed = events.find((event: any) => {
        return event[dataElement] === value;
    });
    return !!processed;
};
const anyEventWithDE = (events: any[], dataElement: string) => {
    if (events.length === 0) {
        return false;
    }
    const processed = events.find((event) => {
        return has(event, dataElement);
    });
    return !!processed;
};

const anyEventWithAnyOfTheValue = (
    events: any[],
    dataElement: string,
    values: string[]
) => {
    const processed = events.find((event: any) => {
        return values.indexOf(event[dataElement]) !== -1;
    });
    if (processed) {
        return true;
    }
    return false;
};

const specificDataElement = (event: any | undefined, dataElement: string) => {
    if (event) {
        return event[dataElement];
    }
    return null;
};

const hasAYes = (event: any | undefined, dataElements: string[]) => {
    if (event) {
        const de = dataElements.map((de: string) => !!event[de]);
        return de.includes(true);
    }
    return false;
};

const allHaveValue = (
    event: any | undefined,
    dataElements: string[],
    value: any
) => {
    if (event) {
        const de = dataElements
            .map((de: string) => event[de])
            .filter((v) => v !== undefined);
        const result =
            every(de, (v) => v === value) && de.length === dataElements.length;
        return result;
    }
    return false;
};

const checkRiskAssessment = (
    event: any | undefined,
    dataElements: string[],
    value?: any
) => {
    if (event) {
        const de = dataElements
            .map((de: string) => event[de])
            .filter((v) => v !== undefined);
        if (de.length === 0) {
            return 0;
        }
        if (de.length < dataElements.length) {
            if (value && every(de, (v) => v === value)) {
                return 3;
            } else if (value && de.indexOf(value) !== -1) {
                return 2;
            }
            return 1;
        }
        if (de.length === dataElements.length) {
            if (value && every(de, (v) => v === value)) {
                return 6;
            } else if (value && de.indexOf(value) !== -1) {
                return 5;
            }
            return 4;
        }
    }
    return -1;
};

const hasDataElementWithinPeriod = (
    events: any[],
    dataElement: string,
    value: string
) => {
    return !!events.find((e: any) => e[dataElement] === value);
};

const deHasAnyValue = (de: any, values: string[]) => {
    if (de && values.indexOf(de) !== -1) {
        return 1;
    }
    return 0;
};

export function useLoader() {
    const engine = useDataEngine();
    const query = {
        me: {
            resource: "me.json",
            params: {
                fields: "dataViewOrganisationUnits[id,name,leaf,level,parent[id,name],children[id,name]]",
            },
        },
        relationships: {
            resource: "relationshipTypes",
            params: {
                pageSize: 5,
                fields: ["id", "displayName", "toConstraint", "fromConstraint"],
            },
        },

        MOE: {
            resource: "optionGroups/HkuYbbefaEM",
            params: {
                fields: "options[code]",
            },
        },
        MOH: {
            resource: "optionGroups/P4tTIlhX1yB",
            params: {
                fields: "options[code]",
            },
        },
        Boys: {
            resource: "optionGroups/WuPXlmvSfVJ",
            params: {
                fields: "options[code]",
            },
        },
        BoysNew: {
            resource: "optionGroups/TIObJloCVdC",
            params: {
                fields: "options[code]",
            },
        },
        Girls: {
            resource: "optionGroups/okgcyLQNVFe",
            params: {
                fields: "options[code]",
            },
        },
        VSLA: {
            resource: "optionGroups/XQ3eQax0uIk",
            params: {
                fields: "options[code]",
            },
        },
        VSLATOT: {
            resource: "optionGroups/qEium1Lrsc0",
            params: {
                fields: "options[code]",
            },
        },
        Financial: {
            resource: "optionGroups/LUR9gZUkcrr",
            params: {
                fields: "options[code]",
            },
        },
        SPM: {
            resource: "optionGroups/EYMKGdEeniO",
            params: {
                fields: "options[code]",
            },
        },
        BANK: {
            resource: "optionGroups/gmEcQwHbivM",
            params: {
                fields: "options[code]",
            },
        },
        SINOVUYO: {
            resource: "optionGroups/ptI9Geufl7R",
            params: {
                fields: "options[code]",
            },
        },
        ECD: {
            resource: "optionGroups/QHaULS891IF",
            params: {
                fields: "options[code]",
            },
        },
        SAVING: {
            resource: "optionGroups/ZOAmd05j2t9",
            params: {
                fields: "options[code]",
            },
        },
        districts: {
            resource: "organisationUnits.json",
            params: {
                level: 3,
                paging: "false",
                fields: "id~rename(value),name~rename(label)",
            },
        },
        subCounties: {
            resource: "organisationUnits.json",
            params: {
                level: 4,
                paging: "false",
                fields: "id,name,parent[id,name]",
            },
        },
        programs: {
            resource: "programs",
            params: {
                fields: "id,name,programTrackedEntityAttributes[trackedEntityAttribute[id,name]],programStages[id,name,programStageDataElements[dataElement[id,name]]]",
            },
        },
        elementsWithOptions: {
            resource: "dataElements",
            params: {
                filter: "optionSetValue:eq:true",
                fields: "id,optionSet[options[name,code]]",
                paging: false,
            },
        },
        attributesWithOptions: {
            resource: "trackedEntityAttributes",
            params: {
                filter: "optionSetValue:eq:true",
                fields: "id,optionSet[options[name,code]]",
                paging: false,
            },
        },
    };
    return useQuery<any, Error>("sqlViews", async () => {
        const {
            me: { dataViewOrganisationUnits },
            relationships: { relationshipTypes },
            MOE: { options },
            MOH: { options: options1 },
            Boys: { options: options2 },
            BoysNew: { options: options12 },
            Girls: { options: options3 },
            VSLA: { options: options4 },
            VSLATOT: { options: options5 },
            Financial: { options: options6 },
            SPM: { options: options7 },
            BANK: { options: options8 },
            SINOVUYO: { options: options9 },
            ECD: { options: options10 },
            SAVING: { options: options11 },
            districts: { organisationUnits: foundDistricts },
            subCounties: { organisationUnits: counties },
            programs: { programs },
            attributesWithOptions: { trackedEntityAttributes },
            elementsWithOptions: { dataElements },
        }: any = await engine.query(query);

        const withOptions = [...trackedEntityAttributes, ...dataElements].map(
            ({
                id,
                optionSet: { options },
            }: {
                id: string;
                optionSet: { options: Array<{ code: string; name: string }> };
            }) => {
                return [
                    id,
                    fromPairs(options.map(({ code, name }) => [code, name])),
                ];
            }
        );
        const processedUnits = dataViewOrganisationUnits.map((unit: any) => {
            return {
                id: unit.id,
                pId: unit.pId || "",
                value: unit.id,
                title: unit.name,
                isLeaf: unit.leaf,
            };
        });
        const processedSubCounties = groupBy(
            counties.map(
                ({ id, name, parent: { id: pId, name: pName } }: any) => {
                    return {
                        id,
                        name,
                        parent: pId,
                        parentName: pName,
                    };
                }
            ),
            "parent"
        );
        setUserOrgUnits(processedUnits);
        setSelectedOrgUnits([dataViewOrganisationUnits[0].id]);
        setSessions({
            "MOE Journeys Plus": options.map((o: any) => o.code),
            "MOH Journeys curriculum": options1.map((o: any) => o.code),
            "No means No sessions (Boys)": options2.map((o: any) => o.code),
            "No means No sessions (Boys) New Curriculum": options12.map(
                (o: any) => o.code
            ),
            "No means No sessions (Girls)": options3.map((o: any) => o.code),
            "VSLA Methodology": options4.map((o: any) => o.code),
            "VSLA TOT": options5.map((o: any) => o.code),
            "Financial Literacy": options6.map((o: any) => o.code),
            "SPM Training": options7.map((o: any) => o.code),
            "Bank Linkages": options8.map((o: any) => o.code),
            SINOVUYO: options9.map((o: any) => o.code),
            ECD: options10.map((o: any) => o.code),
            "Saving and Borrowing": options11.map((o: any) => o.code),
        });

        const allDistricts = fromPairs<string>(
            [...foundDistricts, ...kampalaDivisions].map(
                ({ label, value }: any) => [
                    String(label).split(" ")[0].toUpperCase(),
                    value,
                ]
            )
        );
        const maxLevel = max(
            dataViewOrganisationUnits.map(({ level }: any) => level)
        );
        setDistricts(
            districts.flatMap(({ ip, district }: any) => {
                const found: DistrictOption = {
                    ip,
                    value: allDistricts[district] || "",
                    label: district,
                };
                if (maxLevel === 1) {
                    return found;
                } else if (
                    maxLevel === 2 &&
                    dataViewOrganisationUnits
                        .flatMap(({ children, id }: any) => {
                            if (id === "H3bSPcb6rqc") {
                                return [
                                    ...children.map(({ id }: any) => id),
                                    ...kampalaDivisions.map(
                                        ({ value }) => value
                                    ),
                                ];
                            }
                            return children.map(({ id }: any) => id);
                        })
                        .indexOf(found.value) !== -1
                ) {
                } else if (
                    maxLevel === 3 &&
                    dataViewOrganisationUnits
                        .flatMap(({ id }: any) => {
                            if (id === "aXmBzv61LbM") {
                                return kampalaDivisions.map(
                                    ({ value }) => value
                                );
                            }
                            return id;
                        })
                        .indexOf(found.value) !== -1
                ) {
                    return found;
                }

                return [];
            })
        );
        setSubCounties(processedSubCounties);
        setPrograms(programs);
        // const program = programs[0];
        selectedProgramApi.set("RDEklSXCD4C");
        // const stage = program.programStages[0];
        selectedStageApi.set("kKlAyGUnCML");
        withOptionsApi.set(fromPairs(withOptions));
        return true;
    });
}

export const fetchUnits4Instances = async (
    engine: any,
    trackedEntityInstances: any[]
) => {
    const orgUnits = uniq(
        trackedEntityInstances.map(({ orgUnit }: any) => orgUnit)
    );

    const {
        hierarchy: { organisationUnits },
    } = await engine.query({
        hierarchy: {
            resource: "organisationUnits.json",
            params: {
                filter: `id:in:[${orgUnits.join(",")}]`,
                fields: "id,parent[name,parent[name]]",
                paging: "false",
            },
        },
    });
    return fromPairs(
        organisationUnits.map((unit: any) => {
            return [
                unit.id,
                {
                    subCounty: unit.parent?.name,
                    district: unit.parent?.parent?.name,
                },
            ];
        })
    );
};

export const fetchRelationships4Instances = async (
    engine: any,
    trackedEntityInstances: any[],
    ou: string
) => {
    const currentData = trackedEntityInstances.map(
        ({ relationships: [relationship] }) => {
            if (relationship) {
                return relationship?.from?.trackedEntityInstance
                    .trackedEntityInstance;
            }
        }
    );
    const {
        indexes: { trackedEntityInstances: indexCases },
    } = await engine.query({
        indexes: {
            resource: "trackedEntityInstances",
            params: {
                fields: "trackedEntityInstance,attributes,enrollments[enrollmentDate,program,events[eventDate,programStage,dataValues]]",
                ou,
                ouMode: "DESCENDANTS",
                program: "HEWq6yr4cs5",
                trackedEntityInstance: uniq(currentData).join(";"),
                skipPaging: "true",
            },
        },
    });
    return fromPairs(
        indexCases.map((indexCase: any) => {
            return [indexCase.trackedEntityInstance, indexCase];
        })
    );
};

export const fetchGroupActivities4Instances = async (
    engine: any,
    trackedEntityInstances: any[],
    ou: string
) => {
    const householdMemberCodes = trackedEntityInstances.flatMap(
        ({ attributes }: any) => {
            const attribute = attributes.find(
                (a: any) => a.attribute === "HLKc2AKR9jW"
            );
            if (attribute) {
                return [attribute.value];
            }
            return [];
        }
    );

    const facilities = uniq(
        trackedEntityInstances.map(({ orgUnit }) => {
            return orgUnit;
        })
    );

    const allQueries = facilities.map((f) => {
        return [
            f,
            {
                resource: "events/query.json",
                params: {
                    orgUnit: f,
                    programStage: "VzkQBBglj3O",
                    skipPaging: "true",
                    filter: `ypDUCAS6juy:IN:${householdMemberCodes.join(";")}`,
                },
            },
        ];
    });

    const data = await engine.query(fromPairs(allQueries));

    // const sessionNameIndex = headers.findIndex(
    //   (header: any) => header.name === "n20LkH4ZBF8"
    // );
    // const participantIndex = headers.findIndex(
    //   (header: any) => header.name === "ypDUCAS6juy"
    // );
    // const sessionDateIndex = headers.findIndex(
    //   (header: any) => header.name === "eventDate"
    // );
    return {
        rows: [],
        sessionNameIndex: 1,
        participantIndex: 2,
        sessionDateIndex: 3,
    };
};

export const processPrevention = async (
    engine: any,
    trackedEntityInstances: any[],
    sessions: { [key: string]: string[] },
    period: [Date, Date]
) => {
    const orgUnits = uniq(
        trackedEntityInstances.map(({ orgUnit }: any) => orgUnit)
    );

    const {
        hierarchy: { organisationUnits: ous },
    }: any = await engine.query({
        hierarchy: {
            resource: "organisationUnits.json",
            params: {
                filter: `id:in:[${orgUnits.join(",")}]`,
                fields: "id,parent[name,parent[name]]",
                paging: "false",
            },
        },
    });

    const processedUnits = fromPairs(
        ous.map((unit: any) => {
            return [
                unit.id,
                {
                    subCounty: unit.parent?.name,
                    district: unit.parent?.parent?.name,
                },
            ];
        })
    );

    return trackedEntityInstances.flatMap(
        ({ attributes, enrollments, orgUnit }: any) => {
            const units: any = processedUnits[orgUnit];
            const [{ events, enrollmentDate, orgUnitName }] = enrollments;
            const instance = fromPairs(
                attributes.map((a: any) => [a.attribute, a.value])
            );
            const doneSessions = events
                .filter((event: any) => {
                    return (
                        event.eventDate &&
                        event.programStage === "VzkQBBglj3O" &&
                        isWithinInterval(new Date(event.eventDate), {
                            start: period[0],
                            end: period[1],
                        })
                    );
                })
                .map(({ dataValues }: any) => {
                    const code = dataValues.find(
                        ({ dataElement }: any) => dataElement === "ypDUCAS6juy"
                    );
                    const session = dataValues.find(
                        ({ dataElement }: any) => dataElement === "n20LkH4ZBF8"
                    );
                    return { session: session?.value, code: code?.value };
                });

            const subType: any = instance?.["mWyp85xIzXR"];
            const allSubTypes = String(subType).split(",");
            const completed = mapping[subType];
            const groupedSessions = groupBy(doneSessions, "code");
            return events
                .filter((event: any) => event.programStage === "aTZwDRoJnxj")
                .map((event: any) => {
                    const elements = fromPairs(
                        event.dataValues.map((dv: any) => [
                            dv.dataElement,
                            dv.value,
                        ])
                    );
                    const individualCode: any = elements.ypDUCAS6juy;
                    const participantSessions = groupedSessions[
                        individualCode
                    ]?.filter((i: any) => {
                        return (
                            sessions[allSubTypes[0]].indexOf(i.session) !== -1
                        );
                    });
                    const sess = fromPairs(
                        participantSessions?.map(({ session }: any) => [
                            session,
                            1,
                        ])
                    );
                    return {
                        event: event.event,
                        ...elements,
                        ...instance,
                        ...sess,
                        ...units,
                        parish: orgUnitName,
                        enrollmentDate,
                        [subType]: participantSessions?.length,
                        [completed]:
                            participantSessions?.length >= mapping2[subType]
                                ? 1
                                : 0,
                        completedPrevention:
                            participantSessions?.length >= mapping2[subType]
                                ? 1
                                : 0,
                    };
                });
        }
    );
};

export const processInstances = (
    program: string,
    trackedEntityInstances: any[],
    period: Dayjs,
    sessions: { [key: string]: string[] },
    indexCases: { [key: string]: any },
    processedUnits: { [key: string]: any },
    groupActivities: {
        rows: string[][];
        sessionNameIndex: number;
        participantIndex: number;
        sessionDateIndex: number;
    },
    previousData: { [key: string]: any }
) => {
    const quarterStart: Date = period.startOf("quarter").toDate();
    const quarterEnd: Date = period.endOf("quarter").toDate();
    const [financialQuarterStart, financialQuarterEnd] = calculateQuarter(
        quarterStart.getFullYear(),
        period.quarter()
    );
    const { rows, sessionNameIndex, participantIndex, sessionDateIndex } =
        groupActivities;
    const instances = trackedEntityInstances.map(
        ({
            orgUnit,
            attributes,
            trackedEntityInstance,
            relationships: [relationship],
            enrollments,
        }) => {
            const units: any = processedUnits[orgUnit];
            const [{ trackedEntityInstance: eventInstance, orgUnitName }] =
                enrollments;
            const [enrollmentDate] = enrollments
                .map((e: any) => e.enrollmentDate)
                .sort();
            const allEvents = enrollments.flatMap(({ events }: any) => {
                return events
                    .filter(({ deleted }: any) => deleted === false)
                    .map(
                        ({
                            dataValues,
                            event,
                            eventDate,
                            programStage,
                        }: any) => {
                            return {
                                event,
                                eventDate,
                                trackedEntityInstance: eventInstance,
                                programStage,
                                ...fromPairs(
                                    dataValues.map(
                                        ({ dataElement, value }: any) => [
                                            dataElement,
                                            value,
                                        ]
                                    )
                                ),
                            };
                        }
                    );
            });

            const parent =
                indexCases[
                    relationship?.from?.trackedEntityInstance
                        .trackedEntityInstance
                ];

            let child: any = fromPairs(
                attributes.map(({ attribute, value }: any) => [
                    `${program}.${attribute}`,
                    value,
                ])
            );
            child = {
                trackedEntityInstance,
                [`${program}.orgUnit`]: orgUnit,
                [`${program}.orgUnitName`]: orgUnitName,
                [`${program}.enrollmentDate`]: enrollmentDate,
                [`${program}.type`]: "Comprehensive",
                ...units,
                ...child,
            };
            if (parent) {
                const {
                    enrollments: [
                        { enrollmentDate, program: parentProgram, events },
                    ],
                } = parent;

                let event: any = null;

                if (events.length > 0) {
                    event = sortBy(events, (e) => e.eventDate).reverse()[0];
                }
                let eventDetails = {
                    [`${parentProgram}.enrollmentDate`]: enrollmentDate,
                };
                if (event) {
                    const healthExpenses = event.dataValues.find(
                        (e: any) => e.dataElement === "zbAGBW6PsGd"
                    );
                    const schoolExpenses = event.dataValues.find(
                        (e: any) => e.dataElement === "kQCB9F39zWO"
                    );
                    const foodExpenses = event.dataValues.find(
                        (e: any) => e.dataElement === "iRJUDyUBLQF"
                    );
                    const score18 = [
                        healthExpenses?.value,
                        foodExpenses?.value,
                        schoolExpenses?.value,
                    ].filter((v: any) => v !== undefined && v !== null);

                    const yeses = score18.filter(
                        (v: string) => v === "Yes"
                    ).length;
                    const noses = score18.filter(
                        (v: string) => v === "No"
                    ).length;
                    let houseHoldType = "";
                    const { programStage: parentProgramStage, eventDate } =
                        event;

                    if (score18.length === 3) {
                        if (noses === 3) {
                            houseHoldType = "Destitute";
                        } else if (yeses === 3) {
                            houseHoldType = "Ready to Grow";
                        } else if (noses >= 1) {
                            houseHoldType = "Struggling";
                        }
                    }
                    eventDetails = {
                        ...eventDetails,
                        [`${parentProgram}.${parentProgramStage}.eventDate`]:
                            eventDate,
                        houseHoldType,
                    };
                }
                child = {
                    ...child,
                    ...fromPairs(
                        parent.attributes.map(({ attribute, value }: any) => [
                            `${parentProgram}.${attribute}`,
                            value,
                        ])
                    ),
                    hasEnrollment: !!enrollmentDate,
                    ...eventDetails,
                };
            }

            const isWithin = isWithinInterval(parseISO(enrollmentDate), {
                start: quarterStart,
                end: quarterEnd,
            });

            const heiData = eventsBeforePeriod(
                allEvents,
                "KOFm3jJl7n7",
                quarterEnd
            );
            // One Year before quarter end starting octerber
            const riskAssessmentsDuringYear = eventsWithinPeriod(
                allEvents,
                "B9EI27lmQrZ",
                financialQuarterStart,
                financialQuarterEnd
            );
            const referralsDuringYear = eventsWithinPeriod(
                allEvents,
                "yz3zh5IFEZm",
                financialQuarterStart,
                financialQuarterEnd
            );

            // During Quarter

            const referralsDuringQuarter = eventsWithinPeriod(
                allEvents,
                "yz3zh5IFEZm",
                quarterStart,
                quarterEnd
            );

            const homeVisitsDuringQuarter = eventsWithinPeriod(
                allEvents,
                "HaaSLv2ur0l",
                quarterStart,
                quarterEnd
            );
            const viralLoadDuringQuarter = eventsWithinPeriod(
                allEvents,
                "kKlAyGUnCML",
                quarterStart,
                quarterEnd
            );

            const serviceProvisionDuringQuarter = eventsWithinPeriod(
                allEvents,
                "yz3zh5IFEZm",
                quarterStart,
                quarterEnd
            );
            const serviceLinkagesDuringQuarter = eventsWithinPeriod(
                allEvents,
                "SxnXrDtSJZp",
                quarterStart,
                quarterEnd
            );

            // Before or during quarter starts

            const previousReferrals = eventsBeforePeriod(
                allEvents,
                "yz3zh5IFEZm",
                quarterStart
            );

            const previousViralLoads = eventsBeforePeriod(
                allEvents,
                "yz3zh5IFEZm",
                quarterStart
            );

            const homeVisitsBe4Quarter = eventsBeforePeriod(
                allEvents,
                "HaaSLv2ur0l",
                quarterEnd
            );
            const viralLoadsBe4Quarter = eventsBeforePeriod(
                allEvents,
                "kKlAyGUnCML",
                quarterEnd
            );

            const currentRiskAssessment = mostCurrentEvent(
                riskAssessmentsDuringYear
            );
            const currentReferral = mostCurrentEvent(referralsDuringYear);
            const anyViralLoad = mostCurrentEvent(viralLoadsBe4Quarter);
            const hivResult = specificDataElement(
                currentReferral,
                "XTdRWh5MqPw"
            );

            child = {
                ...child,
                ["RDEklSXCD4C.HaaSLv2ur0l.tM67MBdox3O"]: child[
                    "RDEklSXCD4C.HaaSLv2ur0l.tM67MBdox3O"
                ]
                    ? 1
                    : 0,
                newlyEnrolled: isWithin ? "Yes" : "No",
            };

            const ageGroup: any = child["RDEklSXCD4C.N1nMqKtYKvI"];
            const hVatDate: any = child["HEWq6yr4cs5.enrollmentDate"];
            const age = differenceInYears(quarterEnd, parseISO(ageGroup));

            if (age <= 2) {
                const eidEnrollmentDate = findAnyEventValue(
                    heiData,
                    "sDMDb4InL5F"
                );
                const motherArtNo = findAnyEventValue(heiData, "P6KEPNorRTT");
                const eidNo = findAnyEventValue(heiData, "Qyp4adG3KJL");

                const dateFirstPCRDone = findAnyEventValue(
                    heiData,
                    "yTSlwP6htQh"
                );
                const firstPCRResults = findAnyEventValue(
                    heiData,
                    "fUY7DEjsZin"
                );

                const dateSecondPCRDone = findAnyEventValue(
                    heiData,
                    "TJPxuJHRA3P"
                );
                const secondPCRResults = findAnyEventValue(
                    heiData,
                    "TX2qmTSj0rM"
                );

                const dateThirdPCRDone = findAnyEventValue(
                    heiData,
                    "r0zBP8h3UEl"
                );
                const thirdPCRResults = findAnyEventValue(
                    heiData,
                    "G0YhL0M4YjJ"
                );

                const hivTestDueDate = findAnyEventValue(
                    heiData,
                    "CWqTgshbDbW"
                );
                const dateHivTestDone = findAnyEventValue(
                    heiData,
                    "qitG6coAg3q"
                );
                const hivTestResults = findAnyEventValue(
                    heiData,
                    "lznDPbUscke"
                );
                const finalOutcome = findAnyEventValue(heiData, "fcAZR5zt9i3");

                const pcr = !!hivTestResults
                    ? "4"
                    : !!thirdPCRResults
                    ? "3"
                    : !!secondPCRResults
                    ? "2"
                    : !!firstPCRResults
                    ? "1"
                    : "";

                child = {
                    ...child,
                    eidEnrollmentDate,
                    motherArtNo,
                    eidNo,
                    dateFirstPCRDone,
                    firstPCRResults:
                        firstPCRResults === "1"
                            ? "+"
                            : firstPCRResults === "2"
                            ? "-"
                            : "",
                    dateSecondPCRDone,
                    secondPCRResults:
                        secondPCRResults === "1"
                            ? "+"
                            : secondPCRResults === "2"
                            ? "-"
                            : "",
                    dateThirdPCRDone,
                    thirdPCRResults:
                        thirdPCRResults === "1"
                            ? "+"
                            : thirdPCRResults === "2"
                            ? "-"
                            : "",
                    hivTestDueDate,
                    dateHivTestDone,
                    hivTestResults:
                        hivTestResults === "1"
                            ? "+"
                            : hivTestResults === "2"
                            ? "-"
                            : "",
                    finalOutcome,
                    pcr,
                };
            }

            child = {
                ...child,
                riskFactor:
                    findAnyEventValue(homeVisitsBe4Quarter, "rQBaynepqjy") ||
                    child[`RDEklSXCD4C.nDUbdM2FjyP`],
            };

            if (viralLoadsBe4Quarter.length > 0) {
                child = {
                    ...child,
                    hivStatus: "+",
                };
            } else if (hivResult) {
                child = {
                    ...child,
                    hivStatus:
                        hivResult === "Positive"
                            ? "+"
                            : hivResult === "Negative"
                            ? "-"
                            : "",
                };
            } else if (!!child.hivTestResults) {
                child = {
                    ...child,
                    hivStatus: child.hivTestResults,
                };
            } else if (child.riskFactor === "HEI") {
                child = {
                    ...child,
                    hivStatus: "DK",
                };
            } else {
                child = {
                    ...child,
                    hivStatus:
                        child["RDEklSXCD4C.HzUL8LTDPga"] === "Positive"
                            ? "+"
                            : child["RDEklSXCD4C.HzUL8LTDPga"] === "Negative"
                            ? "-"
                            : child["RDEklSXCD4C.HzUL8LTDPga"] ===
                              "Dont Know (DK)"
                            ? "DK"
                            : "",
                };
            }

            const isNotAtRiskAdult = checkRiskAssessment(
                currentRiskAssessment,
                [
                    "WwMOTHl2cOz",
                    "uf6tkJtuWpt",
                    "zpvSpZxMYIV",
                    "O6O0ADYLwua",
                    "VOCmw7bULXR",
                    "FHu4YfcrIQw",
                    "Dny6B3ubQEa",
                    "h7JCV3YLRJO",
                    "VtnameiqmRy",
                ],
                "false"
            );

            const tbScreeningChild = checkRiskAssessment(
                currentRiskAssessment,
                ["DgCXKSDPTWn", "Rs5qrKay7Gq", "QEm2B8LZtzd", "X9n17I5Ibdf"]
            );
            const tbScreeningChild17 = checkRiskAssessment(
                currentRiskAssessment,
                [
                    "DgCXKSDPTWn",
                    "Rs5qrKay7Gq",
                    "QEm2B8LZtzd",
                    "X9n17I5Ibdf",
                    "Oi6CUuucUCP",
                ]
            );
            const tbScreeningAdult = checkRiskAssessment(
                currentRiskAssessment,
                ["If8hDeux5XE", "ha2nnIeFgbu", "NMtrXN3NBqY", "Oi6CUuucUCP"]
            );

            const atTBRiskChild = checkRiskAssessment(
                currentRiskAssessment,
                ["DgCXKSDPTWn", "Rs5qrKay7Gq", "QEm2B8LZtzd", "X9n17I5Ibdf"],
                "true"
            );
            const atTBRiskChild17 = checkRiskAssessment(
                currentRiskAssessment,
                [
                    "DgCXKSDPTWn",
                    "Rs5qrKay7Gq",
                    "QEm2B8LZtzd",
                    "X9n17I5Ibdf",
                    "Oi6CUuucUCP",
                ],
                "true"
            );
            const atTBRiskAdult = checkRiskAssessment(
                currentRiskAssessment,
                ["If8hDeux5XE", "ha2nnIeFgbu", "NMtrXN3NBqY", "Oi6CUuucUCP"],
                "true"
            );

            const isNotAtRisk = checkRiskAssessment(
                currentRiskAssessment,
                [
                    "WlTMjkcP6gv",
                    "Y8kX45XGXXI",
                    "NN0M618qUFX",
                    "MH5BGP1Ww2Q",
                    "p3FSiLQ1q6T",
                    "x1bL4w5EsPL",
                    "dunvFwnbGQF",
                    "oI9btGSwA7P",
                ],
                "false"
            );
            const serviceProvided = specificDataElement(
                currentReferral,
                "XWudTD2LTUQ"
            );
            const unknownOther = findAnyEventValue(
                riskAssessmentsDuringYear,
                "cTV8aMqnVbe"
            );

            child = {
                ...child,
                linked: deHasAnyValue(serviceProvided, [
                    "Started HIV treatment",
                    "PEP",
                    "HCT/ Tested for HIV",
                    "Intensive Adherence Counseling (IAC)",
                    "Viral Load Testing",
                    "Provided with ARVs",
                ]),
            };

            if (serviceProvided === "HCT/ Tested for HIV") {
                child = { ...child, testedForHIV: 1 };
            } else {
                child = { ...child, testedForHIV: 0 };
            }

            if (child["RDEklSXCD4C.nDUbdM2FjyP"] === "Primary caregiver") {
                child = { ...child, primaryCareGiver: "1" };
            } else {
                child = { ...child, primaryCareGiver: "0" };
            }

            if (ageGroup && ageGroup.length === 10) {
                child = {
                    ...child,
                    [`RDEklSXCD4C.ageGroup`]: findAgeGroup(age),
                };
            }
            if (ageGroup && ageGroup.length === 10) {
                child = {
                    ...child,
                    [`RDEklSXCD4C.age`]: Number(age).toString(),
                };
            }
            if (
                isWithinInterval(parseISO(hVatDate), {
                    start: quarterStart,
                    end: quarterEnd,
                })
            ) {
                child = { ...child, [`HEWq6yr4cs5.jiuPVqetSaV`]: 1 };
            } else {
                child = { ...child, [`HEWq6yr4cs5.jiuPVqetSaV`]: 0 };
            }
            if (
                child["hivStatus"] &&
                child["hivStatus"] !== "+" &&
                riskAssessmentsDuringYear.length > 0
            ) {
                child = {
                    ...child,
                    [`RDEklSXCD4C.B9EI27lmQrZ.vBqh2aiuHOV`]: 1,
                };
            } else {
                child = {
                    ...child,
                    [`RDEklSXCD4C.B9EI27lmQrZ.vBqh2aiuHOV`]: 0,
                };
            }

            if (serviceProvided && serviceProvided === "HCT/ Tested for HIV") {
                child = { ...child, OVC_TST_REFER: 1 };
            } else {
                child = { ...child, OVC_TST_REFER: 0 };
            }
            if (hivResult && child.OVC_TST_REFER === 1) {
                child = { ...child, OVC_TST_REPORT: 1 };
            } else {
                child = { ...child, OVC_TST_REPORT: 0 };
            }

            if (child.hivStatus === "+" && age < 18) {
                child = {
                    ...child,
                    riskFactor: "CLHIV",
                };
            }

            child = {
                ...child,
                memberStatus:
                    findAnyEventValue(homeVisitsBe4Quarter, "tM67MBdox3O") ===
                    "true"
                        ? "Active"
                        : findAnyEventValue(homeVisitsBe4Quarter, "VEw6HHnx8mR")
                        ? findAnyEventValue(homeVisitsBe4Quarter, "VEw6HHnx8mR")
                        : "No Home Visit",
            };
            child = {
                ...child,
                householdStatus: !!findAnyEventValue(
                    homeVisitsBe4Quarter,
                    "PpUByWk3p8N"
                )
                    ? findAnyEventValue(homeVisitsBe4Quarter, "PpUByWk3p8N")
                    : child["hasEnrollment"]
                    ? "Active"
                    : "Not Enrolled",
            };
            child = {
                ...child,
                enrolledInSchool: isAtSchool(
                    age,
                    "",
                    child["RDEklSXCD4C.h4pXErY01YR"] as any
                ),
            };

            const homeVisitor = findAnyEventValue(
                homeVisitsBe4Quarter,
                "i6XGAmzx3Ri"
            );
            const dataEntrant = findAnyEventValue(
                homeVisitsDuringQuarter,
                "YY5zG4Bh898"
            );
            const dataEntrant1 = child["HEWq6yr4cs5.Xkwy5P2JG24"];

            const dataEntrant2 = findAnyEventValue(
                viralLoadDuringQuarter,
                "YY5zG4Bh898"
            );
            const homeVisitorContact = findAnyEventValue(
                homeVisitsBe4Quarter,
                "BMzryoryhtX"
            );

            child = {
                ...child,
                homeVisitor,
                onArt: "",
                facility: "",
                artNo: "",
                homeVisitorContact,
                dataEntrant: dataEntrant || dataEntrant1 || dataEntrant2,
            };

            if (
                viralLoadsBe4Quarter.length > 0 &&
                !!findAnyEventValue(viralLoadsBe4Quarter, "aBc9Lr1z25H")
            ) {
                child = {
                    ...child,
                    artNo: findAnyEventValue(
                        viralLoadsBe4Quarter,
                        "aBc9Lr1z25H"
                    ),
                };

                child = {
                    ...child,
                    facility: findAnyEventValue(
                        viralLoadsBe4Quarter,
                        "usRWNcogGX7"
                    ),
                };
            }
            if (
                viralLoadsBe4Quarter.length > 0 &&
                findAnyEventValue(viralLoadsBe4Quarter, "xyDBnQTdZqS")
            ) {
                child = {
                    ...child,
                    [`onArt`]: findAnyEventValue(
                        viralLoadsBe4Quarter,
                        "xyDBnQTdZqS"
                    )
                        ? 1
                        : "",
                };
            } else if (child["hivStatus"] === "+") {
                child = {
                    ...child,
                    [`onArt`]: "No VL",
                };
            } else {
                child = {
                    ...child,
                    [`onArt`]: "",
                };
            }

            if (
                child["hivStatus"] !== "+" &&
                child["RDEklSXCD4C.umqeJCVp4Zq"] === "NA"
            ) {
                child = {
                    ...child,
                    ["RDEklSXCD4C.umqeJCVp4Zq"]: "",
                };
            } else if (child["hivStatus"] === "+") {
                child = {
                    ...child,
                    ["RDEklSXCD4C.umqeJCVp4Zq"]:
                        child["RDEklSXCD4C.umqeJCVp4Zq"] === "Yes" ? 1 : 0,
                };
            }

            const artStartDate = findAnyEventValue(
                viralLoadsBe4Quarter,
                "epmIBD8gh7G"
            );

            const lastViralLoadDate = findAnyEventValue(
                viralLoadsBe4Quarter,
                "Ti0huZXbAM0"
            );
            const viralTestDone = findAnyEventValue(
                viralLoadsBe4Quarter,
                "cM7dovIX2Dl"
            );
            const viralLoadResultsReceived = findAnyEventValue(
                viralLoadsBe4Quarter,
                "te2VwealaBT"
            );
            const viralLoadStatus = findAnyEventValue(
                viralLoadsBe4Quarter,
                "AmaNW7QDuOV"
            );
            const viralLoadCopies = findAnyEventValue(
                viralLoadsBe4Quarter,
                "b8p0uWaYRhY"
            );
            const regimen = findAnyEventValue(
                viralLoadsBe4Quarter,
                "nZ1omFVYFkT"
            );
            const weight = findAnyEventValue(
                viralLoadsBe4Quarter,
                "Kjtt7SV26zL"
            );
            if (child["hivStatus"] === "+") {
                if (!!artStartDate) {
                    const daysOnArt = differenceInMonths(
                        quarterEnd,
                        parseISO(artStartDate)
                    );
                    if (daysOnArt >= 6) {
                        child = {
                            ...child,
                            ovcEligible: 1,
                        };
                    } else if (!!lastViralLoadDate) {
                        child = {
                            ...child,
                            ovcEligible: 1,
                        };
                    } else {
                        child = {
                            ...child,
                            ovcEligible: "NE",
                        };
                    }
                } else if (!!lastViralLoadDate) {
                    child = {
                        ...child,
                        ovcEligible: 1,
                    };
                } else {
                    child = {
                        ...child,
                        ovcEligible: "No VL",
                    };
                }
                child = { ...child, lastViralLoadDate };

                if (!!lastViralLoadDate && child.ovcEligible === 1) {
                    const monthsSinceLastViralLoad = differenceInMonths(
                        quarterEnd,
                        parseISO(lastViralLoadDate)
                    );
                    if (monthsSinceLastViralLoad <= 12) {
                        child = {
                            ...child,
                            VLTestDone:
                                viralTestDone === "true"
                                    ? 1
                                    : viralTestDone === "false"
                                    ? 0
                                    : 0,
                            VLStatus: viralLoadStatus,
                        };
                    } else {
                        child = {
                            ...child,
                            VLTestDone: 0,
                        };
                    }
                } else {
                    child = {
                        ...child,
                        VLTestDone: 0,
                    };
                }
                if (!!viralLoadResultsReceived && child.VLTestDone === 1) {
                    child = {
                        ...child,
                        ovcVL: viralLoadResultsReceived === "true" ? 1 : 0,
                    };
                } else {
                    child = {
                        ...child,
                        ovcVL: 0,
                    };
                }

                if (child.ovcVL === 1) {
                    child = {
                        ...child,
                        copies: viralLoadCopies,
                        VLSuppressed: viralLoadStatus === "Suppressed" ? 1 : 0,
                    };
                } else {
                    child = {
                        ...child,
                        ovcVL: 0,
                        VLSuppressed: 0,
                    };
                }
            } else {
                child = {
                    ...child,
                    VLTestDone: "",
                    ovcEligible: "",
                    ovcVL: "",
                    VLStatus: "",
                };
            }
            child = {
                ...child,
                VSLA: hadASession(
                    rows,
                    participantIndex,
                    sessionNameIndex,
                    sessionDateIndex,
                    child["RDEklSXCD4C.HLKc2AKR9jW"],
                    quarterStart,
                    quarterEnd,
                    [
                        ...sessions["VSLA Methodology"],
                        ...sessions["VSLA TOT"],
                        ...sessions["Saving and Borrowing"],
                    ]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                fLiteracy: hadASession(
                    rows,
                    participantIndex,
                    sessionNameIndex,
                    sessionDateIndex,
                    child["RDEklSXCD4C.HLKc2AKR9jW"],
                    quarterStart,
                    quarterEnd,
                    sessions["Financial Literacy"]
                )
                    ? 1
                    : 0,
                fHomeBasedLiteracy:
                    (anyEventWithDE(homeVisitsDuringQuarter, "PBiFAeCVnot") ||
                        anyEventWithDE(
                            homeVisitsDuringQuarter,
                            "Xlw16qiDxqk"
                        ) ||
                        anyEventWithDE(
                            homeVisitsDuringQuarter,
                            "rOTbGzSfKbs"
                        )) &&
                    age >= 15
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                [`bankLinkages`]:
                    anyEventWithAnyOfTheValue(
                        serviceLinkagesDuringQuarter,
                        "NxQ4EZUB0fr",
                        [
                            "F1. Access credit services",
                            "F2. Access saving services",
                            "F3. Insurance services/ Health Fund",
                        ]
                    ) ||
                    hadASession(
                        rows,
                        participantIndex,
                        sessionNameIndex,
                        sessionDateIndex,
                        child["RDEklSXCD4C.HLKc2AKR9jW"],
                        quarterStart,
                        quarterEnd,
                        sessions["Bank Linkages"]
                    )
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                [`agriBusiness`]: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    [
                        "A1. Input Markets through voucher",
                        "A2. input such as seeds and poultry",
                        "A3. training in agricultural production",
                    ]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                spmTraining: hadASession(
                    rows,
                    participantIndex,
                    sessionNameIndex,
                    sessionDateIndex,
                    child["RDEklSXCD4C.HLKc2AKR9jW"],
                    quarterStart,
                    quarterEnd,
                    sessions["SPM Training"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                micro: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    [
                        "B1. Access to credit services",
                        "B2. Access to saving services",
                    ]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                igaBooster: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    ["O3. IGA Booster"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                tempConsumption:
                    anyEventWithAnyOfTheValue(
                        serviceLinkagesDuringQuarter,
                        "NxQ4EZUB0fr",
                        ["UF12 Temporary Food Support"]
                    ) ||
                    anyEventWithAnyOfTheValue(
                        referralsDuringQuarter,
                        "XWudTD2LTUQ",
                        ["Temporary Food Support"]
                    )
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                vlsaOvcFund: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    ["UF3 VSLA OVC protection Fund"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                educationFund: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    ["UF09 OVC VSLA Education Fund"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                heathFund: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    ["UF10 OVC VSLA Health Fund"]
                )
                    ? 1
                    : 0,
            };

            child = {
                ...child,
                educationSubsidy:
                    anyEventWithAnyOfTheValue(
                        serviceLinkagesDuringQuarter,
                        "NxQ4EZUB0fr",
                        ["O1. Education subsidy"]
                    ) ||
                    anyEventWithAnyOfTheValue(
                        referralsDuringQuarter,
                        "XWudTD2LTUQ",
                        ["Educational support"]
                    )
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                homeLearning: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    ["Home Learning"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                nonFormalEducation:
                    anyEventWithAnyOfTheValue(
                        serviceLinkagesDuringQuarter,
                        "NxQ4EZUB0fr",
                        ["O2. None Formal Education"]
                    ) ||
                    anyEventWithAnyOfTheValue(
                        referralsDuringQuarter,
                        "XWudTD2LTUQ",
                        ["Vocational/Apprenticeship"]
                    )
                        ? 1
                        : 0,
            };

            child = {
                ...child,
                educationInformation:
                    (anyEventWithDE(homeVisitsDuringQuarter, "sTyaaJxvR5S") ||
                        anyEventWithDE(
                            homeVisitsDuringQuarter,
                            "oyQActIi370"
                        ) ||
                        anyEventWithDE(
                            homeVisitsDuringQuarter,
                            "P7nd91Mkhol"
                        ) ||
                        anyEventWithDE(
                            homeVisitsDuringQuarter,
                            "leNiACgoBcL"
                        )) &&
                    age >= 6
                        ? 1
                        : 0,
            };
            if (
                deHasAnyValue(serviceProvided, [
                    "Started HIV treatment",
                    "PEP",
                    "HCT/ Tested for HIV",
                    "Intensive Adherence Counseling (IAC)",
                    "Viral Load Testing",
                    "Provided with ARVs",
                ]) === 1 ||
                anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "HzDRzHCuzdf",
                    ["HTS"]
                )
            ) {
                child = { ...child, HTSReferral: 1 };
            } else {
                child = { ...child, HTSReferral: 0 };
            }

            child = {
                ...child,
                nonDisclosureSupport:
                    anyEventWithDE(homeVisitsDuringQuarter, "rLc3CF2VeOC") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "xSS9QHbuT4S")
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                artInitiation: anyEventWithAnyOfTheValue(
                    referralsDuringQuarter,
                    "XWudTD2LTUQ",
                    ["Initiated on HIV Treatment"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                homeDrugDelivery: deHasAnyValue(serviceProvided, [
                    "Home drug delivery",
                ]),
            };
            child = {
                ...child,
                artAdherenceEducation:
                    anyEventWithDE(homeVisitsDuringQuarter, "NxhBKqINsZY") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "svrj6VtHjay") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "NJZ13SXf8XV")
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                iac:
                    anyEventWithDataElement(
                        viralLoadDuringQuarter,
                        "iHdNYfm1qlz",
                        "true"
                    ) ||
                    anyEventWithAnyOfTheValue(
                        referralsDuringQuarter,
                        "XWudTD2LTUQ",
                        ["Intensive Adherence Counseling (IAC)"]
                    )
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                eMTCT:
                    anyEventWithDE(homeVisitsDuringQuarter, "SrEP2vZtMHV") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "ffxCn2msT1R") ||
                    anyEventWithAnyOfTheValue(
                        referralsDuringQuarter,
                        "XWudTD2LTUQ",
                        ["EMTCT"]
                    )
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                hivPrevention: anyEventWithDE(
                    homeVisitsDuringQuarter,
                    "xXqKqvuwA8m"
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                journeysMOH: hasCompleted(
                    rows,
                    participantIndex,
                    sessionNameIndex,
                    sessionDateIndex,
                    child["RDEklSXCD4C.HLKc2AKR9jW"],
                    quarterEnd,
                    sessions["MOH Journeys curriculum"],
                    mapping2["MOH Journeys curriculum"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                journeysLARA: hasCompleted(
                    rows,
                    participantIndex,
                    sessionNameIndex,
                    sessionDateIndex,
                    child["RDEklSXCD4C.HLKc2AKR9jW"],
                    quarterEnd,
                    sessions["MOE Journeys Plus"],
                    mapping2["MOE Journeys Plus"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                NMNBoys: hasCompleted(
                    rows,
                    participantIndex,
                    sessionNameIndex,
                    sessionDateIndex,
                    child["RDEklSXCD4C.HLKc2AKR9jW"],
                    quarterEnd,
                    sessions["No means No sessions (Boys)"],
                    mapping2["No means No sessions (Boys)"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                NMNGirls: hasCompleted(
                    rows,
                    participantIndex,
                    sessionNameIndex,
                    sessionDateIndex,
                    child["RDEklSXCD4C.HLKc2AKR9jW"],
                    quarterEnd,
                    sessions["No means No sessions (Girls)"],
                    mapping2["No means No sessions (Girls)"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                TFHealth: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    ["Transport to Facility"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                PEP: anyEventWithAnyOfTheValue(
                    serviceProvisionDuringQuarter,
                    "XWudTD2LTUQ",
                    ["PEP"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                covid19Education: anyEventWithDE(
                    homeVisitsDuringQuarter,
                    "RtQudbqa6XH"
                )
                    ? 1
                    : 0,
            };

            child = {
                ...child,
                immunization: anyEventWithAnyOfTheValue(
                    referralsDuringQuarter,
                    "XWudTD2LTUQ",
                    ["Immunisation"]
                )
                    ? 1
                    : 0,
            };

            child = {
                ...child,
                wash:
                    anyEventWithDE(homeVisitsDuringQuarter, "eEZu3v92pJZ") ||
                    anyEventWithAnyOfTheValue(
                        referralsDuringQuarter,
                        "XWudTD2LTUQ",
                        ["WASH"]
                    )
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                treatedNets: anyEventWithAnyOfTheValue(
                    referralsDuringQuarter,
                    "XWudTD2LTUQ",
                    ["Insecticide Treated Nets"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                familyPlanning: anyEventWithAnyOfTheValue(
                    referralsDuringQuarter,
                    "XWudTD2LTUQ",
                    ["Family planning services"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                tested4TB: anyEventWithAnyOfTheValue(
                    referralsDuringQuarter,
                    "XWudTD2LTUQ",
                    ["Tested for TB"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                initiatedOnTB: anyEventWithAnyOfTheValue(
                    referralsDuringQuarter,
                    "XWudTD2LTUQ",
                    ["Initiated on TB Treatment"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                supported2CompleteTBDose: anyEventWithAnyOfTheValue(
                    referralsDuringQuarter,
                    "XWudTD2LTUQ",
                    ["Supported to Complete TB Dose"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                viralLoadBleeding:
                    anyEventWithAnyOfTheValue(
                        referralsDuringQuarter,
                        "XWudTD2LTUQ",
                        ["Viral Load Testing"]
                    ) ||
                    anyEventWithAnyOfTheValue(
                        serviceLinkagesDuringQuarter,
                        "NxQ4EZUB0fr",
                        ["HTS7. Viral load test"]
                    )
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                returnedToCare: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    ["PLHIV Returned to care"]
                )
                    ? 1
                    : 0,
            };

            child = {
                ...child,
                otherHealthServices:
                    anyEventWithDE(homeVisitsDuringQuarter, "eEZu3v92pJZ") ||
                    // anyEventWithDE(homeVisitsDuringQuarter, "C41UbAJDeqG") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "D7rrGXWwjGn") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "CnfRJ2y4Lg8")
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                tbScreening:
                    (tbScreeningChild === 4 && age < 16) ||
                    (tbScreeningAdult === 4 && age > 17) ||
                    (tbScreeningChild17 === 4 && age >= 16)
                        ? 1
                        : 0,
            };

            child = {
                ...child,
                atRiskOfTB:
                    (atTBRiskChild >= 5 && age < 16) ||
                    (atTBRiskAdult >= 5 && age > 17) ||
                    (atTBRiskChild17 >= 5 && age >= 16)
                        ? 1
                        : 0,
            };

            child = {
                ...child,
                GBVPreventionEducation:
                    anyEventWithDE(homeVisitsDuringQuarter, "ENMOyjoE2GM") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "ak7SceZTDsF") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "HqbcvvZAc9w") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "H4YhW8kTs2P") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "kpWBIc81VKL") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "pm7k8wuOTLt") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "a0lXaMhHh32")
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                TFGBV:
                    anyEventWithDataElement(
                        referralsDuringQuarter,
                        "XWudTD2LTUQ",
                        "Transport GBV"
                    ) ||
                    anyEventWithDataElement(
                        serviceLinkagesDuringQuarter,
                        "NxQ4EZUB0fr",
                        "Transport GBV"
                    )
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                referral4LegalSupport: anyEventWithDataElement(
                    referralsDuringQuarter,
                    "EDa2GQUCbsx",
                    "Legal Support"
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                ECD: hadASession(
                    rows,
                    participantIndex,
                    sessionNameIndex,
                    sessionDateIndex,
                    child["RDEklSXCD4C.HLKc2AKR9jW"],
                    quarterStart,
                    quarterEnd,
                    sessions["ECD"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                parenting: hasCompletedWithin(
                    rows,
                    participantIndex,
                    sessionNameIndex,
                    sessionDateIndex,
                    child["RDEklSXCD4C.HLKc2AKR9jW"],
                    quarterStart,
                    quarterEnd,
                    sessions["SINOVUYO"],
                    mapping2["SINOVUYO"]
                )
                    ? 1
                    : 0,
            };

            child = {
                ...child,
                parentingAttended: hadASession(
                    rows,
                    participantIndex,
                    sessionNameIndex,
                    sessionDateIndex,
                    child["RDEklSXCD4C.HLKc2AKR9jW"],
                    quarterStart,
                    quarterEnd,
                    sessions["SINOVUYO"]
                )
                    ? 1
                    : 0,
            };
            child = {
                ...child,
                childProtectionEducation:
                    anyEventWithDE(homeVisitsDuringQuarter, "cgnfO3xqaYb") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "bJPqgTbbt8g") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "UlQEavBni01") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "v6zHvL8w9ex")
                        ? 1
                        : 0,
            };

            child = {
                ...child,
                nutritionEducation:
                    anyEventWithDE(homeVisitsDuringQuarter, "FGs1bkmfoTX") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "BDVZPgVPVww") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "p9EaFSIg3ht") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "Eg1yxmjMfG7")
                        ? 1
                        : 0,
            };
            child = {
                ...child,
                nutritionalFoodSupplement: deHasAnyValue(serviceProvided, [
                    "Food supplement",
                ]),
            };
            child = {
                ...child,
                nutritionalAssessment: deHasAnyValue(serviceProvided, [
                    "Nutritional assessment",
                ]),
            };
            child = {
                ...child,
                voucher4CropsOrKitchenGardens: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    ["A1. Input Markets through voucher", "M3 Input Vouchers"]
                )
                    ? 1
                    : 0,
            };

            child = {
                ...child,
                kitchenGarden: anyEventWithAnyOfTheValue(
                    serviceLinkagesDuringQuarter,
                    "NxQ4EZUB0fr",
                    ["A2. input such as seeds and poultry"]
                )
                    ? 1
                    : 0,
            };

            child = {
                ...child,
                psychosocialSupport:
                    anyEventWithDE(homeVisitsDuringQuarter, "EPchB4Exe2W") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "bl1spy2qZx9") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "VfpDpPPKRN6") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "I8f8EVY5rtY") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "OawjweoGEhr") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "yowPVwuMMqZ") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "f4jgX6ch67t") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "YZH5hmsL7wS") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "KsGYugQ1vmD") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "Mu3g2OAL45z") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "DJuFa605flQ") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "l2dux9dZ80n") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "I14Ps4E6pkc") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "dkUee6TB7kh") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "SBnpTKoIGsP") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "ySVNhEXsMdJ") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "ttrftNW6Hvt") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "fKt9QfYFLcP") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "LLqXFg9LSva") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "RgiLe8wnGCu") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "xe4vjgebIvY") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "Vvhi5UERsGt") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "XPa9UnDjaBm") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "SPwxtuLWvUS") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "OPaSCuEHG6U") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "AirD3FZ9n6i") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "LQSy4undhKw") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "blyJnu6QaTY") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "xSS9QHbuT4S") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "ffxCn2msT1R") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "qr5qx26F2k5") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "WPjGiogQuMg") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "ArdR8f6lg2I") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "LEa6yJQU4FR") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "OQ2O7hzLz4n") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "kgeTLR5iPGl") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "af5jHMW6cPf") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "bdKyx6Eb911") ||
                    anyEventWithDE(homeVisitsDuringQuarter, "nKjyjWLj88B")
                        ? 1
                        : 0,
            };

            const coreES =
                child.VSLA === 1 ||
                child.fLiteracy === 1 ||
                child.fHomeBasedLiteracy === 1 ||
                child.bankLinkages === 1 ||
                child.agriBusiness === 1 ||
                child.spmTraining === 1 ||
                child.micro === 1 ||
                child.igaBooster === 1 ||
                child.tempConsumption ||
                child.vlsaOvcFund;
            const coreEducation =
                child.educationSubsidy === 1 ||
                child.homeLearning === 1 ||
                child.nonFormalEducation === 1 ||
                child.educationInformation === 1 ||
                child.educationFund === 1;
            const coreHealth =
                child.HTSReferral === 1 ||
                child.nonDisclosureSupport === 1 ||
                child.artInitiation === 1 ||
                child.artAdherenceEducation === 1 ||
                child.iac === 1 ||
                child.eMTCT === 1 ||
                child.hivPrevention === 1 ||
                child.journeysMOH === 1 ||
                child.journeysLARA === 1 ||
                child.NMNBoys === 1 ||
                child.NMNGirls === 1 ||
                child.TFHealth === 1 ||
                child.PEP === 1 ||
                child.covid19Education === 1 ||
                child.otherHealthServices === 1 ||
                child.homeDrugDelivery === 1 ||
                child.tested4TB ||
                child.initiatedOnTB ||
                child.wash ||
                child.treatedNets ||
                child.familyPlanning ||
                child.healthFund ||
                child.TFHealth ||
                child.supported2CompleteTBDose ||
                child.immunization;

            const coreChildProtection =
                child.GBVPreventionEducation === 1 ||
                child.TFGBV === 1 ||
                child.referral4LegalSupport === 1 ||
                child.ECD === 1 ||
                child.parentingAttended === 1 ||
                child.childProtectionEducation === 1;

            const coreNutrition =
                child.nutritionEducation === 1 ||
                child.voucher4CropsOrKitchenGardens === 1 ||
                child.nutritionalAssessment === 1 ||
                child.kitchenGarden === 1 ||
                child.nutritionalFoodSupplement === 1;
            const corePSS = child.psychosocialSupport === 1;

            child = {
                ...child,
                coreES: coreES ? 1 : 0,
                coreEducation: coreEducation ? 1 : 0,
                coreHealth: coreHealth ? 1 : 0,
                coreChildProtection: coreChildProtection ? 1 : 0,
                coreNutrition: coreNutrition ? 1 : 0,
                corePSS: corePSS ? 1 : 0,
            };

            if (
                child.coreES === 1 ||
                child.coreEducation === 1 ||
                child.coreHealth === 1 ||
                child.coreChildProtection === 1 ||
                child.coreNutrition === 1 ||
                child.corePSS === 1
            ) {
                child = {
                    ...child,
                    quarter: 1,
                };
            } else {
                child = {
                    ...child,
                    quarter: "0",
                };
            }

            if (
                previousData[trackedEntityInstance] &&
                previousData[trackedEntityInstance].quarter === 1
            ) {
                child = { ...child, servedInPreviousQuarter: 1 };
            } else {
                child = { ...child, servedInPreviousQuarter: "0" };
            }

            if (child.newlyEnrolled === "Yes" && child.quarter === 1) {
                child = {
                    ...child,
                    OVC_SERV: 1,
                };
            } else if (
                child.quarter === 1 &&
                child.servedInPreviousQuarter === 1
            ) {
                child = {
                    ...child,
                    OVC_SERV: 1,
                };
            } else {
                child = {
                    ...child,
                    OVC_SERV: "0",
                };
            }

            if (age < 18 && child.ovcVL === 1 && child.OVC_SERV === 1) {
                child = {
                    ...child,
                    OVC_ENROL: 1,
                };
            } else if (age < 18 && child.hivStatus === "+") {
                child = {
                    ...child,
                    OVC_ENROL: 0,
                };
            }

            if (age < 18 && child.OVC_SERV === 1) {
                child = {
                    ...child,
                    OVC_SERV_SUBPOP:
                        risks[child.riskFactor] || child.riskFactor,
                };
            }

            if (
                child.hivStatus === "+" ||
                child.hivStatus === "-" ||
                ([0, 3, 6].indexOf(isNotAtRisk) !== -1 &&
                    [0, 3, 6].indexOf(isNotAtRiskAdult) !== -1 &&
                    child.hivStatus === "DK")
            ) {
                child = {
                    ...child,
                    OVC_HIV_STAT: 1,
                };
            } else {
                child = {
                    ...child,
                    OVC_HIV_STAT: 0,
                };
            }
            if (
                riskAssessmentsDuringYear.length > 0 &&
                child.hivStatus !== "+"
            ) {
                child = { ...child, riskAssessment: 1 };
            } else if (child.hivStatus === "+") {
                child = { ...child, riskAssessment: "" };
                child = { ...child, isAtRisk: "" };
            } else {
                child = { ...child, riskAssessment: 0 };
                child = { ...child, isAtRisk: 0 };
            }
            if (child.riskAssessment === 1) {
                if (age < 18 && [0, 3, 6].indexOf(isNotAtRisk) !== -1) {
                    child = { ...child, isAtRisk: 0 };
                } else if (
                    age >= 18 &&
                    [0, 3, 6].indexOf(isNotAtRiskAdult) !== -1
                ) {
                    child = { ...child, isAtRisk: 0 };
                } else if (
                    [0, 3, 6].indexOf(isNotAtRiskAdult) === -1 ||
                    [0, 3, 6].indexOf(isNotAtRisk) === -1
                ) {
                    child = { ...child, isAtRisk: 1 };
                }
            }

            if (child.hivStatus !== "+") {
                if (
                    [0, 3, 6].indexOf(isNotAtRiskAdult) !== -1 ||
                    [0, 3, 6].indexOf(isNotAtRisk) !== -1
                ) {
                    child = { ...child, isNotAtRisk: 1 };
                } else {
                    child = { ...child, isNotAtRisk: 0 };
                }
            }

            if (
                child.hivStatus !== "+" &&
                child.hivStatus !== "-" &&
                child.isNotAtRisk !== 1
            ) {
                if (
                    child.riskFactor === "HEI" &&
                    child.hivStatus === "DK" &&
                    age <= 2
                ) {
                    child = {
                        ...child,
                        unknown: "HEI",
                    };
                } else if (!!unknownOther) {
                    child = {
                        ...child,
                        unknown: unknownOther,
                    };
                } else {
                    child = { ...child, unknown: "Other reasons" };
                }
            } else if (
                child.hivStatus === "+" ||
                child.hivStatus === "-" ||
                child.isNotAtRisk === 1
            ) {
                child = { ...child, unknown: "" };
            }

            if (child.newlyEnrolled === "Yes" && child.hivStatus === "+") {
                child = { ...child, newlyPositive: 1 };
            } else if (child.hivStatus === "+") {
                if (
                    child["RDEklSXCD4C.HzUL8LTDPga"] === "Negative" &&
                    previousViralLoads.length === 0 &&
                    allValues4DataElement(
                        previousReferrals,
                        "XTdRWh5MqPw",
                        "Negative"
                    )
                ) {
                    child = { ...child, newlyPositive: 1 };
                } else {
                    child = { ...child, newlyPositive: 0 };
                }
            }

            if (
                child.newlyPositive &&
                !!artStartDate &&
                isWithinInterval(parseISO(artStartDate), {
                    start: financialQuarterStart,
                    end: financialQuarterEnd,
                })
            ) {
                child = { ...child, newlyTestedPositive: 1 };
            } else if (
                child.newlyPositive &&
                hasDataElementWithinPeriod(
                    referralsDuringYear,
                    "XTdRWh5MqPw",
                    "Positive"
                )
            ) {
                child = { ...child, newlyTestedPositive: 1 };
            } else if (child.hivStatus === "+") {
                child = { ...child, newlyTestedPositive: 0 };
            }
            const currentArtStartDate = anyViralLoad?.["epmIBD8gh7G"];

            child = {
                ...child,
                artStartDate: currentArtStartDate,
            };

            if (
                child.newlyTestedPositive &&
                currentArtStartDate &&
                child.onArt &&
                isWithinInterval(parseISO(currentArtStartDate), {
                    start: financialQuarterStart,
                    end: financialQuarterEnd,
                })
            ) {
                child = {
                    ...child,
                    newlyTestedAndOnArt: 1,
                };
            } else if (serviceProvided === "Started HIV treatment") {
                child = { ...child, newlyTestedAndOnArt: 1 };
            }

            child = { ...child, currentRegimen: regimen, weight };

            if (
                child.memberStatus === "Active" &&
                child.OVC_SERV === "0" &&
                child.servedInPreviousQuarter === "0" &&
                child.quarter === "0" &&
                child.newlyEnrolled === "No"
            ) {
                child = {
                    ...child,
                    exitedWithGraduation: "Not served in both qtrs",
                };
            } else if (
                child.OVC_SERV === "0" &&
                child.quarter === "0" &&
                child.memberStatus === "Active"
            ) {
                child = {
                    ...child,
                    exitedWithGraduation: "Not served current qtr",
                };
            } else if (
                child.OVC_SERV === "0" &&
                child.servedInPreviousQuarter === "0" &&
                child.memberStatus === "Active"
            ) {
                child = {
                    ...child,
                    exitedWithGraduation: "Not served previous qtr",
                };
            } else if (
                child.OVC_SERV === "0" &&
                child.memberStatus === "No Home Visit"
            ) {
                child = {
                    ...child,
                    exitedWithGraduation: "Not served in both qtrs",
                };
            } else if (child.OVC_SERV === "0") {
                child = { ...child, exitedWithGraduation: child.memberStatus };
            }
            return [trackedEntityInstance, child];
        }
    );
    return fromPairs(instances);
};

export const useComprehensiveProgramStage = (
    organisationUnits: string[],
    period: [Date, Date],
    sessions: { [key: string]: string[] },
    page: number,
    pageSize: number
) => {
    const engine = useDataEngine();
    return useQuery<any, Error>(
        [
            "trackedEntityInstances-comp",
            ...organisationUnits,
            ...period,
            page,
            pageSize,
        ],
        async () => {
            if (organisationUnits.length > 0) {
                const query = {
                    instances: {
                        resource: "trackedEntityInstances.json",
                        params: {
                            fields: "*",
                            ou: organisationUnits.join(";"),
                            ouMode: "DESCENDANTS",
                            filter: `mWyp85xIzXR:IN:${[
                                "SINOVUYO",
                                "ECD",
                                "Saving and Borrowing",
                                "SPM Training",
                                "Financial Literacy",
                                "VSLA Methodology",
                            ].join(";")}`,
                            page,
                            pageSize,
                            program: "IXxHJADVCkb",
                            totalPages: true,
                        },
                    },
                };
                const {
                    instances: { trackedEntityInstances, pager },
                }: any = await engine.query(query);
                const { total } = pager;
                changeTotal(total);
                return await processPrevention(
                    engine,
                    trackedEntityInstances,
                    sessions,
                    period
                );
            }
            changeTotal(0);
            return [];
        }
    );
};

export const useProgramStage = (
    organisationUnits: string[],
    period: [Date, Date],
    sessions: { [key: string]: string[] },
    page: number,
    pageSize: number
) => {
    const engine = useDataEngine();
    return useQuery<any, Error>(
        [
            "trackedEntityInstances",
            ...organisationUnits,
            ...period,
            page,
            pageSize,
        ],
        async () => {
            if (organisationUnits.length > 0) {
                const query = {
                    instances: {
                        resource: "trackedEntityInstances.json",
                        params: {
                            fields: "*",
                            ou: organisationUnits.join(";"),
                            ouMode: "DESCENDANTS",
                            filter: `mWyp85xIzXR:IN:${[
                                "MOE Journeys Plus",
                                "MOH Journeys curriculum",
                                "No means No sessions (Boys)",
                                "No means No sessions (Girls)",
                                "No means No sessions (Boys) New Curriculum",
                            ].join(";")}`,
                            page,
                            pageSize,
                            program: "IXxHJADVCkb",
                            totalPages: true,
                        },
                    },
                };
                const {
                    instances: { trackedEntityInstances, pager },
                }: any = await engine.query(query);
                const { total } = pager;
                changeTotal(total);
                return await processPrevention(
                    engine,
                    trackedEntityInstances,
                    sessions,
                    period
                );
            }
            changeTotal(0);
            return [];
        }
    );
};
export const useTracker = (
    program: string,
    organisationUnits: string[],
    sessions: { [a: string]: string[] },
    period: any,
    page: number,
    pageSize: number,
    code: string
) => {
    const engine = useDataEngine();
    return useQuery<any, Error>(
        [
            "trackedEntityInstances",
            program,
            organisationUnits,
            period,
            page,
            pageSize,
            code,
        ],
        async () => {
            if (program && organisationUnits.length > 0 && period) {
                let filter = `HLKc2AKR9jW:NE:""`;
                if (code) {
                    filter = `HLKc2AKR9jW:EQ:${code}`;
                }
                let params = {
                    fields: "*",
                    ou: organisationUnits.join(";"),
                    ouMode: "DESCENDANTS",
                    filter,
                    page,
                    pageSize,
                    program: "RDEklSXCD4C",
                    totalPages: true,
                };
                const query = {
                    instances: {
                        resource: "trackedEntityInstances.json",
                        params,
                    },
                };
                const {
                    instances: { trackedEntityInstances, pager },
                }: any = await engine.query(query);
                const { total } = pager;
                changeTotal(total);

                const filteredInstances = trackedEntityInstances.filter(
                    (instance: any) =>
                        instance.inactive === false &&
                        instance.deleted === false
                );

                const indexCases = await fetchRelationships4Instances(
                    engine,
                    filteredInstances,
                    organisationUnits.join(";")
                );
                const processedUnits = await fetchUnits4Instances(
                    engine,
                    filteredInstances
                );
                const groupActivities = await fetchGroupActivities4Instances(
                    engine,
                    filteredInstances,
                    organisationUnits.join(";")
                );
                const servedPreviousQuarter = processInstances(
                    program,
                    filteredInstances,
                    period.subtract(1, "quarter"),
                    sessions,
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
                return processInstances(
                    program,
                    filteredInstances,
                    period,
                    sessions,
                    indexCases,
                    processedUnits,
                    groupActivities,
                    servedPreviousQuarter
                );
            }
            changeTotal(0);
            return {};
        }
    );
};

export const useSqlView = () => {
    const engine = useDataEngine();
    
    const updateQuery = async (date = '', parish = '') => {
        const query = `"Enrollment Date" >= "${date}" AND "parish" = "${parish}"`
        const params = {
            "type":"QUERY",
            "lastUpdated":"2024-10-12T14:39:42.728",
            "id":"DQyX081ap5z",
            "sqlQuery": `SELECT * FROM get_indicators(1, 1000, '${query}');`,
            "created":"2024-10-10T23:12:19.015",
            "attributeValues":[],
            "sharing":{
                "owner":"dDKHWihXBUP",
                "external":false,
                "users":{},
                "userGroups":{},
                "public":"rwrw----"
            },
            "name":"Layer Report OVC",
            "cacheStrategy":"NO_CACHE",
            "lastUpdatedBy":{"id":"dDKHWihXBUP"},
            "createdBy":{"id":"dDKHWihXBUP"}
        }


        const response1 = await fetch('/ovc/api/29/schemas/sqlView', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const data1 = await response1.json();

        const response = await fetch('/ovc/api/29/sqlViews/DQyX081ap5z?mergeMode=REPLACE', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const data = await response.json();
    }

    const fetchView = async (start = '', end = '', parish = '') => {
        const response = await fetch(`/ovc/api/sqlViews/DQyX081ap5z/data.html+css?var=start:${start}&var=end:${end}&var=parish:${parish}`)
        const data = await response.text();
        return data;
    }

    return { updateQuery, fetchView };
}

export const useLayering = (query: { [key: string]: any }) => {
    return useQuery<any, Error>(
        [Buffer.from(JSON.stringify(query)).toString("base64")],
        async () => {
            const {
                data: { columns, rows, cursor },
            } = await api.post("sql", query);

            if (columns) {
                realColumns = columns;
            }
            return {
                cursor,
                data: rows.map((r: any) => {
                    return fromPairs(
                        realColumns.map((c: any, i: number) => [c.name, r[i]])
                    );
                }),
            };
        }
    );
};

export const useLayering2 = (query: { [key: string]: any }) => {
    return useQuery<any, Error>(
        [Buffer.from(JSON.stringify(query)).toString("base64")],
        async () => {
            const {
                data: { columns, rows, cursor },
            } = await api.post("sql", query);

            if (columns) {
                realColumns = columns;
            }
            return {
                cursor,
                data: rows.map((r: any) => {
                    return fromPairs(
                        realColumns.map((c: any, i: number) => [c.name, r[i]])
                    );
                }),
            };
        }
    );
};

export const useLayeringVSLA = (
    query: { [key: string]: any },
    program: string,
    stage: string,
    units: string[],
    attributeColumns: string[],
    dataElementColumns: string[]
) => {
    const key = Buffer.from(JSON.stringify(query)).toString("base64");
    return useQuery<any, Error>(
        [
            "VSLA",
            program,
            stage,
            ...units,
            key,
            ...attributeColumns,
            ...dataElementColumns,
        ],
        async () => {
            if (program && stage && dataElementColumns.length > 0) {
                const {
                    data: { columns, rows, cursor },
                } = await api.post("sql", {
                    ...query,
                    query: `select ${dataElementColumns.join(
                        ","
                    )} from ${String(stage).toLowerCase()}`,
                });

                if (columns) {
                    realColumns = columns;
                }

                const data = rows.map((r: any) => {
                    return fromPairs(
                        realColumns.map((c: any, i: number) => [c.name, r[i]])
                    );
                });
                const instances = uniq(
                    data.map((d: any) => d.trackedEntityInstance)
                );

                const query2 = {
                    query: `select ${attributeColumns.join(",")} from ${String(
                        program
                    ).toLowerCase()}`,
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
                return {
                    cursor,
                    data: data.map((d: any) => {
                        return {
                            ...d,
                            ...results[d.trackedEntityInstance],
                        };
                    }),
                };
            }
            return {
                data: [],
                cursor: undefined,
            };
        }
    );
};

export const useOVCHMIS = (districts: Option[], period: any) => {
    return useQuery<any, Error>(
        ["ovc-hmis", ...districts.map((d) => d.value), period],
        async () => {
            if (districts.length > 0 && period) {
                let must: any[] = [
                    {
                        match: {
                            "qtr.keyword": period.format("YYYY[Q]Q"),
                        },
                    },
                    {
                        terms: {
                            "level3.keyword": districts.map((d) => d.value),
                        },
                    },
                    {
                        term: {
                            inactive: false,
                        },
                    },
                    {
                        term: {
                            deleted: false,
                        },
                    },
                ];

                let queries = [
                    api.post("sql", {
                        query: `select level4,COUNT(DISTINCT tHCT4RKXoiU) total from layering group by level4`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { coreES: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,sum(nonFormalEducation) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,COUNT(*) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        bool: {
                                            should: [
                                                {
                                                    term: {
                                                        micro: 1,
                                                    },
                                                },
                                                {
                                                    term: {
                                                        igaBooster: 1,
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,COUNT(DISTINCT tHCT4RKXoiU) total from layering group by level4`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { agriBusiness: 1 },
                                    },
                                ],
                            },
                        },
                    }),

                    api.post("sql", {
                        query: `select level4,COUNT(DISTINCT tHCT4RKXoiU) total from layering group by level4`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        bool: {
                                            should: [
                                                {
                                                    term: { VSLA: 1 },
                                                },
                                                {
                                                    term: {
                                                        tempConsumption: 1,
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,sum(coreNutrition) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,COUNT(DISTINCT tHCT4RKXoiU) total from layering group by level4`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { agriBusiness: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,0 total from layering group by level4`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,sum(coreHealth) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,sum(treatedNets) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,0 total from layering group by level4`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,COUNT(*) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        bool: {
                                            should: [
                                                {
                                                    term: { vlsaOvcFund: 1 },
                                                },
                                                {
                                                    term: { educationFund: 1 },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,sum(corePSS) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,sum(tempConsumption) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,sum(GBVPreventionEducation) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,count(*) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: { "hivStatus.keyword": "+" },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,0 total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,COUNT(DISTINCT tHCT4RKXoiU) total from layering group by level4`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "newlyEnrolled.keyword": "Yes",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,COUNT(DISTINCT tHCT4RKXoiU) total from layering group by level4`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "newlyEnrolled.keyword": "Yes",
                                        },
                                    },
                                    {
                                        term: { OVC_SERV: 1 },
                                    },
                                ],
                            },
                        },
                    }),

                    api.post("sql", {
                        query: `select level4,CfpoFtRmK1z,count(*) total from layering group by level4,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "newlyEnrolled.keyword": "Yes",
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { OVC_SERV: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { fullyGraduated: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "newlyEnrolled.keyword": "Yes",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: { linked: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: { testedForHIV: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    // {
                                    //   range: {
                                    //     age: {
                                    //       lte: 17,
                                    //     },
                                    //   },
                                    // },
                                    {
                                        term: { newlyTestedPositive: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    // {
                                    //   range: {
                                    //     age: {
                                    //       lte: 17,
                                    //     },
                                    //   },
                                    // },
                                    {
                                        term: { newlyTestedAndOnArt: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { newlyTestedAndOnArt: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { "hivStatus.keyword": "-" },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "unknown.keyword":
                                                "Test not required",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        terms: {
                                            "unknown.keyword": [
                                                "Other reasons",
                                                "nknown care giver refuses to disclose ",
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: { linked: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { "hivStatus.keyword": "+" },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { onArt: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { VLTestDone: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { ovcVL: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "VLStatus.keyword": "Suppressed",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: { eMTCT: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,0 total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,0 total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    api.post("sql", {
                        query: `select level4,ageGroup,CfpoFtRmK1z,count(*) total from layering group by level4,ageGroup,CfpoFtRmK1z`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        bool: {
                                            should: [
                                                {
                                                    term: { journeysMOH: 1 },
                                                },
                                                {
                                                    term: { hivPrevention: 1 },
                                                },
                                                {
                                                    term: { NMNBoys: 1 },
                                                },
                                                {
                                                    term: { NMNGirls: 1 },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                ];

                const resonse = await Promise.all(queries);
                let processed: { [key: string]: any } = {};
                resonse.forEach(({ data: { rows } }, index) => {
                    processed = {
                        ...processed,
                        ...processRows(`ind${index + 1}`, rows),
                        ...getTotal(`ind${index + 1}`, rows),
                    };
                });
                return processed;
            }
            return {};
        }
    );
};

export const useIndicatorReport = (
    districts: DistrictOption[],
    period: any
) => {
    const engine = useDataEngine();
    return useQuery<any, Error>(
        ["indicator-report", ...districts.map((d) => d.value), period],
        async () => {
            if (districts.length > 0 && period) {
                const year = period.year();
                const quarters = [
                    `${year - 1}Q4`,
                    `${year}Q1`,
                    `${year}Q2`,
                    `${year}Q3`,
                ];
                let must: any[] = [
                    {
                        terms: {
                            "qtr.keyword": quarters,
                        },
                    },
                    {
                        terms: {
                            "level3.keyword": districts.map((d) => d.value),
                        },
                    },
                    {
                        term: {
                            inactive: false,
                        },
                    },
                    {
                        term: {
                            deleted: false,
                        },
                    },
                ];

                let realQueries: any[] = [];
                let realKeys: string[] = [];

                const queries = {
                    // Prevension
                    "actG06XnwYXVPu.uBYxpV8iADb": api.post("sql", {
                        query: `select qtr,COUNT(*) total from "layering2" group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        bool: {
                                            should: prevConditions,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    // COMP
                    "actG06XnwYXVPu.EVrTtYEJfeN": api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [...must],
                            },
                        },
                    }),
                    //Prev Female

                    prevFemale: api.post("sql", {
                        query: `select qtr,COUNT(*) total from "layering2" group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "ZUKC6mck81A.keyword": "Female",
                                        },
                                    },
                                    {
                                        bool: {
                                            should: prevConditions,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    //Prev Male
                    prevMale: api.post("sql", {
                        query: `select qtr,COUNT(*) total from "layering2" group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "ZUKC6mck81A.keyword": "Male",
                                        },
                                    },
                                    {
                                        bool: {
                                            should: prevConditions,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    // COMP Female

                    compFemale: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    // COMP Male
                    compMale: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    // OVC_SERV_SUBPOP
                    actSUBPOP: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        terms: {
                                            "OVC_SERV_SUBPOP.keyword": [
                                                "HEI",
                                                "Survivor of SVAC (0-17 Yrs)",
                                                "CLHIV",
                                                "Child of FSW (0-17 Yrs)",
                                                "Child of HIV+ Caregiver",
                                                "Child of Non suppressed HIV+ Caregiver",
                                                "Adolescent/ Teenage Mother",
                                                "Child of Teenage Mother",
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    tarSUBPOP: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    tarSvwnCeMVs2x: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    tarxjo40XN55fN: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                gt: 17,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    actSvwnCeMVs2x: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        bool: {
                                            should: [
                                                {
                                                    bool: {
                                                        must: [
                                                            {
                                                                term: {
                                                                    isNotAtRisk: 1,
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    "hivStatus.keyword":
                                                                        "DK",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    terms: {
                                                        "hivStatus.keyword": [
                                                            "+",
                                                            "-",
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    actxjo40XN55fN: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                gte: 18,
                                            },
                                        },
                                    },
                                    {
                                        bool: {
                                            should: [
                                                {
                                                    bool: {
                                                        must: [
                                                            {
                                                                term: {
                                                                    isNotAtRisk: 1,
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    "hivStatus.keyword":
                                                                        "DK",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    terms: {
                                                        "hivStatus.keyword": [
                                                            "+",
                                                            "-",
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actfunl4ILuJBgF: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                    {
                                        term: {
                                            "hivStatus.keyword": "DK",
                                        },
                                    },
                                    {
                                        term: {
                                            isNotAtRisk: 0,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actheiF: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                    {
                                        term: {
                                            "hivStatus.keyword": "DK",
                                        },
                                    },
                                    {
                                        term: {
                                            isNotAtRisk: 0,
                                        },
                                    },
                                    {
                                        term: {
                                            "riskFactor.keyword": "HEI",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actfunl4ILuJBgM: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                    {
                                        term: {
                                            "hivStatus.keyword": "DK",
                                        },
                                    },
                                    {
                                        term: {
                                            isNotAtRisk: 0,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actheiM: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                    {
                                        term: {
                                            "hivStatus.keyword": "DK",
                                        },
                                    },
                                    {
                                        term: {
                                            isNotAtRisk: 0,
                                        },
                                    },
                                    {
                                        term: {
                                            "riskFactor.keyword": "HEI",
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    actke1VrRuiMARF: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                    {
                                        term: {
                                            "riskAssessment.keyword": "1",
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    actke1VrRuiMARM: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                    {
                                        term: {
                                            "riskAssessment.keyword": "1",
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    actzu7vuVccd5aF: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                    {
                                        term: {
                                            "isAtRisk.keyword": "1",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actzu7vuVccd5aM: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                    {
                                        term: {
                                            "isAtRisk.keyword": "1",
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    actbvDkc94MhA3F: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_TST_REFER: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actbvDkc94MhA3M: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_TST_REFER: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    actDVgzq5RZugIF: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_TST_REFER: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actDVgzq5RZugIM: api.post("sql", {
                        query: `select qtr,SUM(OVC_SERV) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_TST_REFER: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actRvF3up57r29: api.post("sql", {
                        query: `select qtr,SUM(OVC_ENROL) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },

                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actwTcbcrds2w6F: api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,

                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actwTcbcrds2w6M: api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,

                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    "actwTcbcrds2w6.dHzqsjLPXzb": api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    "actwTcbcrds2w6.VCmHfkJVEDp": api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        range: {
                                            age: {
                                                gte: 18,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    tarwTcbcrds2w6F: api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,

                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    tarwTcbcrds2w6M: api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,

                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    "tarwTcbcrds2w6.dHzqsjLPXzb": api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    "tarwTcbcrds2w6.VCmHfkJVEDp": api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        range: {
                                            age: {
                                                gte: 18,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    actMslqTqo0kdzF: api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            VLTestDone: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            ovcVL: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actMslqTqo0kdzM: api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            VLTestDone: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            ovcVL: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    "actMslqTqo0kdz.dHzqsjLPXzb": api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            VLTestDone: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            ovcVL: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    "actMslqTqo0kdz.VCmHfkJVEDp": api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            VLTestDone: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            ovcVL: 1,
                                        },
                                    },
                                    {
                                        range: {
                                            age: {
                                                gte: 18,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    }),

                    actjCwcGbjVD8GF: api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    // {
                                    //   range: {
                                    //     age: {
                                    //       lte: 17,
                                    //     },
                                    //   },
                                    // },
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            VLTestDone: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            ovcVL: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "VLStatus.keyword": "Suppressed",
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Female",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actjCwcGbjVD8GM: api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,

                                    // {
                                    //   range: {
                                    //     age: {
                                    //       lte: 17,
                                    //     },
                                    //   },
                                    // },
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            VLTestDone: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            ovcVL: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "VLStatus.keyword": "Suppressed",
                                        },
                                    },
                                    {
                                        term: {
                                            "CfpoFtRmK1z.keyword": "Male",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    "actjCwcGbjVD8G.dHzqsjLPXzb": api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                lte: 17,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            VLTestDone: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            ovcVL: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "VLStatus.keyword": "Suppressed",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    "actjCwcGbjVD8G.VCmHfkJVEDp": api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        range: {
                                            age: {
                                                gte: 18,
                                            },
                                        },
                                    },
                                    {
                                        term: {
                                            "hivStatus.keyword": "+",
                                        },
                                    },
                                    {
                                        term: {
                                            OVC_SERV: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "ovcEligible.keyword": "1",
                                        },
                                    },
                                    {
                                        term: {
                                            onArt: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            VLTestDone: 1,
                                        },
                                    },
                                    {
                                        term: {
                                            ovcVL: 1,
                                        },
                                    },

                                    {
                                        term: {
                                            "VLStatus.keyword": "Suppressed",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actd7fhsyxUiCzF: api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        bool: {
                                            should: [
                                                {
                                                    term: {
                                                        GBVPreventionEducation: 1,
                                                    },
                                                },
                                                {
                                                    term: {
                                                        TFGBV: 1,
                                                    },
                                                },
                                                {
                                                    term: {
                                                        "CfpoFtRmK1z.keyword":
                                                            "Female",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actd7fhsyxUiCzM: api.post("sql", {
                        query: `select qtr,COUNT(*) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        bool: {
                                            should: [
                                                {
                                                    term: {
                                                        GBVPreventionEducation: 1,
                                                    },
                                                },
                                                {
                                                    term: {
                                                        TFGBV: 1,
                                                    },
                                                },
                                                {
                                                    term: {
                                                        "CfpoFtRmK1z.keyword":
                                                            "Male",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    tarB5yBgVUt7ij: api.post("sql", {
                        query: `select qtr,COUNT(DISTINCT tHCT4RKXoiU) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "householdStatus.keyword": "Active",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    actB5yBgVUt7ij: api.post("sql", {
                        query: `select qtr,COUNT(DISTINCT tHCT4RKXoiU) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "householdStatus.keyword": "Active",
                                        },
                                    },
                                    {
                                        term: { preGraduated: 1 },
                                    },
                                ],
                            },
                        },
                    }),
                    actHqWXHCI6m5y: api.post("sql", {
                        query: `select qtr,COUNT(DISTINCT tHCT4RKXoiU) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        term: {
                                            "assetOwnership.keyword":
                                                "Improved",
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                    tarHqWXHCI6m5y: api.post("sql", {
                        query: `select qtr,COUNT(DISTINCT tHCT4RKXoiU) total from layering group by qtr`,
                        filter: {
                            bool: {
                                must: [
                                    ...must,
                                    {
                                        terms: {
                                            "assetOwnership.keyword": [
                                                "Improved",
                                                "Stationary",
                                                "Regressed",
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                };

                Object.entries(queries).forEach(([key, query]) => {
                    realKeys = [...realKeys, key];
                    realQueries = [...realQueries, query];
                });

                const responses = await Promise.all(realQueries);

                const { rows } = await fetchTargets2(
                    engine,
                    [
                        "d7fhsyxUiCz",
                        "OVC_AGREE_TST",
                        "xGHjuYfbx31",
                        "etKjMrhsGzx",
                        "lnRPzUJNYQN",
                        "RvF3up57r29",
                        // "xjo40XN55fN",
                        // "SvwnCeMVs2x",
                        "funl4ILuJBg",
                        "A4D8wgVl21q",
                        "FR7RCoLtgHT",
                        "G06XnwYXVPu",
                        "G06XnwYXVPu.EVrTtYEJfeN",
                        "G06XnwYXVPu.uBYxpV8iADb",
                        "G06XnwYXVPu.h4tlGMjEc0Y",
                        // "Jao4Bs5Q2FX",
                        "fiOYJ6SPRIG",
                        "ke1VrRuiMAR",
                        "bvDkc94MhA3",
                        "DVgzq5RZugI",
                        "zu7vuVccd5a",
                        "A4VQnLrL5OE",
                        // "wTcbcrds2w6",
                        // "wTcbcrds2w6.VCmHfkJVEDp",
                        // "wTcbcrds2w6.dHzqsjLPXzb",
                        // "MslqTqo0kdz",
                        // "MslqTqo0kdz.VCmHfkJVEDp",
                        // "MslqTqo0kdz.dHzqsjLPXzb",
                        // "jCwcGbjVD8G",
                        // "jCwcGbjVD8G.VCmHfkJVEDp",
                        // "jCwcGbjVD8G.dHzqsjLPXzb",
                        "HaW4jcu0p9U",
                        "B5yBgVUt7ij",
                        // "HqWXHCI6m5y",
                    ],
                    districts.map((d) => d.value),
                    quarters
                );
                let processed = processRows("tar", rows);

                realKeys.forEach((queryKey: string, index: number) => {
                    const {
                        data: { rows },
                    } = responses[index];
                    processed = {
                        ...processed,
                        ...processRows(queryKey, rows),
                    };
                });

                quarters.forEach((q) => {
                    const prev =
                        processed[`actG06XnwYXVPu.uBYxpV8iADb${q}`] || 0;
                    const comprehensive =
                        processed[`actG06XnwYXVPu.EVrTtYEJfeN${q}`] || 0;

                    const prevMale = processed[`prevMale${q}`] || 0;
                    const comprehensiveMale = processed[`compMale${q}`] || 0;

                    const prevFemale = processed[`prevFemale${q}`] || 0;
                    const comprehensiveFemale =
                        processed[`compFemale${q}`] || 0;

                    processed = {
                        ...processed,
                        [`actG06XnwYXVPu${q}`]: prev + comprehensive,
                        [`actG06XnwYXVPuF${q}`]:
                            prevFemale + comprehensiveFemale,
                        [`actG06XnwYXVPuM${q}`]: prevMale + comprehensiveMale,
                        [`actfunl4ILuJBg${q}`]:
                            (processed[`actfunl4ILuJBgF${q}`] || 0) +
                            (processed[`actfunl4ILuJBgM${q}`] || 0),
                        [`actke1VrRuiMAR${q}`]:
                            (processed[`actke1VrRuiMARF${q}`] || 0) +
                            (processed[`actke1VrRuiMARM${q}`] || 0),
                        [`actzu7vuVccd5a${q}`]:
                            (processed[`actzu7vuVccd5aF${q}`] || 0) +
                            (processed[`actzu7vuVccd5aM${q}`] || 0),
                        [`actbvDkc94MhA3${q}`]:
                            (processed[`actbvDkc94MhA3F${q}`] || 0) +
                            (processed[`actbvDkc94MhA3M${q}`] || 0),
                        [`actDVgzq5RZugI${q}`]:
                            (processed[`actDVgzq5RZugIF${q}`] || 0) +
                            (processed[`actDVgzq5RZugIM${q}`] || 0),
                        [`tarG06XnwYXVPuF${q}`]: processed[`tarG06XnwYXVPu${q}`]
                            ? processed[`tarG06XnwYXVPu${q}`] / 2
                            : 0,
                        [`tarG06XnwYXVPuM${q}`]: processed[`tarG06XnwYXVPu${q}`]
                            ? processed[`tarG06XnwYXVPu${q}`] / 2
                            : 0,
                    };
                });

                quarters.forEach((qtr, index) => {
                    [
                        "jCwcGbjVD8G",
                        "MslqTqo0kdz",
                        "wTcbcrds2w6",
                        "d7fhsyxUiCz",
                        "hei",
                    ].forEach((accessor) => {
                        const targetM = processed[`tar${accessor}M${qtr}`] || 0;
                        const actualM = processed[`act${accessor}M${qtr}`] || 0;
                        const targetF = processed[`tar${accessor}F${qtr}`] || 0;
                        const actualF = processed[`act${accessor}F${qtr}`] || 0;
                        processed = {
                            ...processed,
                            [`act${accessor}${qtr}`]: actualM + actualF,
                            [`tar${accessor}${qtr}`]: targetM + targetF,
                        };
                    });

                    processed = {
                        ...processed,
                        ...convertIndicators(
                            [
                                "actwTcbcrds2w6F",
                                "actwTcbcrds2w6M",
                                "actwTcbcrds2w6.dHzqsjLPXzb",
                                "actwTcbcrds2w6.VCmHfkJVEDp",
                                "actwTcbcrds2w6",
                            ],
                            [
                                "tarMslqTqo0kdzF",
                                "tarMslqTqo0kdzM",
                                "tarMslqTqo0kdz.dHzqsjLPXzb",
                                "tarMslqTqo0kdz.VCmHfkJVEDp",
                                "tarMslqTqo0kdz",
                            ],
                            quarters,
                            processed
                        ),

                        ...convertIndicators(
                            [
                                "actMslqTqo0kdzF",
                                "actMslqTqo0kdzM",
                                "actMslqTqo0kdz.dHzqsjLPXzb",
                                "actMslqTqo0kdz.VCmHfkJVEDp",
                                "actMslqTqo0kdz",
                            ],
                            [
                                "tarjCwcGbjVD8GF",
                                "tarjCwcGbjVD8GM",
                                "tarjCwcGbjVD8G.dHzqsjLPXzb",
                                "tarjCwcGbjVD8G.VCmHfkJVEDp",
                                "tarjCwcGbjVD8G",
                            ],
                            quarters,
                            processed
                        ),
                    };

                    [
                        "B5yBgVUt7ij",
                        "d7fhsyxUiCzF",
                        "d7fhsyxUiCzM",
                        "d7fhsyxUiCz",
                        "HqWXHCI6m5y",
                    ].forEach((accessor) => {
                        if (index > 0) {
                            const indexes = times(index);

                            let target = processed[`tar${accessor}${qtr}`] || 0;
                            let actual = processed[`act${accessor}${qtr}`] || 0;

                            target =
                                target +
                                sum(
                                    indexes.map(
                                        (i: number) =>
                                            processed[
                                                `tar${accessor}${quarters[i]}`
                                            ] || 0
                                    )
                                );

                            actual =
                                actual +
                                sum(
                                    indexes.map(
                                        (i: number) =>
                                            processed[
                                                `act${accessor}${quarters[i]}`
                                            ] || 0
                                    )
                                );

                            processed = {
                                ...processed,
                                [`act${accessor}${qtr}`]: actual,
                                [`tar${accessor}${qtr}`]: target,
                            };
                        }
                    });

                    indicatorReportColumns(period, {}).forEach(
                        ({ columns: [{ accessor }] }) => {
                            if (accessor) {
                                const target =
                                    processed[`tar${accessor}${qtr}`] || 0;
                                const actual =
                                    processed[`act${accessor}${qtr}`] || 0;
                                if (target !== 0) {
                                    processed = {
                                        ...processed,
                                        [`arc${accessor}${qtr}`]:
                                            actual / target,
                                    };
                                }
                            }
                        }
                    );
                });
                return processed;
            }
            return {};
        }
    );
};

const computeOVCServiceTracker = async (
    engine: any,
    period: moment.Moment,
    districts: any[],
    level: string
) => {
    const q = period.quarter();
    const year = period.year();

    const allQuarters = findQuarters(year, q);
    let must: any[] = [
        {
            match: {
                "qtr.keyword": period.format("YYYY[Q]Q"),
            },
        },
        {
            terms: {
                [`level${level}.keyword`]: districts.map((d) => d.value),
            },
        },
        {
            term: {
                inactive: false,
            },
        },
        {
            term: {
                deleted: false,
            },
        },
    ];

    const must2 = [
        {
            match: {
                "qtr.keyword": moment(period)
                    .subtract(1, "quarters")
                    .format("YYYY[Q]Q"),
            },
        },
        { terms: { [`level${level}.keyword`]: districts.map((d) => d.value) } },
    ];
    const queries = [
        api.post("", {
            index: "layering",
            size: 0,
            query: {
                bool: {
                    must: [...must],
                },
            },
            aggs: {
                level: {
                    terms: {
                        field: `level${level}.keyword`,
                        size: 10000,
                    },
                    aggs: {
                        ...ovcTrackerIndicators,
                        age: {
                            terms: {
                                field: "ageGroup.keyword",
                                include: [
                                    "< 1",
                                    "1 - 4",
                                    "5 - 9",
                                    "10 - 14",
                                    "15 - 17",
                                ],
                            },
                            aggs: {
                                ...ovcTrackerIndicators,
                            },
                        },
                    },
                },
            },
        }),
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering2 group by level${level}`,
            filter: {
                bool: {
                    must: [
                        {
                            terms: {
                                "qtr.keyword": allQuarters,
                            },
                        },
                        {
                            terms: {
                                [`level${level}.keyword`]: districts.map(
                                    (d) => d.value
                                ),
                            },
                        },
                        {
                            bool: {
                                should: [
                                    {
                                        term: {
                                            "Completed MOE Journeys Plus": 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "Completed MOH Journeys": 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "Completed NMN Boys": 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "Completed NMN Girls": 1,
                                        },
                                    },
                                    {
                                        term: {
                                            "Completed NMN Boys New Curriculum": 1,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        }),
    ];
    const [
        {
            data: {
                level: { buckets: comprehensive },
            },
        },
        {
            data: { rows: prevention },
        },
        {
            data: { rows: foundRows },
        },
        {
            data: { rows: childrenRows },
        },
        {
            data: { rows: trackers },
        },
        {
            data: { rows: art },
        },
        {
            data: { rows: eligible },
        },
        {
            data: { rows: vlt },
        },
        {
            data: { rows: vlr },
        },
        {
            data: { rows: vls },
        },
        {
            data: { rows: notServed },
        },
        {
            data: { rows: noVL },
        },
        {
            data: { rows: diff },
        },
        {
            data: { rows: sup },
        },
    ] = await Promise.all([
        ...queries,
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            bool: {
                                must_not: [
                                    {
                                        terms: {
                                            "memberStatus.keyword": [
                                                "Died",
                                                "Relocated",
                                                "Exited at Will",
                                                "Not eligible",
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        }),
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            range: {
                                age: {
                                    lte: 20,
                                },
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 1,
                            },
                        },
                    ],
                },
            },
        }),
        //Trackers
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            range: {
                                age: {
                                    lte: 17,
                                },
                            },
                        },
                        {
                            term: {
                                "hivStatus.keyword": "+",
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 1,
                            },
                        },
                        {
                            terms: {
                                "ovcEligible.keyword": ["1", "NE"],
                            },
                        },
                    ],
                },
            },
        }),
        // CLHIV on ART
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            range: {
                                age: {
                                    lte: 17,
                                },
                            },
                        },
                        {
                            term: {
                                "hivStatus.keyword": "+",
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 1,
                            },
                        },
                        {
                            terms: {
                                "ovcEligible.keyword": ["1", "NE"],
                            },
                        },
                        {
                            term: {
                                onArt: 1,
                            },
                        },
                    ],
                },
            },
        }),
        // Eligible
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            range: {
                                age: {
                                    lte: 17,
                                },
                            },
                        },
                        {
                            term: {
                                "hivStatus.keyword": "+",
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 1,
                            },
                        },
                        {
                            term: {
                                "ovcEligible.keyword": "1",
                            },
                        },
                        {
                            term: {
                                onArt: 1,
                            },
                        },
                    ],
                },
            },
        }),
        // VLT
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            range: {
                                age: {
                                    lte: 17,
                                },
                            },
                        },
                        {
                            term: {
                                "hivStatus.keyword": "+",
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 1,
                            },
                        },
                        {
                            term: {
                                "ovcEligible.keyword": "1",
                            },
                        },
                        {
                            term: {
                                onArt: 1,
                            },
                        },
                        {
                            term: {
                                VLTestDone: 1,
                            },
                        },
                    ],
                },
            },
        }),
        // VLR
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            range: {
                                age: {
                                    lte: 17,
                                },
                            },
                        },
                        {
                            term: {
                                "hivStatus.keyword": "+",
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 1,
                            },
                        },
                        {
                            term: {
                                "ovcEligible.keyword": "1",
                            },
                        },
                        {
                            term: {
                                onArt: 1,
                            },
                        },
                        {
                            term: {
                                VLTestDone: 1,
                            },
                        },
                        {
                            term: {
                                ovcVL: 1,
                            },
                        },
                    ],
                },
            },
        }),
        // VLS
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            range: {
                                age: {
                                    lte: 17,
                                },
                            },
                        },
                        {
                            term: {
                                "hivStatus.keyword": "+",
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 1,
                            },
                        },
                        {
                            term: {
                                "ovcEligible.keyword": "1",
                            },
                        },
                        {
                            term: {
                                onArt: 1,
                            },
                        },
                        {
                            term: {
                                VLTestDone: 1,
                            },
                        },
                        {
                            term: {
                                ovcVL: 1,
                            },
                        },

                        {
                            term: {
                                "VLStatus.keyword": "Suppressed",
                            },
                        },
                    ],
                },
            },
        }),
        // Not served
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            range: {
                                age: {
                                    lte: 17,
                                },
                            },
                        },
                        {
                            term: {
                                "hivStatus.keyword": "+",
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 0,
                            },
                        },
                        {
                            terms: {
                                "ovcEligible.keyword": ["1", "NE", "No VL"],
                            },
                        },
                        {
                            bool: {
                                must_not: [
                                    {
                                        terms: {
                                            "memberStatus.keyword": [
                                                "Died",
                                                "Relocated",
                                                "Exited at Will",
                                                "Not eligible",
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        }),
        // CLHIV served no VL
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            range: {
                                age: {
                                    lte: 17,
                                },
                            },
                        },
                        {
                            term: {
                                "hivStatus.keyword": "+",
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 1,
                            },
                        },
                        {
                            term: {
                                "ovcEligible.keyword": "No VL",
                            },
                        },
                    ],
                },
            },
        }),
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must2,
                        {
                            range: {
                                age: {
                                    lte: 17,
                                },
                            },
                        },
                        {
                            term: {
                                "hivStatus.keyword": "+",
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 1,
                            },
                        },
                        {
                            terms: {
                                "ovcEligible.keyword": ["1", "NE"],
                            },
                        },
                    ],
                },
            },
        }),
        api.post("sql", {
            query: `select level${level},COUNT(*) total from layering group by level${level}`,
            filter: {
                bool: {
                    must: [
                        ...must,
                        {
                            range: {
                                age: {
                                    lte: 17,
                                },
                            },
                        },
                        {
                            term: {
                                "hivStatus.keyword": "+",
                            },
                        },
                        {
                            term: {
                                OVC_SERV: 1,
                            },
                        },
                        {
                            term: {
                                "ovcEligible.keyword": "1",
                            },
                        },
                        {
                            term: {
                                onArt: 1,
                            },
                        },
                        {
                            term: {
                                VLTestDone: 1,
                            },
                        },
                        {
                            term: {
                                ovcVL: 1,
                            },
                        },

                        {
                            term: {
                                "VLStatus.keyword": "Unsuppressed",
                            },
                        },
                    ],
                },
            },
        }),
    ]);
    const { rows } = await fetchTargets(
        engine,
        [
            "G06XnwYXVPu.EVrTtYEJfeN",
            "G06XnwYXVPu.uBYxpV8iADb",
            "G06XnwYXVPu.h4tlGMjEc0Y",
            "SvwnCeMVs2x",
            "xjo40XN55fN",
        ],
        districts.map((d) => d.value),
        [period.format("YYYY[Q]Q")]
    );

    let processed: { [key: string]: any } = fromPairs(
        rows.map(([de, ou, value]: any) => [
            `${de}${ou}`,
            Number(Number(value).toFixed(0)),
        ])
    );

    processed = {
        ...processed,
        ...fromPairs(foundRows),
        ...fromPairs(
            childrenRows.map(([ou, total]: any) => [`child${ou}`, total])
        ),
        ...fromPairs(
            trackers.map(([ou, total]: any) => [`tracker${ou}`, total])
        ),
        ...fromPairs(art.map(([ou, total]: any) => [`art${ou}`, total])),
        ...fromPairs(
            eligible.map(([ou, total]: any) => [`eligible${ou}`, total])
        ),
        ...fromPairs(vlt.map(([ou, total]: any) => [`vlt${ou}`, total])),
        ...fromPairs(vlr.map(([ou, total]: any) => [`vlr${ou}`, total])),
        ...fromPairs(vls.map(([ou, total]: any) => [`vls${ou}`, total])),
        ...fromPairs(
            notServed.map(([ou, total]: any) => [`notServed${ou}`, total])
        ),
        ...fromPairs(noVL.map(([ou, total]: any) => [`noVL${ou}`, total])),
        ...fromPairs(diff.map(([ou, total]: any) => [`diff${ou}`, total])),
        ...fromPairs(sup.map(([ou, total]: any) => [`sup${ou}`, total])),
        ...fromPairs(
            prevention.map(([ou, total]: any) => [`PREV${ou}`, total])
        ),
    };
    comprehensive.forEach(
        ({
            key: ou,
            age: { buckets },
            OVC_SERV,
            servedInPreviousQuarter,
            quarter,
        }: any) => {
            let OVC_SERV_17 = 0;
            let quarter_17 = 0;
            let servedInPreviousQuarter_17 = 0;
            buckets.forEach(
                ({ OVC_SERV, servedInPreviousQuarter, quarter }: any) => {
                    OVC_SERV_17 = OVC_SERV_17 + OVC_SERV.value;
                    quarter_17 = quarter_17 + quarter.value;
                    servedInPreviousQuarter_17 =
                        servedInPreviousQuarter_17 +
                        servedInPreviousQuarter.value;
                }
            );
            processed[`OVC_SERV${ou}`] = OVC_SERV.value;
            processed[`quarter${ou}`] = quarter.value;
            processed[`servedInPreviousQuarter${ou}`] =
                servedInPreviousQuarter.value;
            processed[`OVC_SERV_17${ou}`] = OVC_SERV_17;
            processed[`quarter_17${ou}`] = quarter_17;
            processed[`servedInPreviousQuarter_17${ou}`] = quarter.value;
        }
    );

    return processed;
};

export const useOVCServiceTracker = (
    districts: DistrictOption[],
    period: any
) => {
    const engine = useDataEngine();

    return useQuery<any, Error>(
        ["ovc-service-tracker", ...districts.map((d) => d.value), period],
        async () => {
            if (districts.length > 0 && period) {
                // prevention.forEach(({ key: ou, completedPrevention }: any) => {
                //   processed[`PREV${ou}`] = completedPrevention.value;
                // });
                let processed = {};

                const divisions = districts.flatMap((d) => {
                    if (
                        kampalaDivisions
                            .map(({ value }) => value)
                            .indexOf(d.value) !== -1
                    ) {
                        return d;
                    }
                    return [];
                });
                const noneDivisions = districts.flatMap((d) => {
                    if (
                        kampalaDivisions
                            .map(({ value }) => value)
                            .indexOf(d.value) === -1
                    ) {
                        return d;
                    }
                    return [];
                });

                if (noneDivisions.length > 0) {
                    const defaultSettings = await computeOVCServiceTracker(
                        engine,
                        period,
                        districts,
                        "3"
                    );

                    processed = { ...processed, ...defaultSettings };
                }
                if (divisions.length > 0) {
                    const others = await computeOVCServiceTracker(
                        engine,
                        period,
                        divisions,
                        "4"
                    );
                    processed = { ...processed, ...others };
                }
                return processed;
            }
            return {};
        }
    );
};

export const useDistricts = () => {
    const engine = useDataEngine();
    return useQuery<Option[], Error>("districts", async () => {
        const {
            districts: { organisationUnits },
            subCounties: { organisationUnits: counties },
        }: any = await engine.query({
            districts: {
                resource: "organisationUnits.json",
                params: {
                    level: 3,
                    paging: "false",
                    fields: "id~rename(value),name~rename(label)",
                },
            },
            subCounties: {
                resource: "organisationUnits.json",
                params: {
                    level: 4,
                    paging: "false",
                    fields: "id,name,parent[id,name]",
                },
            },
        });
        const processedSubCounties = groupBy(
            counties.map(
                ({ id, name, parent: { id: pId, name: pName } }: any) => {
                    return {
                        id,
                        name,
                        parent: pId,
                        parentName: pName,
                    };
                }
            ),
            "parent"
        );
        setSubCounties(processedSubCounties);
        return organisationUnits;
    });
};
