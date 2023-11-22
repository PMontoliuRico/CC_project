// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet, useNavigate } from 'react-router-dom';
import './App.css';
// import OAuthPage from './OAuthPage';
import Home from './Home';

function CreateJob() {
  return (
    <div>
      <h2>Create Job</h2>
      {/* Your job creation form and logic go here */}
    </div>
  );
}


function App() {
  const [jobData, setJobData] = useState('');
  const [result, setResult] = useState('');
  const [userIdentity, setUserIdentity] = useState('');

  const createJob = async () => {
    try {
      // Your job creation logic goes here...
      const jobId = '123'; // Replace with actual job ID
      setUserIdentity('exampleUser'); // Replace with actual user identity
      setResult(`Job ID: ${jobId}, User Identity: ${userIdentity}, Job Data: ${jobData}`);
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <h1>React Express Frontend Example</h1>
        <Routes>
        <Route path="/" element={<Home />} />
          {/* Add a route for the OAuth page */}
          {/* <Route path="/oauth" element={<OAuthPage />} /> */}
          <Route path="/create-job" element={<CreateJob />} />
        </Routes>
        <textarea
          placeholder="Enter job data..."
          value={jobData}
          onChange={(e) => setJobData(e.target.value)}
        />
        <button onClick={createJob}>Create Job</button>
        <div>
          <h2>Result:</h2>
          <pre>{result}</pre>
        </div>
      </div>
    </Router>
  );
}

export default App;
