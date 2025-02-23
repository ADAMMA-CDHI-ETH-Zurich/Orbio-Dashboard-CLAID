import { Box, Card, Flex, IconButton, Image, Show, Spinner, Text } from '@chakra-ui/react';
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
import { Toaster, toaster } from "./ui/toaster";

interface DataCardWithDateRangeProps {
  apiCall: string;
  downloadApiCall?: string;
  startTime: number;
  endTime: number;
  metricType: string;
  title: string;
}

/** Displays data card with title, 'download to CSV' button, image, collapsible caption, and optionally buttons to switch time range.
 *  @param props.name The name of this data point (e.g., "Heart Rate")
 *  @param props.apiCall full API endpoint to call without time parameters (expects a 'from' and 'to' parameter)
 *  @param props.downloadApiCall full API endpoint to download without time parameters (expects a 'from' and 'to' parameter). If undefined, no option to download data.
 *  @param props.startTime UNIX timestamp string *in local time* representing time where graph data will start (for instance, time of most recent data collection).
 *  @param props.endTime UNIX timestamp string *in local time* representing time where graph data will end (for instance, time of most recent data collection).
 */
const DataCardWithDateRange = ({ 
  apiCall, 
  downloadApiCall, 
  startTime, 
  endTime,
  metricType,
  title
}: DataCardWithDateRangeProps) => {
  const [imageString, setImageString] = useState<string>("");
  const [alt, setAlt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsUpdating(true);
      setImageLoadError(false);
      const fullUrl = `${apiCall}?from_time=${startTime}&to_time=${endTime}&timezone=${getTimezoneOffsetSeconds()}`;
      
      try {
        const response = await axios.get(fullUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.data.image) {
          setError(`No data available for ${metricType}`);
          return;
        }

        setError('');
        setImageString(response.data.image);
        setAlt(response.data.alt);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error(`[${metricType}] API Error:`, {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
            timestamp: new Date().toISOString()
          });
          setError(error.response?.data?.message || `Failed to load ${metricType} data`);
        } else {
          console.error(`[${metricType}] Unknown Error:`, error);
          setError(`An unexpected error occurred loading ${metricType}`);
        }
      } finally {
        setIsLoading(false);
        setIsUpdating(false);
      }
    };

    fetchData();
  }, [apiCall, startTime, endTime, token, metricType]);

  const exportToCsv = async () => {
    if (!downloadApiCall) return;
  
    setIsDownloading(true);
    try {
      const response = await axios.get(
        `${downloadApiCall}?from_time=${startTime}&to_time=${endTime}&timezone=${getTimezoneOffsetSeconds()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
  
      if (!response.data) {
        throw new Error('No data received');
      }
  
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const startDate = new Date(startTime * 1000).toISOString().split('T')[0];
      const endDate = new Date(endTime * 1000).toISOString().split('T')[0];
      link.download = `${sanitizedTitle}_${startDate}_${endDate}.csv`;
      
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV Export Error:', error);
      toaster.create({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download CSV data",
        type: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImageError = () => {
    console.error('Image failed to load:', {
      metricType,
      imageStringLength: imageString?.length,
      hasImageString: !!imageString
    });
    setImageLoadError(true);
    toaster.create({
      title: "Image Load Error",
      description: `Failed to display ${metricType} data visualization`,
      type: "error",
    });
  };

  return (
    <Card.Root maxW="450px" w="100%" variant="outline">
      <Toaster />
      <Skeleton loading={isLoading}>
        <Flex direction="column" gap={2}>
          <Flex justify="space-between" align="center" borderBottom="1px solid lightgray" p="2">
            <Flex alignItems="center" gap="0.5em">
              <Card.Title>{title}</Card.Title>
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

          {error || imageLoadError ? (
            <Box p={4} bg="red.50" borderRadius="md">
              <Text color="red.600" fontSize="sm">
                {error || `Failed to display ${metricType} visualization`}
              </Text>
            </Box>
          ) : (
            imageString && (
              <DialogRoot size="4xl" placement="center">
                <DialogTrigger asChild>
                  <Image 
                    src={`data:image/jpeg;base64,${imageString}`} 
                    alt={alt}
                    onError={handleImageError}
                    style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }}
                  />
                </DialogTrigger>
                <DialogContent maxH="90vh" maxW="90vw">
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
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
          )}
        </Flex>
      </Skeleton>

      {!error && !imageLoadError && (
        <AccordionRoot 
          lazyMount 
          unmountOnExit 
          w="auto" 
          m="0.5em" 
          variant="enclosed" 
          collapsible={true}
        >
          <AccordionItem value="caption">
            <AccordionItemTrigger>Caption</AccordionItemTrigger>
            <AccordionItemContent>{alt}</AccordionItemContent>
          </AccordionItem>
        </AccordionRoot>
      )}
    </Card.Root>
  );
};

export default DataCardWithDateRange; 