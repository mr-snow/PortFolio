import React, { useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Upload,
  Space,
  message,
  Select,
  DatePicker,
  Checkbox,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUserHook,
  updateUserHook,
  deleteUserHook,
} from '../../Hooks/userHook';
import { useNavigate } from 'react-router-dom';
import authStore from '../../Store/authStore';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

function UserPage() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId, removeUserId } = authStore();
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch user
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await getUserHook(userId);
      return res?.data?.data;
    },
    enabled: !!userId,
  });

  // Update mutation
  const { mutate: updateUser } = useMutation({
    mutationFn: async formData => await updateUserHook(formData, userId),
    onSuccess: () => {
      messageApi.success('User updated successfully');
      queryClient.invalidateQueries(['user', userId]);
    },
    onError: err => messageApi.error(err.message || 'Update failed'),
  });

  // Delete mutation
  const { mutate: deleteUser } = useMutation({
    mutationFn: async id => await deleteUserHook(id),
    onSuccess: () => {
      messageApi.success('User deleted');
      queryClient.invalidateQueries(['users']);
      removeUserId();
      navigate('/');
    },
    onError: err => messageApi.error(err.message || 'Delete failed'),
  });

  // Redirect if no userId
  useEffect(() => {
    if (!userId) navigate('/user');
  }, [userId]);

  // Set initial form values
  useEffect(() => {
    if (user) {
      const mapFileToUpload = filePath =>
        filePath
          ? [
              {
                uid: '-1',
                name: filePath.split('/').pop(),
                status: 'done',
                url: `${import.meta.env.VITE_BACKEND_API}/public/${filePath}`,
              },
            ]
          : [];

      const mapDates = arr =>
        arr?.map(item => ({
          ...item,
          startDate: item.startDate ? dayjs(item.startDate) : null,
          endDate: item.endDate ? dayjs(item.endDate) : null,
        }));

      form.setFieldsValue({
        bio: user.bio || {},
        phone: user.phone,
        username: user.username,
        email: user.email,
        title: user.title,
        role: user.role,
        social: user.social?.length ? user.social : [],
        skills: user.skills?.length
          ? user.skills
          : [{ category: '', skills: [''] }],
        currentStatus: user.currentStatus || {},
        projects: mapDates(user.projects),
        experience: mapDates(user.experience),
        education: mapDates(user.education),
        resumePdf: mapFileToUpload(user.resumePdf),
        cvPdf: mapFileToUpload(user.cvPdf),
        image: mapFileToUpload(user.image),
      });
    }
  }, [user]);

  // Form submit
  const onFinish = values => {
    const formData = new FormData();

    ['image', 'resumePdf', 'cvPdf'].forEach(field => {
      if (values[field] && values[field][0]?.originFileObj) {
        formData.append(field, values[field][0].originFileObj);
      }
    });

    // Simple fields
    ['email',,'title', 'username', 'role', 'phone', 'password'].forEach(field => {
      if (values[field]) formData.append(field, values[field]);
    });

    // JSON fields
    [
      'bio',
      'social',
      'skills',
      'currentStatus',
      'projects',
      'experience',
      'education',
    ].forEach(field => {
      if (values[field]) formData.append(field, JSON.stringify(values[field]));
    });

    updateUser(formData);
  };

  return (
    <div className="p-4 w-screen h-screen overflow-y-auto bg-gray-100">
      {contextHolder}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Panel</h1>
        <Button danger onClick={() => deleteUser(userId)}>
          Delete User
        </Button>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Contact Info */}
        <h2 className="text-xl font-semibold mt-4">Contact Info</h2>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Title" name="title">
          <Input placeholder="Your professional title" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: 'email' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>
        <Form.Item label="Role" name="role">
          <Input />
        </Form.Item>
        <Form.Item label="Password" name="password">
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        {/* Bio */}
        <h2 className="text-xl font-semibold mt-6">Bio</h2>
        <Form.Item label="Name" name={['bio', 'name']}>
          <Input />
        </Form.Item>
        <Form.Item label="Age" name={['bio', 'age']}>
          <Input type="number" />
        </Form.Item>
        <Form.Item label="Current Location" name={['bio', 'currentLocation']}>
          <Input />
        </Form.Item>
        <Form.Item label="Original Location" name={['bio', 'location']}>
          <Input />
        </Form.Item>
        <Form.Item label="About" name={['bio', 'about']}>
          <TextArea rows={2} />
        </Form.Item>
        <Form.Item label="Summary" name={['bio', 'summary']}>
          <TextArea rows={4} />
        </Form.Item>

        {/* Social */}
        <h2 className="text-xl font-semibold mt-6">Social Links</h2>
        <Form.List name="social">
          {(fields, { add, remove }) => (
            <>
              {fields.map(field => (
                <Space key={field.key} align="baseline">
                  <Form.Item
                    {...field}
                    label="Platform"
                    name={[field.name, 'platform']}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="e.g., LinkedIn" />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Link"
                    name={[field.name, 'link']}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="https://..." />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Social
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Skills */}
        <h2 className="text-xl font-semibold mt-6">Skills</h2>
        <Form.List name="skills">
          {(categories, { add: addCategory, remove: removeCategory }) => (
            <>
              {categories.map(catField => (
                <div key={catField.key} className="border p-3 mb-3 rounded">
                  <Space align="baseline" className="mb-2">
                    <Form.Item
                      {...catField}
                      label="Category"
                      name={[catField.name, 'category']}
                      rules={[{ required: true, message: 'Category required' }]}
                    >
                      <Input placeholder="Frontend, Backend..." />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => removeCategory(catField.name)}
                    />
                  </Space>

                  <Form.List name={[catField.name, 'skills']}>
                    {(skills, { add: addSkill, remove: removeSkill }) => (
                      <>
                        {skills.map(skillField => (
                          <Space key={skillField.key} align="baseline">
                            <Form.Item
                              {...skillField}
                              name={[skillField.name]}
                              rules={[
                                { required: true, message: 'Skill required' },
                              ]}
                            >
                              <Input placeholder="Skill name" />
                            </Form.Item>
                            <MinusCircleOutlined
                              onClick={() => removeSkill(skillField.name)}
                            />
                          </Space>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => addSkill()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Add Skill
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => addCategory()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Category
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>







        {/* Current Status */}
        <h2 className="text-xl font-semibold mt-6">Current Status</h2>
        <Form.Item label="Company" name={['currentStatus', 'company']}>
          <Input />
        </Form.Item>
        <Form.Item label="Position" name={['currentStatus', 'position']}>
          <Input />
        </Form.Item>
        <Form.Item
          name={['currentStatus', 'asPresent']}
          valuePropName="checked"
        >
          <Checkbox>As Present</Checkbox>
        </Form.Item>

        {/* Projects */}
        <h2 className="text-xl font-semibold mt-6">Projects</h2>
        <Form.List name="projects">
          {(fields, { add, remove }) => (
            <>
              {fields.map(field => (
                <div key={field.key} className="border p-3 mb-3 rounded">
                  <Space align="baseline">
                    <h4>Project</h4>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                  <Form.Item
                    {...field}
                    label="Title"
                    name={[field.name, 'title']}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Description"
                    name={[field.name, 'description']}
                  >
                    <TextArea rows={2} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Git Link"
                    name={[field.name, 'gitLink']}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Live Link"
                    name={[field.name, 'liveLink']}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Technologies"
                    name={[field.name, 'technologies']}
                  >
                    <TextArea
                      rows={1}
                      placeholder='Array as JSON: ["React","Node.js"]'
                    />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Status"
                    name={[field.name, 'status']}
                  >
                    <Select>
                      <Option value="developing">Developing</Option>
                      <Option value="done">Done</Option>
                      <Option value="planned">Planned</Option>
                    </Select>
                  </Form.Item>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Project
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Experience */}
        <h2 className="text-xl font-semibold mt-6">Experience</h2>
        <Form.List name="experience">
          {(fields, { add, remove }) => (
            <>
              {fields.map(field => (
                <div key={field.key} className="border p-3 mb-3 rounded">
                  <Space align="baseline">
                    <h4>Experience</h4>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                  <Form.Item
                    {...field}
                    label="Company"
                    name={[field.name, 'company']}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Position"
                    name={[field.name, 'position']}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Location"
                    name={[field.name, 'location']}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Description"
                    name={[field.name, 'description']}
                  >
                    <TextArea rows={2} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Start Date"
                    name={[field.name, 'startDate']}
                  >
                    <DatePicker />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="End Date"
                    name={[field.name, 'endDate']}
                  >
                    <DatePicker />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Current"
                    name={[field.name, 'current']}
                    valuePropName="checked"
                  >
                    <Checkbox>Current</Checkbox>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Technologies"
                    name={[field.name, 'technologies']}
                  >
                    <TextArea
                      rows={1}
                      placeholder='Array as JSON: ["React","Node.js"]'
                    />
                  </Form.Item>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Experience
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Education */}
        <h2 className="text-xl font-semibold mt-6">Education</h2>
        <Form.List name="education">
          {(fields, { add, remove }) => (
            <>
              {fields.map(field => (
                <div key={field.key} className="border p-3 mb-3 rounded">
                  <Space align="baseline">
                    <h4>Education</h4>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                  <Form.Item
                    {...field}
                    label="Institute"
                    name={[field.name, 'institute']}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Course"
                    name={[field.name, 'course']}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Description"
                    name={[field.name, 'description']}
                  >
                    <TextArea rows={2} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Start Date"
                    name={[field.name, 'startDate']}
                  >
                    <DatePicker />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="End Date"
                    name={[field.name, 'endDate']}
                  >
                    <DatePicker />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Marks"
                    name={[field.name, 'marks']}
                  >
                    <Input />
                  </Form.Item>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Education
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Resume / CV */}
        <h2 className="text-xl font-semibold mt-6">Resume / CV</h2>
        <Form.Item
          name="resumePdf"
          valuePropName="fileList"
          getValueFromEvent={e => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload
            accept="application/pdf"
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button>Upload Resume PDF</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="cvPdf"
          valuePropName="fileList"
          getValueFromEvent={e => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload
            accept="application/pdf"
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button>Upload CV PDF</Button>
          </Upload>
        </Form.Item>

        {/* Profile Image */}
        <h2 className="text-xl font-semibold mt-6">Profile Image</h2>
        <Form.Item
          name="image"
          valuePropName="fileList"
          getValueFromEvent={e => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload
            listType="picture"
            accept="image/*"
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button>Upload Profile Image</Button>
          </Upload>
        </Form.Item>


        <Form.Item>
          <Button type="primary" htmlType="submit" className="mt-4">
            Update User
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default UserPage;
