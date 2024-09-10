import { range } from "lodash";
import { Column, TdProps } from "./../interfaces";

const allAgeGroups = [
    { label: "Under 1 Year", id: "< 1" },
    { label: "1 - 4 Years", id: "1 - 4" },
    { label: "5 - 9 Years", id: "5 - 9" },
    { label: "10 - 14 Years", id: "10 - 14" },
    { label: "15 - 17 Years", id: "15 - 17" },
    { label: "18 - 20 Years", id: "18 - 20" },
    { label: "21 - 24 Years", id: "21 - 24" },
    { label: "25+ Years", id: "25+" },
];

const from0To17 = [
    { label: "Under 1 Year", id: "< 1" },
    { label: "1 - 4 Years", id: "1 - 4" },
    { label: "5 - 9 Years", id: "5 - 9" },
    { label: "10 - 14 Years", id: "10 - 14" },
    { label: "15 - 17 Years", id: "15 - 17" },
];
const from10To17 = [
    { label: "10 - 14 Years", id: "10 - 14" },
    { label: "15 - 17 Years", id: "15 - 17" },
];
export const columns: Column[] = [
    { display: "Instance", id: "id", selected: true },
    { display: "Beneficiary ID", id: "HLKc2AKR9jW", selected: true },
    // {
    //   display: "Old Beneficiary ID",
    //   id: "e0zEpTw7IH6",
    //   selected: true,
    // },
    { display: "Household Code", id: "tHCT4RKXoiU", selected: true },
    {
        display: "Enrollment Date",
        id: "enrollmentDate",
        selected: true,
    },

    {
        display: "Type(Comprehensive, Prevention)",
        id: "type",
        selected: true,
    },
    { display: "District", id: "district", selected: true },
    { display: "Sub-county", id: "subCounty", selected: true },
    { display: "Parish", id: "orgUnitName", selected: true },
    { display: "Village", id: "Xkwy5P2JG24", selected: true },
    { display: "Household Head", id: "ExnzeYjgIaT", selected: true },
    {
        display: "Primary Caregiver",
        id: "primaryCareGiver",
        selected: true,
    },
    {
        display: "Date of Assessment",
        id: "eventDate",
        selected: true,
    },
    {
        display: "Beneficiary Name",
        id: "huFucxA3e5c",
        selected: true,
    },
    { display: "DOB", id: "N1nMqKtYKvI", selected: true },
    { display: "Age", id: "age", selected: true },
    { display: "Age Group", id: "ageGroup", selected: true },
    { display: "Sex", id: "CfpoFtRmK1z", selected: true },
    {
        display: "Current Weight",
        id: "weight",
        selected: true,
    },
    {
        display: "Risk Factor",
        id: "riskFactor",
        selected: true,
    },
    {
        display: "Household Economic Status",
        id: "houseHoldType",
        selected: true,
    },
    {
        display: "Household status",
        id: "householdStatus",
        selected: true,
    },
    { display: "Member status", id: "memberStatus", selected: true },
    {
        display: "Currently Enrolled in School (Y/N)",
        id: "enrolledInSchool",
        selected: true,
    },
    { display: "Newly enrolled", id: "newlyEnrolled", selected: true },
    { display: "HIV_Status(+,-,?, -/+)", id: "hivStatus", selected: true },
    {
        display: "OVC_TST ASSESS",
        id: "riskAssessment",
        selected: true,
    },
    {
        display: "OVC_TST RISK",
        id: "isAtRisk",
        selected: true,
    },
    {
        display: "OVC_TST REFER",
        id: "OVC_TST_REFER",
        selected: true,
    },
    {
        display: "OVC_TST REPORT",
        id: "OVC_TST_REPORT",
        selected: true,
    },
    {
        display: "HIV test not required based on  HIV risk Assessment",
        id: "isNotAtRisk",
        selected: true,
    },
    {
        display: "Unknown HIV status: other reasons",
        id: "unknown",
        selected: true,
    },
    {
        display: "Linked to HTS (referred for Testing) (1 Yes, 0 No)",
        id: "linked",
        selected: true,
    },
    {
        display: "Tested for HIV (1 Yes, 0 No)",
        id: "testedForHIV",
        selected: true,
    },
    {
        display: "Newly Reported HIV Positive (1 Yes, 0 No)",
        id: "newlyPositive",
        selected: true,
    },

    {
        display: "Newly Tested HIV Positive (1 Yes, 0 No)",
        id: "newlyTestedPositive",
        selected: true,
    },
    {
        display: "Newly Tested HIV Positive initiated on ART (1 Yes, 0 No)",
        id: "newlyTestedAndOnArt",
        selected: true,
    },
    { display: "Date of ART initiation", id: "artStartDate", selected: true },
    { display: "ART_No_HVAT", id: "n7VQaJ8biOJ", selected: true },
    { display: "ART_No_VL", id: "artNo", selected: true },
    {
        display: "On_ART_HVAT (1 Yes, 0 No)",
        id: "umqeJCVp4Zq",
        selected: true,
    },
    {
        display: "Facility",
        id: "facility",
        selected: true,
    },
    {
        display: "Last Viral Load Date",
        id: "lastViralLoadDate",
        selected: true,
    },
    {
        display: "Regimen",
        id: "currentRegimen",
        selected: true,
    },
    {
        display: "On_ART_VL (1 Yes, 0 No)",
        id: "onArt",
        selected: true,
    },
    {
        display: "OVC_VL Eligible (1 Yes, 0 No)",
        id: "ovcEligible",
        selected: true,
    },
    { display: "VLTest done (1 Yes, 0 No)", id: "VLTestDone", selected: true },
    { display: "OVC_VLR (1 Yes, 0 No, Waiting )", id: "ovcVL", selected: true },
    {
        display: "Viral Load Status (Suppressed, Non Suppressed, Waiting)",
        id: "VLStatus",
        selected: true,
    },
    {
        display: "Viral Load Copies",
        id: "copies",
        selected: true,
    },
    { display: "OVC_VLS (1 Yes, 0 No))", id: "VLSuppressed", selected: true },
    { id: "eidNo", display: "EID No", selected: true },
    { id: "eidEnrollmentDate", display: "EID Enrollment date", selected: true },
    { id: "motherArtNo", display: "Mother's Art No", selected: true },
    { id: "dateFirstPCRDone", display: "1st PCR Date", selected: true },
    { id: "firstPCRResults", display: "1st PCR Results", selected: true },
    { id: "dateSecondPCRDone", display: "2nd PCR Date", selected: true },
    { id: "secondPCRResults", display: "2nd PCR Results", selected: true },
    { id: "dateThirdPCRDone", display: "3rd PCR Date", selected: true },
    { id: "thirdPCRResults", display: "3rd PCR Results", selected: true },
    {
        id: "hivTestDueDate",
        display: "Due date for HIV rapid Test",
        selected: true,
    },
    {
        id: "dateHivTestDone",
        display: "Date when HIV rapid test was done",
        selected: true,
    },
    { id: "hivTestResults", display: "HIV test result", selected: true },
    { id: "finalOutcome", display: "Final Outcome", selected: true },
    { id: "pcr", display: "PCR Test", selected: true },
    {
        id: "missedAppointmentDate",
        display: "Missed Appointment Date",
        selected: true,
    },
    {
        id: "missedAnAppointment",
        display: "Missed Appointment",
        selected: true,
    },
    {
        id: "missedAnAppointmentReason",
        display: "Missed Appointment Reason",
        selected: true,
    },
    {
        id: "missedAnAppointmentFollowupOutcome",
        display: "Missed Appointment Followup Outcome",
        selected: true,
    },
    {
        id: "hasEverMissedAnAppointment",
        display: "Ever Missed An Appointment",
        selected: true,
    },
    { display: "VSLA", id: "VSLA", selected: true },

    {
        display: "Group Based Financial Literacy",
        id: "fLiteracy",
        selected: true,
    },
    {
        display: "Home Based Financial Literacy",
        id: "fHomeBasedLiteracy",
        selected: true,
    },
    { display: "Bank Linkages", id: "bankLinkages", selected: true },
    { display: "Agribusiness", id: "agriBusiness", selected: true },
    { display: "SPM Training", id: "spmTraining", selected: true },
    { display: "Micro-Franchise", id: "micro", selected: true },
    { display: "IGA Booster", id: "igaBooster", selected: true },
    {
        display: "Temporary Food support",
        id: "tempConsumption",
        selected: true,
    },
    { display: "VSLA OVC protection Fund", id: "vlsaOvcFund", selected: true },
    { display: "Core_ES", id: "coreES", selected: true },
    { display: "Education subsidy", id: "educationSubsidy", selected: true },
    { display: "Home Learning", id: "homeLearning", selected: true },
    {
        display: "Vocational/Apprenticeship",
        id: "nonFormalEducation",
        selected: true,
    },
    {
        display:
            "Education Information(Enrollment,Attendance,Retention and Progression)",
        id: "educationInformation",
        selected: true,
    },
    {
        display: "OVC VSLA Education Fund",
        id: "educationFund",
        selected: true,
    },
    { display: "core_education", id: "coreEducation", selected: true },
    { display: "VSLA OVC Health Fund", id: "healthFund", selected: true },
    { display: "HTS referral", id: "HTSReferral", selected: true },
    {
        display: "Non Disclosure Support",
        id: "nonDisclosureSupport",
        selected: true,
    },
    {
        display: "Antiretroviral Therapy (ART) Initiation",
        id: "artInitiation",
        selected: true,
    },
    {
        display: "Home drug delivery",
        id: "homeDrugDelivery",
        selected: true,
    },
    {
        display: "ART_Adherence_Education",
        id: "artAdherenceEducation",
        selected: true,
    },
    {
        display: "Viraload Bleeding",
        id: "viralLoadBleeding",
        selected: true,
    },
    {
        display: "PLHIV Returned to Care",
        id: "returnedToCare",
        selected: true,
    },
    {
        display: "Intensive Adherence Counseling (IAC)",
        id: "iac",
        selected: true,
    },
    { display: "EMTCT", id: "eMTCT", selected: true },
    {
        display: "HIV prevention Education",
        id: "hivPrevention",
        selected: true,
    },
    { display: "Journeys MOH", id: "journeysMOH", selected: true },
    { display: "Journeys LARA", id: "journeysLARA", selected: true },
    { display: "NMN (Boys)", id: "NMNBoys", selected: true },
    { display: "NMN (Girls)", id: "NMNGirls", selected: true },
    { display: "Transport_Health", id: "TFHealth", selected: true },
    { display: "PEP Service", id: "PEP", selected: true },
    { display: "COVID 19 Education", id: "covid19Education", selected: true },
    { display: "Immunization", id: "immunization", selected: true },
    { display: "WASH Services", id: "wash", selected: true },
    { display: "Insecticide Treated Nets", id: "treatedNets", selected: true },
    { display: "Family Planning", id: "familyPlanning", selected: true },
    { display: "TB Screening", id: "tbScreening", selected: true },
    { display: "Risk of TB", id: "atRiskOfTB", selected: true },
    { display: "Tested for TB", id: "tested4TB", selected: true },
    {
        display: "Initiated on TB Treatment",
        id: "initiatedOnTB",
        selected: true,
    },
    {
        display: "Supported to Complete TB Dose",
        id: "supported2CompleteTBDose",
        selected: true,
    },
    {
        display: "Other Health Related Services",
        id: "otherHealthServices",
        selected: true,
    },
    { display: "core_health", id: "coreHealth", selected: true },
    {
        display: "GBV Prevention Education",
        id: "GBVPreventionEducation",
        selected: true,
    },
    { display: "Transport_GBV", id: "TFGBV", selected: true },
    { display: "Legal support", id: "referral4LegalSupport", selected: true },
    { display: "ECD", id: "ECD", selected: true },
    { display: "Attended Parenting", id: "parentingAttended", selected: true },
    { display: "Completed Parenting", id: "parenting", selected: true },
    {
        display: "Child Protection Education",
        id: "childProtectionEducation",
        selected: true,
    },
    {
        display: "Core_child_protection",
        id: "coreChildProtection",
        selected: true,
    },
    {
        display: "Nutrition education",
        id: "nutritionEducation",
        selected: true,
    },
    {
        display: "Voucher for crops",
        id: "voucher4CropsOrKitchenGardens",
        selected: true,
    },
    {
        display: "NutritionalSupport (Kitchen Garden)",
        id: "kitchenGarden",
        selected: true,
    },
    {
        display: "Nutritional Assessment",
        id: "nutritionalAssessment",
        selected: true,
    },
    {
        display: "Nutritional Food Supplement",
        id: "nutritionalFoodSupplement",
        selected: true,
    },
    { display: "core_nutrition", id: "coreNutrition", selected: true },
    { display: "PSS", id: "psychosocialSupport", selected: true },
    { display: "core_pss", id: "corePSS", selected: true },
    {
        display: "Served in Current Reporting Quarter",
        id: "quarter",
        selected: true,
    },
    {
        display: "Served_in_Previous Quarter",
        id: "servedInPreviousQuarter",
        selected: true,
    },
    {
        display: "Pre-Graduated(1 Yes, 0 No)",
        id: "preGraduated",
        selected: true,
    },
    {
        display: "Fully Graduated(1 Yes, 0 No)",
        id: "fullyGraduated",
        selected: true,
    },
    { display: "OVC_SERV(1 Yes, 0 No)", id: "OVC_SERV", selected: true },
    { display: "OVC_ENROL", id: "OVC_ENROL", selected: true },
    { display: "OVC_SERV_SUBPOP", id: "OVC_SERV_SUBPOP", selected: true },
    {
        display: "OVC_HIV STAT (1 Yes, 0 No, )",
        id: "OVC_HIV_STAT",
        selected: true,
    },
    {
        display: "Asset Ownership",
        id: "assetOwnership",
        selected: true,
    },
    {
        display: "Exited With Graduation",
        id: "exitedWithGraduation",
        selected: true,
    },
    {
        display: "Transferred to Other PEPFAR IP",
        id: "otherPERFARIP",
        selected: true,
    },
    { display: "Transferred to Other IP", id: "otherIP", selected: true },
    { display: "Para-social Worker", id: "homeVisitor", selected: true },
    {
        display: "Telephone No. of Para-social Worker",
        id: "homeVisitorContact",
        selected: true,
    },
    {
        display: "Data Entrant",
        id: "dataEntrant",
        selected: true,
    },
    {
        display: "Q",
        id: "qtr",
        selected: true,
    },
    {
        display: "Lasted Generated",
        id: "generated",
        selected: true,
    },
    {
        display: "Deleted",
        id: "deleted",
        selected: true,
    },
    {
        display: "Inactive",
        id: "inactive",
        selected: true,
    },
];

