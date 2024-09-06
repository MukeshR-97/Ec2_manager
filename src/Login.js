import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AWS from 'aws-sdk';
import "./Login.css";

function Login() {
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateCredentials = async () => {
    const ec2 = new AWS.EC2({
      accessKeyId,
      secretAccessKey,
      region: "us-east-1", // Default region
    });

    try {
      await ec2.describeInstances().promise();
      return true;
    } catch (err) {
      console.error('Invalid AWS credentials:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!accessKeyId || !secretAccessKey) {
      setError("Both Access Key and Secret Key are required.");
      setLoading(false);
      return;
    }

    const isValid = await validateCredentials();

    if (isValid) {
      localStorage.setItem("AWS_ACCESS_KEY_ID", accessKeyId);
      localStorage.setItem("AWS_SECRET_ACCESS_KEY", secretAccessKey);
      localStorage.setItem("AWS_REGION", "us-east-1"); // Default region

      navigate("/instances", { replace: true });
    } else {
      setError("Your credentials are incorrect. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>EC2 Management Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="accessKeyId">Access Key</label>
            <input
              type="text"
              id="accessKeyId"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              required
              placeholder="Enter your AWS Access Key"
            />
          </div>
          <div className="input-group">
            <label htmlFor="secretAccessKey">Secret Access Key</label>
            <input
              type="password"
              id="secretAccessKey"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              required
              placeholder="Enter your AWS Secret Access Key"
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Validating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
