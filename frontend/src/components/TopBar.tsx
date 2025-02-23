import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Orbio } from "../icons";
import { useAuth } from "../provider/authProvider";
import {
  DialogActionTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";

/**
 * @returns Sticky bar that appears on the top of the web page when logged in. Contains a button to log out
 *          and a clickable logo and 'Orbio' text that redirects to the main page of the logged-in account.
 */
const TopBar = () => {
  const navigate = useNavigate();
  const { setToken, name } = useAuth();

  const handleLogout = () => {
    setToken();
    navigate("/");
  };

  return (
    <>
      {/* Placeholder box to maintain layout spacing */}
      <Box h="64px" />
      
      {/* Fixed TopBar */}
      <Flex
        position="fixed"
        top={0}
        left={0}
        right={0}
        h="64px"
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={6}
        align="center"
        justify="space-between"
        zIndex={100}
      >
        <HStack gap={3} onClick={() => navigate("/")} cursor="pointer">
          <Orbio size={32} />
          <Text
            fontSize="xl"
            fontWeight="bold"
          >
            Orbio
          </Text>
        </HStack>
        <HStack gap={4}>
          <Text hideBelow="sm">
            Logged in as <Text as="span" fontWeight="bold">{name}</Text>
          </Text>
          <DialogRoot>
            <DialogTrigger asChild>
              <Button 
                variant="ghost"
                _hover={{
                  bg: "black",
                  color: "white"
                }}
              >
                Log Out
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to log out?</DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogActionTrigger>
                <Button onClick={handleLogout}>Log Out</Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        </HStack>
      </Flex>
    </>
  );
};

export default TopBar;