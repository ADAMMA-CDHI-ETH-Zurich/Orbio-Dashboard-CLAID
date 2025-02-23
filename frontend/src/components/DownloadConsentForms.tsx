import { Box, Button } from "@chakra-ui/react";
import axios from "axios";
import { FileDownload } from "../icons";
import { useAuth } from "../provider/authProvider";
import { BASE_URL } from "../router/apiClient";
import { Toaster, toaster } from "./ui/toaster";

interface Study {
  id: string;
  name: string;
  num_participants: number;
  status?: 'completed' | 'ongoing' | 'not_started';
  description?: string;
  start_date?: string;
  end_date?: string;
  inclusion_criteria?: string | null;
  informed_consent?: string | null;
  duration?: string;
  code?: string;
  metrics?: Array<{
    id: string;
    name: string;
  }>;
} 

/**
 * @param props.study Must contain `id`, `code`, and `num_participants` of the study to download the informed consent forms for.
 * @returns A button which, upon click, downloads a zip file of each participant's signed Informed Consent form for the given study
 */
const DownloadConsentForms = (props: {study: Study}) => {
  const { study } = props;
  const { token } = useAuth();

  const downloadConsentForms = async () => {
    try {
      const response = await axios.get(
        BASE_URL + `/pi/studies/${study.id}/participants/signed_informed_consent`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob' // Important for binary data
        }
      );
  
      // Create blob and download link
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consent_forms_${study.code}.zip`; // Name the file
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toaster.create({
        title: "Download started",
        description: "Consent forms are being downloaded",
        type: "success",
      });
    } catch (error) {
      console.error('Error downloading signed consent forms:', error);
      toaster.create({
        title: "Download failed",
        description: "Failed to download consent forms",
        type: "error",
      });
    }
  };

  return (
    <Box>
      <Toaster />
      <Button
        colorPalette ="blue"
        disabled={study.num_participants === 0}
        onClick={() => downloadConsentForms()}
        w="100%"
      >
        Download Signed Consent Forms <FileDownload  />
      </Button>
    </Box>
  );
}

export default DownloadConsentForms;