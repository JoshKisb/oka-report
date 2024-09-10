import { Tab, TabBar } from "@dhis2/ui";
import { IconFile24, IconHome24, IconList24 } from "@dhis2/ui-icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";
export const Navigation = () => {
    const history = useHistory();
    const [active, setActive] = useState("/");
    const changeLink = (path: string) => {
        setActive(path);
        history.push(path);
    };

    return (
        <div>
            <TabBar>
                <Tab
                    icon={<IconHome24 />}
                    onClick={() => changeLink("/")}
                    selected={active === "/"}
                >
                    OVC SERVICE Layering Report
                </Tab>
                <Tab
                    icon={<IconHome24 />}
                    onClick={() => changeLink("/group-activity-data-layer")}
                    selected={active === "/group-activity-data-layer"}
                >
                    Prevention Group Activity Layering
                </Tab>
                <Tab
                    icon={<IconHome24 />}
                    onClick={() =>
                        changeLink("/comprehensive-group-activity-layering")
                    }
                    selected={
                        active === "/comprehensive-group-activity-layering"
                    }
                >
                    Comprehensive Group Activity Layering
                </Tab>
                <Tab
                    icon={<IconList24 />}
                    onClick={() => changeLink("/ovc-service-tracker")}
                    selected={active === "/ovc-service-tracker"}
                >
                    OVC SERVICE Tracker
                </Tab>
                <Tab
                    icon={<IconFile24 />}
                    onClick={() => changeLink("/indicator-report")}
                    selected={active === "/indicator-report"}
                >
                    Indicator Report
                </Tab>
                <Tab
                    icon={<IconFile24 />}
                    onClick={() => changeLink("/ovc-mis-report")}
                    selected={active === "/ovc-mis-report"}
                >
                    OVC MIS Form 100 Report
                </Tab>
                <Tab
                    icon={<IconFile24 />}
                    onClick={() => changeLink("/vsla-line-list")}
                    selected={active === "/vsla-line-list"}
                >
                    Data Export
                </Tab>
            </TabBar>
        </div>
    );
};
