import React, { useEffect, useState } from "react";
import axios from "axios";
import { FloatButton, message, Spin } from "antd";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminVisitorView = () => {
  const [visitors, setVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_API;
  const adminId = import.meta.env.VITE_DEFAULT_USER_ID; // from .env

  // --- Fetch my visitors ---
  const fetchVisitors = async () => {
    try {
      setLoadingVisitors(true);
      const res = await axios.get(`${backendUrl}/api/visits/${adminId}`);
      setVisitors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to fetch visitors");
      setVisitors([]);
    } finally {
      setLoadingVisitors(false);
    }
  };

  // --- Delete single visitor ---
  const deleteVisitor = async (visitorId) => {
    if (!window.confirm("Delete this visitor?")) return;
    try {
      await axios.delete(`${backendUrl}/api/visits/${adminId}/${visitorId}`);
      messageApi.success("Visitor deleted");
      fetchVisitors();
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to delete visitor");
    }
  };

  // --- Delete all visitors ---
  const deleteAllVisitors = async () => {
    if (!window.confirm("Delete ALL visitors?")) return;
    try {
      await axios.delete(`${backendUrl}/api/visits/${adminId}`);
      messageApi.success("All visitors deleted");
      fetchVisitors();
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to delete all visitors");
    }
  };

  // --- Fetch all users ---
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get(`${backendUrl}/api/user`);
      const userList = Array.isArray(res.data.data) ? res.data.data : [];
      setUsers(userList);
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // --- Delete a user ---
  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${backendUrl}/api/user/${userId}`);
      messageApi.success("User deleted");
      fetchUsers();
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchVisitors();
    fetchUsers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100 bg-gray-900 min-h-screen rounded-2xl shadow-lg">
      {contextHolder}

      <FloatButton
        shape="circle"
        type="primary"
        style={{ insetInlineEnd: 25 }}
        icon={<FaHome />}
        onClick={() => navigate(-1)}
      />

      {/* --- Section 1: My Visitors --- */}
      <h2 className="text-3xl font-bold mb-4">My Visitors</h2>
      <div className="mb-4 flex justify-end">
        <button
          onClick={deleteAllVisitors}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition"
        >
          Delete All My Visitors
        </button>
      </div>

      {loadingVisitors ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : visitors.length > 0 ? (
        <table className="w-full border-collapse border mb-10">
          <thead>
            <tr className="bg-gray-800 text-gray-300 uppercase text-xs">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">IP</th>
              <th className="p-2 text-left">Page</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v, i) => (
              <tr key={v._id} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{v.ip}</td>
                <td className="p-2">{v.page}</td>
                <td className="p-2">{new Date(v.time).toLocaleString()}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteVisitor(v._id)}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-400 py-10">
          No visitors found for my portfolio.
        </p>
      )}

      {/* --- Section 2: Users List --- */}
      <h2 className="text-3xl font-bold mb-4">Users List</h2>
      {loadingUsers ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : users.length > 0 ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-800 text-gray-300 uppercase text-xs">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u._id} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.name || "-"}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-400 py-10">No users found.</p>
      )}
    </div>
  );
};

export default AdminVisitorView;
