import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Stack,
  Text
} from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../provider/authProvider';

import { BASE_URL } from '../router/apiClient';
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle
} from './ui/dialog';
import { PasswordInput } from './ui/password-input';

interface UserData {
  name: string;
  surname: string;
  email: string;
  user_type: string;
  password: string;
  new_password?: string;
  old_password?: string;
  weight_in_kg?: number;
  height_in_cm?: number;
}

const PASSWORD_DEFAULT = "••••••••";

/**
 * 
 * @returns User settings (name, email, height, weight etc.)
 */
const UserSettings = () => {
  const [originalData, setOriginalData] = useState<UserData | null>(null);
  const { token } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordInput, setPasswordInput] = useState(PASSWORD_DEFAULT);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  // const [oldPasswordError, setOldPasswordError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  // const [showPassword, setShowPassword] = useState(false);




  const handleSave = () => {
    //Replace this check with backend call to verify password
    if (userData?.password !== originalData?.password) {
      setShowPasswordDialog(true);
    } else {
      // Uncomment when backend is ready
      saveChanges();
    }
  };


  const handlePasswordConfirm = () => {
    setShowPasswordDialog(false);  // Close the dialog before saving
    saveChanges();  // Proceed with saving changes
  };


  const getChangedValues = () => {
    if (!userData || !originalData) return null;

    const changedFields: Partial<UserData> = {};

    // Compare each field
    if (userData.weight_in_kg !== originalData.weight_in_kg) {
      changedFields.weight_in_kg = userData.weight_in_kg;
    }
    if (userData.height_in_cm !== originalData.height_in_cm) {
      changedFields.height_in_cm = userData.height_in_cm;
    }
    if (userData.password !== originalData.password) {
      changedFields.old_password = oldPassword;
      changedFields.new_password = userData.password;
    }

    return Object.keys(changedFields).length > 0 ? changedFields : null;
  };

  const saveChanges = async () => {
    const changedValues = getChangedValues();
    if (!changedValues) return;

    if (changedValues.password && changedValues.password.trim() === '') {
      setPasswordError('Password cannot be empty');
      return;
    }

    try {
      await axios.put(
        BASE_URL + '/users/me',
        changedValues,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setOriginalData(userData);
      setHasChanges(false);
      setPasswordError('');
      setOldPassword('');  // Clear the old password input
    } catch (error) {
      setError('Failed to save changes');
    }
  };
  
  useEffect(() => {
    if (userData && originalData) {
      const weightChanged = userData.weight_in_kg !== originalData.weight_in_kg;
      const heightChanged = userData.height_in_cm !== originalData.height_in_cm;
      const passwordChanged = userData.password !== originalData.password || passwordInput === "";
      setHasChanges(weightChanged || heightChanged || passwordChanged);
    }
  }, [userData, originalData]);

  const handleCancel = () => {
    if (originalData) {
      setPasswordInput(PASSWORD_DEFAULT);
      setUserData(originalData); // Revert all values to original
    }
  };

  const getUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(BASE_URL + '/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data: UserData = {
        ...response.data,
        password: "",
        user_type: "user"
      }
      setUserData(data);
      setOriginalData(data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, [token]);

  return (
    <Box>
      <Stack gap={6} align="stretch">
        <Heading>Settings</Heading>

        {loading && <Text>Loading...</Text>}
        {error && (
          <Box p={4} bg="red.100" borderRadius="md">
            <Text color="red.600">{error}</Text>
          </Box>
        )}

        {userData && (
          <Stack gap={4}>
            <Box>
              <Text mb={2} fontWeight="medium">Name</Text>
              <Input
                value={userData.name}
                readOnly
                bg="gray.100"
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium">Surname</Text>
              <Input
                value={userData.surname}
                readOnly
                bg="gray.100"
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium">Email</Text>
              <Input
                value={userData.email}
                readOnly
                bg="gray.100"
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium">Password</Text>
                <Flex>
                  <PasswordInput
                    defaultVisible
                    value={passwordInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPasswordInput(value);
                      setPasswordError('');
                      if (!value.trim()) {
                        setPasswordError('Password cannot be empty');
                      }
                      setUserData({ ...userData, password: value });
                    }}
                    onFocus={() => {
                      setPasswordInput('');
                    }}
                    onBlur={() => {
                      if (!passwordInput.trim()) {
                        setPasswordInput(PASSWORD_DEFAULT)
                      }
                    }}
                    pr="4.5rem"
                    isInvalid={!!passwordError} />
                </Flex>
                {passwordError && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {passwordError}
                  </Text>
                )}
            </Box>

            {userData.user_type === 'user' && (
              <>
                <Box>
                  <Text mb={2} fontWeight="medium">Weight (kg)</Text>
                  <Input
                    type="number"
                    value={userData.weight_in_kg}
                    onChange={(e) => setUserData({
                      ...userData,
                      weight_in_kg: Number(e.target.value)
                    })}
                  />
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">Height (cm)</Text>
                  <Input
                    type="number"
                    value={userData.height_in_cm}
                    onChange={(e) => setUserData({
                      ...userData,
                      height_in_cm: Number(e.target.value)

                    })}
                  />
                </Box>
              </>
            )}

            {hasChanges && (
              <HStack gap={4} justify="flex-end" pt={4}>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleSave}>
                  Save Changes
                </Button>
              </HStack>
            )}
          </Stack>
        )}
      </Stack>
      <DialogRoot open={showPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Password Change</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <Text mb={2}>Please enter your current password to confirm changes</Text>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            {passwordError && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {passwordError}
              </Text>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handlePasswordConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default UserSettings;