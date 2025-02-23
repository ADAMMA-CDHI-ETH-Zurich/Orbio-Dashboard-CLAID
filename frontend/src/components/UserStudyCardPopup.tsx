import { Box, Button, List, Skeleton } from "@chakra-ui/react";
import axios from "axios";
import { Duration } from "luxon";
import { useEffect, useState } from "react";
import { FileDownload } from "../icons";
import { useAuth } from "../provider/authProvider";
import { BASE_URL } from '../router/apiClient';
import { StudyAndUserData } from "../types/StudyTypes";
import ChakraMarkdown from "./ChakraMarkdown";
import { DataListItem, DataListRoot } from "./ui/data-list";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
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
 * Returns a popup with information about a study that a user
 * is currently participating in, including an option to download
 * their signed informed consent form.
 * 
 * @param props.studyId ID of the study to display information about.
 *   Must be a valid study ID that the user is currently participating in.
 */
const UserStudyCardPopup = (props: {studyId: string}) => {
  const { studyId } = props;
  const { token } = useAuth();
  const [study, setStudy] = useState<StudyAndUserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getStudyData() {
      axios.get(BASE_URL + `/user/studies/${studyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
        .then(res => {
          const studyData = res.data.study_data;
          const userData = res.data.user_study_data;
          setStudy({
            studyData: {
              id: userData.study_id,
              code: studyData.code,
              name: studyData.name,
              description: studyData.description,
              organizerName: studyData.organizer_name,
              endDate: new Date(studyData.end_date),
              startDate: new Date(studyData.start_date),
              status: userData.status,
              duration: Duration.fromISO(studyData.duration),
              inclusionCriteria: studyData.inclusion_criteria,
              informedConsent: studyData.informed_consent,
              metrics: studyData.metrics,
            },
            userStudyData: {
              participantNum: userData.participant_num,
              signedInformedConsent: userData.signed_informed_consent,
              startDate: new Date(userData.start_date),
              endDate: new Date(userData.end_date),
            },
          })
          setIsLoading(false);
        })
        .catch(err => {
          alert("Error getting study info");
          console.error(err);
        });
    }

    getStudyData();
  }, [token, studyId]);

  const downloadForm = () => {
    if (!study) {
      alert("Error in getting form");
      return;
    }

    try {
      const dataUriString = study.userStudyData.signedInformedConsent;

      // Validate if we have a data URI
      if (!dataUriString) {
        throw new Error('No form data available');
      }

      // Handle both formats: with and without data URI prefix
      let base64Content;
      if (dataUriString.includes('base64,')) {
        // Extract base64 content from data URI
        base64Content = dataUriString.split('base64,')[1];
      } else {
        // If it's already just base64, use it directly
        base64Content = dataUriString;
      }

      // Validate base64 string
      if (!base64Content || base64Content.trim() === '') {
        throw new Error('Invalid form data');
      }

      // Clean the base64 string (remove whitespace, newlines, etc)
      base64Content = base64Content.replace(/\s/g, '');

      // Create blob from base64
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `informed_consent_${study.studyData.code}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('Error downloading form:', error);
      alert('Failed to download the form. Please try again or contact support.');
    }
  };

  return (
    <DialogRoot size="xl" placement="center">
      <DialogTrigger asChild>
        <Button variant="surface">
          See More
        </Button>
      </DialogTrigger>
      {(isLoading || !study) ? <Skeleton /> : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{study?.studyData.name}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DataListRoot>
              <DataListItem label="Organizer" value={study.studyData.organizerName} />
              <DataListItem label="Study Start" value={study.userStudyData.startDate.toDateString()} />
              <DataListItem label="Study End" value={study.userStudyData.endDate.toDateString()} />
              <DataListItem label="Recorded Metrics" value={
                <List.Root>
                  {study?.studyData.metrics.map((metric: any) => {
                    return <List.Item>{metric.name}</List.Item>
                  })}
                </List.Root>
              } />
              <DataListItem
                label="Inclusion Criteria"
                value={
                  <Box p="1em" w="100%" border="1px solid lightgray" borderRadius="md">
                    <ChakraMarkdown md={study.studyData.inclusionCriteria} />
                  </Box>
                }
              />
              <DataListItem label="Informed Consent Form" value={<Button onClick={downloadForm}><FileDownload aria-label="Download file" /> Signed Informed Consent Form</Button>} />
            </DataListRoot>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      )}
    </DialogRoot>
  );
}

export default UserStudyCardPopup;