export const columns2: Column[] = [
    {
        id: "id",
        display: "Activity Code",
        selected: true,
    },
    {
        id: "ypDUCAS6juy",
        display: "Beneficiary ID",
        selected: true,
    },
    {
        id: "enrollmentDate",
        display: "Enrollment Date",
        selected: true,
    },
    {
        id: "completionDate",
        display: "Completion Date",
        selected: true,
    },
    {
        id: "Ah4eyDOBf51",
        display: "Implementing Partner",
        selected: true,
    },
    {
        id: "mWyp85xIzXR",
        display: "Group Type",
        selected: true,
    },
    {
        id: "cYDK0qZSri9",
        display: "Group Name",
        selected: true,
    },
    {
        id: "vfHaBC1ONln",
        display: "Beneficiary Name",
        selected: true,
    },
    {
        id: "ZUKC6mck81A",
        display: "Sex",
        selected: true,
    },
    {
        id: "eXWM3v3oIKu",
        display: "Age",
        selected: true,
    },
    {
        id: "district",
        display: "District",
        selected: true,
    },
    {
        id: "subCounty",
        display: "Sub-county",
        selected: true,
    },
    {
        id: "orgUnitName",
        display: "Parish",
        selected: true,
    },

    //MOE

    {
        id: "My body image",
        selected: true,
        bg: "red.200",
        display: "1.My body image",
    },
    {
        id: "Pupil to pupil Relationships",
        selected: true,
        bg: "red.200",
        display: "2.Pupil to pupil Relationships",
    },
    {
        id: "Teacher to pupil Relationships",
        selected: true,
        bg: "red.200",
        display: "3.Teacher to pupil Relationships",
    },
    {
        id: "Healthy and unhealthy relationships",
        selected: true,
        bg: "red.200",
        display: "4.Healthy and unhealthy relationships",
    },
    {
        id: "Resisting negative peer pressure",
        selected: true,
        bg: "red.200",
        display: "5.Resisting negative peer pressure",
    },
    {
        id: "HIV/AIDS, STI, Truth and Myths",
        selected: true,
        bg: "red.200",
        display: "6.HIV/AIDS, STI, Truth and Myths",
    },
    {
        id: "HIV Transmission",
        selected: true,
        bg: "red.200",
        display: "7.HIV Transmission",
    },
    {
        id: "Stigma and Discrimination",
        selected: true,
        bg: "red.200",
        display: "8.Stigma and Discrimination",
    },
    {
        id: "Gender and HIV",
        selected: true,
        bg: "red.200",
        display: "9.Gender and HIV",
    },
    {
        id: "Teenage Pregnancy",
        selected: true,
        bg: "red.200",
        display: "10.Teenage Pregnancy",
    },
    {
        id: "The 4Cs and meaning of consents",
        selected: true,
        bg: "red.200",
        display: "11.The 4Cs and meaning of consents",
    },
    {
        id: "Power and Consent",
        selected: true,
        bg: "red.200",
        display: "12.Power and Consent",
    },
    {
        id: "Let's decide",
        selected: true,
        bg: "red.200",
        display: "13.Let's decide",
    },
    {
        id: "HIV & School Related GBV risk and protection",
        selected: true,
        bg: "red.200",
        display:
            "14.HIV & School Related Gender Based Violence (SRGBV) risk and protection",
    },
    {
        id: "Positive bystander response to violence",
        selected: true,
        bg: "red.200",
        display: "15.Positive bystander response to violence",
    },
    {
        id: "Post Violence Care, treatment and support",
        selected: true,
        bg: "red.200",
        display: "16.Post Violence Care, treatment and support",
    },
    {
        id: "Reporting of Violence and Abuse",
        selected: true,
        bg: "red.200",
        display: "17.Reporting of Violence and Abuse",
    },
    {
        id: "Seeking Assistance",
        selected: true,
        bg: "red.200",
        display: "18.Seeking Assistance",
    },
    {
        id: "MOE Journeys Plus",
        selected: true,
        bg: "red.200",
        display: "MOE Journeys Plus sessions attended",
    },
    {
        id: "Completed MOE Journeys Plus",
        selected: true,
        bg: "red.200",
        display: "Completed MOE Journeys Plus",
    },

    //MOH
    {
        id: "Let's communicate",
        selected: true,
        bg: "yellow",
        display: "1.Let's communicate",
    },
    {
        id: "Making friends",
        selected: true,
        bg: "yellow",
        display: "2.Making friends",
    },
    {
        id: "What's important to me",
        selected: true,
        bg: "yellow",
        display: "3.What's important to me",
    },
    {
        id: "Talents, interests and personal qualities",
        selected: true,
        bg: "yellow",
        display: "4.Talents, interests and personal qualities",
    },
    {
        id: "Respecting similarities and differences",
        selected: true,
        bg: "yellow",
        display: "5.Respecting similarities and differences",
    },
    {
        id: "The feeling game",
        selected: true,
        bg: "yellow",
        display: "6.The feeling game",
    },
    {
        id: "Let's decide",
        selected: true,
        bg: "yellow",
        display: "7.Let's decide",
    },
    {
        id: "Gender",
        selected: true,
        bg: "yellow",
        display: "8.Gender",
    },
    {
        id: "My Body",
        selected: true,
        bg: "yellow",
        display: "9.My Body",
    },

    {
        id: "Menstruation and making reusable sanitary pads",
        selected: true,
        bg: "yellow",
        display: "10.Menstruation and making reusable sanitary pads",
    },
    {
        id: "Child pregnancy",
        selected: true,
        bg: "yellow",
        display: "11.Child pregnancy",
    },
    {
        id: "My body image",
        selected: true,
        bg: "yellow",
        display: "12.My body image",
    },

    {
        id: "Facts about HIV/AIDS and other sexual transmitted infections (STIs)",
        selected: true,
        bg: "yellow",
        display:
            "13.Facts about HIV/AIDS and other sexual transmitted infections (STIs)",
    },
    {
        id: "14.How HIV affects our bodies",
        selected: true,
        bg: "yellow",
        display: "14.How HIV affects our bodies",
    },
    {
        id: "How HIV and AIDs affects children",
        selected: true,
        bg: "yellow",
        display: "15.How HIV and AIDs affects children",
    },
    {
        id: "Healthy and unhealthy relationships",
        selected: true,
        bg: "yellow",
        display: "16.Healthy and unhealthy relationships",
    },
    {
        id: "Positive and Negative attention",
        selected: true,
        bg: "yellow",
        display: "17.Positive and Negative attention",
    },

    {
        id: "Status",
        selected: true,
        bg: "yellow",
        display: "18.Status",
    },
    {
        id: "Sexual Harassment",
        selected: true,
        bg: "yellow",
        display: "19.Sexual Harassment",
    },
    {
        id: "Community response to violence",
        selected: true,
        bg: "yellow",
        display: "20.Community response to violence",
    },
    {
        id: "My circle of support",
        selected: true,
        bg: "yellow",
        display: "21.My circle of support",
    },

    {
        id: "Our project",
        selected: true,
        bg: "yellow",
        display: "22.Our project",
    },

    {
        id: "MOH Journeys curriculum",
        selected: true,
        bg: "yellow",
        display: "MOH Journeys sessions attended",
    },
    {
        id: "Completed MOH Journeys",
        selected: true,
        bg: "yellow",
        display: "Completed MOH Journeys",
    },

    //Boys

    {
        id: "Introduction to sources of strength",
        selected: true,
        bg: "green",
        display: "1.Introduction to sources of strength",
    },
    {
        id: "Journey to Manhood",
        selected: true,
        bg: "green",
        display: "2.Journey to Manhood",
    },
    {
        id: "Introduction to the man box",
        selected: true,
        bg: "green",
        display: "3.Introduction to the man box",
    },
    {
        id: "Cycle of force",
        selected: true,
        bg: "green",
        display: "4.Cycle of force",
    },
    {
        id: "Intervention",
        selected: true,
        bg: "green",
        display: "5.Intervention",
    },
    {
        id: "No means No sessions (Boys)",
        selected: true,
        bg: "green",
        display: "NMN Boys total sessions",
    },
    {
        id: "Completed NMN Boys",
        selected: true,
        bg: "green",
        display: "Completed NMN Boys",
    },
    // Girls

    {
        id: "Self-defence basics and assault continuum",
        selected: true,
        bg: "pink",
        display: "1.Self-defence basics and assault continuum",
    },
    {
        id: "Target, test and attack (plays, awareness, intuition)",
        selected: true,
        bg: "pink",
        display: "2.Target, test and attack (plays, awareness, intuition)",
    },
    {
        id: "Assertive, aggressiveness passive scale and verbal skills",
        selected: true,
        bg: "pink",
        display: "3.Assertive, aggressiveness passive scale and verbal skills",
    },
    {
        id: "Weapons and targets",
        selected: true,
        bg: "pink",
        display: "4.Weapons and targets",
    },
    {
        id: "Strikes, chokes, full force",
        selected: true,
        bg: "pink",
        display: "5.Strikes, chokes, full force",
    },
    {
        id: "Descalation, negotiation, multiple attackers, full force drill",
        selected: true,
        bg: "pink",
        display:
            "6.Descalation, negotiation, multiple attackers, full force drill",
    },

    {
        id: "No means No sessions (Girls)",
        selected: true,
        bg: "pink",
        display: "NMN Girls sessions attended",
    },
    {
        id: "Completed NMN Girls",
        selected: true,
        bg: "pink",
        display: "Completed NMN Girls",
    },

    // New Boys
    {
        id: "1 Introduction to No Means No program.",
        bg: "yellow",
        selected: true,
        display: "1 Introduction to No Means No program.",
    },
    {
        id: "2. Steps on your Journey to Adulthood.",
        bg: "yellow",
        selected: true,
        display: "2. Steps on your Journey to Adulthood.",
    },
    {
        id: "3. Step Outside of the Box",
        bg: "yellow",
        selected: true,
        display: "3. Step Outside of the Box",
    },
    {
        id: "4 Your Sources of Strength",
        bg: "yellow",
        selected: true,
        display: "4 Your Sources of Strength",
    },
    {
        id: "5 Scenes of Strength",
        bg: "yellow",
        selected: true,
        display: "5 Scenes of Strength",
    },
    {
        id: "6 Empowered Survivors Perspective",
        bg: "yellow",
        selected: true,
        display: "6 Empowered Survivors Perspective",
    },
    {
        id: "7 Your Moment of Truth",
        bg: "yellow",
        selected: true,
        display: "7 Your Moment of Truth",
    },
    {
        id: "8. It take Courage",
        bg: "yellow",
        selected: true,
        display: "8. It take Courage",
    },
    {
        id: "9. Bystander Intervention",
        bg: "yellow",
        selected: true,
        display: "9. Bystander Intervention",
    },
    {
        id: "10. Graduation",
        bg: "yellow",
        selected: true,
        display: "10. Graduation",
    },

    {
        id: "No means No sessions (Boys) New Curriculum",
        bg: "yellow",
        selected: true,
        display: "NMN Boys new curriculum total sessions",
    },

    {
        id: "Completed NMN Boys New Curriculum",
        selected: true,
        bg: "pink",
        display: "Completed NMN Boys New Curriculum",
    },

    {
        id: "completedPrevention",
        selected: true,
        bg: "pink",
        display: "OVC_SERV PREV",
    },
    {
        id: "completedLastFinancialYear",
        selected: true,
        bg: "pink",
        display: "Completed Prevention Last Financial Year",
    },
    {
        id: "everCompleted",
        selected: true,
        bg: "pink",
        display: "Ever Completed",
    },
];

