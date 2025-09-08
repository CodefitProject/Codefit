import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage.tsx";
import MbtiExample from "./pages/survey/MbtiExample.tsx";
import SurveyMbti from "./pages/survey/SurveyMbti.tsx";
import CompanyMain from "./pages/company/CompanyMain.tsx";
import CompanyRegister from "./pages/company/CompanyRegister.tsx";
import CompanyDashboard from "./pages/company/CompanyDashboard.tsx";
import PostList from "./pages/post/PostList.tsx";
import PostDetail from "./pages/post/PostDetail.tsx";
import PostCreate from "./pages/post/PostCreate.tsx";
import PostEdit from "./pages/post/PostEdit.tsx";
import Signup from "./pages/user/Signup.tsx";
import SignupComplete from "./pages/user/SignupComplete.tsx";
import LocationSelect from "./pages/user/LocationSelect.tsx";
import SalarySelect from "./pages/user/SalarySelect.tsx";
import CareerInput from "./pages/user/CareerInput.tsx";
import ProfileAdditional from "./pages/user/ProfileAdditional.tsx";
import ProfileComplete from "./pages/user/ProfileComplete.tsx";
import UserDetailRoutes from "./pages/user/UserDetail.tsx";
import ApplicationList from "./pages/application/ApplicationList.tsx";
import ApplicantScout from "./pages/application/ApplicationScout.tsx";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/complete" element={<SignupComplete />} />
          <Route path="/signup/location" element={<LocationSelect />} />
          <Route path="/signup/salary" element={<SalarySelect />} />
          <Route path="/signup/career" element={<CareerInput />} />
          <Route path="/signup/additional" element={<ProfileAdditional />} />
          <Route
            path="/signup/profile-complete"
            element={<ProfileComplete />}
          />
          <Route path="/mbti-example" element={<MbtiExample />} />
          <Route path="/survey/mbti" element={<SurveyMbti />} />
          <Route path="/company" element={<CompanyMain />} />
          <Route path="/company/register" element={<CompanyRegister />} />
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/posts/create" element={<PostCreate />} />
          <Route path="/post" element={<PostList />} />
          <Route path="/post/detail/:jobPostingId" element={<PostDetail />} />
          <Route path="/post/create" element={<PostCreate />} />
          <Route path="/user/detail/*" element={<UserDetailRoutes />} />
          <Route path="/post/edit/:jobPostingId" element={<PostEdit />} />
          <Route path="/post/applicant/:id" element={<ApplicationList />} />
          <Route
            path="/post/scout/:jobPostingId"
            element={<ApplicantScout />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
