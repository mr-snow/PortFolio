import React, { useState } from 'react';
import { Button, Form, Input, message, FloatButton } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { userLoginHook } from '../../Hooks/userHook';
import { useNavigate } from 'react-router-dom';
import authStore from '../../Store/authStore';
import { FaHome } from 'react-icons/fa';

function UserLogin() {
  const [login, setLogin] = useState(true);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { setUserId, setToken } = authStore();

  const { mutate: userLogin } = useMutation({
    mutationFn: async data => {
      const response = await userLoginHook(data, login);
      return response?.data;
    },
    onSuccess: data => {
      setToken(data?.token);
      setUserId(data?.data?.id);
      if (login) {
        messageApi.success('Login successful');

        navigate('/user/dashboard');
      } else {
        setLogin(true);
        messageApi.success('User SignUP successful , Please Login ');
      }
    },
    onError: error => {
      messageApi.error(error?.response?.data?.message || error.message);
    },
  });

  const onFinish = async data => {
    userLogin(data);
  };

  const changeSign = () => {
    setLogin(prev => (prev === true ? false : true));
  };

  return (
    <div className="bg-green-30 h-screen w-screen flex justify-center items-center">
      {contextHolder}

      <FloatButton
        shape="circle"
        type="primary"
        style={{ insetInlineEnd: 25, insetBlockEnd: 20 }}
        icon={<FaHome />}
        onClick={() => navigate(-1)}
      />

      <Form
        className="shadow-2xl !p-5 flex justify-center gap-2"
        layout="inline"
        onFinish={onFinish}
        form={form}
        style={{ maxWidth: 350 }}
      >
        <div className=" w-full  text-center text-xl py-2">
          <h1 className="text-[2rem]">User</h1>
        </div>
        <Form.Item
          name={'email'}
          label="Email"
          rules={[{ required: true, message: 'email required' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name={'password'}
          label="Password"
          rules={[{ required: true, message: 'Password required' }]}
        >
          <Input.Password></Input.Password>
        </Form.Item>

        <div className="flex  w-full  items-center justify-center gap-1 ">
          <Button type="primary" htmlType="submit">
            {login ? 'Login' : 'SignUp'}{' '}
          </Button>
          <Button type="text" onClick={() => changeSign()}>
            {login ? 'SignUp' : 'Login'}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default UserLogin;