export const columns3: Column[] = [
    // {
    //   id: "event",
    //   display: "Event",
    //   selected: true,
    // },
    {
        id: "ypDUCAS6juy",
        display: "Beneficiary ID",
        selected: true,
    },
    {
        id: "enrollmentDate",
        display: "Enrollment Date",
        selected: true,
    },
    {
        id: "completionDate",
        display: "Completion Date",
        selected: true,
    },
    {
        id: "Ah4eyDOBf51",
        display: "Implementing Partner",
        selected: true,
    },
    {
        id: "mWyp85xIzXR",
        display: "Group Type",
        selected: true,
    },
    {
        id: "cYDK0qZSri9",
        display: "Group Name",
        selected: true,
    },
    {
        id: "vfHaBC1ONln",
        display: "Beneficiary Name",
        selected: true,
    },
    {
        id: "ZUKC6mck81A",
        display: "Sex",
        selected: true,
    },
    {
        id: "eXWM3v3oIKu",
        display: "Age",
        selected: true,
    },
    {
        id: "district",
        display: "District",
        selected: true,
    },
    {
        id: "subCounty",
        display: "Sub-county",
        selected: true,
    },
    {
        id: "parish",
        display: "Parish",
        selected: true,
    },

    // SINOVUYO

    {
        id: "Introducing the program and defining goals",
        selected: true,
        display: "1. Introducing the program and defining goals",
    },
    {
        id: "Building a positive relationship thru",
        selected: true,
        display: "2. Building a positive relationship thru",
    },
    {
        id: "Praising each other",
        selected: true,
        display: "3. Praising each other",
    },
    {
        id: "Talking about emotions",
        selected: true,
        display: "4. Talking about emotions",
    },
    {
        id: "Managing anger & solving problems",
        selected: true,
        display: "5. Managing anger & solving problems",
    },
    {
        id: "Problem solving-putting out the fire spending time",
        selected: true,
        display:
            "6. Problem solving-putting out the fire spending time together",
    },
    {
        id: "Motivation to save and making a budget",
        selected: true,
        display: "7. Motivation to save and making a budget",
    },
    {
        id: "Dealing with problems without Conflict-I",
        selected: true,
        display: "8. Dealing with problems without Conflict-I",
    },
    {
        id: "Dealing with problems without conflict-II",
        selected: true,
        display: "9. Dealing with problems without conflict-II",
    },
    {
        id: "Establishing family rules and routines",
        selected: true,
        display: "10. Establishing family rules and routines",
    },
    {
        id: "Understanding the ways to save and the risk to bor",
        selected: true,
        display: "11. Understanding the ways to save and the risk to borrow",
    },
    {
        id: "Keeping safe in the community",
        selected: true,
        display: "12. Keeping safe in the community",
    },

    {
        id: "Responding to crisis",
        selected: true,
        display: "13. Responding to crisis",
    },
    {
        id: "Widening the circle of support",
        selected: true,
        display: "14. Widening the circle of support",
    },

    {
        id: "SINOVUYO",
        selected: true,
        bg: "pink",
        display: "SINOVUYO sessions attended",
    },
    {
        id: "Completed SINOVUYO",
        selected: true,
        bg: "pink",
        display: "Completed SINOVUYO",
    },

    // ECD
    {
        id: "Introduction to Early childhood development",
        selected: true,
        display: "1. Introduction to Early childhood development",
    },
    {
        id: "Physical development",
        selected: true,
        display: "2. Physical development",
    },
    {
        id: "Cognitive development",
        selected: true,
        display: "3. Cognitive development",
    },
    {
        id: "Language development",
        selected: true,
        display: "4. Language development",
    },
    {
        id: "Social and Emotional Development",
        selected: true,
        display: "5. Social and Emotional Development",
    },
    {
        id: "Baby cues",
        selected: true,
        display: "6. Baby cues",
    },
    {
        id: "Baby Massage",
        selected: true,
        display: "7. Baby Massage",
    },
    {
        id: "Basic health, Hygiene, Safety and Nutrition",
        selected: true,
        display: "8. Basic health, Hygiene, Safety and Nutrition",
    },
    {
        id: "HIV Basic and HIV in children",
        selected: true,
        display: "9. HIV Basic and HIV in children",
    },
    {
        id: "Disclosure, Adherence and HIV risks in children",
        selected: true,
        display: "10. Disclosure, Adherence and HIV risks in children",
    },

    {
        id: "Loss, Grief and Bereavement",
        selected: true,
        display: "11. Loss, Grief and Bereavement",
    },

    {
        id: "Care planning, Referrals and Linkages to care",
        selected: true,
        display: "12. Care planning, Referrals and Linkages to care",
    },

    {
        id: "ECD",
        selected: true,
        bg: "pink",
        display: "ECD sessions attended",
    },
    {
        id: "Completed ECD",
        selected: true,
        bg: "pink",
        display: "Completed ECD",
    },

    //VSLA Saving and Borrowing

    {
        id: "VSLA Saving",
        selected: true,
        display: "1. VSLA Saving",
    },
    {
        id: "VSLA Borrowing",
        selected: true,
        display: "2. VSLA Borrowing",
    },
    {
        id: "VSLA OVC Fund",
        selected: true,
        display: "3. VSLA OVC Fund",
    },

    {
        id: "Saving and Borrowing",
        selected: true,
        bg: "pink",
        display: "Saving and Borrowing sessions attended",
    },
    {
        id: "Completed Saving and Borrowing",
        selected: true,
        bg: "pink",
        display: "Completed Saving and Borrowing",
    },

    // VSLA Methodology
    {
        id: "VSLA concepts",
        selected: true,
        bg: "yellow",
        display: "1. VSLA concepts",
    },
    {
        id: "Leadership and Elections of the Management committ",
        selected: true,
        bg: "yellow",
        display: "2. Leadership and Elections of the Management committee",
    },
    {
        id: "Development of Internal rules and regulations",
        selected: true,
        bg: "yellow",
        display: "3. Development of Internal rules and regulations",
    },
    {
        id: "Introduction to written record keeping",
        selected: true,
        bg: "yellow",
        display: "4. Introduction to written record keeping",
    },
    {
        id: "Meeting procedures/ meeting steps",
        selected: true,
        bg: "yellow",
        display: "5. Meeting procedures/ meeting steps",
    },
    {
        id: "Conflict resolution",
        selected: true,
        bg: "yellow",
        display: "6. Conflict resolution",
    },

    {
        id: "Share-out & Action audit",
        selected: true,
        bg: "yellow",
        display: "7. Share-out & Action audit",
    },

    {
        id: "VSLA Methodology",
        selected: true,
        bg: "pink",
        display: "VSLA Methodology sessions attended",
    },
    {
        id: "Completed VSLA Methodology",
        selected: true,
        bg: "pink",
        display: "Completed VSLA Methodology",
    },

    // Financial Literacy

    {
        id: "Personal Financial Management",
        selected: true,
        bg: "orange",
        display: "1. Personal Financial Management",
    },

    {
        id: "Module1: Saving",
        selected: true,
        bg: "orange",
        display: "2. Module2: Saving",
    },
    {
        id: "Module3: Budgeting",
        selected: true,
        bg: "orange",
        display: "3. Module3: Loan Management",
    },
    {
        id: "Investment",
        selected: true,
        bg: "orange",
        display: "4. Module4: Investment",
    },
    {
        id: "Planning for Old age",
        selected: true,
        bg: "orange",
        display: "5. Module 5: Planning for Old age",
    },
    {
        id: "Financial Service providers",
        selected: true,
        bg: "orange",
        display: "6. Module6: Financial Service providers",
    },
    // {
    //   id: "Module3: Budgeting",
    //   selected: true,
    //   bg: "orange",
    //   display: "Module3: Budgeting",
    // },
    // {
    //   id: "Module1: Saving",
    //   selected: true,
    //   bg: "orange",
    //   display: "Module1: Saving",
    // },
    {
        id: "Financial Literacy",
        selected: true,
        bg: "pink",
        display: "Financial Literacy sessions attended",
    },
    {
        id: "Completed Financial Literacy",
        selected: true,
        bg: "pink",
        display: "Completed Financial Literacy",
    },

    // SPM Training

    {
        id: "IGA selection process",
        selected: true,
        bg: "lightblue",
        display: "1. IGA selection process",
    },
    {
        id: "Market assessment",
        selected: true,
        bg: "lightblue",
        display: "2. Market assessment",
    },
    {
        id: "Knowledge and skills",
        selected: true,
        bg: "lightblue",
        display: "3. Knowledge and skills",
    },
    {
        id: "Estimation of start-up and working costs",
        selected: true,
        bg: "lightblue",
        display: "4. Estimation of start-up and working costs",
    },
    {
        id: "Estimating sales and Income",
        selected: true,
        bg: "lightblue",
        display: "5. Estimating sales and Income",
    },
    {
        id: "Weekly expenses and Weekly income",
        selected: true,
        bg: "lightblue",
        display: "6. Weekly expenses and Weekly income",
    },
    {
        id: "Actual IGA Selection",
        selected: true,
        bg: "lightblue",
        display: "7. Actual IGA Selection",
    },
    {
        id: "IGA planning",
        selected: true,
        bg: "lightblue",
        display: "8. IGA planning",
    },
    {
        id: "IGA management",
        selected: true,
        bg: "lightblue",
        display: "9. IGA management",
    },

    {
        id: "SPM Training",
        selected: true,
        bg: "pink",
        display: "SPM Training sessions attended",
    },
    {
        id: "Completed SPM Training",
        selected: true,
        bg: "pink",
        display: "Completed SPM Training",
    },
];

