import { Box, Card, Flex, For, IconButton, Image, Show, Spinner, Tabs, Text } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { ExportCsv } from '../icons';
import { useAuth } from '../provider/authProvider';
import { getTimezoneOffsetSeconds } from '../utils/timezone';
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "./ui/accordion";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Skeleton } from './ui/skeleton';

const TIME_RANGES = [
  "6 hours",
  "Last day",
  "Last 3 days"
]

const TIME_RANGES_SEC = [
  21600,
  86400,
  259200
]

/** Displays data card with title, 'download to CSV' button, image, collapsible caption, and optionally buttons to switch time range.
 *  @param props.name The name of this data point (e.g., "Heart Rate")
 *  @param props.apiCall full API endpoint to call without time parameters (expects a 'from' and 'to' parameter)
 *  @param props.downloadApiCall full API endpoint to download without time parameters (expects a 'from' and 'to' parameter). If undefined, no option to download data.
 *  @param props.endTime UNIX timestamp string representing time where graph data will end (for instance, time of most recent data collection).
 */
const DataCard = (props: {name: string, apiCall: string, downloadApiCall?: string, endTime: number}) => {
  const [index, setIndex] = useState<number>(0); // corresponds to index in TIME_RANGES
  const [imageString, setImageString] = useState<string>("");
  const [alt, setAlt] = useState<string>("");
  // const [imageStrings, setImageStrings] = useState<string[]>(['', '', '']);
  // const [alts, setAlts] = useState<string[]>(['', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const { token } = useAuth();
  const { name, apiCall, endTime, downloadApiCall } = props;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiCall}?from_time=${endTime - TIME_RANGES_SEC[index]}&to_time=${endTime}&timezone=${getTimezoneOffsetSeconds()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (!response.data.image) {
          const errorMessage = response.data.message || "No data available for this time range.";
          setError(errorMessage);
          // toaster.create({
          //   title: "Data Error",
          //   description: errorMessage,
          //   type: "error",
          // });
          return;
        }

        setError('');
        setImageString(response.data.image);
        setAlt(response.data.alt);
      } catch (error) {
        if (error instanceof AxiosError) {
          const errorMessage = error.response?.data?.message || "No data available for this time range.";
          setError(errorMessage);
          // toaster.create({
          //   title: "Error",
          //   description: errorMessage,
          //   type: "error",
          // });
          console.error(error.response?.data);
        } else {
          setError("An unexpected error occurred");
          // toaster.create({
          //   title: "Error",
          //   description: "An unexpected error occurred while loading data",
          //   type: "error",
          // });
          console.error(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  async function changeValue(val: string) {
    const index = TIME_RANGES.indexOf(val);
    setIndex(index);
    setIsUpdating(true);
    try {
      const response = await axios.get(`${apiCall}?from_time=${endTime - TIME_RANGES_SEC[index]}&to_time=${endTime}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.data.image) {
        const errorMessage = response.data.message || "No data available for this time range.";
        setError(errorMessage);
        // toaster.create({
        //   title: "Data Error",
        //   description: errorMessage,
        //   type: "error",
        // });
        return;
      }
      setError('');
      setImageString(response.data.image);
      setAlt(response.data.alt);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || "No data available for this time range.";
        setError(errorMessage);
        // toaster.create({
        //   title: "Error",
        //   description: errorMessage,
        //   type: "error",
        // });
        console.error(error.response?.data);
      } else {
        setError("An unexpected error occurred");
        // toaster.create({
        //   title: "Error",
        //   description: "An unexpected error occurred while loading data",
        //   type: "error",
        // });
        console.error(error);
      }
    } finally {
      setIsUpdating(prev => false);
    }
    
  }

  async function exportToCsv() {
    if (downloadApiCall === undefined) {
      return;
    }
  
    setIsDownloading(true);
    try {
      const response = await axios.get(
        `${downloadApiCall}?from_time=${endTime - TIME_RANGES_SEC[index]}&to_time=${endTime}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // Add this to ensure proper handling of CSV data
          responseType: 'blob'
        }
      );
  
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set filename for download (you can adjust the filename as needed)
      link.download = `data_${new Date().toISOString()}.csv`;
      link.href = url;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV Export Error:', error);
      alert("There was an issue downloading the data.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Card.Root maxW="450px" w="100%" variant="outline">
      <Skeleton loading={isLoading}>
        {/* Title, CSV icon, and image */}
        <Flex justify="space-between" align="center" borderBottom="1px solid lightgray" p="2">
          <Flex alignItems="center" gap="0.5em">
            <Card.Title>{name}</Card.Title>
            <Show when={isUpdating}><Spinner /></Show>
          </Flex>  
          <Show when={downloadApiCall !== undefined && !error}>
            <IconButton 
              onClick={exportToCsv} 
              color="gray" 
              aria-label="Export to CSV" 
              variant="ghost" 
              p="0"
              disabled={isDownloading}
            >
              {isDownloading ? <Spinner size="sm" /> : <ExportCsv />}
            </IconButton>
          </Show>
        </Flex>
        { error
          ? <Text p="1em">{error}</Text>
          : (
            <DialogRoot size="4xl" placement="center">
              <DialogTrigger asChild>
                <Image 
                  src={`data:image/jpeg;base64,${imageString}`} 
                  alt={alt}
                  style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }}
                />
              </DialogTrigger>
              <DialogContent maxH="90vh" maxW="90vw">
                <DialogHeader>
                  <DialogTitle>{name}</DialogTitle>
                  <DialogCloseTrigger />
                </DialogHeader>
                <DialogBody p={4} display="flex" justifyContent="center" alignItems="center">
                  <Box maxH="calc(90vh - 80px)" maxW="100%" overflow="auto">
                    <Image
                      src={`data:image/jpeg;base64,${imageString}`}
                      alt={alt}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: 'calc(90vh - 100px)',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                </DialogBody>
              </DialogContent>
            </DialogRoot>
          )
        }
      </Skeleton>
      {/* Buttons to switch time range */}
      {!endTime ? null :
        <Tabs.Root fitted value={TIME_RANGES[index]} onValueChange={(e: Tabs.RootProps) => changeValue(e.value ?? '')} variant="enclosed">
          <Tabs.List>
            <For each={TIME_RANGES}>
              {(range, idx) => 
                <Tabs.Trigger key={idx} value={range}>
                  {range}
                </Tabs.Trigger>
              }
            </For>
          </Tabs.List>
        </Tabs.Root>
      }
      {/* Collapsible caption */}
      <AccordionRoot disabled={error !== ''} lazyMount unmountOnExit w="auto" m="0.5em" variant="enclosed" collapsible={true}>
        <AccordionItem value="caption">
          <AccordionItemTrigger>Caption</AccordionItemTrigger>
          <AccordionItemContent>{alt}</AccordionItemContent>
        </AccordionItem>
      </AccordionRoot>
    </Card.Root>
  );
}
export default DataCard;