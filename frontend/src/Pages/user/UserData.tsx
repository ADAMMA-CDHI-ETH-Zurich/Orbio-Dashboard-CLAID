import { Box, Flex, Heading } from '@chakra-ui/react';
import DataCard from "../../components/dataCard";
import { BASE_URL } from '../../router/apiClient';

const API_CALLS = [
  {
    graph: BASE_URL + "/heartrate/graph",
    download: BASE_URL + "/heartrate/download",
    name: "Heart Rate",
  },
  {
    graph: BASE_URL + "/acceleration/xyz",
    download: BASE_URL + "/acceleration/download",
    name: "Acceleration in XYZ Axes",
  },
  {
    graph: BASE_URL + "/acceleration/vector",
    download: BASE_URL + "/acceleration/download",
    name: "Acceleration Vector Magnitude",
  }
];

/**
 * @returns Page displaying user's data in graph form
 * */
const UserData = () => {
  // Return list of cards each displaying title,
  // button to switch 
  return (
    <Box>
      <Heading mb="1em">My Data</Heading>
      <Flex gap="2em" wrap="wrap">
        {API_CALLS.map((apiCall, idx) => 
          <Box key={idx}>
            <DataCard name={apiCall.name} apiCall={apiCall.graph} downloadApiCall={apiCall.download} endTime={Math.floor(Date.now() / 1000)} /* endTime= 1734631623*//>
          </Box>)}
      </Flex>
    </Box>
  );
};
export default UserData;