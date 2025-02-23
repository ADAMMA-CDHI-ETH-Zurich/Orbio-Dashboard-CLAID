import { Box, Button, Flex, For, Grid, GridItem, Heading, Icon, List, Spinner, Stack, Text } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { MdEdit, MdPending } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Toaster, toaster } from "../../components/ui/toaster";
import { useAuth } from '../../provider/authProvider';
import { BASE_URL } from '../../router/apiClient';

type Doctor = {
  name: string,
  // id: number,
}

type Request = {
  name: string,
  id: number,
  dataRequested: string[],  // Requested data
}

const dummyRequests: Request[] = [
  {
    id: 3,
    name: "Martin",
    dataRequested: ["Heart rate", "Acceleration"],
  },
  {
    id: 4,
    name: "Andreas",
    dataRequested: ["Heart rate"],
  },
  {
    id: 5,
    name: "Manuel",
    dataRequested: ["Acceleration"]
  }
]

/**
 * Display page for viewing user's doctors.
 * Not currently in use.
 */
const UserDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [requests, setRequests] = useState<Request[]>(dummyRequests);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(BASE_URL + '/doctors', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const doctorArray = response.data.doctors;
        const doctors: Doctor[] = doctorArray.map((name: string) => ({ name: name }));
        setDoctors(doctors);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            console.error("Failed to fetch doctors", error.response?.data);
            return;
          }
          alert("Failed to fetch doctors. Please try again.");
          console.error(error.response?.data);
        }
      }
    };

    fetchData();
  }, []);

  function approveDoctor(doctor: Request) {
    setDoctors([...doctors, { name: doctor.name }]);
    setRequests(requests.filter((request) => request.id !== doctor.id)); // Filter out request with same id
    toaster.create({
      description: "You have approved the request from " + doctor.name + "!",
      type: "success",
    });
  }

  function rejectDoctor(doctor: Request) {
    setRequests(requests.filter((request) => request.id !== doctor.id)); // Filter out request with same id
    toaster.create({
      description: "You have rejected the request from " + doctor.name + ".",
      type: "error",
      action: {
        label: "Undo",
        onClick: () => setRequests(prev => [...prev, doctor])
      }
    });
  }

  const hasDoctors: boolean = (doctors.length != 0);
  const hasRequests: boolean = (requests.length != 0);

  return (
    <Box>
      {/* Toaster to render 'Toast' components */}
      <Toaster />
      {/* Doctors. Changes at 'lg' breakpoint to larger screen view. */}
      { isLoading ? <Spinner /> :
      <Grid templateColumns={{ base: "1", lg: "repeat(5, 1fr)" }}>
        <GridItem colSpan={3}>
          <Stack gap="1em">
            <Heading>My Doctors</Heading>
            { !hasDoctors ? <Text>You have no assigned doctors.</Text> :
            <For each={doctors}>
              {(doctor: { name: string }, idx) => (
                <Box key={idx}>
                  <Button variant="surface" w="300px" onClick={() => navigate(`${doctor.name}`)}>
                    <Flex w="100%" align="center" justify="space-between">
                      <Text>{doctor.name}</Text>
                      <Icon>
                        <MdEdit />
                      </Icon>
                    </Flex>
                  </Button>
                </Box>
              )}
            </For>
            }
          </Stack>
        </GridItem>
        {/* Requests */}
        <GridItem colSpan={2} pt={{ base: "3em", lg: "0" }} lg={{ borderLeft: "1px solid lightgray", pl: "1em" }}>
          <Stack gap="1em" minW="-moz-fit-content">
            <Heading>Requests</Heading>
            { !hasRequests ? <Text>There are no new requests.</Text> :
            <For each={requests}>
              {(doctor: { id: number, name: string, dataRequested: string[] }, idx) => (
                <Box key={idx}>
                  <DialogRoot closeOnInteractOutside role="dialog" placement="center">
                    <DialogTrigger asChild>
                      <Button colorPalette="blue" variant="solid" w="300px">
                        <Flex w="100%" align="center" justify="space-between">
                          <Text>{doctor.name}</Text>
                          <Icon>
                            <MdPending />
                          </Icon>
                        </Flex>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{doctor.name} is requesting access to the following data:</DialogTitle>
                      </DialogHeader>
                      <DialogBody>
                        <List.Root fontSize="1.2em" gap="2">
                          <For each={doctor.dataRequested}>
                            {(datum: string, idx) => <List.Item key={idx}>{datum}</List.Item>}
                          </For>
                        </List.Root>
                      </DialogBody>
                      <DialogFooter>
                        <DialogActionTrigger asChild>
                          <Button variant="solid" colorPalette="blue" onClick={() => approveDoctor(doctor)}>Approve</Button>
                        </DialogActionTrigger>
                        <DialogActionTrigger asChild>
                        <Button variant="solid" colorPalette="red" onClick={() => rejectDoctor(doctor)}>Reject</Button>
                        </DialogActionTrigger>
                      </DialogFooter>
                      <DialogCloseTrigger />
                    </DialogContent>
                  </DialogRoot>
                </Box>
              )}
            </For> }
          </Stack>
        </GridItem>
      </Grid>
      }
    </Box>
  );
};
export default UserDoctors;