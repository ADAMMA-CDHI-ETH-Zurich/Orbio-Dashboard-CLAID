import { Duration } from "luxon";

export type StudyOverview = {
  id: string,
  name: string,
  description: string,
  endDate: Date,
  startDate: Date,
  status: "ongoing" | "completed" | "not_started" | "undefined",
}

export type StudyData = {
  id: string,
  code: string,  // shorter identifier for lookup purposes
  name: string,
  description: string,
  organizerName: string,
  endDate: Date,
  startDate: Date,
  status: "ongoing" | "completed" | "not_started" | "undefined",
  duration: Duration,
  inclusionCriteria: string,  // markdown
  informedConsent: string,  // markdown
  metrics: Array<{
    id: string,
    name: string,
  }>,
}

export type UserStudyData = {
  participantNum: number,
  signedInformedConsent: string,  // PDF in base 64
  startDate: Date,
  endDate: Date,
}

export type StudyAndUserData = {
  studyData: StudyData,
  userStudyData: UserStudyData,
}