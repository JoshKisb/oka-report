import { useState, useEffect } from 'react';
import { Button, Box } from '@chakra-ui/react';
import { MdFileDownload } from "react-icons/md";
import { serverapi } from "../store/Queries";
import { $store } from "../store/Stores";
import { useStore } from 'effector-react';
import dayjs, { Dayjs } from 'dayjs';
import { getQuarterDates } from '../store/utils';


function buildOrgQueryString(orgs: string | string[], code: string, period: any) {
  let params = "";
  if (Array.isArray(orgs) && orgs.length > 0) {
    params = params + `?org=${encodeURIComponent(JSON.stringify(orgs))}`;
  } else if (typeof orgs === 'string') {
    params = params + `?org=${orgs}`;
  }

  if (!!code && typeof code === 'string') {
    params += !!params ? "&":"?";
    params += `code=${code}`;
  }

  if (!!period) {
    params += !!params ? "&":"?";
    const { start, end } = getQuarterDates(period);
    const periodObject = `{"start":"${start}","end":"${end}"}`;
    const encodedPeriod = encodeURIComponent(periodObject);
    params += `period=${encodedPeriod}`;
  }
  return params;
}

type ReportDownloadButtonProps = {
  code: string;
}

const ReportDownloadButton: React.FC<ReportDownloadButtonProps> = ({ code }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const store = useStore($store);

  const handleDownloadReport = async () => {
    // const orgunit = store.selectedOrgUnits;
    const selectedOrg = store.selectedOrgUnits?.[0];
		const org = store.userOrgUnits.find(org => org.id == selectedOrg);
    console.log("org", store.selectedOrgUnits, org);
    // const code = store.code;
    const period = store.period;
    setIsLoading(true);
    setError(null);
    try {

      const response = await serverapi.get(`/download-report${buildOrgQueryString([org?.name], code, period)}`, { responseType: 'blob' });
      // const response = await serverapi.get(`/download-report?level={}&org={}`, { responseType: 'blob' });

      // Create a URL for the downloaded file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'report.csv'); 

      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      setError("There was an error downloading the report."); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clear error message after 5 seconds
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer); 
  }, [error]);

  return (
    <div>
      <Button
        rightIcon={<MdFileDownload />}
        colorScheme="blue"
        variant="outline"
        size="sm"
        isLoading={isLoading}
        onClick={handleDownloadReport}
      >
        {isLoading ? 'Downloading...' : 'Download Report'}
      </Button>
      {error && <Box color="red.500" mt={2}>{error}</Box>}
    </div>
  );
};

export default ReportDownloadButton;