export const ovcMISSections = [
    {
        label: "1",
        sectionId: "1",
        indicators: [
            {
                label: "# of OVC HHs who received economic strengthening support",
                others: [],
                indicatorId: "ind1",
            },
            {
                label: "# Of OVC supported to attain vocation/apprentice skills",
                others: [],
                indicatorId: "ind2",
            },
            {
                label: "# of OVC provided with toolkits/startup kits",
                others: [],
                indicatorId: "ind3",
            },
        ],
    },

    {
        label: "2",
        sectionId: "2",
        indicators: [
            {
                label: "# of OVC HHs that received agricultural/farm input",
                others: [],
                indicatorId: "ind4",
            },
            {
                label: "# OF HH provided with food",
                others: [],
                indicatorId: "ind5",
            },
            {
                label: "# of OVC provided with Nutritional support",
                others: [],
                indicatorId: "ind6",
            },
            {
                label: "# of OVC HHs that received agric. advisory services",
                others: [],
                indicatorId: "ind7",
            },
            {
                label: "# of OVC HHs supported to access safe water",
                others: [],
                indicatorId: "ind8",
            },
            {
                label: "# of OVC supported to receive health services",
                others: [],
                indicatorId: "ind9",
            },
            {
                label: "# of OVC provided with Insecticide Treated Nets",
                others: [],
                indicatorId: "ind10",
            },
            {
                label: "# of OVC HHs provided with shelter",
                others: [],
                indicatorId: "ind11",
            },
        ],
    },
    {
        label: "3",
        sectionId: "3",
        indicators: [
            {
                label: "# of OVC supported to access education",
                others: [],
                indicatorId: "ind12",
            },
            {
                label: "# OVC provided with Psycho-social Support",
                others: [],
                indicatorId: "ind13",
            },
            {
                label: "# OVC provided with basic care",
                others: [],
                indicatorId: "ind14",
            },
            {
                label: "# of OVC re-integrated with their families",
                others: [],
                indicatorId: "ind15",
            },
            {
                label: "# of OVC removed from child labour",
                others: [],
                indicatorId: "ind16",
            },
        ],
    },
    {
        label: "4",
        sectionId: "4",
        indicators: [
            {
                label: "# of OVC assisted to register births",
                others: [],
                indicatorId: "ind17",
            },
            {
                label: "# of child abuse &amp; neglect cases handled",
                others: [],
                indicatorId: "ind18",
            },
            {
                label: "# of OVC Provided Legal Support for GBV",
                others: [],
                indicatorId: "ind19",
            },
            {
                label: "# of OVC Provided GBV Counselling",
                others: [],
                indicatorId: "ind20",
            },
            {
                label: "# of OVC Withdrawn from GBV affected Household",
                others: [],
                indicatorId: "ind21",
            },
        ],
    },
    {
        label: "5",
        sectionId: "5",
        indicators: [
            {
                label: "# of OVC supported with 3 or more CPAs:",
                others: [],
                indicatorId: "ind22",
            },
            {
                others: [],
                label: "# of OVC referred for other services",
                indicatorId: "ind23",
            },
            {
                others: [],
                label: "# of HIV+ children supported",
                indicatorId: "ind24",
            },
            {
                others: [],
                label: "# of staff trained in OVC programming",
                indicatorId: "ind25",
            },
            {
                others: [],
                label: "# of community volunteers trained",
                indicatorId: "ind26",
            },
            {
                others: [],
                label: "# of Sensitization Activities/Events Conducted",
                indicatorId: "ind27",
            },
            {
                others: [],
                label: "# of Households Assessed this quarter",
                indicatorId: "ind28",
            },
            {
                others: [],
                label: "# of Households considered for Support this quarter",
                indicatorId: "ind29",
            },
            {
                others: [],
                label: "# of OVC identified in HH considered for support this qtr",
                indicatorId: "ind30",
            },
            {
                others: allAgeGroups,
                label: "# of Beneficiaries Served this period",
                indicatorId: "ind31",
            },
            {
                others: allAgeGroups,
                label: "# of Beneficiaries who graduated this quarter",
                indicatorId: "ind32",
            },

            {
                others: allAgeGroups,
                label: "# of Newly Enrolled Beneficiaries served",
                indicatorId: "ind334",
            },
        ],
    },
    {
        label: "6",
        sectionId: "6",
        indicators: [
            {
                others: from0To17,
                label: "# Referred for HIV Testing Services",
                indicatorId: "ind34",
            },
            {
                others: from0To17,
                label: "# Tested for HIV in this quarter",
                indicatorId: "ind35",
            },
            {
                others: from0To17,
                label: "# Tested HIV+ in this quarter",
                indicatorId: "ind36",
            },
            {
                others: from0To17,
                label: "# Tested HIV+ and linked to HIV Care &amp; Treatment in this quarter",
                indicatorId: "ind37",
            },
            {
                others: from0To17,
                label: "# Tested HIV+ and Initiated on ART in this quarter",
                indicatorId: "ind38",
            },
        ],
    },
    {
        label: "7",
        sectionId: "7",
        indicators: [
            {
                others: from0To17,
                label: "# Reported HIV Negative",
                indicatorId: "ind39",
            },
            {
                others: from0To17,
                label: "# of OVC whose HIV status is unknown as the HIV test is not required based on an HIV Risk Assessment",
                indicatorId: "ind40",
            },
            {
                others: from0To17,
                label: "# of OVC whose HIV status is unknown due to other reasons",
                indicatorId: "ind41",
            },
            {
                others: from0To17,
                label: "# Tested HIV+ and linked to HIV Care &amp; Treatment in this quarter",
                indicatorId: "ind42",
            },
            {
                others: from0To17,
                label: "# Reported HIV Positive",
                indicatorId: "ind43",
            },
            {
                others: from0To17,
                label: "# of OVC currently on ART this quarter",
                indicatorId: "ind44",
            },
            {
                others: from0To17,
                label: "# of OVC currently on ART that conducted viral load test within the previous 12 months",
                indicatorId: "ind45",
            },
            {
                others: from0To17,
                label: "# of OVC currently on ART that conducted a viral load test with a known test result within the previous 12 months",
                indicatorId: "ind46",
            },
            {
                others: from0To17,
                label: "# of OVC currently on ART that conducted a viral load test within the previous 12 months with a known viral load test result that are virally suppressed",
                indicatorId: "ind47",
            },
            {
                others: from10To17,
                label: "# of OVC Provided eMTCT Services",
                indicatorId: "ind48",
            },
            {
                others: from10To17,
                label: "# of OVC Provided PrEP",
                indicatorId: "ind49",
            },
            {
                others: from0To17,
                label: "# of OVC Provided VMMC/SMC",
                indicatorId: "ind50",
            },
            {
                others: from10To17,
                label: "# of OVC Provided with Self -awareness Knowledge about HIV prevention",
                indicatorId: "ind51",
            },

            {
                others: from10To17,
                label: "# of OVC Provided Condoms:10 - 14 Years",
                indicatorId: "ind52",
            },
            {
                others: from0To17,
                label: "# of OVC Provided PEP",
                indicatorId: "ind53",
            },

            {
                others: [],
                label: "Active DREAMS Beneficiaries (10-17 Yrs.) NOT enrolled in the Comprehensive Program",
                indicatorId: "ind54",
            },
            {
                others: [],
                label: "Total # received prevention ONLY services (9-14 Yrs.)",
                indicatorId: "ind55",
            },
            {
                others: from10To17,
                label: "# of Adolescents who completed Journeys plus Curriculum",
                indicatorId: "ind56",
            },

            {
                others: from10To17,
                label: "# of Adolescents who completed Sinovuyo Curriculum",
                indicatorId: "ind57",
            },
            {
                others: [],
                label: "# of Caregivers who completed Sinovuyo Curriculum (18+ years)",
                indicatorId: "ind58",
            },
            {
                others: from10To17,
                label: "# of Adolescents who completed Coaching Boys Into Men (CBIM) Curriculum",
                indicatorId: "ind59",
            },

            {
                others: from10To17,
                label: "# of Adolescents who completed No Means No Curriculum",
                indicatorId: "ind60",
            },

            {
                others: from10To17,
                label: "# of Adolescents who completed Grassroots Soccer Curriculum",
                indicatorId: "ind61",
            },
        ],
    },
];

