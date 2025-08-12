import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage.tsx';
import MbtiExample from './pages/survey/MbtiExample.js';
import CompanyMain from './pages/company/CompanyMain.tsx';
import CompanyRegister from './pages/company/CompanyRegister.tsx';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/mbti-example" element={<MbtiExample />} />
          <Route path="/company" element={<CompanyMain />} />
          <Route path="/company/register" element={<CompanyRegister />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
