import { Box, Stack } from "@chakra-ui/react";
import UserSettings from "../../components/UserSettings";
import DeleteAccount from "../../components/deleteAccount";

/**
 * @returns Page with settings for User (name, email, height, etc.) and button to delete account
 */
const UserSettingsPage = () => {
  return (
    <Box>
      <Stack gap={8}>
        <UserSettings />
        <DeleteAccount userType="user" />
      </Stack>
    </Box>
  );
};
export default UserSettingsPage;