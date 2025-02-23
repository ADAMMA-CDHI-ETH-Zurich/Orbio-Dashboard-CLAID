import {
  Badge,
  Box,
  Heading,
  HStack,
  IconButton,
  Separator,
  Stack,
  Text
} from '@chakra-ui/react';
import { Copy, FileDownload } from '../icons';
import { Toaster, toaster } from "./ui/toaster";

import DeleteStudyButton from './DeleteStudyButton';
import DownloadConsentForms from './DownloadConsentForms';

interface Study {
    id: string;
    name: string;
    num_participants: number;
    status: 'completed' | 'ongoing' | 'not_started';
    description: string;
    start_date: string;
    end_date: string;
    inclusion_criteria: string | null;
    informed_consent: string | null;
    duration: string;
    code: string;
    metrics: Array<{
      id: string;
      name: string;
      // Add other metric properties if needed
    }>;
  } 

interface StudyDetailsBarProps {
  study: Study;
}

/**
 * @param study Contains information about study
 * @returns Bar for PI view that appears on right side of screen (with z-index of 1) that lists information about the given study,
 *          including a copyable study code, a button to download informed consent forms of all participants, and a button to
 *          delete the study.
 */
const StudyDetailsBar: React.FC<StudyDetailsBarProps> = ({ study }) => {
  const handleCopyId = () => {
      navigator.clipboard.writeText(study.code);
      toaster.create({
        title: "Study code copied",
        description: `Code ${study.code} copied to clipboard`,
        type: "success",
      });
    
  };

  const handleDownload = (fileType: 'inclusion_criteria' | 'informed_consent') => {
    const content = fileType === 'inclusion_criteria' ? study.inclusion_criteria : study.informed_consent;

    if (!content) {
        toaster.create({
            title: "Download failed",
            description: "No content available",
            type: "error",
        });
        return;
    }

    try {
        // Create blob from the markdown content
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileType}-${study.id}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Download error:', error);
        toaster.create({
            title: "Download failed",
            description: "Failed to process content",
            type: "error",
        });
    }
};
const formatDuration = (duration: string): string => {
  // Extract days and hours using regex
  const daysMatch = duration.match(/(\d+)D/);
  const hoursMatch = duration.match(/T(\d+)H/);
  
  const days = daysMatch ? parseInt(daysMatch[1]) : 0;
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  
  // Build readable string
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} days`);
  if (hours > 0) parts.push(`${hours} hours`);
  
  return parts.length > 0 ? parts.join(' ') : '0 hours';
};

  return (
    <>
      <Toaster />
      <Box
        position="fixed"
        right={0}
        top={0}
        h="100vh"
        w="400px"
        bg="white"
        boxShadow="lg"
        p={6}
        pt="80px"
        overflowY="auto"
        zIndex="1"
      >
        <Stack gap={6}>
          <Box>
            <Heading size="md" mb={2}>{study.name}</Heading>
            <Text color="gray.600" fontSize="sm">Status: {study.status}</Text>
          </Box>

          <Separator />

          <Box>
            <Heading size="sm" mb={3}>Study Details</Heading>
            <Stack gap={2}>
              <Text>Participants: {study.num_participants}</Text>
              <Text>Start Date: {new Date(study.start_date).toLocaleDateString()}</Text>
              <Text>End Date: {new Date(study.end_date).toLocaleDateString()}</Text>
              <Text>Duration: {formatDuration(study.duration)}</Text>
            </Stack>
          </Box>

          <Box>
            <Heading size="sm" mb={3}>Description</Heading>
            <Text>{study.description}</Text>
          </Box>

          <Box>
            <Heading size="sm" mb={3}>Metrics</Heading>
            {study.metrics && study.metrics.length > 0 ? (
              <Stack direction="row" flexWrap="wrap" gap={2}>
                {study.metrics.map((metric) => (
                  <Badge
                    key={metric.id}
                    px={2}
                    py={1}
                    borderRadius="md"
                    bg="blue.50"
                    color="blue.700"
                  >
                    {metric.name}
                  </Badge>
                ))}
              </Stack>
            ) : (
              <Text color="gray.500">No metrics assigned</Text>
            )}
          </Box>

          <Separator />

          <Box>
            <Heading size="sm" mb={3}>Study Code</Heading>
            <HStack justify="space-between">
              <Text fontSize="sm" fontFamily="mono">{study.code}</Text>
              <IconButton
                variant="ghost"
                aria-label="Copy code"
                onClick={() => handleCopyId()}
                size="sm"
              >
                <Copy />
              </IconButton>
            </HStack>
          </Box>

          <Box>
            <Heading size="sm" mb={3}>Documents</Heading>
            <Stack gap={3}>
              <HStack justify="space-between">
                <Text>Inclusion Criteria</Text>
                <IconButton
                  variant="ghost"
                  aria-label="Download Inclusion Criteria"
                  onClick={() => handleDownload('inclusion_criteria')}
                  size="sm"
                >
                  <FileDownload />
                </IconButton>
              </HStack>
              <HStack justify="space-between">
                <Text>Informed Consent</Text>
                <IconButton
                  variant="ghost"
                  aria-label="Download Consent Form"
                  onClick={() => handleDownload('informed_consent')}
                  size="sm"
                >
                  <FileDownload />
                </IconButton>
              </HStack>
            </Stack>
          </Box>

          <Separator />

            
          <DownloadConsentForms study={study} />

          <Separator />

          <DeleteStudyButton study={study} />
        </Stack>


          
      </Box>
    </>
  );
};

export default StudyDetailsBar;