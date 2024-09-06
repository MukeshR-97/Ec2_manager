import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Instances from './App';
import PrivateRoute from './PrivateRoute';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/instances" element={<PrivateRoute element={Instances} />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
