import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage.tsx';
import MbtiExample from './pages/survey/MbtiExample.js';
import CompanyMain from './pages/company/CompanyMain.js';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/mbti-example" element={<MbtiExample />} />
          <Route path="/company" element={<CompanyMain />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
