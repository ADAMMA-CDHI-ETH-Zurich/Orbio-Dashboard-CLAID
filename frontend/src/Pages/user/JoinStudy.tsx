import { Box, Group, Heading, IconButton, Input, Stack, Text } from "@chakra-ui/react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Duration } from "luxon";
import { useState } from "react";
import { useForm } from "react-hook-form";
import JoinStudyInfo from "../../components/JoinStudyInfo";
import { Field } from "../../components/ui/field";
import { Toaster, toaster } from "../../components/ui/toaster";
import { Search } from "../../icons";
import { useAuth } from "../../provider/authProvider";
import { BASE_URL } from '../../router/apiClient';
import { StudyData } from "../../types/StudyTypes";
// type StudyData = {
//   id: string,
//   code: string,  // shorter identifier for lookup purposes
//   name: string,
//   description: string,
//   organizerName: string,
//   endDate: Date,
//   startDate: Date,
//   status: "ongoing" | "completed" | "not_started" | "undefined",
//   duration: Duration,
//   inclusionCriteria: string,  // markdown
//   informedConsent: string,  // markdown
//   metrics: Array<{
//     id: string,
//     name: string,
//   }>,
// }

/**
 * 
 * @returns Page with option to enter a study code. Valid study code (i.e., study code to ongoing study) will display study information
 * with button to join study. Ongoing/planned studies and invalid study codes will display appropriate text.
 */
const JoinStudy = () => {
  const { token } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<{code: string}>();
  const [study, setStudy] = useState<StudyData | null>(null);
  
  async function onSubmit(data: {code: string}) {
    const { code } = data;
    
    axios.get(BASE_URL + `/studies/${code}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res: AxiosResponse) => {
        clearErrors("code"); // Clear errors if valid
        const data = res.data;

        switch (data.status) {
          case "completed": {
            setError("code", { type: "manual", message: "You can no longer register for this study" });
            return;
          }
          case "not_started": {
            setError("code", { type: "manual", message: `You can register for this study on ${new Date(data.start_date)}` });
            return;
          }
          case "undefined": {
            setError("code", { type: "manual", message: "Error retrieving study information" });
            return;
          }
        }

        setStudy({
          id: data.id,
          code: data.code,
          name: data.name,
          description: data.description,
          organizerName: data.organizer_name,
          startDate: new Date(data.start_date),
          endDate: new Date(data.end_date),
          status: data.status,
          duration: Duration.fromISO(data.duration),
          inclusionCriteria: data.inclusion_criteria,
          informedConsent: data.informed_consent,
          metrics: data.metrics,
        });
      })
      .catch((err: AxiosError) => {
        setError("code", { type: "manual", message: "Invalid study code" });
      });
  }

  function joinedStudy(name: string) {
    setStudy(null);

    toaster.create({
      title: "Joined '" + name + "'!",
      type: "success",
      duration: 6000,
    });
  }  
  
  return (
    <Box>
      <Toaster />
      <form onSubmit={handleSubmit(onSubmit)}>
          <Heading mb="1em">Join a Study</Heading>
            <Stack gap="1em">
              <Text>
                Ask a study coordinator to give you the code 
                that is generated when creating 
                a new study with Orbio.
              </Text>
              <Field
                invalid={!!errors.code}
                errorText={errors.code?.message}
                label="Study Code">
                <Group attached w="100%">
                  <Input placeholder="Enter the study code..." {...register("code", { required: "Code is required" })} />
                  <IconButton aria-label="Search for study" variant="surface" type="submit">
                    <Search />
                  </IconButton>
                </Group>
              </Field>
              {study ? <JoinStudyInfo study={study} joinedStudy={joinedStudy} /> : null }
            </Stack>
        </form>
    </Box>
  );
}

export default JoinStudy;