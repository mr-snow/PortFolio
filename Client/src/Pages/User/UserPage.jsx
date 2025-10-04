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
  InputNumber,
} from 'antd';
import { CiLogout } from 'react-icons/ci';
import { GrView } from 'react-icons/gr';
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
import { FaHome } from 'react-icons/fa';

const { TextArea } = Input;
const { Option } = Select;

function UserPage() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId, removeUserId, removeToken } = authStore();
  const [messageApi, contextHolder] = message.useMessage();

  const adminId = import.meta.env.VITE_DEFAULT_USER_ID;
  const frontendBaseUrl = import.meta.env.VITE_FRONTEND_API;

  const isAdmin = userId === adminId;

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

  const goHome = () => {
    if (userId) {
      navigate(`/${userId}`);
    } else {
      navigate('/');
    }
  };

  // Redirect if no userId
  useEffect(() => {
    if (!userId) navigate('/user');
  }, [userId]);

  // Set initial form values
  useEffect(() => {
    if (user) {
      const mapFileToUpload = file => {
        if (!file) return [];

        if (Array.isArray(file)) {
          return file.map(f => {
            // if object with url already
            if (f && typeof f === 'object' && f.url) {
              return {
                uid: f.uid || String(Math.random()),
                name: f.name || f.url.split('/').pop(),
                status: f.status || 'done',
                url: f.url,
              };
            }
            // if string path
            return {
              uid: String(Math.random()),
              name: f.split('/').pop(),
              status: 'done',
              url: `${import.meta.env.VITE_BACKEND_API}/public/${f}`,
            };
          });
        }

        // single string path
        return [
          {
            uid: String(Math.random()),
            name: file.split('/').pop(),
            status: 'done',
            url: `${import.meta.env.VITE_BACKEND_API}/public/${file}`,
          },
        ];
      };

      const portfolioLink = user.portfolioLink
        ? user.portfolioLink
        : `${frontendBaseUrl}/${userId}`;

      form.setFieldsValue({
        bio: user.bio || {},
        phone: user.phone,
        username: user.username,
        email: user.email,
        title: user.title,
        role: user.role,
        social: user.social?.length ? user.social : [],
        portfolioLink,
        notes: user?.notes,

        // ✅ skills: each category with mapped image
        skills: user.skills?.length
          ? user.skills.map(skill => ({
              ...skill,
              image: mapFileToUpload(skill.image),
            }))
          : [{ category: '', skills: [''], image: [] }],

        // ✅ projects: each project with mapped image

        projects: user.projects?.length
          ? user.projects.map(proj => ({
              ...proj,
              image: proj.image
                ? [
                    {
                      uid: String(Math.random()),
                      name: proj.image.split('/').pop(),
                      status: 'done',
                      url: `${import.meta.env.VITE_BACKEND_API}/public/${
                        proj.image
                      }`,
                    },
                  ]
                : [],
            }))
          : [{ title: '', description: '', image: [] }],

        experience:
          user.experience?.map(exp => ({
            ...exp,
            startDate: exp.startDate ? dayjs(exp.startDate) : null,
            endDate: exp.endDate ? dayjs(exp.endDate) : null,
          })) || [],

        education:
          user.education?.map(edu => ({
            ...edu,
            startDate: edu.startDate ? dayjs(edu.startDate) : null,
            endDate: edu.endDate ? dayjs(edu.endDate) : null,
          })) || [],
        certificates:
          user.certificates?.map(cert => ({
            ...cert,
            image: cert.image
              ? [
                  {
                    uid: String(Math.random()),
                    name: cert.image.split('/').pop(),
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_API}/public/${
                      cert.image
                    }`,
                  },
                ]
              : [],
          })) || [],

        resumePdf: mapFileToUpload(user.resumePdf),
        cvPdf: mapFileToUpload(user.cvPdf),
        image: mapFileToUpload(user.image),
      });
    }
  }, [user]);

  // Form submit
  const onFinish = values => {
    const formData = new FormData();

    // handle main files
    ['image', 'resumePdf', 'cvPdf'].forEach(field => {
      if (values[field] && values[field][0]?.originFileObj) {
        formData.append(field, values[field][0].originFileObj);
      }
    });

    // handle simple fields
    [
      'email',
      'title',
      'username',
      'role',
      'phone',
      'password',
      'portfolioLink',
      'notes',
    ].forEach(field => {
      if (values[field]) formData.append(field, values[field]);
    });

    // handle nested json
    ['bio', 'social', 'currentStatus', 'experience', 'education'].forEach(
      field => {
        if (values[field])
          formData.append(field, JSON.stringify(values[field]));
      }
    );

    // handle skills with optional image
    if (values.skills) {
      const skillsData = values.skills.map(skill => {
        const { image, ...rest } = skill;
        if (image && image[0]?.originFileObj) {
          formData.append('skillImage', image[0].originFileObj);
        }
        return rest;
      });
      formData.append('skills', JSON.stringify(skillsData));
    }

    // Handle projects
    if (values.projects) {
      const projectsData = values.projects.map((proj, idx) => {
        const { image, ...rest } = proj;
        if (image && image[0]?.originFileObj) {
          formData.append(`projectImage_${idx}`, image[0].originFileObj);
        }
        return rest;
      });
      formData.append('projects', JSON.stringify(projectsData));
    }

    // Handle certificates
    if (values.certificates) {
      const certificatesData = values.certificates.map((cert, idx) => {
        const { image, ...rest } = cert;

        // Keep old image if no new file
        if (image && image[0]?.originFileObj) {
          formData.append(`certificateImage_${idx}`, image[0].originFileObj);
          rest.image = null; // will be replaced on server
        } else if (image && image[0]?.url) {
          // preserve existing image URL
          rest.image = image[0].url.split('/public/')[1]; // "certificate/filename.jpg"
        }

        return rest;
      });
      formData.append('certificates', JSON.stringify(certificatesData));
    }

    updateUser(formData);
  };

  return (
    <div className="p-4 w-screen h-screen overflow-y-auto bg-gray-100">
      {contextHolder}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold w-full sm:w-auto">User Panel</h1>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button danger onClick={() => deleteUser(userId)}>
            Delete User
          </Button>

          <Button
            type="default"
            icon={<CiLogout />}
            onClick={() => {
              removeUserId();
              removeToken();
              navigate('/');
            }}
          >
            Logout
          </Button>

          <Button
            type="primary"
            icon={<GrView />}
            onClick={() => {
              if (isAdmin) {
                navigate(`/admin/visitors`);
              } else {
                navigate(`/${userId}/visitors`);
              }
            }}
          >
            Visitors
          </Button>

          {user?.portfolioLink ? (
            <Button
              type="primary"
              icon={<FaHome />}
              className="transition"
              onClick={() => {
                const link = user.portfolioLink.startsWith('http')
                  ? user.portfolioLink
                  : `https://${user.portfolioLink}`;
                window.location.href = link; // open in same tab
              }}
            >
              Website
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<FaHome />}
              className="transition"
              onClick={() => {
                navigate(`/${userId}`);
              }}
            >
              Website
            </Button>
          )}
        </div>
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
        <Form.Item label="Portfolio / Deploy Link" name="portfolioLink">
          <Input placeholder="https://your-portfolio.com" />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input placeholder="Notes " />
        </Form.Item>

        <Form.Item label="Password" name="password">
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        {/* Bio */}
        <h2 className="text-xl font-semibold mt-6">Bio</h2>
        <Form.Item label="Name" name={['bio', 'name']}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Age"
          name={['bio', 'age']}
          rules={[{ type: 'number', min: 0 }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="Enter your age" />
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

        {/* Social Links */}
        <h2 className="text-xl font-semibold mt-6">Social Links</h2>
        <Form.List name="social">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, idx) => (
                <Space
                  key={`social-${field.key}-${idx}`}
                  align="baseline"
                  className="flex-wrap"
                >
                  <Form.Item
                    {...field}
                    label="Platform"
                    name={[field.name, 'platform']}
                    rules={[{ required: true, message: 'Select a platform' }]}
                  >
                    <Select
                      placeholder="Select platform"
                      style={{ minWidth: 150 }}
                    >
                      <Option value="linkedin">LinkedIn</Option>
                      <Option value="github">GitHub</Option>
                      <Option value="youtube">YouTube</Option>
                      <Option value="gmail">Gmail</Option>
                      <Option value="mail">Mail</Option>
                      <Option value="phone">Phone</Option>
                      <Option value="website">Website</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...field}
                    label="Link"
                    name={[field.name, 'link']}
                    rules={[{ required: true, message: 'Enter link or value' }]}
                  >
                    <Input placeholder="https:// or contact info..." />
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
              {categories.map((catField, catIdx) => (
                <div
                  key={`skillcat-${catField.key}-${catIdx}`}
                  className="border p-3 mb-3 rounded"
                >
                  <Space align="baseline" className="mb-2">
                    <Form.Item
                      {...catField}
                      label="Category"
                      name={[catField.name, 'category']}
                    >
                      <Input placeholder="Frontend, Backend..." />
                    </Form.Item>
                    <Form.Item
                      {...catField}
                      label="Skill Image"
                      name={[catField.name, 'image']}
                      valuePropName="fileList"
                      getValueFromEvent={e =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        listType="picture"
                        accept="image/*"
                        beforeUpload={() => false}
                        maxCount={1}
                      >
                        <Button>Upload Skill Image</Button>
                      </Upload>
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => removeCategory(catField.name)}
                    />
                  </Space>
                  <Form.List name={[catField.name, 'skills']}>
                    {(skills, { add: addSkill, remove: removeSkill }) => (
                      <>
                        {skills.map((skillField, skillIdx) => (
                          <Space
                            key={`skill-${skillField.key}-${skillIdx}`}
                            align="baseline"
                          >
                            <Form.Item {...skillField} name={[skillField.name]}>
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
              {fields.map((field, idx) => (
                <div
                  key={`project-${field.key}-${idx}`}
                  className="border p-3 mb-3 rounded"
                >
                  <Space align="baseline">
                    <h4>Project</h4>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                  {[
                    'title',
                    'description',
                    'gitLink',
                    'liveLink',
                    'technologies',
                    'status',
                  ].map((f, fIdx) => (
                    <Form.Item
                      key={`${field.key}-${f}-${fIdx}`}
                      {...field}
                      label={f.charAt(0).toUpperCase() + f.slice(1)}
                      name={[field.name, f]}
                    >
                      {f === 'status' ? (
                        <Select>
                          <Option value="developing">Developing</Option>
                          <Option value="done">Done</Option>
                          <Option value="planned">Planned</Option>
                        </Select>
                      ) : f === 'technologies' ? (
                        <TextArea
                          rows={1}
                          placeholder='Array as JSON: ["React","Node.js"]'
                        />
                      ) : f === 'description' ? (
                        <TextArea rows={2} />
                      ) : (
                        <Input />
                      )}
                    </Form.Item>
                  ))}
                  <Form.Item
                    {...field}
                    label="Project Image"
                    name={[field.name, 'image']}
                    valuePropName="fileList"
                    getValueFromEvent={e =>
                      Array.isArray(e) ? e : e?.fileList
                    }
                  >
                    <Upload
                      listType="picture"
                      accept="image/*"
                      beforeUpload={() => false}
                      maxCount={1}
                    >
                      <Button>Upload Project Image</Button>
                    </Upload>
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
              {fields.map((field, idx) => (
                <div
                  key={`exp-${field.key}-${idx}`}
                  className="border p-3 mb-3 rounded"
                >
                  <Space align="baseline">
                    <h4>Experience</h4>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                  {[
                    'company',
                    'position',
                    'location',
                    'description',
                    'startDate',
                    'endDate',
                    'current',
                    'technologies',
                  ].map((f, fIdx) => (
                    <Form.Item
                      key={`${field.key}-${f}-${fIdx}`}
                      {...field}
                      label={f.charAt(0).toUpperCase() + f.slice(1)}
                      name={[field.name, f]}
                      valuePropName={f === 'current' ? 'checked' : undefined}
                    >
                      {f === 'current' ? (
                        <Checkbox>Current</Checkbox>
                      ) : f === 'startDate' || f === 'endDate' ? (
                        <DatePicker />
                      ) : f === 'technologies' ? (
                        <TextArea
                          rows={1}
                          placeholder='Array as JSON: ["React","Node.js"]'
                        />
                      ) : f === 'description' ? (
                        <TextArea rows={2} />
                      ) : (
                        <Input />
                      )}
                    </Form.Item>
                  ))}
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
              {fields.map((field, idx) => (
                <div
                  key={`edu-${field.key}-${idx}`}
                  className="border p-3 mb-3 rounded"
                >
                  <Space align="baseline">
                    <h4>Education</h4>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                  {[
                    'institute',
                    'course',
                    'description',
                    'startDate',
                    'endDate',
                    'marks',
                  ].map((f, fIdx) => (
                    <Form.Item
                      key={`${field.key}-${f}-${fIdx}`}
                      {...field}
                      label={f.charAt(0).toUpperCase() + f.slice(1)}
                      name={[field.name, f]}
                    >
                      {f === 'description' ? (
                        <TextArea rows={2} />
                      ) : f === 'startDate' || f === 'endDate' ? (
                        <DatePicker />
                      ) : (
                        <Input />
                      )}
                    </Form.Item>
                  ))}
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

        <h2 className="text-xl font-semibold mt-6">Certificates</h2>
        <Form.List name="certificates">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, idx) => (
                <div
                  key={`cert-${field.key}-${idx}`}
                  className="border p-3 mb-3 rounded"
                >
                  <Space align="baseline">
                    <h4>Certificate</h4>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>

                  <Form.Item
                    {...field}
                    label="Title"
                    name={[field.name, 'title']}
                    rules={[{ required: true, message: 'Title required' }]}
                  >
                    <Input placeholder="Certificate title" />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    label="Issue Date"
                    name={[field.name, 'issueDate']}
                  >
                    <DatePicker />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    label="Certificate Image"
                    name={[field.name, 'image']}
                    valuePropName="fileList"
                    getValueFromEvent={e =>
                      Array.isArray(e) ? e : e?.fileList
                    }
                  >
                    <Upload
                      listType="picture"
                      accept="image/*"
                      beforeUpload={() => false}
                      maxCount={1}
                    >
                      <Button>Upload Certificate Image</Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item
                    {...field}
                    label="Link (optional)"
                    name={[field.name, 'link']}
                  >
                    <Input placeholder="Certificate verification link" />
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
                  Add Certificate
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
