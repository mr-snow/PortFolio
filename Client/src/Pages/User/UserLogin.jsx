import React, { useState } from 'react';
import { Button, Form, Input, message, FloatButton, Typography } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { userLoginHook } from '../../Hooks/userHook';
import { useNavigate } from 'react-router-dom';
import authStore from '../../Store/authStore';
import { FaHome } from 'react-icons/fa';

const { Title } = Typography;

function UserLogin() {
  const [login, setLogin] = useState(true);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { setUserId, setToken } = authStore();

  const { mutate: userLogin } = useMutation({
    mutationFn: async (data) => {
      const response = await userLoginHook(data, login);
      return response?.data;
    },
    onSuccess: (data) => {
      setToken(data?.token);
      setUserId(data?.data?.id);
      if (login) {
        messageApi.success('Login successful');
        navigate('/user/dashboard');
      } else {
        setLogin(true);
        messageApi.success('User SignUp successful, Please Login');
      }
    },
    onError: (error) => {
      messageApi.error(error?.response?.data?.message || error.message);
    },
  });

  const onFinish = (data) => userLogin(data);
  const toggleLogin = () => setLogin((prev) => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      {contextHolder}

      <FloatButton
        shape="circle"
        type="primary"
        style={{ insetInlineEnd: 25, insetBlockEnd: 20 }}
        icon={<FaHome />}
        onClick={() => navigate('/')}
      />

      <div className="bg-gray-800 rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Title level={2} className="!text-green-600 mb-1">
            {login ? 'Login' : 'Sign Up'}
          </Title>
          <p className="text-gray-400">
            {login
              ? 'Enter your credentials to access your account'
              : 'Create a new account to get started'}
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-6"
          
        >
          <Form.Item
            label={<span className="text-gray-200">Email</span>}
            name="email"
            rules={[{ required: true, message: 'Email is required' }]}
          >
            <Input
              placeholder="Enter your email"
              className="bg-gray-700 text-white border-gray-600 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-200">Password</span>}
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              placeholder="Enter your password"
              className="bg-gray-700 text-white border-gray-600 rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full py-2 rounded-xl text-lg bg-green-600 hover:bg-green-700"
            >
              {login ? 'Login' : 'Sign Up'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Button
            type="link"
            onClick={toggleLogin}
            className="text-green-400 hover:text-green-300"
          >
            {login
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Login'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
