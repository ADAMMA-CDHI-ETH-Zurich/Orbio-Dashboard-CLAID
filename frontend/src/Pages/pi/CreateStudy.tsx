import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import axios from 'axios';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import MetricsList from '../../components/MetricsList';
import { Field } from "../../components/ui/field";
import { Toaster, toaster } from "../../components/ui/toaster";
import { useAuth } from '../../provider/authProvider';
import { BASE_URL } from '../../router/apiClient';
interface StudyFormValues {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  inclusionCriteria: File | null;
  informedConsent: File | null;

  durationDays: number;
  durationHours: number;
  selectedMetrics: string[];
}

/**
 * @returns a page for a PI to enter in the details to create a new study (name, description, .md files, recorded metrics, etc.) and
 * creates new study in backend upon submission
 */
const CreateStudy = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StudyFormValues>({
    defaultValues: {
      durationDays: 0,
      durationHours: 0,
      inclusionCriteria: null,
      informedConsent: null
    }
  });
  // Watch uploaded files
  const inclusionCriteriaFile = watch('inclusionCriteria');
  const informedConsentFile = watch('informedConsent');

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [metricsError, setMetricsError] = useState('');
  const navigate = useNavigate();



  const isMarkdownFile = (file: File): boolean => {
    const validExtensions = ['.md', '.markdown'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return validExtensions.includes(fileExtension);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'inclusionCriteria' | 'informedConsent') => {
    const file = event.target.files?.[0];
    if (!file) {
      setValue(fieldName, null);
      return;
    }

    if (isMarkdownFile(file)) {
      setValue(fieldName, file, {
        shouldValidate: true,
        shouldDirty: true
      });
    } else {
      setValue(fieldName, null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleMetricsChange = (metrics: string[]) => {
    setSelectedMetrics(metrics);
    if (metrics.length > 0) {
      setMetricsError('');
    }
  };

  const convertMarkdownToString = async (markdownFile: File | null): Promise<string> => {
    if (!markdownFile || !(markdownFile instanceof File)) {
      return '';
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result;
          if (typeof content === 'string') {
            resolve(content);
          } else {
            reject(new Error('Failed to read file content as string'));
          }
        } catch (error) {
          reject(new Error(`Error converting markdown to string: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(markdownFile);
    });
  };

  const convertToIsoDuration = (days: number, hours: number): string => {
    // Remove leading zeros and convert to integers
    const d = Math.max(0, parseInt(String(days), 10));
    const h = Math.max(0, parseInt(String(hours), 10));
  
    // Build ISO duration string
    let duration = 'P';
    
    // Add days if present
    if (d > 0) duration += `${d}D`;
    
    // Add hours if present
    if (h > 0) duration += `T${h}H`;
    
    // Return at least PT0H if no duration specified
    return duration === 'P' ? 'PT0H' : duration;
  };

  const formatDateWithTime = (dateStr: string): string => {
    // Add time component (midnight) to date string
    return `${dateStr}T00:00:00`;
  };

  const validateDuration = (days: number, hours: number) => {
    const totalHours = (days * 24) + hours;
    return totalHours >= 1 || "Duration must be at least 1 hour";
  };

  const onSubmit = async (data: StudyFormValues) => {
    // Check for metrics first
    if (selectedMetrics.length === 0) {
      setMetricsError('At least one metric must be selected');
      return;
    }

    // Validate total duration before submitting
    const totalHours = (Number(data.durationDays) * 24) + Number(data.durationHours);
    if (totalHours < 1) {
      return;
    }

    setIsLoading(true);
    const duration = convertToIsoDuration(
      Number(data.durationDays), 
      Number(data.durationHours)
    );
    if (data.inclusionCriteria) {
      const inclusionCriteriaContent = data.inclusionCriteria
        ? await convertMarkdownToString(data.inclusionCriteria)
        : '';
      const informedConsentContent = data.informedConsent
        ? await convertMarkdownToString(data.informedConsent)
        : '';
      const requestData = {
        name: data.name,
        description: data.description,
        start_date: formatDateWithTime(data.startDate),
        end_date: formatDateWithTime(data.endDate),
        duration: duration,
        inclusion_criteria: inclusionCriteriaContent,
        informed_consent: informedConsentContent,
        metrics: selectedMetrics.map(id => id) 
      };
      
      try {
        const response = await axios.post(BASE_URL + '/pi/studies', requestData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const studycode = response.data.code;
        const studyId = response.data.id;
        await copyToClipboard(studycode);

        toaster.create({
          title: "Study Created Successfully",
          description: `Study code (${studycode}) copied to clipboard. Navigating to new study...`,
          type: "success",
        });
        //I want there to be a short delay before the navigation
        setTimeout(() => {
          navigate(`/pi/${studyId}`, { state: { study: response.data } });
        }, 1500);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 422) {
          console.error('Validation error:', error.response.data);
          toaster.create({
            title: "Validation Error",
            description: "Please check all required fields and formats",
            type: "error",
          });
        } 
        toaster.create({
          title: "Error Creating Study",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box>
      <Toaster />
      <Heading mb="1em">Create a New Study</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={6}>
          <Field
            label="Study Name"
            required
            invalid={!!errors.name}
            errorText={errors.name?.message}
          >
            <Input
              {...register("name", { required: "Study name is required" })}
            />
          </Field>

          <Field
            label="Description"
            required
            invalid={!!errors.description}
            errorText={errors.description?.message}
          >
            <Textarea
              {...register("description", { required: "Description is required" })}
            />
          </Field>

          <Box>
            <Text fontWeight="medium" mb={2}>Registration Window</Text>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Define the period during which participants can join the study
            </Text>
            <Stack gap={4}>
              <Field
                label="Start Registration Date"
                required
                invalid={!!errors.startDate}
                errorText={errors.startDate?.message}
              >
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register("startDate", { required: "Start date is required" })}
                />
              </Field>

              <Field
                label="End Registration Date"
                required
                invalid={!!errors.endDate}
                errorText={errors.endDate?.message}
              >
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register("endDate", {
                    required: "End date is required",
                    validate: (value) => {
                      const startDate = watch("startDate");
                      return new Date(value) > new Date(startDate) || "End date must be after start date";
                    }
                  })}
                />
              </Field>
            </Stack>
          </Box>

          <Box>
            <Text fontWeight="medium" mb={2}>Study Documents</Text>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Upload markdown files (.md) containing study information
            </Text>
            
            <Stack gap={4}>
              <Box
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={errors.inclusionCriteria ? "red.300" : "gray.200"}
                _hover={{ borderColor: "blue.500" }}
              >
                <Text fontWeight="medium" mb={2}>Inclusion Criteria <Text as="span" color="red.500">*</Text></Text>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  Document describing who can participate in the study
                </Text>
                <Input
                  required
                  type="file"
                  accept=".md,.markdown"
                  onChange={(e) => handleFileUpload(e, 'inclusionCriteria')}
                  sx={{
                    '::file-selector-button': {
                      border: 'none',
                      outline: 'none',
                      mr: 2,
                      py: '2px',
                      px: 3,
                      bg: 'blue.50',
                      color: 'blue.600',
                      borderRadius: 'md',
                      fontWeight: 'medium',
                      cursor: 'pointer',
                      _hover: { bg: 'blue.100' }
                    }
                  }}
                />
                {inclusionCriteriaFile && (
                  <Text fontSize="sm" color="green.600" mt={2}>
                    ✓ {inclusionCriteriaFile.name}
                  </Text>
                )}
                {errors.inclusionCriteria && (
                  <Text color="red.500" fontSize="sm" mt={2}>
                    {errors.inclusionCriteria.message}
                  </Text>
                )}
              </Box>

              <Box
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={errors.informedConsent ? "red.300" : "gray.200"}
                _hover={{ borderColor: "blue.500" }}
              >
                <Text fontWeight="medium" mb={2}>Informed Consent <Text as="span" color="red.500">*</Text></Text>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  Document that participants must agree to before joining
                </Text>
                <Input
                  required
                  type="file"
                  accept=".md,.markdown"
                  onChange={(e) => handleFileUpload(e, 'informedConsent')}
                  sx={{
                    '::file-selector-button': {
                      border: 'none',
                      outline: 'none',
                      mr: 2,
                      py: '2px',
                      px: 3,
                      bg: 'blue.50',
                      color: 'blue.600',
                      borderRadius: 'md',
                      fontWeight: 'medium',
                      cursor: 'pointer',
                      _hover: { bg: 'blue.100' }
                    }
                  }}
                />
                {informedConsentFile && (
                  <Text fontSize="sm" color="green.600" mt={2}>
                    ✓ {informedConsentFile.name}
                  </Text>
                )}
                {errors.informedConsent && (
                  <Text color="red.500" fontSize="sm" mt={2}>
                    {errors.informedConsent.message}
                  </Text>
                )}
              </Box>
            </Stack>
          </Box>

          <Box>
            <Text fontWeight="medium" mb={2}>Data Collection Duration</Text>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Specify how long data will be collected from each participant after they join (minimum 1 hour)
            </Text>
            <Field
              label={<>Study Duration <Text as="span" color="red.500">*</Text></>}
              invalid={!!errors.durationDays || !!errors.durationHours}
            >
              <Stack direction="row" gap={4}>
                <Box>
                  <Text mb={2} fontSize="sm">Days</Text>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    {...register("durationDays", {
                      required: "Duration is required",
                      min: { value: 0, message: "Cannot be negative" },
                      validate: {
                        minDuration: (value) => {
                          const hours = watch("durationHours") || 0;
                          return validateDuration(Number(value), Number(hours));
                        }
                      }
                    })}
                  />
                </Box>

                <Box>
                  <Text mb={2} fontSize="sm">Hours</Text>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    {...register("durationHours", {
                      required: "Duration is required",
                      min: { value: 0, message: "Cannot be negative" },
                      max: { value: 23, message: "Must be less than 24" },
                      validate: {
                        minDuration: (value) => {
                          const days = watch("durationDays") || 0;
                          return validateDuration(Number(days), Number(value));
                        }
                      }
                    })}
                  />
                </Box>
              </Stack>
              {(errors.durationDays || errors.durationHours) && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.durationDays?.message || errors.durationHours?.message || "Please enter valid duration"}
                </Text>
              )}
            </Field>
          </Box>

          <Field
            label={
              <>
                Study Metrics<Text as="span" color="red.500"></Text>
              </>
            }
            invalid={!!metricsError}
            errorText={metricsError}
            required
          >
            <MetricsList onMetricsChange={handleMetricsChange} />
          </Field>

          <Button
            type="submit"
            colorPalette="blue"
            isLoading={isLoading}
            loadingText="Creating Study..."
          >
            Create Study
          </Button>
        </Stack>
      </form>
    </Box>
  );
};



export default CreateStudy;