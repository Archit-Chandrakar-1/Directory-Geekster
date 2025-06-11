// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { FaUserPlus } from 'react-icons/fa';

function App() {
  const [activeTab, setActiveTab] = useState('add');
  const [rows, setRows] = useState([]);
  const [aadharSearch, setAadharSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('peopleList')) || [];
    setRows(saved);
  }, []);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const ageDiff = Date.now() - birthDate.getTime();
    return Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
  };

  const addRow = () => {
    setRows([...rows, { name: '', dob: '', aadhar: '', mobile: '', age: '', isNew: true }]);
  };

  const updateField = (index, field, value) => {
    const updatedRows = [...rows];

    if (field === 'aadhar') {
      if (/^\d{0,12}$/.test(value)) {
        updatedRows[index][field] = value;
      }
    } else if (field === 'mobile') {
      if (/^\d{0,10}$/.test(value)) {
        updatedRows[index][field] = value;
      }
    } else {
      updatedRows[index][field] = value;
    }

    if (field === 'dob') updatedRows[index].age = calculateAge(value);
    setRows(updatedRows);
  };

  const saveRow = (index) => {
    const row = rows[index];
    if (!row.name || !row.dob || !row.aadhar || !row.mobile || row.aadhar.length !== 12 || row.mobile.length !== 10) {
      alert('Invalid or incomplete data');
      return;
    }
    const updatedRows = [...rows];
    updatedRows[index].isNew = false;
    setRows(updatedRows);
    const filtered = updatedRows.filter(row => !row.isNew);
    localStorage.setItem('peopleList', JSON.stringify(filtered));
  };

  const deleteRow = (index) => {
    const updatedRows = [...rows];
    const row = updatedRows[index];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
    if (!row.isNew) {
      const filtered = updatedRows.filter(r => !r.isNew);
      localStorage.setItem('peopleList', JSON.stringify(filtered));
    }
  };

  const findRecord = () => {
    const saved = JSON.parse(localStorage.getItem('peopleList')) || [];
    const match = saved.find(p => p.aadhar === aadharSearch);
    setSearchResult(match || 'No Data');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="brand">Directory-Geekster</div>
        <div className="nav-btn-group">
          <button className={`nav-btn ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
            <FaUserPlus style={{ marginRight: '6px' }} /> Add New Person
          </button>
          <button className={`nav-btn ${activeTab === 'retrieve' ? 'active' : ''}`} onClick={() => setActiveTab('retrieve')}>
            🔍 Retrieve Information
          </button>
        </div>
      </nav>

      {activeTab === 'add' && (
        <section className="section-box">
          <h2 className="section-title">Add New Person</h2>
          <p className="section-subtitle">Enter personal details to add to directory</p>

          {rows.length === 0 ? (
            <div className="empty-state">
              <p className="icon">👤</p>
              <h3>No entries yet</h3>
              <p>Click the button below to add your first person</p>
              <button className="cta-btn" onClick={addRow}>+ Add New Entry</button>
            </div>
          ) : (
            <>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date of Birth</th>
                    <th>Aadhar Number</th>
                    <th>Mobile Number</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td><input value={row.name} onChange={(e) => updateField(index, 'name', e.target.value)} /></td>
                      <td><input type="date" value={row.dob} onChange={(e) => updateField(index, 'dob', e.target.value)} /></td>
                      <td><input value={row.aadhar} onChange={(e) => updateField(index, 'aadhar', e.target.value)} /></td>
                      <td><input value={row.mobile} onChange={(e) => updateField(index, 'mobile', e.target.value)} /></td>
                      <td>{row.age}</td>
                      <td>
                        <button className="save" onClick={() => saveRow(index)}>Save</button>
                        <button className="delete" onClick={() => deleteRow(index)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="cta-btn" onClick={addRow}>+ Add Another</button>
            </>
          )}
        </section>
      )}

      {activeTab === 'retrieve' && (
        <section className="section-box">
          <h2 className="section-title">Retrieve Information</h2>
          <div className="retrieve-input">
            <input placeholder="Enter Aadhar Number" value={aadharSearch} onChange={(e) => setAadharSearch(e.target.value)} />
            <button onClick={findRecord}>Find</button>
          </div>

          {searchResult === null ? null : searchResult === 'No Data' ? (
            <p className="no-data">No match found.</p>
          ) : (
            <div className="result-box">
              <p><strong>Name:</strong> {searchResult.name}</p>
              <p><strong>DOB:</strong> {searchResult.dob}</p>
              <p><strong>Aadhar:</strong> {searchResult.aadhar}</p>
              <p><strong>Mobile No:</strong> {searchResult.mobile}</p>
              <p><strong>Age:</strong> {searchResult.age}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
