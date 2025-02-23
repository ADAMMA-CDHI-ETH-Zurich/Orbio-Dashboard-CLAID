import {
  Box, Button,
  Fieldset, HStack, Input,
  Stack, Text
} from '@chakra-ui/react';
import axios from "axios";
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { BASE_URL } from '../router/apiClient';
import { Alert } from './ui/alert';
import { Field } from "./ui/field";
import {
  NativeSelectField,
  NativeSelectRoot
} from "./ui/native-select";
import { PasswordInput } from "./ui/password-input";

interface FormValues {
  email: string;
  password: string;
  user_type: string;
}

/**
 * Login component that handles user authentication and password reset functionality.
 * 
 * @component
 * 
 * @returns {JSX.Element} The rendered component.
 * 
 * @description
 * This component provides a form for users to log in with their email, password, and user type.
 * It also includes functionality for resetting the password via email.
 * 
 * @hook
 * - `useAuth` - Provides authentication context including `setToken` and `setUserId`.
 * - `useNavigate` - Provides navigation functionality.
 * - `useState` - Manages local state for email, errors, loading states, etc.
 * - `useForm` - Manages form state and validation.
 * 
 * @function
 * - `validateEmail` - Validates the email format.
 * - `handleEmailChange` - Handles changes to the email input field.
 * - `handleResetPassword` - Sends a password reset email.
 * - `onSubmit` - Handles form submission for login.
 * 
 * @state
 * - `resetEmail` - Stores the email for password reset.
 * - `emailError` - Stores the error message for email validation.
 * - `isResetting` - Indicates if the password reset process is ongoing.
 * - `resetError` - Stores the error message for password reset.
 * - `loading` - Indicates if the login process is ongoing.
 * - `error` - Stores the error message for login.
 * 
 * @dependencies
 * - `axios` - For making HTTP requests.
 * - `react` - For managing component state and lifecycle.
 * - `react-hook-form` - For managing form state and validation.
 * - `chakra-ui` - For UI components and styling.
 * 
 * @remarks
 * The component uses Chakra UI for styling and layout. It includes a form with fields for email, password, and user type.
 * It also includes a password reset dialog that can be opened by clicking the "Forgot Password?" button.
 */
const Login = () => {
  const { setToken, setUserId, setName } = useAuth();
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>();

  // const validateEmail = useCallback((email: string) => {
  //   const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  //   return emailRegex.test(email);
  // }, []);


const handleUserNameForAPI = (user_type: string) => {
  switch(user_type) {
    case "User":
      return "user";
    case "Principal Investigator":
      return "principal_investigator";
    default:
      console.error('Invalid user type');
  }
};

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setError('');
    let retData;
    let access_token;
    data.user_type = handleUserNameForAPI(data.user_type);
    
    try {

      data.email = data.email.toLowerCase();
      
      retData = await axios.post(BASE_URL + '/auth/login', data);
      access_token = retData.data.access_token;
      setToken(access_token);
      setUserId(data.user_type);

      setName(retData.data.data.name);

      switch(data.user_type) {
        case "user":
          navigate('/user');
          break;
        case "principal_investigator":
          navigate('/create-study');
          break;
        default:
          console.error('Invalid user type');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }

    if (!retData?.data) {
      setError('Invalid email, password or user type');
      return;
    }


  });

  return (

        <Box 
          bg="white"
          p={8}
          borderRadius="xl"
          boxShadow="lg"
          w="full"
          maxW="md"
        >
          <form onSubmit={onSubmit}>
            {error && (
              <Alert status="error" maxW="md" title={error} />
            )}

            <Fieldset.Root size="lg" maxW="md">
              <Stack>
                <Fieldset.Legend>Login</Fieldset.Legend>
              </Stack>

              <Fieldset.Content>
                <Field 
                  label="Email address"
                  invalid={!!errors.email}
                  errorText={errors.email?.message}
                >
                  <Input 
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                </Field>

                <Field
                  label="Password"
                  invalid={!!errors.password}
                  errorText={errors.password?.message}
                >
                  <PasswordInput
                    {...register("password", { required: "Password is required" })}
                  />
                </Field>

                <Field label="User">
                  <NativeSelectRoot>
                    <NativeSelectField
                      {...register("user_type", {
                        required: "User type is required",
                        validate: (value) => value !== "Choose your role..." || "Please select a role"
                      })}
                      items={[
                        "Choose your role...",
                        "User",
                        "Principal Investigator"
                      ]}
                    />
                  </NativeSelectRoot>
                  {errors.user_type && <span>{errors.user_type.message}</span>}
                </Field>
              </Fieldset.Content>
              <Stack>
              <HStack gap={4}>
                <Button
                  type="submit"
                  alignSelf="flex-start"
                  loading={loading}
                  loadingText="Logging in..."
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

              </HStack>

              <HStack gap={2} pt={4}>
                <Text>Don't have an account?</Text>
                <Button
                  variant="link"
                  color="blue.500"
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </Button>
              </HStack>
            </Stack>
            </Fieldset.Root>
          </form>

        </Box>

  );
};

export default Login;