const rowKeys: { [key: number]: string } = {
    0: "tar",
    1: "act",
    2: "arc",

    3: "tar",
    4: "act",
    5: "arc",

    6: "tar",
    7: "act",
    8: "arc",

    9: "tar",
    10: "act",
    11: "arc",

    12: "tar",
    13: "act",
    14: "arc",
};

const findBg = (value: number) => {
    if (value >= 95) {
        return "#02B050";
    }
    if (value >= 90) {
        return "yellow";
    }
    return "#C00001";
};

const findColor = (value: number) => {
    if (value >= 95) {
        return "";
    }
    if (value >= 90) {
        return "";
    }
    return "white";
};

const createColumns = (
    keyStart: number,
    year: number,
    accessor: string,
    data: { [key: string]: any }
) => {
    return range(15).map((v, index) => {
        let quarter = "";
        if ([0, 1, 2].indexOf(v) !== -1) {
            quarter = `${year - 1}Q4`;
        }
        if ([3, 4, 5].indexOf(v) !== -1) {
            quarter = `${year}Q1`;
        }
        if ([6, 7, 8].indexOf(v) !== -1) {
            quarter = `${year}Q2`;
        }
        if ([9, 10, 11].indexOf(v) !== -1) {
            quarter = `${year}Q3`;
        }
        let value: any = data[`${rowKeys[index]}${accessor}${quarter}`] || 0;
        let color = "";
        let bg = "";

        if ([2, 5, 8, 11].indexOf(index) !== -1) {
            value = Number(value * 100);
            color = findColor(value);
            bg = findBg(value);
            value = `${value.toFixed(0)}%`;
        }
        const computed: TdProps = {
            key: `${keyStart + v + 1}`,
            accessor,
            textAlign: "right",
            color,
            bg,
            label: value,
            rowSpan: 1,
            colSpan: 1,
        };
        return computed;
    });
};

