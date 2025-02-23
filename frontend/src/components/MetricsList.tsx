import { Box, Button, Spinner, Stack, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../provider/authProvider';
import { BASE_URL } from '../router/apiClient';
interface Metric {
  id: string;
  name: string;
}

interface MetricsListProps {
  onMetricsChange: (selectedMetrics: string[]) => void;
}

/**
 * 
 * @param onMetricsChange Function that takes in array of metric ids (strings). Called whenever selected list of metrics changes and is passed the list of active metrics.
 * @returns List of buttons representing metrics that PIs can record in their studies
 */
const MetricsList = ({ onMetricsChange }: MetricsListProps) => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(BASE_URL + '/metrics/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setMetrics(response.data.metrics);
      } catch (error) {
        setError('Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [token]);

  const toggleMetric = (metricId: string) => {
    const newSelection = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    
    setSelectedMetrics(newSelection);
    onMetricsChange(newSelection);
  };

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box>
      <Stack gap={2}>
        {metrics.map((metric) => (
          <Button
            key={metric.id}
            onClick={() => toggleMetric(metric.id)}
            variant={selectedMetrics.includes(metric.id) ? "solid" : "outline"}
            colorScheme="blue"
            size="sm"
            width="full"
          >
            {metric.name}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default MetricsList;