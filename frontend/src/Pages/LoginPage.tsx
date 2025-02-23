import { Center, VStack } from "@chakra-ui/react";
import Login from "../components/Login";
import Welcome from "../components/Welcome";

/**
 * 
 * @returns Page with login form and Welcome banner at top
 */
const LoginPage = () => {
  return (
    <Center minH="100vh">
      <VStack gap={8}>
        <Welcome />
        <Login />
      </VStack>
    </Center>
  );
};

export default LoginPage;