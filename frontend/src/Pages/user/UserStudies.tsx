import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Icon,
  Spinner,
  Stack,
  Tabs,
  Text
} from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserStudyCard from '../../components/UserStudyCard';
import { Plus } from '../../icons';
import { useAuth } from '../../provider/authProvider';
import { BASE_URL } from '../../router/apiClient';
import { StudyOverview } from '../../types/StudyTypes';
// export type StudyOverview = {
//   id: string,
//   name: string,
//   description: string,
//   endDate: Date,
//   startDate: Date,
//   status: "ongoing" | "completed" | "not_started" | "undefined",
// }

/**
 * @returns Page that displays a list of the users' ongoing and completed studies, with options to leave studies and see more information about them.
 */
const UserStudies = () => {
  const [curStudies, setCurStudies] = useState<StudyOverview[]>([]);
  const [doneStudies, setDoneStudies] = useState<StudyOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const response = await axios.get(BASE_URL + "/user/studies", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setError('');
        const studyData = response.data.studies;
        const ongoingStudies = studyData.filter((data: any) => data.status === "ongoing");
        const completedStudies = studyData.filter((data: any) => data.status === "completed");
        if (ongoingStudies.length === 0) {
          setCurStudies([]);
        } else {
          setCurStudies(ongoingStudies.map((data: any) => ({
            id: data.study_id,
            name: data.study_name,
            description: data.description,
            endDate: new Date(data.end_date),
            startDate: new Date(data.start_date),
            status: data.status,
          })));
        }

        if (completedStudies.length === 0) {
          setDoneStudies([]);
        } else {
          setDoneStudies(completedStudies.map((data: any) => ({
            id: data.study_id,
            name: data.study_name,
            description: data.description,
            endDate: new Date(data.end_date),
            startDate: new Date(data.start_date),
            status: data.status,
          })));
        }
      } catch (error) {
        setError('Failed to fetch studies');
        console.error('Error fetching studies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, [token]);

  if (loading) {
    return <Center><Spinner size="xl" /></Center>;
  }

  if (error) {
    return <Center><Text color="red.500">{error}</Text></Center>;
  }

  return (
    <Box>
      <Flex alignItems="center" justifyContent="space-between">
        <Heading>Studies</Heading>
        {/* Button to join a new study */}
        <Button onClick={() => navigate("join")}>
          <Icon>
            <Plus />
          </Icon>
          Join Study
        </Button>
      </Flex>
      {/* List of studies, if any */}
      <Tabs.Root fitted mt="1em" defaultValue="ongoingStudies" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value='ongoingStudies'>Ongoing</Tabs.Trigger>
          <Tabs.Trigger value='completedStudies'>Completed</Tabs.Trigger>
        </Tabs.List>
          
          <Tabs.Content value='ongoingStudies'>
            <Stack gap="1em">
              {curStudies.length ? 
              (curStudies
                .map((study: StudyOverview) => (
                  <UserStudyCard study={study} />
                )))
              : <Text>There are no ongoing studies.</Text> }
            </Stack>
          </Tabs.Content>
          
          <Tabs.Content value='completedStudies'>
            <Stack gap="1em">
              {doneStudies.length ? 
              (doneStudies
                .map((study: StudyOverview) => (
                  <UserStudyCard study={study} />
                )))
              : <Text>There are no completed studies.</Text> }
            </Stack>
          </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

export default UserStudies;