const createRow = (
    key: string,
    startColumns: {
        key: string;
        label: string;
        rowSpan: number;
        colSpan: number;
    }[],
    year: number,
    data: { [key: string]: any },
    accessor: string
) => {
    return {
        key,
        columns: [
            ...startColumns.map((c: any) => {
                const calculated: TdProps = {
                    ...c,
                    accessor,
                    color: "",
                    bg: "",
                    textAlign: "left",
                };
                return calculated;
            }),
            ...createColumns(startColumns.length, year, accessor, data),
        ],
    };
};

export const indicatorReportColumns = (
    period: any,
    data: { [key: string]: any }
) => {
    const year = period.year();
    const rows = [
        createRow(
            "1",
            [
                { key: "1", label: "#19", rowSpan: 7, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_SERV: Number of beneficiaries served by PEPFAR OVC programs for children and families affected by HIV",
                    rowSpan: 7,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "F",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "G06XnwYXVPuF"
        ),
        createRow(
            "2",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "G06XnwYXVPuM"
        ),
        createRow(
            "3",
            [{ key: "1", label: "T(COMP+PREV)", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "G06XnwYXVPu"
        ),
        createRow(
            "4",
            [{ key: "1", label: "COMP", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "G06XnwYXVPu.EVrTtYEJfeN"
        ),
        createRow(
            "5",
            [{ key: "1", label: "PREV(Community)", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "G06XnwYXVPu.uBYxpV8iADb"
        ),
        createRow(
            "6",
            [{ key: "1", label: "PREV(In school)", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "G06XnwYXVPu.h4tlGMjEc0Y"
        ),
        createRow(
            "621",
            [{ key: "1", label: "PREV(ARPA)", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "G06XnwYXVPu.h4tlGMjEc4Y"
        ),
        createRow(
            "7",
            [
                { key: "1", label: "#19.1", rowSpan: 1, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_SERV_SUBPOP",
                    rowSpan: 1,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "%",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "SUBPOP"
        ),
        createRow(
            "8",
            [
                { key: "1", label: "#19.2", rowSpan: 1, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_DREAMS_OVERLAP",
                    rowSpan: 1,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "%",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "lnRPzUJNYQN"
        ),
        createRow(
            "9",
            [
                { key: "1", label: "#20", rowSpan: 1, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_HIVSTAT: Percentage of orphans and vulnerable children(<18 years old) with HIV status reported to implementing partner (IP)",
                    rowSpan: 1,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "%",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "SvwnCeMVs2x"
        ),
        createRow(
            "10",
            [
                { key: "1", label: "#20.1", rowSpan: 1, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_HIVSTAT 18+",
                    rowSpan: 1,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "%",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "xjo40XN55fN"
        ),
        createRow(
            "11",
            [
                { key: "1", label: "#20.2", rowSpan: 3, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_HIVSTAT_UNKNOWN",
                    rowSpan: 3,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "F",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "funl4ILuJBgF"
        ),
        createRow(
            "12",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "funl4ILuJBgM"
        ),
        createRow(
            "13",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "funl4ILuJBg"
        ),

        createRow(
            "110",
            [
                { key: "1", label: "#20.2.1", rowSpan: 3, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_HIVSTAT_UNKNOWN_HEI",
                    rowSpan: 3,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "F",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "heiF"
        ),
        createRow(
            "121",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "heiM"
        ),
        createRow(
            "132",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "hei"
        ),

        createRow(
            "14",
            [
                { key: "1", label: "#20.3", rowSpan: 3, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_TST_ASSESS",
                    rowSpan: 3,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "F",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "ke1VrRuiMARF"
        ),
        createRow(
            "15",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "ke1VrRuiMARM"
        ),
        createRow(
            "16",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "ke1VrRuiMAR"
        ),

        createRow(
            "17",
            [
                { key: "1", label: "#20.4", rowSpan: 3, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_TST_RISK",
                    rowSpan: 3,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "F",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "zu7vuVccd5aF"
        ),
        createRow(
            "18",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "zu7vuVccd5aM"
        ),
        createRow(
            "19",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "zu7vuVccd5a"
        ),

        createRow(
            "20",
            [
                { key: "1", label: "#20.5", rowSpan: 3, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_TST_REFER",
                    rowSpan: 3,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "F",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "bvDkc94MhA3F"
        ),
        createRow(
            "21",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "bvDkc94MhA3M"
        ),
        createRow(
            "22",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "bvDkc94MhA3"
        ),

        createRow(
            "23",
            [
                { key: "1", label: "#20.6", rowSpan: 3, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_TST_REPORT",
                    rowSpan: 3,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "F",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "DVgzq5RZugIF"
        ),
        createRow(
            "24",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "DVgzq5RZugIM"
        ),
        createRow(
            "25",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "DVgzq5RZugI"
        ),

        createRow(
            "26",
            [
                { key: "1", label: "#21", rowSpan: 1, colSpan: 1 },
                { key: "2", label: "OVC_OFFER", rowSpan: 1, colSpan: 1 },
                { key: "3", label: "%", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "A4D8wgVl21q"
        ),
        createRow(
            "27",
            [
                { key: "1", label: "#21.1", rowSpan: 1, colSpan: 1 },
                { key: "2", label: "OVC_ENROL", rowSpan: 1, colSpan: 1 },
                { key: "3", label: "%", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "RvF3up57r29"
        ),

        createRow(
            "28",
            [
                { key: "1", label: "#22", rowSpan: 3, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_UNK_REF",
                    rowSpan: 3,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "F",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "A4VQnLrL5OEF"
        ),
        createRow(
            "29",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "A4VQnLrL5OEM"
        ),
        createRow(
            "30",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "A4VQnLrL5OE"
        ),

        createRow(
            "31",
            [
                { key: "1", label: "#22.1", rowSpan: 1, colSpan: 1 },
                { key: "2", label: "OVC_REACH", rowSpan: 1, colSpan: 1 },
                { key: "3", label: "%", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "FR7RCoLtgHT"
        ),
        createRow(
            "32",
            [
                { key: "1", label: "#22.2", rowSpan: 1, colSpan: 1 },
                { key: "2", label: "OVC_AGREE_TST", rowSpan: 1, colSpan: 1 },
                { key: "3", label: "%", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "xGHjuYfbx31"
        ),

        createRow(
            "33",
            [
                { key: "1", label: "#2231", rowSpan: 1, colSpan: 1 },
                { key: "2", label: "OVC_TEST", rowSpan: 1, colSpan: 1 },
                { key: "3", label: "%", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "fiOYJ6SPRIG"
        ),
        createRow(
            "34",
            [
                { key: "1", label: "#22.4", rowSpan: 1, colSpan: 1 },
                { key: "2", label: "OVC_CI_ASSESSED", rowSpan: 1, colSpan: 1 },
                { key: "3", label: "%", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "etKjMrhsGzx"
        ),

        createRow(
            "35",
            [
                { key: "1", label: "#23", rowSpan: 1, colSpan: 1 },
                {
                    key: "2",
                    label: "Percent of OVC households that graduate (Annual indicator)",
                    rowSpan: 1,
                    colSpan: 1,
                },
                { key: "3", label: "%", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "B5yBgVUt7ij"
        ),

        createRow(
            "36",
            [
                { key: "1", label: "#24", rowSpan: 3, colSpan: 1 },
                {
                    key: "2",
                    label: "Number of people reached by a USG funded intervention providing GBV services (e.g., health, legal,psycho-social counseling, shelters, hotlines, other) (Annual indicator)",
                    rowSpan: 3,
                    colSpan: 1,
                },
                {
                    key: "3",
                    label: "F",
                    rowSpan: 1,
                    colSpan: 1,
                },
            ],
            year,
            data,
            "d7fhsyxUiCzF"
        ),
        createRow(
            "37",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "d7fhsyxUiCzM"
        ),
        createRow(
            "38",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "d7fhsyxUiCz"
        ),
        createRow(
            "39",
            [
                { key: "1", label: "#26", rowSpan: 1, colSpan: 1 },
                {
                    key: "2",
                    label: "Percent of OVC enrolled primary school age children who successfully transition to secondary school (Annual indicator)",
                    rowSpan: 1,
                    colSpan: 1,
                },
                { key: "3", label: "%", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "HaW4jcu0p9U"
        ),
        createRow(
            "40",
            [
                { key: "1", label: "#29", rowSpan: 1, colSpan: 1 },
                {
                    key: "2",
                    label: "Percent of vulnerable households reporting increase in asset ownership (Annual indicator)",
                    rowSpan: 1,
                    colSpan: 1,
                },
                { key: "3", label: "%", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "HqWXHCI6m5y"
        ),
        createRow(
            "41",
            [
                { key: "1", label: "#30", rowSpan: 5, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_VL_ELIGIBLE",
                    rowSpan: 5,
                    colSpan: 1,
                },
                { key: "3", label: "F", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "wTcbcrds2w6F"
        ),

        createRow(
            "42",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "wTcbcrds2w6M"
        ),
        createRow(
            "43",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "wTcbcrds2w6"
        ),
        createRow(
            "44",
            [{ key: "1", label: "Children(<18)", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "wTcbcrds2w6.dHzqsjLPXzb"
        ),
        createRow(
            "45",
            [{ key: "1", label: "Adults(18+)", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "wTcbcrds2w6.VCmHfkJVEDp"
        ),

        createRow(
            "46",
            [
                { key: "1", label: "#32", rowSpan: 5, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_VLR",
                    rowSpan: 5,
                    colSpan: 1,
                },
                { key: "3", label: "F", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "MslqTqo0kdzF"
        ),
        createRow(
            "47",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "MslqTqo0kdzM"
        ),
        createRow(
            "48",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "MslqTqo0kdz"
        ),
        createRow(
            "49",
            [{ key: "1", label: "Children(<18)", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "MslqTqo0kdz.dHzqsjLPXzb"
        ),
        createRow(
            "50",
            [{ key: "1", label: "Adults(18+)", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "MslqTqo0kdz.VCmHfkJVEDp"
        ),

        createRow(
            "51",
            [
                { key: "1", label: "#31", rowSpan: 5, colSpan: 1 },
                {
                    key: "2",
                    label: "OVC_VLS",
                    rowSpan: 5,
                    colSpan: 1,
                },
                { key: "3", label: "F", rowSpan: 1, colSpan: 1 },
            ],
            year,
            data,
            "jCwcGbjVD8GF"
        ),
        createRow(
            "52",
            [{ key: "1", label: "M", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "jCwcGbjVD8GM"
        ),
        createRow(
            "53",
            [{ key: "1", label: "T", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "jCwcGbjVD8G"
        ),
        createRow(
            "54",
            [{ key: "1", label: "Children(<18)", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "jCwcGbjVD8G.dHzqsjLPXzb"
        ),
        createRow(
            "55",
            [{ key: "1", label: "Adults(18+)", rowSpan: 1, colSpan: 1 }],
            year,
            data,
            "jCwcGbjVD8G.VCmHfkJVEDp"
        ),
    ];
    return rows;
};

export const districts = [
    {
        ip: "ACCORD",
        district: "GOMBA",
    },
    {
        ip: "ACCORD",
        district: "KAKUMIRO",
    },
    {
        ip: "ACCORD",
        district: "KYENJOJO",
    },
    {
        ip: "ACCORD",
        district: "LUWERO",
    },
    {
        ip: "ACCORD",
        district: "MITYANA",
    },
    {
        ip: "IDI",
        district: "ARUA",
    },
    {
        ip: "IDI",
        district: "HOIMA",
    },
    {
        ip: "IDI",
        district: "KAGADI",
    },
    {
        ip: "IDI",
        district: "KIBAALE",
    },
    {
        ip: "IDI",
        district: "KIKUUBE",
    },
    {
        ip: "IDI",
        district: "MADI-OKOLLO",
    },
    {
        ip: "IDI",
        district: "MASINDI",
    },
    {
        ip: "IDI",
        district: "NEBBI",
    },
    {
        ip: "IDI",
        district: "PAKWACH",
    },
    {
        ip: "IDI",
        district: "WAKISO",
    },
    {
        ip: "IDI",
        district: "KIRYANDONGO",
    },
    {
        ip: "UWESO",
        district: "BUSIA",
    },
    {
        ip: "UWESO",
        district: "KOTIDO",
    },
    {
        ip: "UWESO",
        district: "MBALE",
    },
    {
        ip: "UWESO",
        district: "TORORO",
    },
    {
        ip: "UWESO",
        district: "KATAKWI",
    },
    {
        ip: "UWESO",
        district: "SOROTI",
    },
    {
        ip: "Youth Alive",
        district: "AGAGO",
    },
    {
        ip: "Youth Alive",
        district: "APAC",
    },
    {
        ip: "Youth Alive",
        district: "DOKOLO",
    },
    {
        ip: "Youth Alive",
        district: "GULU",
    },
    {
        ip: "Youth Alive",
        district: "KITGUM",
    },
    {
        ip: "Youth Alive",
        district: "KOLE",
    },
    {
        ip: "Youth Alive",
        district: "KWANIA",
    },
    {
        ip: "Youth Alive",
        district: "LIRA",
    },
    {
        ip: "Youth Alive",
        district: "OMORO",
    },
    {
        ip: "Youth Alive",
        district: "OYAM",
    },
    {
        ip: "Youth Alive",
        district: "ALEBTONG",
    },
    {
        ip: "Youth Alive",
        district: "AMOLATAR",
    },
    // {
    //   ip: "MDMS",
    //   district: "BUKOMANSIMBI",
    // },
    // {
    //   ip: "MDMS",
    //   district: "KALANGALA",
    // },
    // {
    //   ip: "MDMS",
    //   district: "KALUNGU",
    // },
    // {
    //   ip: "MDMS",
    //   district: "LWENGO",
    // },
    // {
    //   ip: "MDMS",
    //   district: "LYANTONDE",
    // },
    // {
    //   ip: "MDMS",
    //   district: "MASAKA",
    // },
    // {
    //   ip: "MDMS",
    //   district: "MPIGI",
    // },
    {
        ip: "ROM-KAMPALA",
        district: "CENTRAL",
    },
    {
        ip: "ROM-KAMPALA",
        district: "KAWEMPE",
    },
    {
        ip: "ROM-KAMPALA",
        district: "MAKINDYE",
    },
    {
        ip: "ROM-KAMPALA",
        district: "NAKAWA",
    },
    {
        ip: "ROM-KAMPALA",
        district: "RUBAGA",
    },
    // {
    //   ip: "ROM-KAMPALA",
    //   district: "KAMPALA",
    // },
    {
        ip: "Mild May",
        district: "KASSANDA",
    },
    {
        ip: "Mild May",
        district: "KIBOGA",
    },
    {
        ip: "Mild May",
        district: "MUBENDE",
    },
    {
        ip: "Mild May",
        district: "NAKASEKE",
    },
    // {
    //   ip: "Mild May",
    //   district: "SEMBABULE",
    // },
];

export const columns4: Column[] = [
    { selected: true, display: "Member Code", id: "HLKc2AKR9jW" },
    { selected: true, display: "Name", id: "huFucxA3e5c" },
    { selected: true, display: "Sex", id: "CfpoFtRmK1z" },
    { selected: true, display: "District", id: "district" },
    { selected: true, display: "Sub-County", id: "subCounty" },
    { selected: true, display: "Parish", id: "parish" },
    { selected: true, display: "VSLA.Group Name", id: "Qm1A7Ot2OTQ" },

    { selected: true, display: "VSLA.MIS Number", id: "mSh07fWXuxX" },

    { selected: true, display: "VSLA.Share Value in UGX", id: "Gne81yYoFOW" },

    {
        selected: true,
        display: "VSLA.Number of Active Beneficiaries",
        id: "nXnA8N98dCu",
    },

    {
        selected: true,
        display: "VSLA.Date of data collection",
        id: "fDg3QtVjDNb",
    },

    { selected: true, display: "VSLA.Reporting Month", id: "qaZSoTRHwW9" },

    {
        selected: true,
        display: "VSLA.Total Shares Bought this cycle",
        id: "x8BMFjQ1DRf",
    },

    {
        selected: true,
        display: "VSLA.Member Cumulative Savings this cycle",
        id: "H5vsW6LYFhy",
    },

    {
        selected: true,
        display: "VSLA.Member Cumulative Loans Taken this cycle(in UGX)",
        id: "s4w6hTytt5h",
    },

    { selected: true, display: "VSLA.Purpose of the Loan", id: "AMVNNVkM6dc" },

    {
        selected: true,
        display:
            "VSLA.Member Cumulative Social/Welfare Fund Fund Accessed this Cycle",
        id: "tZvlWl0BqO7",
    },

    {
        selected: true,
        display: "VSLA.Purpose of Social/Welfare Fund",
        id: "bRDt9a8xPRi",
    },

    {
        selected: true,
        display:
            "VSLA.Member Cumulative OVC Protection Fund Contribution this cycle",
        id: "qEeXNzlJkN8",
    },

    {
        selected: true,
        display: "VSLA.OVC protection Fund Accessed this Cycle in UGX",
        id: "NyAyKHrhalx",
    },

    {
        selected: true,
        display: "VSLA.Purpose of OVC protection Fund",
        id: "GUadpWyWyhF",
    },
];
