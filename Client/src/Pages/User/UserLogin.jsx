import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { userLoginHook } from '../../Hooks/userHook';
import { useNavigate } from 'react-router-dom';
import authStore from '../../Store/authStore';

function UserLogin() {
  const [login, setLogin] = useState(true);
  const [form] = Form.useForm();
  const [contextHolder, messageApi] = message.useMessage();
  const navigate = useNavigate();
  const { setUserId } = authStore();

  const { mutate: userLogin } = useMutation({
    mutationFn: async data => {
      const response = await userLoginHook(data, login);
      return response?.data?.data;
    },
    onSuccess: data => {
      const id = data[0]?._id;
      setUserId(id);
      navigate('/user/dashboard');
    },
    onError: error => {
      console.log('onError', error.message);
    },
  });

  const onFinish = async data => {
    console.log('form data ', data);
    userLogin(data);
  };

  const changeSign = () => {
    setLogin(prev => (prev === true ? false : true));
  };

  return (
    <div className="bg-green-30 h-screen w-screen flex justify-center items-center">
      {/* {contextHolder} */}
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
