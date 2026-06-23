import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login/Login";
import ResetPassword from "./pages/login/reset";
import OTP from "./pages/login/otp";

import Access from "./pages/admin/accessandpermissions/accessrules/Access";
import Roles from "./pages/admin/accessandpermissions/roles/roles";
import SharedLinks from "./pages/admin/accessandpermissions/sharedlinks/sharedlinks";

import Dashboard from "./pages/admin/Dashboard/Overview";
import Mytask from "./pages/admin/Dashboard/mytasks";
import Recent from "./pages/admin/Dashboard/Recent";
import StudyAreasPage from "./pages/admin/Dashboard/StudyAreasPage";
import SampleLaboratoryPage from "./pages/admin/Dashboard/SampleLaboratoryPage";
import SettingsManagementPage from "./pages/admin/Dashboard/SettingsManagementPage";
import UploadDocumentPage from "./pages/admin/Dashboard/UploadDocumentPage";
import GeologistDashboard from "./pages/admin/Dashboard/GeologistDashboard";
import ViewerDashboard from "./pages/admin/Dashboard/ViewerDashboard";

import Audittrail from "./pages/admin/Audit&logs/audittrail/audittrail";
import LoginHistory from "./pages/admin/Audit&logs/Loginhistory/loginhistory";
import SystemLog from "./pages/admin/Audit&logs/systemlog";
import Overview from "./pages/admin/Audit&logs/Overview/overview";
import Alert from "./pages/admin/Audit&logs/Alert/alerts";

import Alldocuments from "./pages/admin/Documents/alldoc/Alldocumments";
import Archive from "./pages/admin/Documents/Archieve/Archieve";
import Favorite from "./pages/admin/Documents/fav/Fav";
import Mydocs from "./pages/admin/Documents/Mydocs/Mydocs";
import SharedDoc from "./pages/admin/Documents/shareddoc/Shareddoc";

import FAQs from "./pages/admin/Help&support/FAQs/FAQs";
import Manual from "./pages/admin/Help&support/Manual/Manual";
import SubmitTicket from "./pages/admin/Help&support/SubmitTicket/SubmitTicket";

import Organization from "./pages/admin/Organization/Organization";
import Categories from "./pages/admin/Organization/Categories/categories";
import Construction from "./pages/admin/Organization/Docalltypes/Construction/Construction";
import Department from "./pages/admin/Organization/Department/Department";
import Docalltype from "./pages/admin/Organization/Docalltypes/docalltype";
import Geological from "./pages/admin/Organization/Docalltypes/Geological/Geological";
import Geotechnical from "./pages/admin/Organization/Docalltypes/Geotecnical";
import Projects from "./pages/admin/Organization/Projects/Projects";
import ProjectDetails from "./pages/admin/Organization/Projects/ProjectDetails";
import Tags from "./pages/admin/Organization/Tags/Tags";

import ReportsOverview from "./pages/admin/Reports/Overview";
import Accessreport from "./pages/admin/Reports/Accessreport";
import Depreport from "./pages/admin/Reports/depreport";
import Docreport from "./pages/admin/Reports/Docreport";
import VersioningRep from "./pages/admin/Reports/versioningrep/versioningrep";
import Uploadrep from "./pages/admin/Reports/Uploadrep";

import Advancedfilter from "./pages/admin/Search/Advanced/Advanced";
import SavedSearch from "./pages/admin/Search/Saved";
import Smartsearch from "./pages/admin/Search/Smartsearch";

import Docnumbering from "./pages/admin/Settings/Docnumbering";
import Integrations from "./pages/admin/Settings/intergrations";
import Backup from "./pages/admin/Settings/backup/Backup";
import Storage from "./pages/admin/Settings/Storage";
import Companyprofile from "./pages/admin/Settings/Companyprofile";

import Bulk from "./pages/admin/Upload&digitization/Bulk/bulk";
import History from "./pages/admin/Upload&digitization/History";
import Scan from "./pages/admin/Upload&digitization/scan";
import Upload from "./pages/admin/Upload&digitization/Upload";

import Usermanagement from "./pages/admin/UserManagement/UserManagement";

