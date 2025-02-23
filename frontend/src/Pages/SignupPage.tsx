import { Center, VStack } from "@chakra-ui/react";
import SignUp from "../components/SignUp";
import Welcome from "../components/Welcome";

/**
 * 
 * @returns Page with signup form and Welcome banner at top
 */
const SignUpPage = () => {
  return (
    <Center minH="100vh">
      <VStack >
        <Welcome />
        <SignUp />
      </VStack>
    </Center>
  );
};

export default SignUpPage;