import dayjs, { Dayjs } from "dayjs";

export function s2ab(s: any) {
  let buf = new ArrayBuffer(s.length);
  let view = new Uint8Array(buf);
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

export const calculateQuarter = (
  year: number,
  quarter: number
): [Date, Date] => {
  if (quarter === 1) {
    // Q1: October 1 of the previous year to December 31 of the previous year
    return [new Date(`${year - 1}-10-01`), new Date(`${year - 1}-12-31`)];
  }
  if (quarter === 2) {
    // Q2: January 1 to March 31 of the current year
    return [new Date(`${year}-01-01`), new Date(`${year}-03-31`)];
  }
  if (quarter === 3) {
    // Q3: April 1 to June 30 of the current year
    return [new Date(`${year}-04-01`), new Date(`${year}-06-30`)];
  }
  if (quarter === 4) {
    // Q4: July 1 to September 30 of the current year
    return [new Date(`${year}-07-01`), new Date(`${year}-09-30`)];
  }
  // Default case if quarter is invalid
  return [new Date(`${year}-10-01`), new Date(`${year}-12-31`)];
};




export const findQuarters = (year: number, quarter: number) => {
  if (quarter === 1) {
    return [`${year - 1}Q4`, `${year}Q1`];
  }
  if (quarter === 2) {
    return [`${year - 1}Q4`, `${year}Q1`, `${year}Q2`];
  }
  if (quarter === 3) {
    return [`${year - 1}Q4`, `${year}Q1`, `${year}Q2`, `${year}Q3`];
  }
  return [`${year}Q4`];
};

export const getQuarterFromDate = (date: Dayjs) => {
  const month = date.month() + 1; // Months are 0-indexed in `dayjs`
  const quarter = Math.ceil(month / 3); // Calculate the quarter
  return quarter;
}


export const getQuarterDates = (date: Dayjs) => {
  const year = date.year();
  const quarter = getQuarterFromDate(date);

  const [startDate, endDate] = calculateQuarter(year, quarter);

  return {
    start: dayjs(startDate).format('YYYY-MM-DD'),
    end: dayjs(endDate).format('YYYY-MM-DD')
  };
}


export const innerColumns = (index: number) => {
  if (index === 0) {
    return {
      position: "sticky",
      w: "200px",
      minWidth: "200px",
      maxWidth: "200px",
      left: "0px",
      backgroundColor: "white",
      zIndex: 100,
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      w: "250px",
      minW: "250px",
      maxWidth: "250px",
      left: "200px",
      backgroundColor: "white",
      zIndex: 100,
    } as any;
  }
  return {} as any;
};

export const otherRows = (index: number, bg: string = "white") => {
  if (index === 0) {
    return {
      position: "sticky",
      backgroundColor: "white",
      w: "200px",
      minWidth: "200px",
      maxWidth: "200px",
      left: "0px",
      top: "0px",
      zIndex: 2000,
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      backgroundColor: "white",
      w: "200px",
      minW: "200px",
      maxWidth: "200px",
      left: "200px",
      top: "0px",
      zIndex: 2000,
    } as any;
  }
  return {
    top: "0px",
    position: "sticky",
    bg,
    // textAlign: "center",
    zIndex: 1000,
  } as any;
};

export const ovcTrackerFreezes = (index: number, column: number = 0) => {
  if (index === 0) {
    return {
      position: "sticky",
      backgroundColor: "#002060",
      w: "200px",
      minWidth: "200px",
      maxWidth: "200px",
      left: "0px",
      zIndex: 2000,
      top: "48px",
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      w: "200px",
      minW: "200px",
      maxWidth: "200px",
      left: "200px",
      backgroundColor: "#002060",
      zIndex: 2000,
      top: "48px",
    } as any;
  }
  if (index === 2) {
    return {
      position: "sticky",
      w: "200px",
      minW: "200px",
      maxWidth: "200px",
      left: "200px",
      // top: "48px",
      backgroundColor: "#002060",
      zIndex: 2000,
    } as any;
  }
  return {
    top: "0px",
    // position: "sticky",
  } as any;
};

export const ovcTrackerInnerColumns = (index: number, column: number = 0) => {
  if (index === 0) {
    return {
      position: "sticky",
      w: "200px",
      minWidth: "200px",
      maxWidth: "200px",
      left: "0px",
      zIndex: 100,
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      w: "250px",
      minW: "250px",
      maxWidth: "250px",
      left: "200px",
      zIndex: 100,
    } as any;
  }
  return {} as any;
};

export const secondHeader = (): any => {
  return {
    position: "sticky",
    top: "48px",
    zIndex: 10000,
    backgroundColor: "#002060",
  };
};

export const indicatorReportQueries = {
  OVC_SERV: {
    sum: {
      field: "OVC_SERV",
    },
  },
  // OVC_SERV_SUBPOP: {
  //   sum: {
  //     field: "OVC_SERV_SUBPOP",
  //   },
  // },
  // OVC_TST_ASSESS: {
  //   sum: {
  //     field: "riskAssessment",
  //   },
  // },
  OVC_TST_RISK: {
    sum: {
      field: "isAtRisk",
    },
  },
  OVC_TST_REFER: {
    sum: {
      field: "OVC_TST_REFER",
    },
  },
  OVC_TST_REPORT: {
    sum: {
      field: "OVC_TST_REPORT",
    },
  },
  OVC_VL_ELIGIBLE: {
    sum: {
      field: "ovcEligible",
    },
  },
  OVC_VLR: {
    sum: {
      field: "ovcVL",
    },
  },
  OVC_VLS: {
    sum: {
      field: "VLSuppressed",
    },
  },
};

export const ovcTrackerIndicators = {
  OVC_SERV: {
    sum: {
      field: "OVC_SERV",
    },
  },
  servedInPreviousQuarter: {
    sum: {
      field: "servedInPreviousQuarter",
    },
  },
  quarter: {
    sum: {
      field: "quarter",
    },
  },
};

export const ovcTrackerPreventionIndicators = {
  completedPrevention: {
    sum: {
      field: "completedPrevention",
    },
  },
};
