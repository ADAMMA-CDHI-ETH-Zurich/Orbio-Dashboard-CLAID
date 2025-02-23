import { Button, IconButton } from "@chakra-ui/react";
import axios from "axios";
import { useEffect } from "react";
import { TrashForever } from "../icons";
import { useAuth } from "../provider/authProvider";
import { BASE_URL } from '../router/apiClient';
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
} from "./ui/dialog";
import { Toaster, toaster } from "./ui/toaster";
// export type StudyData = {
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

// export type UserStudyData = {
//   participantNum: number,
//   signedInformedConsent: string,  // PDF in base 64
//   startDate: Date,
//   endDate: Date,
// }

// export type StudyAndUserData = {
//   studyData: StudyData,
//   userStudyData: UserStudyData,
// }

/**
 * Returns a popup confirming that a user wants to leave a study, then
 * leaves it if the user confirms.
 * 
 * @param props.studyId ID of the study to leave.
 *   Must be a valid study ID that the user is currently participating in.
 */
const UserLeaveStudyPopup = (props: {studyId: string}) => {
  const { studyId } = props;
  const { token } = useAuth();
  
  useEffect(() => {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  }, [token]);

  const leaveStudy = () => {
    axios.delete(BASE_URL + `/user/studies/${studyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(_ => {
        toaster.create({
          title: "Left study",
          description: "You may need to refresh the page to view changes.",
        });
        setTimeout(() => {window.location.reload()}, 1500);
      })
      .catch(err => {
        alert("There was an error leaving the study");
        console.error(err);
      })
  }

  return (
    <DialogRoot size="md" placement="center">
      <Toaster />
      <DialogTrigger asChild>
        <IconButton boxSize="30px" variant="subtle" ml="0.3em" colorPalette="red" color="red" aria-label="Leave study" p="0">
          <TrashForever />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to leave the study?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          Your data will no longer be available to the study organizer.
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <DialogActionTrigger asChild>
            <Button onClick={leaveStudy} variant="solid" colorPalette="red">Leave Study</Button>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}

export default UserLeaveStudyPopup;