import Compare from "./pages/admin/Versioncontrol/Compare";
import Restore from "./pages/admin/Versioncontrol/Restore";
import VersionHistory from "./pages/admin/Versioncontrol/versionhistory";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/otp" element={<OTP />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Mytasks" element={<Mytask />} />
        <Route path="/Recentactivity" element={<Recent />} />
        <Route path="/viewer-dashboard" element={<ViewerDashboard />} />
        <Route path="/geologist-dashboard" element={<GeologistDashboard />} />
        <Route
          path="/viewer"
          element={<Navigate to="/viewer-dashboard" replace />}
        />
        <Route
          path="/geologist"
          element={<Navigate to="/geologist-dashboard" replace />}
        />

        {/* Study Areas */}
        <Route path="/study-areas" element={<StudyAreasPage />} />
        <Route path="/study-areas/maps" element={<StudyAreasPage />} />
        <Route path="/study-areas/locations" element={<StudyAreasPage />} />
        <Route path="/study-areas/fields" element={<StudyAreasPage />} />
        <Route
          path="/maps"
          element={<Navigate to="/study-areas/maps" replace />}
        />
        <Route
          path="/locations"
          element={<Navigate to="/study-areas/locations" replace />}
        />
        <Route
          path="/fields"
          element={<Navigate to="/study-areas/fields" replace />}
        />

        {/* Samples & Laboratory */}
        <Route
          path="/samples-laboratory"
          element={<SampleLaboratoryPage />}
        />
        <Route
          path="/samples"
          element={<SampleLaboratoryPage />}
        />
        <Route
          path="/laboratory"
          element={<SampleLaboratoryPage />}
        />
        <Route
          path="/lab-results"
          element={<SampleLaboratoryPage />}
        />

        {/* Upload Document */}
        <Route path="/upload-document" element={<UploadDocumentPage />} />
        <Route
          path="/upload-documents"
          element={<Navigate to="/upload-document" replace />}
        />
        <Route
          path="/document-upload"
          element={<Navigate to="/upload-document" replace />}
        />

        {/* Access & permissions - hidden from sidebar but routes still work */}
        <Route path="/access" element={<Access />} />
        <Route path="/role" element={<Roles />} />
        <Route path="/sharedlinks" element={<SharedLinks />} />

        {/* Audit & logs */}
        <Route path="/audittrail" element={<Audittrail />} />
        <Route path="/alerts" element={<Alert />} />
        <Route path="/loginhistory" element={<LoginHistory />} />
        <Route path="/systemlog" element={<SystemLog />} />
        <Route path="/overview" element={<Overview />} />

        {/* Documents */}
        <Route path="/alldocuments" element={<Alldocuments />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/mydocs" element={<Mydocs />} />
        <Route path="/shareddocs" element={<SharedDoc />} />

        {/* Help & support */}
        <Route path="/helpandsupport/faqs" element={<FAQs />} />
        <Route path="/helpandsupport/manual" element={<Manual />} />
        <Route path="/helpandsupport/submitticket" element={<SubmitTicket />} />

        {/* Organization main route */}
        <Route path="/organization" element={<Organization />} />

        {/* Old Organization link redirect */}
        <Route
          path="/Organization"
          element={<Navigate to="/organization" replace />}
        />

        {/* Organization modules */}
        <Route path="/categories" element={<Categories />} />
        <Route path="/Department" element={<Department />} />
        <Route path="/Docalltype" element={<Docalltype />} />
        <Route path="/organization/construction" element={<Construction />} />
        <Route path="/organization/geological" element={<Geological />} />
        <Route path="/organization/geotechnical" element={<Geotechnical />} />
        <Route path="/Tags" element={<Tags />} />

        {/* Projects */}
        <Route path="/Projects" element={<Projects />} />
        <Route path="/Projects/:projectId" element={<ProjectDetails />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />

        {/* Search & retrieval */}
        <Route path="/search" element={<Smartsearch />} />
        <Route
          path="/Smartsearch"
          element={<Navigate to="/search" replace />}
        />
        <Route path="/Advancedfilter" element={<Advancedfilter />} />
        <Route path="/SavedSearch" element={<SavedSearch />} />

        {/* Reports main route */}
        <Route path="/reports" element={<ReportsOverview />} />

        {/* Old reports overview redirect */}
        <Route
          path="/reports/overview"
          element={<Navigate to="/reports" replace />}
        />

        {/* Reports modules */}
        <Route path="/reports/accessreport" element={<Accessreport />} />
        <Route path="/reports/depreport" element={<Depreport />} />
        <Route path="/reports/docreport" element={<Docreport />} />
        <Route path="/reports/versioningrep" element={<VersioningRep />} />
        <Route path="/reports/uploadrep" element={<Uploadrep />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsManagementPage />} />
        <Route
          path="/settings/notifications"
          element={<SettingsManagementPage />}
        />
        <Route path="/settings/email" element={<SettingsManagementPage />} />
        <Route path="/notifications" element={<SettingsManagementPage />} />
        <Route path="/email-settings" element={<SettingsManagementPage />} />
        <Route path="/settings/docnumbering" element={<Docnumbering />} />
        <Route path="/settings/integrations" element={<Integrations />} />
        <Route path="/settings/backuprestore" element={<Backup />} />
        <Route path="/settings/storage" element={<Storage />} />
        <Route path="/settings/companyprofile" element={<Companyprofile />} />

        {/* Upload & digitization main route */}
        <Route path="/upload&digitization" element={<Bulk />} />

        {/* Old bulk route redirect */}
        <Route
          path="/upload&digitization/bulk"
          element={<Navigate to="/upload&digitization" replace />}
        />

        {/* Upload & digitization modules */}
        <Route path="/upload&digitization/history" element={<History />} />
        <Route path="/upload&digitization/scan" element={<Scan />} />
        <Route path="/upload&digitization/upload" element={<Upload />} />

        {/* Users */}
        <Route path="/usermanagement" element={<Usermanagement />} />

        {/* Version control - hidden from sidebar but routes still work */}
        <Route path="/versioncontrol/compare" element={<Compare />} />
        <Route path="/versioncontrol/restore" element={<Restore />} />
        <Route path="/versioncontrol/history" element={<VersionHistory />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};