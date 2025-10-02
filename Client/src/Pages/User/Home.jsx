import React from 'react';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BACKEND_API;

function Home() {
  const apiCall = async () => {
    const response = await axios.post(`${BASE_URL}/api/user/`, {
      username: 'Anshif',
      password: '123',
      email: 'anshif@gmail.com',
      role: 'admin',
    });
    console.log(response?.data?.message);
  };
  return (
    <>
      <div>
        <button onClick={() => apiCall()}>Click</button>
      </div>
    </>
  );
}

export default Home;
