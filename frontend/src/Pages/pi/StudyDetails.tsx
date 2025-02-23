import {
  Badge,
  Box,
  Container,
  Heading,
  HStack,
  Stack,
  Text
} from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import StudyDetailsBar from '../../components/StudyDetailsBar';
import { User } from '../../icons';
import { useAuth } from '../../provider/authProvider';
import { BASE_URL } from '../../router/apiClient';
interface Participant {
  participant_num: number;
  start_date: string;
  end_date: string;
  status: 'ongoing' | 'completed';
  signed_informed_consent: string;
  last_updated: number;
}

/**
 * @returns Page comtaining participants of a given study for a PI.
 */
const StudyDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { study } = location.state;

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(
          BASE_URL + `/pi/studies/${study.id}/participants`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setParticipants(response.data.participants);
      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (study) {
      fetchParticipants();
    }
  }, [study, token]);

  const handleParticipantClick = (e: React.MouseEvent, participant: Participant) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate("participant", {
      state: {
        study,
        participant
      }
    });
  };

  if (!study) {
    return <div>Loading...</div>;
  }

  const hasParticipants = participants.length > 0;

  return (
    <div>
      <Box hideBelow="lg">
        <StudyDetailsBar study={study} />
      </Box>
      <Container pr={{ lg: "450px" }}>
        <BackButton />
        <Stack mt="1em" gap={6}>
          <Heading>Study Participants</Heading>

          {loading ? (
            <Text>Loading participants...</Text>
          ) : (
            (!hasParticipants
              ? <Text>There are no participants yet.</Text>
              : (
                <Stack gap={3}>
                  {participants.map((participant) => (
                    <Box
                      key={participant.participant_num}
                      p={4}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{
                        bg: "gray.50",
                        cursor: "pointer",
                        borderColor: "blue.500"
                      }}
                      onClick={(e) => handleParticipantClick(e, participant)}
                    >
                      <HStack justify="space-between">
                        <HStack>
                          <User />
                          <Box>
                            <Text fontWeight="medium">
                              Participant {participant.participant_num}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Latest Data Received: {
                                participant.last_updated === 0
                                  ? "No data received"
                                  : new Date(participant.last_updated * 1000).toLocaleDateString()
                              }
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Joined: {new Date(participant.start_date).toLocaleDateString()}
                            </Text>
                          </Box>
                        </HStack>
                        <Badge
                          colorScheme={participant.status === 'ongoing' ? 'green' : 'blue'}
                        >
                          {participant.status}
                        </Badge>
                      </HStack>
                    </Box>
                  ))}
                </Stack>
              )
            )
          )}
        </Stack>
      </Container>
    </div>
  );
};

export default StudyDetails;