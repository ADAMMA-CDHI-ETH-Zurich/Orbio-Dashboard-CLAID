import { useState } from 'react';
// UI Components
import { Box, Button, Fieldset, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { Alert } from './ui/alert';
import { Field } from "./ui/field";
import { NativeSelectField, NativeSelectRoot } from "./ui/native-select";
import { PasswordInput } from "./ui/password-input";
// Hooks and Routing
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { BASE_URL } from '../router/apiClient';

interface FormValues {
  name: string;
  email: string;
  surname: string;
  password: string;
  user_type: string;
  birth_date?: Date;
  weight_in_kg?: number;
  height_in_cm?: number;
  confirmPassword: string;
}

interface SignUpResponse {
  access_token: string;
}

/**
 * SignUp component handles the user registration process.
 * 
 * This component uses the `useForm` hook from `react-hook-form` to manage form state and validation.
 * It also utilizes `useAuth` for authentication context and `useNavigate` for navigation.
 * 
 * @component
 * 
 * @returns {JSX.Element} The rendered SignUp component.
 * 
 * @example
 * <SignUp />
 * 
 * @remarks
 * - The form includes fields for name, surname, email, password, confirm password, and user type.
 * - Depending on the selected user type, additional fields for height, weight, and birthdate are displayed.
 * - On form submission, the data is sent to the backend for registration.
 * - If the registration is successful, the user is redirected based on their user type.
 * - If the registration fails, appropriate error messages are displayed.
 * 
 * @function
 * @name SignUp
 * 
 * @hook
 * @name useForm
 * @description Manages form state and validation.
 * 
 * @hook
 * @name useAuth
 * @description Provides authentication context.
 * 
 * @hook
 * @name useNavigate
 * @description Provides navigation functionality.
 * 
 * @typedef {Object} FormValues
 * @property {string} name - The user's name.
 * @property {string} surname - The user's surname.
 * @property {string} email - The user's email address.
 * @property {string} password - The user's password.
 * @property {string} confirmPassword - The user's password confirmation.
 * @property {string} user_type - The type of user (User, Principal Investigator).
 * @property {number} [height_in_cm] - The user's height in centimeters (required for users).
 * @property {number} [weight_in_kg] - The user's weight in kilograms (required for users).
 * @property {Date} [birth_date] - The user's birthdate (required for users).
 * 
 * @typedef {Object} SignUpResponse
 * @property {string} access_token - The access token received upon successful registration.
 */
const SignUp = () => {

  const { setToken, setUserId, setName } = useAuth();
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState('');
  const [loading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>();

  const user_type = watch("user_type");
  const password = watch("password");

  const handleUserRedirect = (userType: string) => {
    switch (userType) {
      case "User":
        navigate('/config');
        break;
      case "Principal Investigator":
        navigate('/pi/about');
        break;
      default:
        throw new Error('Invalid user type');
    }
  };

const handleUserNameForAPI = (user_type) => {
  switch(user_type) {
    case "User":
      return "user";
    case "Principal Investigator":
      return "principal_investigator";
    default:
      console.error('Invalid user type');
  }
};

  const onSubmit = handleSubmit(async (data: FormValues) => {
    setIsLoading(true);
    setEmailError('');

    const { confirmPassword, user_type, birth_date, ...requestData } = data;
    const formattedData = {
      ...requestData,

      birth_date: birth_date&& user_type==="User" ? new Date(birth_date).toISOString().slice(0, 10) : undefined //reformat date
    };
    data.email = data.email.toLowerCase();

    try {
      let response;
      if (user_type === "Principal Investigator") {
        const piData = {
          email: data.email,
          name: data.name,
          surname: data.surname,
          password: data.password
        };
        response = await axios.post<SignUpResponse>(
          BASE_URL + '/auth/signup/principal_investigator',
          piData
        );
      } else {
        response = await axios.post<SignUpResponse>(
          BASE_URL + '/auth/signup/user',
          formattedData
        );
      }
      setName(data.name);
      setUserId(handleUserNameForAPI(data.user_type));
      setToken(response.data.access_token);
      handleUserRedirect(data.user_type);

    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          setEmailError('This email is already registered');
        } else {
          setEmailError('Registration failed. Please try again.');
        }
        console.error('Signup error:', error.response?.data);
      }
    } finally {
      setIsLoading(false);
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
          {emailError && (
            <Alert status="error" maxW="md" title={emailError} />
          )}
  
          <Fieldset.Root size="lg" maxW="md">
            <Stack>
              <Fieldset.Legend>Contact details</Fieldset.Legend>
              <Fieldset.HelperText>
                Please provide your contact details below.
              </Fieldset.HelperText>
            </Stack>
  
            <Fieldset.Content>
              <Field
                label="Name"
                invalid={!!errors.name}
                errorText={errors.name?.message}
              >
                <Input {...register("name", { required: "Name is required" })} />
              </Field>
  
              <Field
                label="Surname"
                invalid={!!errors.surname}
                errorText={errors.surname?.message}
              >
                <Input {...register("surname", { required: "Surname is required" })} />
              </Field>
  
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
                <PasswordInput {...register("password", { required: "Password is required" })} />
              </Field>
  
              <Field
                label="Confirm Password"
                invalid={!!errors.confirmPassword}
                errorText={errors.confirmPassword?.message}
              >
                <PasswordInput
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "Passwords do not match"
                  })}
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
  
              {user_type === "User" && (
                <>
                  <Field
                    label="Height (cm)"
                    invalid={!!errors.height_in_cm}
                    errorText={errors.height_in_cm?.message}
                  >
                    <Input
                      {...register("height_in_cm", { required: "Height is required for users", 
                        validate: (value) => value && value > 0 || "Height must be greater than 0"
                      })}
                      type="number"
                    />
                  </Field>
  
                  <Field
                    label="Weight (kg)"
                    invalid={!!errors.weight_in_kg}
                    errorText={errors.weight_in_kg?.message}
                  >
                    <Input
                      {...register("weight_in_kg", { required: "Weight is required for users", 
                        validate : (value) => value && value > 0 || "Weight must be greater than 0"
                      })}
                      type="number"
                    />
                  </Field>
  
                  <Field
                    label="Birthdate"
                    invalid={!!errors.birth_date}
                    errorText={errors.birth_date?.message}
                  >
                    <Input
                      {...register("birth_date", {
                        required: "Birthdate is required for users",
                        valueAsDate: true,
                        validate: (value) => {
                          const today = new Date();
                          return value && value <= today || "Birthdate cannot be in the future";
                        }
                      })}
                      type="date"
                    />
                  </Field>
                </>
              )}
            </Fieldset.Content>
  
            <Stack>
              <Button type="submit" alignSelf="flex-start">
                Submit
              </Button>
              <HStack gap={2} pt={4}>
                <Text>Already have an account?</Text>
                <Button 
                  variant="link"
                  color="blue.500"
                  onClick={() => navigate('/')}
                >
                  Log in
                </Button>
              </HStack>
            </Stack>
          </Fieldset.Root>
        </form>
      </Box>

  );
}
export default SignUp;