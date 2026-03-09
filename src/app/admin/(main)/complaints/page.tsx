"use client";

import { useState, useEffect } from 'react';
import {
  Search,
  AlertCircle,
  X,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Package,
  User,
  Trash2,
} from 'lucide-react';

type Complaint = {
  id: string;
  fullName: string;
  address: string;
  primaryContactNumber: string;
  alternateContactNumber?: string;
  brand: string;
  category: string;
  problemDescription: string;
  images: string[];
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ComplaintsPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch complaints on mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/getAllComplaints");
      const data = await res.json();
      console.log('Complaints data:', data);
      
      if (data.success) {
        setComplaints(data.complaints);
      } else {
        console.error("Failed to fetch complaints:", data.message);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (complaintId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/updateComplaintStatus`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintId,
          isComplete: !currentStatus,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local state
        setComplaints(prev =>
          prev.map(c =>
            c.id === complaintId ? { ...c, isComplete: !currentStatus } : c
          )
        );
        
        if (selectedComplaint && selectedComplaint.id === complaintId) {
          setSelectedComplaint({ ...selectedComplaint, isComplete: !currentStatus });
        }
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating complaint status:", error);
      alert("Failed to update status");
    }
  };

  const openDeleteModal = (complaint: Complaint) => {
    setComplaintToDelete(complaint);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setComplaintToDelete(null);
  };

  const handleDeleteComplaint = async () => {
    if (!complaintToDelete) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/deleteComplaint`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintId: complaintToDelete.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Remove complaint from local state
        setComplaints(prev => prev.filter(c => c.id !== complaintToDelete.id));
        
        // Close modals if the deleted complaint was being viewed
        if (selectedComplaint && selectedComplaint.id === complaintToDelete.id) {
          setShowDetailModal(false);
          setSelectedComplaint(null);
        }
        
        closeDeleteModal();
      } else {
        alert(data.message || "Failed to delete complaint");
      }
    } catch (error) {
      console.error("Error deleting complaint:", error);
      alert("Failed to delete complaint");
    } finally {
      setDeleting(false);
    }
  };

  const viewComplaintDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  // Filtered complaints
  const filteredComplaints = complaints.filter(c =>
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.primaryContactNumber.includes(searchTerm)
  );

  const pendingCount = complaints.filter(c => !c.isComplete).length;
  const completedCount = complaints.filter(c => c.isComplete).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
            <p className="text-gray-600">Manage customer service requests</p>
          </div>
        </div>

        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, category, brand, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold">{complaints.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-900" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-900" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-900" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold">
                {complaints.filter(c => {
                  const today = new Date().toDateString();
                  const complaintDate = new Date(c.createdAt).toDateString();
                  return today === complaintDate;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Customer Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Appliance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Problem
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="inline-block w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500">Loading complaints...</p>
                    </td>
                  </tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        No complaints found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map(complaint => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="w-5 h-5 text-blue-900" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{complaint.fullName}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {complaint.address.substring(0, 30)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {complaint.primaryContactNumber}
                          </p>
                          {complaint.alternateContactNumber && (
                            <p className="text-xs text-gray-500">
                              Alt: {complaint.alternateContactNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{complaint.brand}</p>
                          <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded-full text-xs">
                            {complaint.category}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                          {complaint.problemDescription}
                        </p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(complaint.id, complaint.isComplete)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            complaint.isComplete
                              ? 'bg-green-100 text-green-900 hover:bg-green-200'
                              : 'bg-orange-100 text-orange-900 hover:bg-orange-200'
                          }`}
                        >
                          {complaint.isComplete ? 'Completed' : 'Pending'}
                        </button>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewComplaintDetails(complaint)}
                            className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openDeleteModal(complaint)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Delete complaint"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold">Complaint Details</h2>
                <p className="text-blue-100 text-sm mt-1">
                  ID: {selectedComplaint.id}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Status Badge and Actions */}
              <div className="flex items-center justify-between">
                <div className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                  selectedComplaint.isComplete
                    ? 'bg-green-100 text-green-900'
                    : 'bg-orange-100 text-orange-900'
                }`}>
                  {selectedComplaint.isComplete ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                  {selectedComplaint.isComplete ? 'Completed' : 'Pending'}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(selectedComplaint.id, selectedComplaint.isComplete)}
                    className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
                  >
                    Mark as {selectedComplaint.isComplete ? 'Pending' : 'Completed'}
                  </button>
                  <button
                    onClick={() => openDeleteModal(selectedComplaint)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="font-medium text-gray-900">{selectedComplaint.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Primary Contact</p>
                    <p className="font-medium text-gray-900">{selectedComplaint.primaryContactNumber}</p>
                  </div>
                  {selectedComplaint.alternateContactNumber && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Alternate Contact</p>
                      <p className="font-medium text-gray-900">{selectedComplaint.alternateContactNumber}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="font-medium text-gray-900">{selectedComplaint.address}</p>
                  </div>
                </div>
              </div>

              {/* Appliance Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Appliance Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Brand</p>
                    <p className="font-medium text-gray-900">{selectedComplaint.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-medium text-gray-900">{selectedComplaint.category}</p>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Problem Description
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.problemDescription}
                </p>
              </div>

              {/* Images */}
              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Uploaded Images ({selectedComplaint.images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedComplaint.images.map((img, index) => (
                      <a
                        key={index}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition"
                      >
                        <img
                          src={img}
                          alt={`Complaint ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <p className="text-white text-sm font-medium">View Full Size</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Complaint Created</p>
                      <p className="text-xs text-gray-600">
                        {new Date(selectedComplaint.createdAt).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-600">
                        {new Date(selectedComplaint.updatedAt).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && complaintToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Delete Complaint
              </h2>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this complaint from{' '}
                <span className="font-semibold text-gray-900">{complaintToDelete.fullName}</span>?
                This action cannot be undone.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium text-gray-900">{complaintToDelete.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium text-gray-900">{complaintToDelete.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900">{complaintToDelete.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(complaintToDelete.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteComplaint}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Complaint
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}