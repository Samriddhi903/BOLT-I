import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type PendingInvestment = {
  _id: string;
  investorId: string;
  startupId: string;
  amount: number;
  equity: number;
  status: string;
  createdAt: string;
};

const PendingInvestment: React.FC = () => {
  const [pendingInvestments, setPendingInvestments] = useState<PendingInvestment[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState("");
  const [userRole, setUserRole] = useState<"startup" | "investor" | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("http://localhost:3001/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
          if (data.role !== 'startup') {
            navigate('/'); // Redirect non-startups
          }
        }
      } catch (error) {
        // ignore
      }
    };
    fetchUserRole();
  }, [navigate]);

  useEffect(() => {
    if (userRole !== 'startup') return;
    const fetchPendingInvestments = async () => {
      setPendingLoading(true);
      setPendingError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        // Fetch all investments for this startup
        const res = await fetch("http://localhost:3001/api/startup/pending-investments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch pending investments");
        const data = await res.json();
        setPendingInvestments(data.investments || []);
      } catch (err) {
        setPendingError("Error loading pending investments");
      } finally {
        setPendingLoading(false);
      }
    };
    fetchPendingInvestments();
  }, [userRole]);

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/investments/${id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPendingInvestments(pendingInvestments.filter(inv => inv._id !== id));
  };
  const handleReject = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/investments/${id}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPendingInvestments(pendingInvestments.filter(inv => inv._id !== id));
  };

  if (userRole !== 'startup') return null;

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8 border-b border-purple-700 pb-2">
        <button
          className={`px-4 py-2 font-semibold rounded-t-lg ${activeTab === 'pending' ? 'bg-purple-700 text-white' : 'bg-transparent text-purple-400'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Offers
        </button>
        {/* Add more tabs here if needed */}
      </div>
      {activeTab === 'pending' && (
        <>
          <h1 className="text-2xl font-bold mb-6 text-purple-400">Pending Investment Offers</h1>
          {pendingLoading ? (
            <div className="p-4 text-center">Loading pending investments...</div>
          ) : pendingError ? (
            <div className="p-4 text-center text-red-500">{pendingError}</div>
          ) : pendingInvestments.length > 0 ? (
            <ul>
              {pendingInvestments.map(inv => (
                <li key={inv._id} className="mb-4 flex items-center justify-between bg-purple-900/20 p-4 rounded-lg">
                  <div>
                    <div className="font-semibold text-white">Amount: ${inv.amount} | Equity: {inv.equity}%</div>
                    <div className="text-sm text-gray-300">Investor ID: {inv.investorId}</div>
                    <div className="text-xs text-gray-400">Offer Date: {new Date(inv.createdAt).toLocaleString()}</div>
                    <div className="text-xs text-yellow-400">Status: {inv.status}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleApprove(inv._id)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                    <button onClick={() => handleReject(inv._id)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-400">No pending investments.</div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingInvestment; 