import {
  Badge,
  Card,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Heading,
  HStack,
  IconButton,
  Separator,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Copy, FileDownload } from '../icons';
import DeleteStudyButton from './DeleteStudyButton';
import DownloadConsentForms from './DownloadConsentForms';
import { Toaster, toaster } from "./ui/toaster";


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

interface StudyCardProps {
    study: Study;
    isOpen: boolean;
    onToggle: () => void;
  }

  /**
   * @param study Object containing information about a study
   * @param isOpen Whether the card is expanded or not.
   * @param onToggle A function to call when the card is closed or opened.
   * @returns Card shown to PIs that gives an overview of a study (name and status). Includes a dropdown that, when clicked,
   *          expands the card to show more information including a copyable study code, a button that downloads
   *          consent forms of all participants, and a button to delete the study.
   */
const StudyCard = ({ study, isOpen, onToggle }: StudyCardProps) => {
  const navigate = useNavigate();

  const handleCopyId = () => {


      navigator.clipboard.writeText(study.code);
      toaster.create({
        title: "Study code copied",
        description: `Code ${study.code} copied to clipboard`,
        type: "success",
      });
    
  };
  
  const handleHeaderClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the IconButton
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`${study.id}`, { state: { study } });
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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'ongoing':
        return {
          bg: 'green.50',
          color: 'green.700',
          borderColor: 'green.200'
        };
      case 'completed':
        return {
          bg: 'blue.50',
          color: 'blue.700',
          borderColor: 'blue.200'
        };
      case 'not_started':
        return {
          bg: 'orange.50',
          color: 'orange.700',
          borderColor: 'orange.200'
        };
      default:
        return {
          bg: 'gray.50',
          color: 'gray.700',
          borderColor: 'gray.200'
        };
    }
  };

  return (
    
<Card.Root 
  maxW="450px"
  w="100%"
  overflow="hidden"
  h={isOpen ? "auto" : "70px"}

  borderColor={isOpen ? "blue.200" : "gray.200"} 
  transition="height 0.2s ease-in-out" // Smooth transition
  _hover={{
    borderColor: "blue.500"
    
  }}
><Toaster />
    <Collapsible.Root>
    <Card.Header 
          p={4}
          onClick={handleHeaderClick}
          cursor="pointer" // Add pointer cursor
          _hover={{ bg: "gray.50" }} // Optional hover effect
        >
      
        <HStack justify="space-between" align="center" w="100%" h="full">
        
          <HStack gap={3}>
            <Badge 
              {...getStatusStyles(study.status)}
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
              fontWeight="medium"
              border="1px solid"
            >
              {study.status.replace('_', ' ')}
            </Badge>
            <Heading size="md">{study.name}</Heading>
          </HStack>
          <CollapsibleTrigger>
            <IconButton
              onClick={onToggle}
              variant="ghost"
              ml="auto"
              p="10px"
            >{isOpen ? <ChevronUp /> : <ChevronDown />}
            </IconButton>
            </CollapsibleTrigger>
        </HStack>
        
      </Card.Header>

      <CollapsibleContent>
        <Card.Body>
        <VStack gap={4} align="stretch">
          <Text>Participants: {study.num_participants}</Text>
          <Text>Status: {study.status}</Text>
          <Text>Description: {study.description}</Text>
          <Text>Start Date: {new Date(study.start_date).toLocaleDateString()}</Text>
          <Text>End Date: {new Date(study.end_date).toLocaleDateString()}</Text>
          <Text>Duration: {formatDuration(study.duration)}</Text>

          <HStack justify="space-between" align="center" w="100%">
            <Text>Study code: {study.code}</Text>
            <IconButton
              variant="ghost"
              aria-label="Copy code"
              onClick={() =>handleCopyId()}
              size="sm"
            ><Copy />
            </IconButton>
          </HStack>
          

           < HStack   justify="space-between" align="center" w="100%" >
            <Text>Inclusion Criteria</Text>
            <IconButton
            variant="ghost"
                aria-label="Download inclusion criteria"
                onClick={() => handleDownload('inclusion_criteria')}
              size="sm"
            >
                <FileDownload />
            </IconButton>
            
            </HStack>
           < HStack   justify="space-between" align="center" w="100%" >
            <Text>Consent Form</Text>
            <IconButton
            variant="ghost"
                aria-label="Download informed consent"
                onClick={() => handleDownload('informed_consent')}
              size="sm"
            >
                <FileDownload />
            </IconButton>
            
            </HStack>

          {study.metrics && study.metrics.length > 0 && (
            <>
              <Text fontWeight="semibold">Metrics:</Text>
              <Stack gap={2}>
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
            </>
          )}

          <Separator />

          <DownloadConsentForms study={study} />

          <Separator />

          <DeleteStudyButton study={study} />

          </VStack>
        </Card.Body>
      </CollapsibleContent>
      </Collapsible.Root>
    </Card.Root>
  );
};
export default StudyCard;