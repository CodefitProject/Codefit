import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage.tsx';
import MbtiExample from './pages/survey/MbtiExample.js';
import CompanyMain from './pages/company/CompanyMain.js';
import PostList from './pages/post/PostList.tsx';
import PostDetail from './pages/post/PostDetail.tsx';
import PostCreate from './pages/post/PostCreate.tsx';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/mbti-example" element={<MbtiExample />} />
          <Route path="/company" element={<CompanyMain />} />
          <Route path="/post" element={<PostList />} />
          <Route path="/post/detail/:jobPostingId" element={<PostDetail />} />
          <Route path="/post/create" element={<PostCreate />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
