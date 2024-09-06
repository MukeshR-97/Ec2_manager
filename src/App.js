import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listInstances, startInstance, stopInstance } from "./awsService"; // Assume you have awsService for API calls
import "./App.css";

const regions = ["us-east-1", "us-west-2", "ap-south-1", "us-east-2", "us-west-1"];
const itemsPerPage = 5; // Set the number of items per page

function Instances() {
  const [instances, setInstances] = useState([]);
  const [filteredInstances, setFilteredInstances] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem("AWS_REGION") || "us-east-1");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({ state: "all", type: "all" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessKeyId = localStorage.getItem("AWS_ACCESS_KEY_ID");
    const secretAccessKey = localStorage.getItem("AWS_SECRET_ACCESS_KEY");

    if (!accessKeyId || !secretAccessKey) {
      navigate("/", { replace: true }); // Redirect if no credentials
    } else {
      fetchInstances();
    }
  }, [selectedRegion, navigate]);

  useEffect(() => {
    applyFilters();
  }, [instances, filter]);

  const fetchInstances = async () => {
    setLoading(true);
    setError(null);  // Reset error before fetching
    const accessKeyId = localStorage.getItem("AWS_ACCESS_KEY_ID");
    const secretAccessKey = localStorage.getItem("AWS_SECRET_ACCESS_KEY");

    try {
      const data = await listInstances(selectedRegion, accessKeyId, secretAccessKey);
      setInstances(data);
    } catch (error) {
      setError("Failed to fetch instances. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...instances];

    // Apply state filter
    if (filter.state !== "all") {
      filtered = filtered.filter((instance) => instance.State.Name === filter.state);
    }

    // Apply type filter
    if (filter.type !== "all") {
      filtered = filtered.filter((instance) => instance.InstanceType === filter.type);
    }

    setFilteredInstances(filtered);
    setCurrentPage(1); // Reset to page 1 after applying filters
  };

  const handleStart = async (instanceId) => {
    const accessKeyId = localStorage.getItem("AWS_ACCESS_KEY_ID");
    const secretAccessKey = localStorage.getItem("AWS_SECRET_ACCESS_KEY");
    await startInstance(instanceId, selectedRegion, accessKeyId, secretAccessKey);
    fetchInstances();
  };

  const handleStop = async (instanceId) => {
    const accessKeyId = localStorage.getItem("AWS_ACCESS_KEY_ID");
    const secretAccessKey = localStorage.getItem("AWS_SECRET_ACCESS_KEY");
    await stopInstance(instanceId, selectedRegion, accessKeyId, secretAccessKey);
    fetchInstances();
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("AWS_ACCESS_KEY_ID");
      localStorage.removeItem("AWS_SECRET_ACCESS_KEY");
      localStorage.removeItem("AWS_REGION");
      navigate("/", { replace: true });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get paginated instances
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInstances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInstances.length / itemsPerPage);

  return (
    <div className="instances-container">
      <header className="header">
        <h1>EC2 Instance Manager</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div className="controls">
        <div className="region-selector">
          <label htmlFor="region-select">Select Region:</label>
          <select
            id="region-select"
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              localStorage.setItem("AWS_REGION", e.target.value);
            }}
            value={selectedRegion}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div className="filters">
          <label htmlFor="state-filter">Filter by State:</label>
          <select
            id="state-filter"
            onChange={(e) => setFilter({ ...filter, state: e.target.value })}
            value={filter.state}
          >
            <option value="all">All States</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
          </select>

          <label htmlFor="type-filter">Filter by Type:</label>
          <select
            id="type-filter"
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            value={filter.type}
          >
            <option value="all">All Types</option>
            {instances.map((instance) => (
              <option key={instance.InstanceType} value={instance.InstanceType}>
                {instance.InstanceType}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="instance-list">
        {loading ? (
          <p>Loading instances...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredInstances.length ? (
          currentItems.map((instance) => (
            <div className="instance-card" key={instance.InstanceId}>
              <h2>Instance ID: {instance.InstanceId}</h2>
              <p><strong>Name:</strong> {instance.Tags.find(tag => tag.Key === "Name")?.Value || "N/A"}</p>
              <p><strong>Type:</strong> {instance.InstanceType}</p>
              <p><strong>Public IP:</strong> {instance.PublicIpAddress || "N/A"}</p>
              <p><strong>State:</strong> {instance.State.Name}</p>
              <div className="buttons">
                {instance.State.Name === 'running' ? (
                  <button className="stop" onClick={() => handleStop(instance.InstanceId)}>Stop</button>
                ) : (
                  <button className="start" onClick={() => handleStart(instance.InstanceId)}>Start</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No instances available for the selected filters or region.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Instances;
