import { Box, Spinner, Stack } from "@chakra-ui/react";
import {
    HashRouter as Router,
    Redirect,
    Route,
    Switch,
} from "react-router-dom";
import { Navigation } from "./components/Navigation";
import ComprehensiveLayer from "./pages/ComprehensiveLayer";
import DataSetLayer from "./pages/DataSetLayer";
import IndicatorReport from "./pages/IndicatorReport";
import OVCMISReport from "./pages/OVCMISReport";
import OVCServiceTracker from "./pages/OVCServiceTracker";
import PreventionLayer from "./pages/PreventionLayer";
import VSLALineList from "./pages/VSLALineList";
import { useLoader } from "./store/Queries";

const App = () => {
    const { isLoading, isSuccess, isError, error } = useLoader();
    return (
        <>
            {isLoading && (
                <Stack
                    h="calc(100vh - 48px)"
                    alignItems="center"
                    justifyContent="center"
                    justifyItems="center"
                    alignContent="center"
                >
                    <Spinner />
                </Stack>
            )}
            {isSuccess && (
                <Router>
                    <Navigation />
                    <Switch>
                        <Route path="/" exact>
                            <DataSetLayer />
                        </Route>
                        <Route path="/ovc-service-tracker">
                            <OVCServiceTracker />
                        </Route>
                        <Route path="/indicator-report">
                            <IndicatorReport />
                        </Route>
                        <Route path="/ovc-mis-report">
                            <OVCMISReport />
                        </Route>
                        <Route path="/group-activity-data-layer">
                            <PreventionLayer />
                        </Route>
                        <Route path="/comprehensive-group-activity-layering">
                            <ComprehensiveLayer />
                        </Route>
                        <Route path="/vsla-line-list">
                            <VSLALineList />
                        </Route>
                        <Redirect to="/" />
                    </Switch>
                </Router>
            )}
            {isError && <Box>{error?.message}</Box>}
        </>
    );
};

export default App;
