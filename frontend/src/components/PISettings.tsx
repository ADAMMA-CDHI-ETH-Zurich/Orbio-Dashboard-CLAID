import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../provider/authProvider';

import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle
} from './ui/dialog';

import { BASE_URL } from '../router/apiClient';
import { PasswordInput } from './ui/password-input';
import { Toaster, toaster } from "./ui/toaster";

interface PIData {
  name: string;
  surname: string;
  email: string;
  user_type: string;
  password: string;
}

const PASSWORD_DEFAULT = "••••••••";

/**
 * 
 * @returns PI settings (name, email, etc.)
 */
const PISettings = () => {
  const [originalData, setOriginalData] = useState<PIData | null>(null);
  const { token } = useAuth();
  const [userData, setUserData] = useState<PIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordInput, setPasswordInput] = useState(PASSWORD_DEFAULT);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  // const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    if (!passwordInput || passwordInput.trim() === '') {
      setPasswordError('Password cannot be empty');
      return;
    }
    
    if (userData?.password !== originalData?.password) {
      setShowPasswordDialog(true);
    } else {
      saveChanges();
    }
  };

  const handlePasswordConfirm = () => {
    if (!passwordInput || passwordInput.trim() === '') {
      setPasswordError('New password cannot be empty');
      return;
    }
    
    if (!oldPassword) {
      setOldPasswordError('Please enter your current password');
      return;
    }
    
    saveChanges();
  };

  const getChangedValues = () => {
    if (!userData || !originalData) return null;

    if (userData.password !== originalData.password) {
      return {
        new_password: userData.password,
        old_password: oldPassword
      };
    }

    return null;
  };

  const saveChanges = async () => {
    const changedValues = getChangedValues();
    if (!changedValues) return;

    if (changedValues.new_password.trim() === '') {
      setPasswordError('Password cannot be empty');
      return;
    }

    try {
      await axios.put(BASE_URL + '/pi/me', changedValues, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setOriginalData(userData);
      setHasChanges(false);
      setPasswordError('');
      setOldPassword('');
      setShowPasswordDialog(false);
      
      toaster.create({
        title: "Success",
        description: "Password successfully updated",
        type: "success",
      });

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to save changes';
        setOldPasswordError(errorMessage);
      } else {
        setError('Failed to save changes');
      }
    }
  };

  useEffect(() => {
    if (userData && originalData) {
      const passwordChanged = userData.password !== originalData.password || passwordInput === "";
      setHasChanges(passwordChanged);
    }
  }, [userData, originalData, passwordInput]);

  const handleCancel = () => {
    if (originalData) {
      setPasswordInput(PASSWORD_DEFAULT);
      setUserData(originalData);
    }
  };

  useEffect(() => {
    const getPIData = async () => {
      setShowPasswordDialog(false)
      try {
        setLoading(true);
        const response = await axios.get(BASE_URL + '/pi/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data: PIData = {
          ...response.data,
          password: "",
          user_type: "Principal Investigator"
        };
        setUserData(data);
        setOriginalData(data);
        setError('');
      } catch (error) {
        console.error('Failed to fetch PI data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
        
      }
    };
    
    getPIData();
  }, [token]);

  return (
    <Box>
      <Toaster />
      <VStack gap={6} align="stretch">
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
                {/* <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPasswordInput(value);
                    setPasswordError('');
                    if (value !== PASSWORD_DEFAULT) {
                      if (!value.trim()) {
                        setPasswordError('Password cannot be empty');
                      }
                      setUserData({ ...userData, password: value });
                    }
                  }}
                  onBlur={() => {
                    if (!passwordInput.trim()) {
                      setPasswordError('Password cannot be empty');
                    }
                  }}
                  pr="4.5rem"
                  isInvalid={!!passwordError}
                />
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  ml="-45px"
                  variant="ghost"
                  zIndex={1}
                >
                  {showPassword ? <HiEyeOff /> : <HiEye />}
                </IconButton> */}
              </Flex>
              {passwordError && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {passwordError}
                </Text>
              )}
            </Box>

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
      </VStack>

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
            {oldPasswordError && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {oldPasswordError}
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

export default PISettings; 