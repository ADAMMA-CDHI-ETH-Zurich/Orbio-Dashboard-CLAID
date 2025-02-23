import {
  Box,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CheckCircle } from "../../icons";

/**
 * @returns Information for Principal Investigator displayed after a PI makes an account
 */
const PIAboutPage = () => {
  return (
    <VStack align="stretch" gap={8}>
      <Heading size="xl">About the Principal Investigator Portal</Heading>

      <Text fontSize="lg">
        Welcome to the Principal Investigator (PI) portal. This platform is designed 
        to help you manage your research studies efficiently and effectively.
      </Text>

      <Box>
        <Heading size="md" mb={4}>Key Features</Heading>
        <VStack align="stretch" gap={4}>
          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Study Creation:</strong> Create new studies with customizable 
              parameters, including duration, metrics to track, and participant criteria.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Document Management:</strong> Upload and manage inclusion criteria 
              and informed consent documents in markdown format.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Participant Tracking:</strong> Monitor participant enrollment, 
              progress, and data collection in real-time.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Study Management:</strong> View and manage all your studies from 
              a central dashboard, including ongoing, completed, and planned studies.
            </Text>
          </HStack>
        </VStack>
      </Box>

      <Box>
        <Heading size="md" mb={4}>Getting Started</Heading>
        <VStack align="stretch" gap={4}>
          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Create a Study:</strong> Use the "Create Study" option to set up 
              a new research study. You'll need to provide study details, duration, and 
              required documentation.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Monitor Studies:</strong> Access "My Studies" to view all your 
              studies and track their progress. Click on individual studies to see 
              detailed information and participant data.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Manage Settings:</strong> Update your account settings and 
              preferences through the Settings page.
            </Text>
          </HStack>
        </VStack>
      </Box>

      <Box>
        <Heading size="md" mb={4}>Study Status Types</Heading>
        <VStack align="stretch" gap={4}>
          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Not Started:</strong> Studies that are set up but haven't begun 
              collecting data yet.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Ongoing:</strong> Active studies currently collecting participant 
              data.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Completed:</strong> Studies that have finished their data 
              collection period.
            </Text>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default PIAboutPage; 