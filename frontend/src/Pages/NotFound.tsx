import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

/**
 * @returns 404 Not Found page
 */
export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      minHeight="100vh"
      backgroundColor="gray.50"
      padding={8}
    >
      <Stack gap={6}>
        {/* <Image
          src="https://via.placeholder.com/300x200" // Replace with your own 404 image or illustration
          alt="404 Not Found"
          boxSize="300px"
        /> */}
        <Heading size="2xl">404</Heading>
        <Text fontSize="lg" color="gray.600">
          Oops! The page you're looking for doesn't exist.
        </Text>
        <Button
          colorScheme="blue"
          onClick={() => navigate("/")} // Redirect to home or desired route
        >
          Go Back to Home
        </Button>
      </Stack>
    </Box>
  );
};

export default NotFound;