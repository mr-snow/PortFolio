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
    if (!id) return;
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
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {contextHolder}

      <FloatButton
        shape="circle"
        type="primary"
        style={{ insetInlineEnd: 25, insetBlockEnd: 20 }}
        icon={<FaHome />}
        onClick={() => navigate(-1)}
      />

      <div className="max-w-5xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Visitor Logs</h2>

        <div className="flex justify-end mb-4">
          <button
            onClick={deleteAllVisits}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition"
          >
            Delete All
          </button>
        </div>

        {visits.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No visits found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-700 text-gray-300 uppercase text-xs">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">IP</th>
                  <th className="p-2 text-left">Page</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v, i) => (
                  <tr
                    key={v._id}
                    className="border-t border-gray-700 hover:bg-gray-700 transition"
                  >
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{v.ip}</td>
                    <td className="p-2">{v.page}</td>
                    <td className="p-2">{new Date(v.time).toLocaleString()}</td>
                    <td className="p-2">
                      <button
                        onClick={() => deleteVisit(v._id)}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
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
    </div>
  );
};

export default VisitorView;
