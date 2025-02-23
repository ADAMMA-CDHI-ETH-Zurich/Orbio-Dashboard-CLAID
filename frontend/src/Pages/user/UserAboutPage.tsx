import {
  Box,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CheckCircle } from "../../icons";

/**
 * @returns Information for User displayed after a User makes an account
 */
const UserAboutPage = () => {
  return (
    <VStack align="stretch" gap={8}>
      <Heading size="xl">About the User Portal</Heading>

      <Text fontSize="lg">
        Welcome to the User portal. This platform allows you to participate in research 
        studies and contribute valuable data while maintaining control over your participation.
      </Text>

      <Box>
        <Heading size="md" mb={4}>Key Features</Heading>
        <VStack align="stretch" gap={4}>
          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Study Participation:</strong> Join research studies by entering their 
              unique study code and reviewing study information.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Data Privacy:</strong> Maintain control over your data with clear 
              information about what data is collected and how it's used.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Study Management:</strong> View all your active studies and track 
              your participation status.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Device Configuration:</strong> Set up your wearable device to 
              collect the required data for studies.
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
              <strong>Join a Study:</strong> Enter the study code provided by the researcher, 
              review the study details, and sign the informed consent form.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Configure Your Device:</strong> Follow the setup instructions to 
              configure your wearable device for data collection.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Monitor Your Studies:</strong> Track your active studies and view 
              your participation status through the dashboard.
            </Text>
          </HStack>
        </VStack>
      </Box>

      <Box>
        <Heading size="md" mb={4}>Study Participation</Heading>
        <VStack align="stretch" gap={4}>
          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Review Study Information:</strong> Before joining, you can review 
              all study details, including duration, data collection, and requirements.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Data Collection:</strong> Your wearable device will automatically 
              collect and send the required data during the study period.
            </Text>
          </HStack>

          <HStack align="flex-start" gap={3}>
            <Box color="green.500" mt={1}>
              <CheckCircle />
            </Box>
            <Text>
              <strong>Leave Studies:</strong> You can choose to leave a study at any time
              and your provided data will not be accessible to the researchers anymore (The already downloaded data remains under their control).
            </Text>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default UserAboutPage; 