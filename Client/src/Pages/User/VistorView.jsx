import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FloatButton, message, Spin } from 'antd';
import { FaHome } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import authStore from '../../Store/authStore';

const VisitorView = () => {
  const { id: routeUserId } = useParams(); // from URL
  const { userId: loggedInUserId } = authStore(); // logged-in user ID
  const activeUserId = routeUserId || loggedInUserId; // use route ID if exists

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_API;

  // Fetch visits for the user
  const fetchVisits = async id => {
    if (!id) return; // prevent undefined
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/visits/${id}`);
      setVisits(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      messageApi.error('Failed to fetch visits');
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete single visit
  const deleteVisit = async visitId => {
    if (!window.confirm('Delete this visit?')) return;
    try {
      await axios.delete(`${backendUrl}/api/visits/${activeUserId}/${visitId}`);
      messageApi.success('Visit deleted');
      fetchVisits(activeUserId);
    } catch (err) {
      console.error(err);
      messageApi.error('Failed to delete visit');
    }
  };

  // Delete all visits
  const deleteAllVisits = async () => {
    if (!window.confirm('Delete ALL visits?')) return;
    try {
      await axios.delete(`${backendUrl}/api/visits/${activeUserId}`);
      messageApi.success('All visits deleted');
      fetchVisits(activeUserId);
    } catch (err) {
      console.error(err);
      messageApi.error('Failed to delete all visits');
    }
  };

  useEffect(() => {
    fetchVisits(activeUserId);
  }, [activeUserId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {contextHolder}

      <FloatButton
        shape="circle"
        type="primary"
        style={{ insetInlineEnd: 25, insetBlockEnd: 20 }}
        icon={<FaHome />}
        onClick={() => navigate(-1)}
      />

      <h2 className="text-2xl font-bold mb-4">Visitor Logs</h2>

      <button
        onClick={deleteAllVisits}
        className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Delete All
      </button>

      {visits.length === 0 ? (
        <p>No visits found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border px-2 py-1">IP</th>
                <th className="border px-2 py-1">Page</th>
                <th className="border px-2 py-1">Time</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {visits.map(v => (
                <tr key={v._id} className="bg-gray-100 hover:bg-gray-200">
                  <td className="border px-2 py-1">{v.ip}</td>
                  <td className="border px-2 py-1">{v.page}</td>
                  <td className="border px-2 py-1">
                    {new Date(v.time).toLocaleString()}
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => deleteVisit(v._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VisitorView;
