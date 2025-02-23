import { Route, Routes } from 'react-router-dom';
import Layout from '../Layout';
import NotFound from '../NotFound';
import CreateStudy from './CreateStudy';
import ParticipantDetails from './ParticipantDetails';
import PIAboutPage from './PIAboutPage';
import PISettingsPage from './PISettingsPage';
import Studies from './Studies';
import StudyDetails from './StudyDetails';

/**
 * Main routing page for all 'PI' pages.
 */
const PI = () => {
  return (
    <Layout userType="principal_investigator">
      <Routes>
        <Route path="/" element={<Studies />} />
        <Route path="/:id" element={<StudyDetails />} />
        <Route path="/:id/participant" element={<ParticipantDetails />} />
        <Route path="/create-study" element={<CreateStudy />} />
        <Route path="/about" element={<PIAboutPage />} />
        <Route path="/settings" element={<PISettingsPage />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default PI;