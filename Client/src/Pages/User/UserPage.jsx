import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Upload } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteUserHook,
  getUserHook,
  updateUserHook,
} from '../../Hooks/userHook';
import { useTheme } from '../../Context/themContext';
import { useNavigate } from 'react-router-dom';
import authStore from '../../Store/authStore';
import DeleteIcon from '../../assets/icons/del';
import { FaTrash } from 'react-icons/fa';

function UserPage() {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});
  const queryclient = useQueryClient();
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  const [contextHolder, messageApi] = message.useMessage();
  const { userId, removeUserId } = authStore();

  const onFinish = async data => {
    const mulData = new FormData();
    if (data?.email) mulData.append('email', data?.email);
    if (data?.password) mulData.append('password', data?.password);
    if (data?.username) mulData.append('username', data?.username);
    if (data?.role) mulData.append('role', data?.role);
    if (data?.image) mulData.append('image', data?.image[0]?.originFileObj);

    console.log('form data ', data);
    console.log('mul data ', mulData);
    setFormData(mulData);
    updateUser(mulData);
  };

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      try {
        const response = await getUserHook(userId);
        return response?.data?.data;
      } catch (error) {
        console.log(
          'qery error',
          error?.response?.data?.message || error.message
        );
        throw new Error(error.message);
      }
    },
    retry: false,
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: async id => {
      const response = await deleteUserHook(id);
      return response?.data;
    },
    onSuccess: data => {
      console.log('user delete ', data);
      queryclient.invalidateQueries(['users']);
    },
    onError: error => {
      console.log('onError', error.message);
    },
  });

  const { mutate: updateUser } = useMutation({
    mutationFn: async postData => {
      const response = await updateUserHook(postData, userId);
      return response?.data;
    },
    onSuccess: data => {
      console.log('user update ', data);
      queryclient.invalidateQueries(['users', 'user']);
    },
    onError: error => {
      console.log('onError', error.message);
    },
  });

  useEffect(() => {
    if (!userId) {
      alert('Id is required .. !');
      navigate('/user');
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      console.log('user', user);

      const hasValidImage =
        user.image && user.image !== 'undefined' && user.image.trim() !== '';

      form.setFieldsValue({
        role: user?.role,
        email: user?.email,
        password: user?.password,
        username: user?.username,
        image: hasValidImage
          ? [
              {
                uid: '-1',
                name: user?.image,
                status: 'done',
                url: `${import.meta.env.VITE_BACKEND_API}/public/${
                  user?.image
                }`,
              },
            ]
          : [],
      });
    }
  }, [user, form]);

  return (
    <>
      <div className=" w-screen h-screen flex flex-col  overflow-y-auto bg-[var(--primary-color)] text-[var(--primary-text)] ">
        <div className="flex-none h-10 data-theme flex justify-between px-5 items-center py-2 shadow-inner">
          <div className=" flex-1 text-center">
            {' '}
            <h1 className="text-2xl">User Panel </h1>
          </div>
          <Button
            style={{ backgroundColor: 'yellow' }}
            onClick={() => {
              removeUserId();
              navigate('/');
            }}
          >
            Logout
          </Button>
        </div>

        <div className=" flex-1 p-2  min-h-100 flex flex-row gap-2  overflow-y-auto">
          <div className="bg-red-200 flex justify-center items-start p-2  ">
            <Form
              className="shadow-2xl   relative  rounded-2xl !p-5 flex items-center juc   gap-2 flex-1"
              layout="inline"
              onFinish={onFinish}
              form={form}
              initialValues={{
                id: userId,
              }}
            >
              <Button
                danger
                // icon={<img src={deleteIcon} alt="delete" className="w-4 h-4" />}
                icon={<DeleteIcon size={'1.2rem'} color="white" />}
                type="primary"
                className="ml-4 absolute"
                onClick={() => deleteUser(userId)}
              ></Button>

              <Form.Item name={'id'} label="Id" className="custom-item">
                <Input
                  className="custom-input"
                  placeholder="Enter Id"
                  disabled
                ></Input>
              </Form.Item>

              <Form.Item name={'email'} label="Email" className="custom-item">
                <Input className="custom-input"></Input>
              </Form.Item>
              <Form.Item
                name={'password'}
                label="Password"
                className="custom-item"
              >
                <Input.Password
                  placeholder={'Change your Password'}
                  className="custom-input"
                ></Input.Password>
              </Form.Item>

              <Form.Item name={'role'} label="Role" className="custom-item">
                <Input className="custom-input"></Input>
              </Form.Item>

              <Form.Item
                name={'username'}
                label="Username"
                className="custom-item"
              >
                <Input
                  className="custom-input"
                  placeholder="Enter username"
                ></Input>
              </Form.Item>

              <Form.Item
                name={'image'}
                label="Image"
                className="custom-item"
                valuePropName="fileList"
                getValueFromEvent={e =>
                  Array.isArray(e) ? e : e && e.fileList
                }
              >
                <Upload
                  listType="picture"
                  accept="image/*"
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  <Button>click Image </Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserPage;
