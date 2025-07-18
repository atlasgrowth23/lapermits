'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function PermitModal({ permit, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [addressHistory, setAddressHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [permitTabs, setPermitTabs] = useState([]);
  const [permitDetails, setPermitDetails] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getStatusColor = (statusColor) => {
    switch(statusColor) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'blue': return 'bg-blue-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const fetchAddressHistory = async () => {
    if (!permit?.id) return;
    
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/permits/${permit.id}/address-history`);
      if (response.ok) {
        const data = await response.json();
        setAddressHistory(data);
      }
    } catch (error) {
      console.error('Error fetching address history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchPermitDetails = async (permitId) => {
    if (permitDetails[permitId]) return permitDetails[permitId];
    
    try {
      const response = await fetch(`/api/permits/${permitId}`);
      if (response.ok) {
        const data = await response.json();
        setPermitDetails(prev => ({ ...prev, [permitId]: data }));
        return data;
      }
    } catch (error) {
      console.error('Error fetching permit details:', error);
    }
    return null;
  };

  const openPermitTab = async (historyPermit) => {
    const tabId = `permit-${historyPermit.id}`;
    
    // Don't open if already open
    if (permitTabs.find(tab => tab.id === tabId)) {
      setActiveTab(tabId);
      return;
    }
    
    // Add new tab
    const newTab = {
      id: tabId,
      label: historyPermit.permitnum,
      permit: historyPermit,
      closeable: true
    };
    
    setPermitTabs(prev => [...prev, newTab]);
    setActiveTab(tabId);
    
    // Fetch full details for this permit
    await fetchPermitDetails(historyPermit.id);
  };

  const closePermitTab = (tabId) => {
    setPermitTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTab === tabId) {
      setActiveTab('overview');
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'address-history') {
      fetchAddressHistory();
    }
  }, [isOpen, activeTab, permit?.id]);

  // Reset tabs when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPermitTabs([]);
      setActiveTab('overview');
    }
  }, [isOpen, permit?.id]);

  if (!isOpen || !permit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{permit.permitnum}</h2>
            <p className="text-sm text-gray-600">{permit.originaladdress1}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('address-history')}
              className={`py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'address-history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Address History
            </button>
            {permitTabs.map((tab) => (
              <div key={tab.id} className="flex items-center">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
                {tab.closeable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closePermitTab(tab.id);
                    }}
                    className="ml-1 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Permit Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(permit.status_color)}`}></div>
                      <span className="font-medium">{permit.main_status}</span>
                    </div>
                    <p><span className="font-medium">Applied:</span> {formatDate(permit.applieddate)}</p>
                    <p><span className="font-medium">Issued:</span> {formatDate(permit.issuedate)}</p>
                    <p><span className="font-medium">Completed:</span> {formatDate(permit.completedate)}</p>
                    <p><span className="font-medium">Current Status:</span> {permit.statuscurrent}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Project Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Permit Type:</span> {permit.permittype}</p>
                    <p><span className="font-medium">Work Class:</span> {permit.workclass || 'N/A'}</p>
                    <p><span className="font-medium">Permit Class:</span> {permit.permitclass || 'N/A'}</p>
                    <p><span className="font-medium">Property Type:</span> {permit.property_type}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {permit.description || 'No description available'}
                </p>
              </div>

              {/* Address and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Address</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Street:</span> {permit.originaladdress1}</p>
                    <p><span className="font-medium">City:</span> {permit.originalcity}</p>
                    <p><span className="font-medium">State:</span> {permit.originalstate}</p>
                    <p><span className="font-medium">ZIP:</span> {permit.originalzip}</p>
                    <p><span className="font-medium">PIN:</span> {permit.pin || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Financial</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Project Cost:</span> {formatCurrency(permit.estprojectcost)}</p>
                    <p><span className="font-medium">Permit Fee:</span> {formatCurrency(permit.fee)}</p>
                    <p><span className="font-medium">Square Footage:</span> {formatNumber(permit.totalsqft)}</p>
                  </div>
                </div>
              </div>

              {/* Contractor Info */}
              {permit.contractorcompanyname && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Contractor Information</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p><span className="font-medium">Company:</span> {permit.contractorcompanyname}</p>
                    <p><span className="font-medium">Trade:</span> {permit.contractortrade || 'N/A'}</p>
                    <p><span className="font-medium">License:</span> {permit.contractorlicnum || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'address-history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                All Permits at {permit.originaladdress1}
              </h3>
              
              {loadingHistory ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : addressHistory.length > 0 ? (
                <div className="space-y-4">
                  {addressHistory.map((historyPermit, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => openPermitTab(historyPermit)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-blue-600 hover:text-blue-800">{historyPermit.permitnum}</span>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              {historyPermit.permittype}
                            </span>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(historyPermit.status_color)}`}></div>
                              <span className="text-sm text-gray-600">{historyPermit.statuscurrent}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {historyPermit.description?.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Applied: {formatDate(historyPermit.applieddate)}</span>
                            {historyPermit.issuedate && (
                              <span>Issued: {formatDate(historyPermit.issuedate)}</span>
                            )}
                            {historyPermit.contractorcompanyname && (
                              <span>Contractor: {historyPermit.contractorcompanyname}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-400 text-xs ml-4">
                          Click to view details
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No other permits found at this address.</p>
              )}
            </div>
          )}

          {/* Individual Permit Tabs */}
          {permitTabs.map((tab) => {
            if (activeTab !== tab.id) return null;
            
            const tabPermit = tab.permit;
            
            return (
              <div key={tab.id} className="space-y-6">
                {/* Status and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Permit Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(tabPermit.status_color)}`}></div>
                        <span className="font-medium">{tabPermit.main_status}</span>
                      </div>
                      <p><span className="font-medium">Applied:</span> {formatDate(tabPermit.applieddate)}</p>
                      <p><span className="font-medium">Issued:</span> {formatDate(tabPermit.issuedate)}</p>
                      <p><span className="font-medium">Completed:</span> {formatDate(tabPermit.completedate)}</p>
                      <p><span className="font-medium">Current Status:</span> {tabPermit.statuscurrent}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Project Details</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Permit Type:</span> {tabPermit.permittype}</p>
                      <p><span className="font-medium">Work Class:</span> {tabPermit.workclass || 'N/A'}</p>
                      <p><span className="font-medium">Permit Class:</span> {tabPermit.permitclass || 'N/A'}</p>
                      <p><span className="font-medium">Property Type:</span> {tabPermit.property_type}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {tabPermit.description || 'No description available'}
                  </p>
                </div>

                {/* Address and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Address</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Street:</span> {tabPermit.originaladdress1}</p>
                      <p><span className="font-medium">City:</span> {tabPermit.originalcity}</p>
                      <p><span className="font-medium">State:</span> {tabPermit.originalstate}</p>
                      <p><span className="font-medium">ZIP:</span> {tabPermit.originalzip}</p>
                      <p><span className="font-medium">PIN:</span> {tabPermit.pin || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Financial</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Project Cost:</span> {formatCurrency(tabPermit.estprojectcost)}</p>
                      <p><span className="font-medium">Permit Fee:</span> {formatCurrency(tabPermit.fee)}</p>
                      <p><span className="font-medium">Square Footage:</span> {formatNumber(tabPermit.totalsqft)}</p>
                    </div>
                  </div>
                </div>

                {/* Contractor Info */}
                {tabPermit.contractorcompanyname && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Contractor Information</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p><span className="font-medium">Company:</span> {tabPermit.contractorcompanyname}</p>
                      <p><span className="font-medium">Trade:</span> {tabPermit.contractortrade || 'N/A'}</p>
                      <p><span className="font-medium">License:</span> {tabPermit.contractorlicnum || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}