import { Box, Button, IconButton, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu as MenuIcon } from "../icons";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger
} from "./ui/drawer";

/**
 * Displays static menu on left side of screen for larger screens, and hamburger menu for smaller screens
 * @param props.links Map from name of menu item (key) to page link that it should navigate to (value)
 */
export default function Menu(props: { links: Map<string, string> }) {
  const { links } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const menuButtons =
    Array.from(links).map(([name, path]) => (
      <Button
        key={name}
        onClick={() => navigate(path)}
        variant="ghost"
        justifyContent="flex-start"
        bg={location.pathname === path ? "blue.100" : "transparent"}
        borderLeft={location.pathname === path ? "4px solid" : "none"}
        borderLeftColor="blue.500"
        _hover={{ bg: location.pathname === path ? "blue.200" : "gray.200" }}
      >
        {name}
      </Button>
    ));

  return (
    <Box>
      {/* Menu to display when screen is big enough */}
      <Stack
        hideBelow="md"
        gap={4} 
        p={4}
        bg="gray.100"
        minW="200px"
        h="100vh"
        position="fixed"  // Makes the menu stay fixed
        left={0}         // Aligns to the left side
        top={0}          // Aligns to the top
        zIndex={1}       // Ensures menu stays above other content
        pt="80px" 
        boxShadow="sm"
      >
        {menuButtons}
      </Stack>
      {/* Menu to display when screen is small enough */}
      <DrawerRoot onOpenChange={(e) => setOpen(e.open)} open={open} size="xs" placement="start">
        <DrawerBackdrop />
        <DrawerTrigger position="fixed" asChild>
          <IconButton m="10px" hideFrom="md" variant="ghost">
            <MenuIcon />
          </IconButton>
        </DrawerTrigger >
        <DrawerContent>
          <DrawerBody>
            <Stack gap="4" pt="4" onClick={() => setOpen(false)}>
              {menuButtons}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Box>
  );
}
