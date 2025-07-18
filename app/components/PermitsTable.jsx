'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PermitModal from './PermitModal';

export default function PermitsTable() {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('smart_date');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    permitType: '',
    status: '',
    propertyType: ''
  });

  const fetchPermits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        sortBy,
        sortOrder,
        ...filters
      });

      const response = await fetch(`/api/permits?${params}`);
      if (!response.ok) throw new Error('Failed to fetch permits');
      
      const data = await response.json();
      setPermits(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, [pagination.page, search, sortBy, sortOrder, filters]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
  };

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

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'ASC' ? 
      <ChevronUpIcon className="w-4 h-4" /> : 
      <ChevronDownIcon className="w-4 h-4" />;
  };

  const TableHeader = ({ column, children, className = '' }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <SortIcon column={column} />
      </div>
    </th>
  );


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Legend */}
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Permit Status</h4>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Issued (Construction happening)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Pending (Applied but not issued)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Completed (Project finished)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Dead (Voided/Expired/Denied)</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Permit Codes (Top 9 for Orleans Steel)</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span><strong>RNVN:</strong> Renovation (Non-Structural)</span>
              <span><strong>SERV:</strong> Service/Electrical</span>
              <span><strong>RNVS:</strong> Renovation (Structural) ⭐</span>
              <span><strong>ACCS:</strong> Accessory Structure</span>
              <span><strong>NEWC:</strong> New Construction ⭐</span>
              <span><strong>POOL:</strong> Pool</span>
              <span><strong>DEMI:</strong> Demolition Interior</span>
              <span><strong>SAPP:</strong> Special Application</span>
              <span><strong>ROOF:</strong> Roofing</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              ⭐ = Highest value for structural steel, fencing, and roofing materials
            </p>
          </div>
        </div>
      </div>

      {/* Header with search and filters */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">New Orleans Permits</h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search permits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            {/* Filter by permit type */}
            <select
              value={filters.permitType}
              onChange={(e) => setFilters({...filters, permitType: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Permit Types</option>
              <option value="RNVN">Renovation (Non-Structural)</option>
              <option value="SERV">Service/Electrical</option>
              <option value="RNVS">Renovation (Structural)</option>
              <option value="ACCS">Accessory Structure</option>
              <option value="NEWC">New Construction</option>
              <option value="POOL">Pool</option>
              <option value="DEMI">Demolition Interior</option>
              <option value="SAPP">Special Application</option>
              <option value="ROOF">Roofing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <TableHeader column="description">Description</TableHeader>
              <TableHeader column="main_status">Status</TableHeader>
              <TableHeader column="smart_date">Date</TableHeader>
              <TableHeader column="originaladdress1">Address</TableHeader>
              <TableHeader column="permitclass">Permit Class</TableHeader>
              <TableHeader column="permittype">Code</TableHeader>
              <TableHeader column="contractorcompanyname">Contractor</TableHeader>
              <TableHeader column="property_type">Type</TableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {permits.map((permit) => (
              <tr 
                key={permit.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedPermit(permit);
                  setIsModalOpen(true);
                }}
              >
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={permit.description}>
                    {permit.description || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      permit.status_color === 'green' ? 'bg-green-500' :
                      permit.status_color === 'yellow' ? 'bg-yellow-500' :
                      permit.status_color === 'blue' ? 'bg-blue-500' :
                      permit.status_color === 'red' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium">{permit.main_status || 'Other'}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span className="font-medium">{formatDate(permit.smart_date)}</span>
                    <span className="text-xs text-gray-500">{permit.date_type}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={permit.originaladdress1}>
                    {permit.originaladdress1 || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {permit.permitclass || 'N/A'}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-blue-600">
                  {permit.permittype || 'N/A'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={permit.contractorcompanyname}>
                    {permit.contractorcompanyname || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    permit.property_type === 'Residential' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {permit.property_type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} permits
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({...pagination, page: Math.min(pagination.totalPages, pagination.page + 1)})}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <PermitModal
        permit={selectedPermit}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPermit(null);
        }}
      />
    </div>
  );
}