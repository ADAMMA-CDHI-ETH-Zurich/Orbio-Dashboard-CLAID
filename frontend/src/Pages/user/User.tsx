import { Route, Routes } from 'react-router-dom';
import Layout from '../Layout';
import NotFound from '../NotFound';
import Config from './Config';
import JoinStudy from './JoinStudy';
import UserAboutPage from './UserAboutPage';
import UserData from './UserData';
import UserSettingsPage from './UserSettingsPage';
import UserStudies from './UserStudies';

/**
 * Main routing page for all 'user' pages.
 */
const User = () => {
  return (
    <Layout userType="user">
      <Routes>
        <Route path="/" element={<UserData />} />
        <Route path="/studies" element={<UserStudies />} />
        <Route path="/studies/join" element={<JoinStudy />} />
        {/* <Route path="/doctors" element={<UserDoctors />} />
        <Route path="/doctors/:id" element={<Test />} /> */}
        <Route path="/config" element={<Config />} />
        <Route path="/about" element={<UserAboutPage />} />
        <Route path="/settings" element={<UserSettingsPage />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default User;