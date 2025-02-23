
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Tabs,
  Text
} from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import StudyCard from '../../components/StudyCard';
import { useAuth } from '../../provider/authProvider';
import { BASE_URL } from '../../router/apiClient';
interface Study {
  id: string;
  name: string;
  num_participants: number;
  status: 'completed' | 'ongoing' | 'not_started';
  description: string;
  start_date: string;
  end_date: string;
  inclusion_criteria: string | null;
  informed_consent: string | null;
  duration: string;
  code: string;
}

/**
 * @returns Page containing a PI's ongoing, completed, and planned studies
 */
const Studies = () => {
  const { token } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const response = await axios.get(BASE_URL + '/pi/studies', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setStudies(response.data.studies);
        //setStudies(response.data);
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
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  return (
    <Box>
      <Heading mb="1em">Studies</Heading>
      <Tabs.Root variant="enclosed" defaultValue="ongoingStudies" fitted mt="1em">
        <Tabs.List>
          <Tabs.Trigger value='ongoingStudies'>Ongoing</Tabs.Trigger>
          <Tabs.Trigger value='completedStudies'>Done</Tabs.Trigger>
          <Tabs.Trigger value='plannedStudies'>Planned</Tabs.Trigger>
          <Tabs.Trigger hideBelow="md" value='allStudies'>All</Tabs.Trigger>
        </Tabs.List>

          <Tabs.Content value='allStudies'>
          <Flex gap="2em" wrap="wrap">
              {studies.map(study => (
                <StudyCard key={study.id} study={study} isOpen={expandedIds.has(study.id)} onToggle={() => handleToggle(study.id)}/>
              ))}
            </Flex>
          </Tabs.Content>
          
          <Tabs.Content value='ongoingStudies'>
          <Flex gap="2em" wrap="wrap">
              {studies
                .filter(study => study.status === 'ongoing')
                .map(study => (
                  <StudyCard key={study.id} study={study} isOpen={expandedIds.has(study.id)} onToggle={() => handleToggle(study.id)}/>
                ))}
            </Flex>
          </Tabs.Content>
          
          <Tabs.Content value='completedStudies'>
          <Flex gap="2em" wrap="wrap">
              {studies
                .filter(study => study.status === 'completed')
                .map(study => (
                <StudyCard key={study.id} study={study} isOpen={expandedIds.has(study.id)} onToggle={() => handleToggle(study.id)}/>
                ))}
            </Flex>
          </Tabs.Content>
          <Tabs.Content value='plannedStudies'>
          <Flex gap="2em" wrap="wrap">
              {studies
                .filter(study => study.status === 'not_started')
                .map(study => (
                <StudyCard key={study.id} study={study} isOpen={expandedIds.has(study.id)} onToggle={() => handleToggle(study.id)}/>
                ))}
            </Flex>
          </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

export default Studies;