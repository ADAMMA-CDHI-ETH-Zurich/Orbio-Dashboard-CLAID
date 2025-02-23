import {
  Box,
  Button,
  Input,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../provider/authProvider';
import { BASE_URL } from '../router/apiClient';
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from './ui/dialog';

interface DeleteAccountProps {
  userType: 'pi' | 'user';
}

/**
 * 
 * @param userType `'pi'` or `'user'`, depending on user type
 * @returns Button that deletes account (opens pop-up confirming deletion)
 */
const DeleteAccount = ({ userType }: DeleteAccountProps) => {
  const navigate = useNavigate();
  const { setToken, token } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const getDeleteEndpoint = () => {
    return userType === 'pi' 
      ? BASE_URL + '/pi/me'
      : BASE_URL + '/users/me';
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        getDeleteEndpoint(),
        {
          data: { password },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.status === 204 || response.status === 200) {
        setToken(); // Clear auth token
        navigate('/'); // Redirect to home
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      if (error.response?.status === 401) {
        setError('Incorrect password. Please try again.');
      } else {
        setError('Failed to delete account. Please try again.');
      }
    }
  };

  return (
    <Box>
      <Button
        colorScheme="red"
        onClick={() => setShowDialog(true)}
      >
        Delete Account
      </Button>

      <DialogRoot open={showDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          
          <DialogBody>
            <Text mb={4}>Are you sure you want to delete your account? This action cannot be undone.</Text>
            <Text mb={2}>Please enter your password to confirm:</Text>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {error}
              </Text>
            )}
          </DialogBody>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDialog(false);
                setPassword('');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="red"
              onClick={handleDelete}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default DeleteAccount;