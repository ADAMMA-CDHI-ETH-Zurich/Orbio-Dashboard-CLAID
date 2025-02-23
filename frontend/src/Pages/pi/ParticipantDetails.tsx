import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import DataCardWithDateRange from '../../components/DataCardWithDateRange';
import { Toaster } from "../../components/ui/toaster";
import { BASE_URL } from '../../router/apiClient';
import { capitalizeFirstLetter } from '../../utils/string';

/**
 * @returns Page with details of participant's status in study as well as data cards displaying their recorded metrics
 */
const ParticipantDetails = () => {
  const location = useLocation();
  const { study, participant } = location.state;

  const getMetricApiCalls = (metric: { id: string; name: string }) => {
    const baseUrl = BASE_URL + `/pi/studies/${study.id}/participants/${participant.participant_num}/metrics`;
    const downloadBaseUrl = BASE_URL + `/pi/studies/${study.id}/participants/${participant.participant_num}/download_metrics`;
  
    let metricEndpoints = [];
    
    if (metric.name.toLowerCase() === 'acceleration') {
      metricEndpoints = [
        {
          apiCall: `${baseUrl}/${metric.name}_xyz`,
          downloadApiCall: `${downloadBaseUrl}/${metric.id}`,
          metricType: 'xyz',
          originalName: metric.name
        },
        {
          apiCall: `${baseUrl}/${metric.name}_vector`,
          downloadApiCall: `${downloadBaseUrl}/${metric.id}`,
          metricType: 'vector',
          originalName: metric.name
        }
      ];
    } else if (metric.name.toLowerCase() === 'heartrate') {
      metricEndpoints = [
        {
          apiCall: `${baseUrl}/${metric.name}`,
          downloadApiCall: `${downloadBaseUrl}/${metric.id}`,
          metricType: 'regular',
          originalName: metric.name
        }
      ];
    } else {
      metricEndpoints = [
        {
          apiCall: `${baseUrl}/${metric.name}`,
          downloadApiCall: `${downloadBaseUrl}/${metric.name}`,
          metricType: 'default',
          originalName: metric.name
        }
      ];
    }



    return metricEndpoints;
  };

  const startTime = Math.floor((new Date(participant.start_date)).getTime() / 1000);
  const endTime = participant.status === "completed" 
    ? Math.floor((new Date(participant.end_date)).getTime() / 1000)
    : Math.floor(Date.now() / 1000);

  return (
    <>
      <Toaster />
      <Container>
        <BackButton />
        <VStack mt="1em" align="stretch" gap={6}>
          <Box>
            <Heading mb={2}>
              Participant {participant.participant_num}
            </Heading>
            <Text color="gray.600">
              Study: {study.name}
            </Text>
          </Box>

          <Box p={6} borderRadius="lg" border="1px solid" borderColor="gray.200">
            <VStack align="stretch" gap={4}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Status</Text>
                <Badge 
                  colorScheme={participant.status === 'ongoing' ? 'green' : 'blue'}
                >
                  {participant.status}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="medium">Start Date</Text>
                <Text>{new Date(participant.start_date).toLocaleDateString()}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="medium">End Date</Text>
                <Text>{new Date(participant.end_date).toLocaleDateString()}</Text>
              </HStack>

            </VStack>
          </Box>

          <Flex wrap="wrap" gap="1em">
            {study.metrics.flatMap((metric: { id: string; name: string }) => {

              const endpoints = getMetricApiCalls(metric);
              
              return endpoints.map((endpoint, index) => (
                <DataCardWithDateRange 
                  key={`${metric.id}-${endpoint.metricType}-${index}`}
                  apiCall={endpoint.apiCall}
                  downloadApiCall={endpoint.downloadApiCall}
                  startTime={startTime}
                  endTime={endTime}
                  metricType={endpoint.metricType}
                  title={`${capitalizeFirstLetter(endpoint.originalName)} ${
                    endpoint.metricType !== 'default' 
                      ? `(${endpoint.metricType.toUpperCase()})` 
                      : ''
                  }`}
                />
              ));
            })}
          </Flex>
        </VStack>
      </Container>
    </>
  );
};

export default ParticipantDetails; 