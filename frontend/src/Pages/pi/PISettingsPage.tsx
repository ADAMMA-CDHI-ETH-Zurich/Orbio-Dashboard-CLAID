import { Box, Stack } from "@chakra-ui/react";
import PISettings from "../../components/PISettings";
import DeleteAccount from "../../components/deleteAccount";

/**
 * @returns Page with settings for PI (name, email, etc.) and button to delete account
 */
const PISettingsPage = () => {
  return (
    <Box>
      <Stack gap={8}>
          <PISettings />
          <DeleteAccount userType="pi" />
      </Stack>
    </Box>
  );
};

export default PISettingsPage; 