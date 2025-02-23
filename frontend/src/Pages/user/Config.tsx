import { Heading, Link, List, Stack } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { FileDownload, OpenInNewWindow } from "../../icons";
import { useAuth } from "../../provider/authProvider";
import { BASE_URL } from "../../router/apiClient";
const JSON_FILE_NAME = "orbio_config.json";
const JAVA_FILE_NAME = "MyApplication.java";
const ZIP_FILE_NAME = "CLAIDWearOSApp";


/** Name of instructional PDF found in /public folder */
const INSTRUCTION_PDF = "Orbio_Pairing_Galaxy_Watch_Android_Studio.pdf";

const Config = () => {
  const [isJsonLoading, setIsJsonLoading] = useState<boolean>(false);
  const [isJavaLoading, setIsJavaLoading] = useState<boolean>(false);
  const [isZipLoading, setIsZipLoading] = useState<boolean>(false);

  const { token } = useAuth();

  const downloadJson = async () => {
    setIsJsonLoading(true);

    try {
      const response = await axios.get(BASE_URL + "/setup/config?battery=true&acceleration=true&heartrate=true&oxygen=true", {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = response.data;

      // Convert the JSON object to a string
      const jsonString = JSON.stringify(data, null, 2);

      // Create a Blob with the JSON string
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a hidden anchor element
      const link = document.createElement('a');
      link.href = url;

      // Set the file name for the download
      link.download = JSON_FILE_NAME;

      // Append the anchor to the document, trigger click, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the Blob URL to free up memory
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("There was an error downloading the file.");
      console.error(err);
    } finally {
      setIsJsonLoading(false);
    }
  };

  const downloadJava = async () => {
    setIsJavaLoading(true);

    try {
      const response = await axios.get(BASE_URL + "/setup/app", {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      // Create a hidden anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = JAVA_FILE_NAME;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      alert("There was an error downloading the file.");
      console.error(err);
    } finally {
      setIsJavaLoading(false);
    }
  }

  const downloadZip = async () => {
    setIsZipLoading(true);

    try {
      // Fetch the ZIP file from the backend
      const response = await axios.get(BASE_URL + "/setup/project", {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const blob = new Blob([response.data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);

      // Create a hidden anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = ZIP_FILE_NAME;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

    } catch (err) {
      alert("There was an error downloading the file.");
      console.error(err);
    } finally {
      setIsZipLoading(false);
    }
  }

  return (
    <Stack>
      <Heading mb="1em">Orbio Configuration Instructions</Heading>
      {/* TODO add info box about how this can take a while and a contact point if there are questions */}
      <List.Root as="ol" gap="1.5em">
        <List.Item><Link variant="underline" colorPalette="blue" href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer">Download Android Studio</Link> onto your computer if you don't already have it.</List.Item>
        <List.Item>
          Download the configuration files below. Bigger files may take a while to download.
          <List.Root mt="0.5em" gap="0.5em" ps="5">
            <List.Item>
            <Button onClick={downloadZip} loading={isZipLoading} loadingText="Downloading...">
              <FileDownload aria-label="Download file" /> Project Files
            </Button>
            </List.Item>
            <List.Item>
            <Button onClick={downloadJson} loading={isJsonLoading} loadingText="Downloading...">
              <FileDownload aria-label="Download file" /> JSON Setup File
            </Button>
            </List.Item>
            <List.Item>
            <Button onClick={downloadJava} loading={isJavaLoading} loadingText="Downloading...">
              <FileDownload aria-label="Download file" /> Java Application File
            </Button>
            </List.Item>
          </List.Root>
        </List.Item>
        <List.Item>
          Follow the instructions in the linked PDF:
          <List.Root mt="0.5em" gap="0.5em" ps="5">
            <List.Item>
                <Link variant="underline" colorPalette="blue" href={`/${INSTRUCTION_PDF}`} target="_blank"><OpenInNewWindow aria-label="Open in new window" /> Instruction PDF</Link>
            </List.Item>
          </List.Root>
        </List.Item>
      </List.Root>
    </Stack>
  );
}

export default Config;