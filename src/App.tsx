import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./pages/login/Login"
import ResetPassword from "./pages/login/reset"
import OTP from "./pages/login/otp"
import Access from "./pages/admin/accessandpermissions/accessrules/Access"
import Roles from "./pages/admin/accessandpermissions/roles/roles"
import Dashboard from "./pages/admin/Dashboard/Overview"
import Mytask from "./pages/admin/Dashboard/mytasks"
import Recent from "./pages/admin/Dashboard/Recent"
import SharedLinks from "./pages/admin/accessandpermissions/sharedlinks/sharedlinks"
import Audittrail from "./pages/admin/Audit&logs/audittrail/audittrail"
import LoginHistory from "./pages/admin/Audit&logs/Loginhistory/loginhistory"
import SystemLog from "./pages/admin/Audit&logs/systemlog"
import Overview from "./pages/admin/Audit&logs/Overview/overview"
import Alldocuments from "./pages/admin/Documents/alldoc/Alldocumments"
import Archive from "./pages/admin/Documents/Archieve/Archieve"
import Favorite from "./pages/admin/Documents/fav/Fav"
import Mydocs from "./pages/admin/Documents/Mydocs/Mydocs"
import SharedDoc from "./pages/admin/Documents/shareddoc/Shareddoc"
import FAQs from "./pages/admin/Help&support/FAQs/FAQs"
import Manual from "./pages/admin/Help&support/Manual/Manual"
import SubmitTicket from "./pages/admin/Help&support/SubmitTicket/SubmitTicket"
import Categories from "./pages/admin/Organization/Categories/categories"
import Construction from "./pages/admin/Organization/Docalltypes/Construction/Construction"
import Department from "./pages/admin/Organization/Department/Department"
import Docalltype from "./pages/admin/Organization/Docalltypes/docalltype"
import Geological from "./pages/admin/Organization/Docalltypes/Geological/Geological"
import Projects from "./pages/admin/Organization/Projects/Projects"
import Tags from "./pages/admin/Organization/Tags/Tags"
import ReportsOverview from "./pages/admin/Reports/Overview"
import Accessreport from "./pages/admin/Reports/Accessreport"
import Depreport from "./pages/admin/Reports/depreport"
import Docreport from "./pages/admin/Reports/Docreport"
import VersioningRep from "./pages/admin/Reports/versioningrep/versioningrep"
import Uploadrep from "./pages/admin/Reports/Uploadrep"
import Advancedfilter from "./pages/admin/Search/Advanced/Advanced"
import SavedSearch from "./pages/admin/Search/Saved"
import Smartsearch from "./pages/admin/Search/Smartsearch"
import Docnumbering from "./pages/admin/Settings/Docnumbering"
import Integrations from "./pages/admin/Settings/intergrations"
import Backup from "./pages/admin/Settings/backup/Backup"
import Notifications from "./pages/admin/Settings/Notifications"
import Storage from "./pages/admin/Settings/Storage"
import Bulk from "./pages/admin/Upload&digitization/Bulk/bulk"
import History from "./pages/admin/Upload&digitization/History"
import Scan from "./pages/admin/Upload&digitization/scan"
import Upload from "./pages/admin/Upload&digitization/Upload"
import Usermanagement from "./pages/admin/UserManagement/UserManagement"
import Companyprofile from "./pages/admin/Settings/Companyprofile"
import Compare from "./pages/admin/Versioncontrol/Compare"
import Restore from "./pages/admin/Versioncontrol/Restore"
import VersionHistory from "./pages/admin/Versioncontrol/versionhistory"
import Alert from "./pages/admin/Audit&logs/Alert/alerts"
import Geotechnical from "./pages/admin/Organization/Docalltypes/Geotecnical"

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/resetpassword" element={<ResetPassword/>} />
        <Route path="/otp" element={<OTP/>} />
        <Route path="/access" element={<Access/>} />
        <Route path="/role" element={<Roles/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/Mytasks" element={<Mytask/>} />
        <Route path="/Recentactivity" element={<Recent/>}/>
        <Route path="/sharedlinks" element={<SharedLinks/>}/>
        <Route path="/audittrail" element={<Audittrail/>}/>
        <Route path="/alerts" element={<Alert/>}/>
        <Route path="/loginhistory" element={<LoginHistory/>}/>
        <Route path="/systemlog" element={<SystemLog/>}/>
        <Route path="/overview" element={<Overview/>}/>
        <Route path="/alldocuments" element={<Alldocuments/>}/>
        <Route path="/archive" element={<Archive/>}/>
        <Route path="/favorite" element={<Favorite/>}/>
        <Route path="/mydocs" element={<Mydocs/>}/>
        <Route path="/shareddocs" element={<SharedDoc/>}/>
        <Route path="/helpandsupport/faqs" element={<FAQs/>}/>
        <Route path="/helpandsupport/manual" element={<Manual/>}/>
        <Route path="/helpandsupport/submitticket" element={<SubmitTicket/>}/>
        <Route path="/categories" element={<Categories/>}/>
      
        <Route path="/Department" element={<Department/>}/>
        <Route path="/Docalltype" element={<Docalltype/>}/>
        <Route path="/organization/construction" element={<Construction/>}/>
        <Route path="/organization/geological" element={<Geological/>}/>
        <Route path="/organization/geotechnical" element={<Geotechnical/>}/>
        <Route path="/Projects" element={<Projects/>}/>
        <Route path="/Tags" element={<Tags/>}/>
        <Route path="/reports/accessreport" element={<Accessreport/>}/>
        <Route path="/reports/depreport" element={<Depreport/>}/>
        <Route path="/reports/docreport" element={<Docreport/>}/>
        <Route path="/reports/versioningrep" element={<VersioningRep/>}/>
        <Route path="/reports/uploadrep" element={<Uploadrep/>}/>
        <Route path="/reports/overview" element={<ReportsOverview/>}/>
        <Route path="/Advancedfilter" element={<Advancedfilter/>}/>
        <Route path="/SavedSearch" element={<SavedSearch/>}/>
        <Route path="/Smartsearch" element={<Smartsearch/>}/>
        <Route path="/settings/docnumbering" element={<Docnumbering/>}/>
        <Route path="/settings/integrations" element={<Integrations/>}/>
        <Route path="/settings/backuprestore" element={<Backup/>}/>
        <Route path="/settings/notifications" element={<Notifications/>}/>
        <Route path="/settings/storage" element={<Storage/>}/>
        <Route path="/settings/companyprofile" element={<Companyprofile/>}/>
        <Route path="/upload&digitization/bulk" element={<Bulk/>}/>
        <Route path="/upload&digitization/history" element={<History/>}/>
        <Route path="/upload&digitization/scan" element={<Scan/>}/>
        <Route path="/upload&digitization/upload" element={<Upload/>}/>
        <Route path="/usermanagement" element={<Usermanagement/>}/>
        <Route path="/versioncontrol/compare" element={<Compare/>}/>
        <Route path="/versioncontrol/restore" element={<Restore/>}/>
        <Route path="/versioncontrol/history" element={<VersionHistory/>}/>
      </Routes>
    </BrowserRouter>
  )
}
