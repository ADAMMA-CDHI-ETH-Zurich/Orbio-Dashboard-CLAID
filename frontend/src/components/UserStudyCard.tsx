import { Card, Flex } from "@chakra-ui/react";
import { StudyOverview } from "../types/StudyTypes";
import UserLeaveStudyPopup from "./UserLeaveStudyPopup";
import UserStudyCardPopup from "./UserStudyCardPopup";

// export type StudyOverview = {
//   id: string,
//   name: string,
//   description: string,
//   endDate: Date,
//   startDate: Date,
//   status: "ongoing" | "completed" | "not_started" | "undefined",
// }

/**
 * @returns Card containing an overview of a study for a user,
 * including a button that shows a popup with more information,
 * and an option to leave the study.
 */
const UserStudyCard = (props: {study: StudyOverview}) => {
  const { study: {id, name, description} } = props;

  return (
    <Card.Root>
      <Card.Body gap="2">
        <Flex justify="space-between" align="top">
          <Card.Title>{name}</Card.Title>
          <UserLeaveStudyPopup studyId={id} />
        </Flex>
        <Card.Description>
          {description}
        </Card.Description>
      </Card.Body>
      <Card.Footer justifyContent="flex-start">
        <UserStudyCardPopup studyId={id} />
      </Card.Footer>
    </Card.Root>
  );
}

export default UserStudyCard;