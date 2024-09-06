import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component }) => {
  const accessKeyId = localStorage.getItem("AWS_ACCESS_KEY_ID");
  const secretAccessKey = localStorage.getItem("AWS_SECRET_ACCESS_KEY");

  return accessKeyId && secretAccessKey ? <Component /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
