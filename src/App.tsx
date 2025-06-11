import React, { useState } from 'react';
import { User, Search, Plus, Save, Trash2, UserPlus, Database } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  dateOfBirth: string;
  aadharNumber: string;
  mobileNumber: string;
  age: string;
}

interface TableRow extends Person {
  isEditing: boolean;
  isSaved: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState<'add' | 'retrieve'>('add');
  const [rows, setRows] = useState<TableRow[]>([]);
  const [searchAadhar, setSearchAadhar] = useState('');
  const [searchResult, setSearchResult] = useState<Person | null>(null);
  const [searchMessage, setSearchMessage] = useState('');

  // Calculate age from date of birth
  const calculateAge = (dob: string): string => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Add new row
  const addNewRow = () => {
    const newRow: TableRow = {
      id: Date.now().toString(),
      name: '',
      dateOfBirth: '',
      aadharNumber: '',
      mobileNumber: '',
      age: '',
      isEditing: true,
      isSaved: false
    };
    setRows([...rows, newRow]);
  };

  // Update row data
  const updateRow = (id: string, field: keyof Person, value: string) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        if (field === 'dateOfBirth') {
          updatedRow.age = calculateAge(value);
        }
        return updatedRow;
      }
      return row;
    }));
  };

  // Validate row data
  const validateRow = (row: TableRow): boolean => {
    if (!row.name.trim() || !row.dateOfBirth || !row.aadharNumber || !row.mobileNumber) {
      alert('Please fill all fields');
      return false;
    }
    if (row.aadharNumber.length !== 12 || !/^\d{12}$/.test(row.aadharNumber)) {
      alert('Aadhar Number should be exactly 12 digits');
      return false;
    }
    if (row.mobileNumber.length !== 10 || !/^\d{10}$/.test(row.mobileNumber)) {
      alert('Mobile Number should be exactly 10 digits');
      return false;
    }
    return true;
  };

  // Save row to localStorage
  const saveRow = (id: string) => {
    const row = rows.find(r => r.id === id);
    if (!row || !validateRow(row)) return;

    // Get existing data from localStorage
    const existingData = JSON.parse(localStorage.getItem('directoryData') || '[]');
    
    // Check if person already exists
    const existingIndex = existingData.findIndex((person: Person) => person.aadharNumber === row.aadharNumber);
    
    const personData: Person = {
      id: row.id,
      name: row.name,
      dateOfBirth: row.dateOfBirth,
      aadharNumber: row.aadharNumber,
      mobileNumber: row.mobileNumber,
      age: row.age
    };

    if (existingIndex >= 0) {
      existingData[existingIndex] = personData;
    } else {
      existingData.push(personData);
    }

    localStorage.setItem('directoryData', JSON.stringify(existingData));

    // Update row state
    setRows(rows.map(r => r.id === id ? { ...r, isSaved: true, isEditing: false } : r));
    alert('Data saved successfully!');
  };

  // Delete row
  const deleteRow = (id: string) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;

    if (row.isSaved) {
      // Remove from localStorage
      const existingData = JSON.parse(localStorage.getItem('directoryData') || '[]');
      const updatedData = existingData.filter((person: Person) => person.aadharNumber !== row.aadharNumber);
      localStorage.setItem('directoryData', JSON.stringify(updatedData));
    }

    // Remove from table
    setRows(rows.filter(r => r.id !== id));
  };

  // Search person by Aadhar
  const searchPerson = () => {
    if (!searchAadhar.trim()) {
      alert('Please enter Aadhar Number');
      return;
    }

    if (searchAadhar.length !== 12 || !/^\d{12}$/.test(searchAadhar)) {
      alert('Please enter a valid 12-digit Aadhar Number');
      return;
    }

    const existingData = JSON.parse(localStorage.getItem('directoryData') || '[]');
    const person = existingData.find((p: Person) => p.aadharNumber === searchAadhar);

    if (person) {
      setSearchResult(person);
      setSearchMessage('');
    } else {
      setSearchResult(null);
      setSearchMessage('No match found');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Directory</h1>
              <p className="text-sm text-slate-500">Manage personal information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'add'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Person
            </button>
            <button
              onClick={() => setActiveTab('retrieve')}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'retrieve'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 mr-2" />
              Retrieve Information
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'add' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Add New Person</h2>
                  <p className="text-sm text-slate-500">Enter personal details to add to directory</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {rows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 font-medium text-slate-700">Name</th>
                        <th className="text-left py-4 px-4 font-medium text-slate-700">Date of Birth</th>
                        <th className="text-left py-4 px-4 font-medium text-slate-700">Aadhar Number</th>
                        <th className="text-left py-4 px-4 font-medium text-slate-700">Mobile Number</th>
                        <th className="text-left py-4 px-4 font-medium text-slate-700">Age</th>
                        <th className="text-left py-4 px-4 font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={row.id} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                          <td className="py-4 px-4">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                              disabled={!row.isEditing}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                              placeholder="Enter full name"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="date"
                              value={row.dateOfBirth}
                              onChange={(e) => updateRow(row.id, 'dateOfBirth', e.target.value)}
                              disabled={!row.isEditing}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="text"
                              value={row.aadharNumber}
                              onChange={(e) => updateRow(row.id, 'aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                              disabled={!row.isEditing}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                              placeholder="12 digit number"
                              maxLength={12}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="text"
                              value={row.mobileNumber}
                              onChange={(e) => updateRow(row.id, 'mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                              disabled={!row.isEditing}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                              placeholder="10 digit number"
                              maxLength={10}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                              {row.age || 'Auto calculated'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveRow(row.id)}
                                disabled={row.isSaved}
                                className="flex items-center px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </button>
                              <button
                                onClick={() => deleteRow(row.id)}
                                className="flex items-center px-3 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-sm font-medium transition-colors"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No entries yet</h3>
                  <p className="text-slate-500 mb-6">Click the button below to add your first person</p>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <button
                  onClick={addNewRow}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 font-medium shadow-lg shadow-indigo-500/25 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Entry
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Retrieve Information</h2>
                  <p className="text-sm text-slate-500">Search for a person using their Aadhar number</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="max-w-md mx-auto">
                <div className="flex space-x-4 mb-8">
                  <input
                    type="text"
                    value={searchAadhar}
                    onChange={(e) => setSearchAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength={12}
                  />
                  <button
                    onClick={searchPerson}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 font-medium shadow-lg shadow-indigo-500/25 transition-all duration-200"
                  >
                    Find
                  </button>
                </div>
              </div>

              {searchResult && (
                <div className="max-w-md mx-auto">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Person Found</h3>
                        <p className="text-sm text-slate-500">Details retrieved successfully</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="font-medium text-slate-700">Name</span>
                        <span className="text-slate-900">{searchResult.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="font-medium text-slate-700">Date of Birth</span>
                        <span className="text-slate-900">{searchResult.dateOfBirth}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="font-medium text-slate-700">Aadhar Number</span>
                        <span className="text-slate-900 font-mono">{searchResult.aadharNumber}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="font-medium text-slate-700">Mobile Number</span>
                        <span className="text-slate-900 font-mono">{searchResult.mobileNumber}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-slate-700">Age</span>
                        <span className="text-slate-900">{searchResult.age} years</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {searchMessage && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-400 mb-2">No Data</h3>
                  <p className="text-slate-500">{searchMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;