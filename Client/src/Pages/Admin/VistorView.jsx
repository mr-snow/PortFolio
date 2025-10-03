import React, { useEffect, useState } from "react";
import axios from "axios";

const VisitorView = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_API;

  // Fetch all visitors
  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/visits`);
      setVisitors(res.data);
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Delete a single visitor
  const deleteVisitor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this visitor?")) return;
    try {
      await axios.delete(`${backendUrl}/api/visits/${id}`);
      fetchVisitors();
    } catch (err) {
      console.error("Failed to delete visitor:", err);
    }
  };

  // Delete all visitors
  const deleteAllVisitors = async () => {
    if (!window.confirm("Are you sure you want to delete ALL visitors?")) return;
    try {
      await axios.delete(`${backendUrl}/api/visits`);
      fetchVisitors();
    } catch (err) {
      console.error("Failed to delete all visitors:", err);
    }
  };

  if (loading) return <div className="p-4">Loading visitors...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Visitor Logs</h2>

      {visitors.length === 0 ? (
        <p>No visitors found.</p>
      ) : (
        <>
          <button
            onClick={deleteAllVisitors}
            className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Delete All Visitors
          </button>

          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-700 text-gray-200">
                <th className="border px-2 py-1">IP</th>
                <th className="border px-2 py-1">User Agent</th>
                <th className="border px-2 py-1">Page</th>
                <th className="border px-2 py-1">Time</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v._id} className="bg-gray-800 text-gray-100">
                  <td className="border px-2 py-1">{v.ip}</td>
                  <td className="border px-2 py-1">
                    {v.userAgent.length > 40
                      ? v.userAgent.slice(0, 40) + "..."
                      : v.userAgent}
                  </td>
                  <td className="border px-2 py-1">{v.page}</td>
                  <td className="border px-2 py-1">
                    {new Date(v.time).toLocaleString()}
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => deleteVisitor(v._id)}
                      className="px-2 py-1 bg-red-500 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default VisitorView;
