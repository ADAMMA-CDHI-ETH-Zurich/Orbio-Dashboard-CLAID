import { Button, Text } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Trash } from "../icons";
import { useAuth } from "../provider/authProvider";
import { BASE_URL } from '../router/apiClient';
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Toaster, toaster } from "./ui/toaster";

interface Study {
  id: string;
  name: string;
  num_participants?: number;
  status?: 'completed' | 'ongoing' | 'not_started';
  description?: string;
  start_date?: string;
  end_date?: string;
  inclusion_criteria?: string | null;
  informed_consent?: string | null;
  duration?: string;
  code?: string;
  metrics?: Array<{
    id: string;
    name: string;
    // Add other metric properties if needed
  }>;
} 

/**
 * @param props.study Contains information about study that may be deleted (at minimum, contains `id` and `name`)
 * @returns Button to delete a study. When clicked, opens a pop-up to confirm.
 */
const DeleteStudyButton = (props: { study: Study }) => {
  const { study } = props;
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleDeleteStudy = async () => {
      try {
        await axios.delete(
          BASE_URL + `/pi/studies/${study.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
  
        toaster.create({
          title: "Study Deleted",
          description: "The study has been successfully deleted",
          type: "success",
        });
  
        // Navigate back to studies list
        navigate('/pi');
        window.location.reload()
        
      } catch (error) {
        console.error('Error deleting study:', error);
        toaster.create({
          title: "Delete Failed",
          description: "Failed to delete the study. Please try again.",
          type: "error",
        });
      }
    };

  return (
      <DialogRoot placement="center">
        <Toaster />
        <DialogTrigger asChild>
          <Button
            colorPalette ="red"
            w="100%"
          >
            Delete Study <Trash />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Study</DialogTitle>
          </DialogHeader>
          
          <DialogBody>
            <Text mb={4}>
              Are you sure you want to delete this study? This action cannot be undone.
            </Text>
            <Text fontWeight="medium" color="red.500">
              Study Name: {study.name}
            </Text>
          </DialogBody>
          
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button 
              colorPalette="red"
              onClick={handleDeleteStudy}
            >
              Delete Study
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
  );
}

export default DeleteStudyButton;