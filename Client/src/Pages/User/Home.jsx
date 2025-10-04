import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserHook } from '../../Hooks/userHook';
import authStore from '../../Store/authStore';
import emailjs from '@emailjs/browser';
import axios from 'axios';
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaUser,
  FaPen,
  FaYoutube,
  FaGlobe,
  FaFileDownload,
} from 'react-icons/fa';
import { FaRegShareFromSquare, FaNoteSticky } from 'react-icons/fa6';
import { FloatButton, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

function Home() {
  const { userId: loggedInUserId } = authStore();
  const { id: routeUserId } = useParams();

  const userId =
    routeUserId || import.meta.env.VITE_DEFAULT_USER_ID || loggedInUserId;

  const [messageApi, contextHolder] = message.useMessage();
  const contactFormRef = useRef();
  const subjectRef = useRef();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  const isValidObjectId = id => /^[0-9a-fA-F]{24}$/.test(id);

  const [selectedProject, setSelectedProject] = useState(null);

  const closeModal = () => setSelectedProject(null);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await getUserHook(userId);
      return res?.data?.data;
    },
    enabled: userId && isValidObjectId(userId),
  });

  useEffect(() => {
    if (!userId) return;

    axios
      .post(`${import.meta.env.VITE_BACKEND_API}/api/visits/track`, {
        userId,
        page: 'Home Page',
      })
      .catch(err => console.error('Tracking error:', err));
  }, [userId]);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError || !user) return <div className="p-4">User not found</div>;

  const sendEmail = e => {
    e.preventDefault();

    let prefix = 'New message ';
    if (user.approval === 'pending') prefix = 'Pending Request: ';
    if (user.approval === 'failed') prefix = 'Approval Request: ';

    if (subjectRef.current) {
      subjectRef.current.value = `${prefix}`;
    }

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE,
        import.meta.env.VITE_EMAILJS_TEMPLATE,
        contactFormRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        {
          subject: `${prefix}`,
        }
      )
      .then(() => {
        messageApi.success('Email sent successfully!');
        setEmailSent(true);
      })
      .catch(() => messageApi.error('Failed to send email.'));
    e.target.reset();
  };

  const isRouteWithId = !!routeUserId;

  if (isRouteWithId) {
    switch (user.approval) {
      case 'pending':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 p-4">
            <h2 className="text-2xl font-bold mb-4">
              Admin approval pending. Please contact admin for access.
            </h2>

            <div className="bg-gray-800 p-4 rounded mt-4 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2 text-center">
                Contact Admin
              </h3>
              {contextHolder}

              {!emailSent ? (
                <form
                  ref={contactFormRef}
                  onSubmit={sendEmail}
                  className="flex flex-col gap-3"
                >
                  <input
                    type="hidden"
                    name="subject"
                    value=""
                    ref={subjectRef}
                  />
                  <input
                    type="text"
                    name="from_name"
                    placeholder="Your name"
                    required
                    className="p-2 rounded bg-gray-700"
                  />
                  <input
                    type="email"
                    name="reply_to"
                    placeholder="Your email"
                    required
                    className="p-2 rounded bg-gray-700"
                  />
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Your message"
                    required
                    className="p-2 rounded bg-gray-700"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600 transition"
                  >
                    Send
                  </button>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${
                      import.meta.env.VITE_ADMIN_EMAIL
                    }&su=Pending Request | ProtFolio  &body=Hi  ,`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-center bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600 transition"
                  >
                    Email Me Directly
                  </a>
                </form>
              ) : (
                <div className="text-center bg-gray-700 p-6 rounded-lg">
                  <h4 className="text-xl font-bold text-teal-400 mb-2">
                    ✅ Email Sent Successfully!
                  </h4>
                  <p className="text-gray-300">
                    Thank you for reaching out. Your request has been received.
                    <br />
                    Please wait for admin approval — we’ll reply as soon as
                    possible.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 p-4">
            <h2 className="text-2xl font-bold mb-4">
              Approval failed. Please contact admin.
            </h2>

            <div className="bg-gray-800 p-4 rounded mt-4 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2 text-center">
                Contact Admin
              </h3>
              {contextHolder}

              {!emailSent ? (
                <form
                  ref={contactFormRef}
                  onSubmit={sendEmail}
                  className="flex flex-col gap-3"
                >
                  <input
                    type="hidden"
                    name="subject"
                    value=""
                    ref={subjectRef}
                  />
                  <input
                    type="text"
                    name="from_name"
                    placeholder="Your name"
                    required
                    className="p-2 rounded bg-gray-700"
                  />
                  <input
                    type="email"
                    name="reply_to"
                    placeholder="Your email"
                    required
                    className="p-2 rounded bg-gray-700"
                  />
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Your message"
                    required
                    className="p-2 rounded bg-gray-700"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600 transition"
                  >
                    Send
                  </button>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${
                      import.meta.env.VITE_ADMIN_EMAIL
                    }&su=Approval Request | ProtFolio   &body=Hi  ,`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-center bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600 transition"
                  >
                    Email Me Directly
                  </a>
                </form>
              ) : (
                <div className="text-center bg-gray-700 p-6 rounded-lg">
                  <h4 className="text-xl font-bold text-teal-400 mb-2">
                    ✅ Email Sent Successfully!
                  </h4>
                  <p className="text-gray-300">
                    Thank you for contacting us. Your message has been sent.
                    <br />
                    Please wait for admin response — we’ll get back to you soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'approval':
      default:
        break;
    }
  }

  const backendUrl =
    import.meta.env.VITE_BACKEND_API || 'http://localhost:5000';
  const getFileUrl = filePath => `${backendUrl}/public/${filePath}`;
  const getDownloadUrl = filePath => {
    const fileName = filePath.split('/').pop();
    const type = filePath.includes('resume') ? 'resume' : 'cv';
    return `${backendUrl}/download/${type}/${fileName}`;
  };

  const statusText = user.currentStatus?.asPresent ? 'Working' : 'Open to work';

  const scrollToSection = id => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Main JSX ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 font-sans">
      <nav className="flex-1 flex  top-0 right-0 w-full bg-gray-900 h-flex-1  bg-opacity-95 shadow z-50 flex-wrap sm:flex-row pt-4  justify-center sm:justify-end  gap-3 sm:gap-6  p-2 text-sm md:text-base sm:pr-20">
        {[
          'about',
          'skills',
          'experience',
          'education',
          'projects',
          'contact',
        ].map(sec => (
          <button
            key={sec}
            onClick={() => scrollToSection(sec)}
            className="text-gray-300 hover:text-teal-400 transition"
          >
            {sec.charAt(0).toUpperCase() + sec.slice(1)}
          </button>
        ))}

        {userId && (
          <FloatButton
            shape="circle"
            type="primary"
            style={{ insetInlineEnd: 25, insetBlockEnd: 120 }}
            icon={<FaPen />}
            onClick={() => navigate('/user/dashboard')}
          />
        )}

        <FloatButton
          shape="circle"
          type="primary"
          style={{ insetInlineEnd: 25, insetBlockEnd: 70 }}
          icon={<FaHome />}
          onClick={() => navigate(-1)}
        />

        <FloatButton
          shape="circle"
          type="primary"
          style={{ insetInlineEnd: 25, insetBlockEnd: 20 }}
          icon={<FaUser />}
          onClick={() => navigate('/user')}
        />
      </nav>

      <main className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 p-4 pt-3 ">
        {/* Left column */}
        <section className="md:col-span-1 flex flex-col gap-3 ">
          {contextHolder}
          <div className="bg-gray-900 p-6 rounded-xl flex flex-col items-center text-center">
            <img
              src={
                user.image
                  ? getFileUrl(user.image)
                  : 'https://via.placeholder.com/150'
              }
              alt="Profile"
              className="w-32 h-32 rounded-xl mb-4 object-cover"
            />
            <h2 className="text-xl font-bold">{user.bio?.name} </h2>

            <p className="mt-2 text-gray-400">{user.title}</p>

            <div
              className="bg-gray-800 p-4 rounded text-sm mt-4 w-full flex flex-col sm:justify-center sm:items-center  sm:text-left "
              id="contact"
            >
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p>
                Email:{' '}
                <a href={`mailto:${user.email}`} className="text-teal-400">
                  {user.email}
                </a>
              </p>

              {user?.bio?.currentLocation && (
                <p className="">
                  Current Location: {user.bio?.currentLocation || 'N/A'}
                </p>
              )}

              <p>Status: {statusText}</p>

              {/* ✅ Updated Social Icons Section */}
              <div className="flex gap-3 sm:gap-2 mt-3 flex-wrap justify-center   sm:justify-start ">
                {user.social?.map((s, idx) => {
                  const platform = s.platform?.toLowerCase() || '';
                  const link = s.link?.trim() || '';
                  if (!link) return null;

                  const iconMap = {
                    linkedin: <FaLinkedin />,
                    github: <FaGithub />,
                    youtube: <FaYoutube />,
                    mail: <FaEnvelope />,
                    gmail: <FaEnvelope />,
                    phone: <FaPhone />,
                    website: <FaGlobe />,
                  };

                  const icon = iconMap[platform];
                  if (!icon) return null;

                  let href = link;
                  if (platform === 'mail' || platform === 'gmail') {
                    href = link.startsWith('mailto:') ? link : `mailto:${link}`;
                  } else if (platform === 'phone') {
                    href = link.startsWith('tel:') ? link : `tel:${link}`;
                  } else if (!link.startsWith('http')) {
                    href = `https://${link}`;
                  }

                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded hover:bg-teal-500 transition"
                      title={platform}
                    >
                      {icon}
                    </a>
                  );
                })}

                {user.portfolioLink && (
                  <button
                    onClick={() =>
                      navigator.share
                        ? navigator.share({
                            title: `${user.username}'s Portfolio`,
                            url: user.portfolioLink,
                          })
                        : window.open(user.portfolioLink, '_blank')
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    <FaRegShareFromSquare />
                  </button>
                )}
              </div>

              <div className="mt-4 flex  gap-2 justify-center items-center">
                {user.resumePdf && (
                  <a
                    href={getDownloadUrl(user.resumePdf)}
                    className="px-4 py-2 bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600  flex flex-wrap justify-around items-center flex-none "
                  >
                    <FaFileDownload size={'1.5rem'} />
                    Resume
                  </a>
                )}
                {user.cvPdf && (
                  <a
                    href={getDownloadUrl(user.cvPdf)}
                    className="px-4 py-2 bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600  flex flex-wrap justify-around items-center flex-none "
                  >
                    <FaFileDownload size={'1.5rem'} />
                    CV
                  </a>
                )}
              </div>
            </div>

            {/* Email Form */}
            <div className="bg-gray-800 p-4 rounded mt-4 w-full">
              <h3 className="text-lg font-semibold mb-2">Send a message</h3>
              <form
                ref={contactFormRef}
                onSubmit={sendEmail}
                className="flex flex-col gap-3"
              >
                <input
                  type="text"
                  name="from_name"
                  placeholder="Your name"
                  required
                  className="p-2 rounded bg-gray-700"
                />
                <input
                  type="email"
                  name="reply_to"
                  placeholder="Your email"
                  required
                  className="p-2 rounded bg-gray-700"
                />
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Your message"
                  required
                  className="p-2 rounded bg-gray-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600 transition"
                >
                  Send
                </button>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}&su=Portfolio visitor  &body=Hi ${user.bio?.name} ,`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600 transition"
                >
                  Email Me Directly
                </a>
              </form>
            </div>

            {user.notes && (
              <div
                id="notes"
                className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 border-l-4 border-teal-500 p-6 rounded-xl mt-8 shadow-lg"
              >
                <h3 className="text-xl font-bold mb-3 text-teal-400 flex items-center gap-2">
                  <FaNoteSticky /> Note
                </h3>
                <p className="text-gray-300 leading-relaxed tex-sm">
                  {user.notes ||
                    'If you’re interested in hiring me as a developer, you can contact me using the email above. Also, if anyone is interested in this portfolio, feel free to message me — I’ll make sure to reply!'}
                </p>
              </div>
            )}

            {user.notes && (
              <div
                id="notes"
                className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 border-l-4 border-teal-500 p-6 rounded-xl mt-8 shadow-lg"
              >
                <h3 className="text-xl font-bold mb-3 text-teal-400 flex items-center gap-2">
                  <FaNoteSticky /> Short Bio
                </h3>
                <p className="text-gray-300 leading-relaxed tex-sm">
                  {user?.bio?.summary && <p> {user.bio?.summary}</p>}
                </p>

                <div className="  text-left">
                  <p>Origin: {user.bio?.location || 'N/A'}</p>
                  <p>Current: {user.bio?.currentLocation || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right column: About, Skills, Experience, Education */}
        <section className="md:col-span-2 flex flex-col gap-5 ">
          {/* About */}
          <div className="bg-gray-900 p-6 rounded-xl" id="about">
            <h3 className="text-xl font-bold mb-2">About Me</h3>
            <p className="text-gray-400">
              {user.bio?.about || 'No description available.'}
            </p>
          </div>

          {/* Skills */}
          {user.skills?.length > 0 && (
            <div className="bg-gray-900 p-6 rounded-xl" id="skills">
              <h3 className="text-xl font-bold mb-4">Skills</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {user.skills.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded flex flex-col items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundImage: cat.image
                        ? `url(${getFileUrl(cat.image)})`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: cat.image ? 'transparent' : '#1f2937',
                    }}
                  >
                    <div className="bg-black bg-opacity-50 p-2 rounded text-gray-200">
                      {cat.category}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center mt-2">
                      {cat.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-teal-600 text-gray-900 px-2 py-1 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {user.experience?.length > 0 && (
            <div className="bg-gray-900 p-6 rounded-xl" id="experience">
              <h3 className="text-xl font-bold mb-4">Experience</h3>
              {user.experience.map((exp, idx) => (
                <div key={idx} className="mb-4 border-b border-gray-700 pb-3">
                  <h4 className="font-semibold">
                    {exp.position} — {exp.company}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {new Date(exp.startDate).toLocaleDateString()} -{' '}
                    {exp.current
                      ? 'Present'
                      : new Date(exp.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-sm">{exp.description}</p>
                  <p className="text-gray-400 text-sm">
                    Tech: {exp.technologies.join(', ')}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Location: {exp.location}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {user.education?.length > 0 && (
            <div className="bg-gray-900 p-6 rounded-xl" id="education">
              <h3 className="text-xl font-bold mb-4">Education</h3>
              {user.education.map((edu, idx) => (
                <div key={idx} className="mb-4 border-b border-gray-700 pb-3">
                  <h4 className="font-semibold">
                    {edu.course} — {edu.institute}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {new Date(edu.startDate).toLocaleDateString()} -{' '}
                    {new Date(edu.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-sm">{edu.description}</p>
                  <p className="text-gray-400 text-sm">Marks: {edu.marks}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Projects */}
      {/* {user.projects?.length > 0 && (
        <div
          className="max-w-full p-6 mt-6 bg-gray-900 rounded-xl"
          id="projects"
        >
          <h3 className="text-xl font-bold mb-4 text-center">Projects</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {user.projects.map((proj, idx) => (
              <div
                key={idx}
                className="bg-gray-800 rounded overflow-hidden flex flex-col shadow hover:shadow-lg transition cursor-pointer hover:-translate-y-1 transform"
                title="Click to view project"
              >
                {proj.image && (
                  <img
                    src={getFileUrl(proj.image)}
                    alt={proj.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col gap-2">
                  <h4 className="font-semibold text-gray-200">{proj.title}</h4>
                  <div className="flex gap-3 mt-2">
                    {proj.gitLink && (
                      <a
                        href={
                          proj.gitLink.startsWith('http')
                            ? proj.gitLink
                            : `https://${proj.gitLink}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 text-sm hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        GitHub
                      </a>
                    )}
                    {proj.liveLink && (
                      <a
                        href={
                          proj.liveLink.startsWith('http')
                            ? proj.liveLink
                            : `https://${proj.liveLink}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 text-sm hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        Live
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Projects */}
      {user.projects?.length > 0 && (
        <div
          className="max-w-full p-6 mt-6 bg-gray-900 rounded-xl"
          id="projects"
        >
          <h3 className="text-xl font-bold mb-4 text-center">Projects</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {user.projects.map((proj, idx) => (
              <div
                key={idx}
                className="bg-gray-800 rounded overflow-hidden flex flex-col shadow hover:shadow-lg transition cursor-pointer hover:-translate-y-1 transform"
                title="Click to view project"
                onClick={() => proj.description && setSelectedProject(proj)}
              >
                {proj.image && (
                  <img
                    src={getFileUrl(proj.image)}
                    alt={proj.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col gap-2">
                  <h4 className="font-semibold text-gray-200">{proj.title}</h4>
                  <div className="flex gap-3 mt-2">
                    {proj.gitLink && (
                      <a
                        href={
                          proj.gitLink.startsWith('http')
                            ? proj.gitLink
                            : `https://${proj.gitLink}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 text-sm hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        GitHub
                      </a>
                    )}
                    {proj.liveLink && (
                      <a
                        href={
                          proj.liveLink.startsWith('http')
                            ? proj.liveLink
                            : `https://${proj.liveLink}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 text-sm hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        Live
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

      
          {/* Project Modal */}
          {selectedProject && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-gray-300 hover:text-teal-400 text-2xl font-bold"
                >
                  &times;
                </button>

                <h3 className="text-2xl font-bold mb-4 text-teal-400">
                  {selectedProject.title}
                </h3>

                <p className="text-gray-300 mb-4">
                  {selectedProject.description}
                </p>

                {selectedProject.gitLink && (
                  <p className="text-gray-300 mb-2">
                    GitHub:{' '}
                    <a
                      href={
                        selectedProject.gitLink.startsWith('http')
                          ? selectedProject.gitLink
                          : `https://${selectedProject.gitLink}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:underline"
                    >
                      {selectedProject.gitLink}
                    </a>
                  </p>
                )}

                {selectedProject.liveLink && (
                  <p className="text-gray-300 mb-2">
                    Live:{' '}
                    <a
                      href={
                        selectedProject.liveLink.startsWith('http')
                          ? selectedProject.liveLink
                          : `https://${selectedProject.liveLink}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:underline"
                    >
                      {selectedProject.liveLink}
                    </a>
                  </p>
                )}

                {selectedProject.technologies &&
                  selectedProject.technologies.length > 0 && (
                    <p className="text-gray-300 mt-2">
                      Tech: {selectedProject.technologies.join(', ')}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certificates */}
      {user.certificates?.length > 0 && (
        <div className="bg-gray-900 p-6 rounded-xl w-full" id="certificates">
          <h3 className="text-xl font-bold mb-4 text-center">Certificates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {user.certificates.map((cert, idx) => (
              <div
                key={idx}
                className="bg-gray-800 rounded overflow-hidden flex flex-col shadow hover:shadow-lg transition cursor-pointer hover:-translate-y-1 transform"
                title={cert.title}
                onClick={() => {
                  if (cert.link) window.open(cert.link, '_blank');
                }}
              >
                <img
                  src={
                    cert.image
                      ? getFileUrl(cert.image)
                      : 'https://via.placeholder.com/150'
                  }
                  alt={cert.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2 text-center">
                  <h4 className="text-gray-200 font-semibold">{cert.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
