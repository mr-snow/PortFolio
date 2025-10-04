import React, { useRef, useEffect } from 'react';
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
} from 'react-icons/fa';
import { FloatButton } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

function Home() {
  const { userId: loggedInUserId } = authStore();
  const { id: routeUserId } = useParams();

  const userId =
    routeUserId || import.meta.env.VITE_DEFAULT_USER_ID || loggedInUserId;

  const contactFormRef = useRef();
  const navigate = useNavigate();

  const isValidObjectId = id => /^[0-9a-fA-F]{24}$/.test(id);

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

  const backendUrl =
    import.meta.env.VITE_BACKEND_API || 'http://localhost:5000';
  const getFileUrl = filePath => `${backendUrl}/public/${filePath}`;

  const getDownloadUrl = filePath => {
    const fileName = filePath.split('/').pop(); // get only the filename
    const type = filePath.includes('resume') ? 'resume' : 'cv';
    return `${backendUrl}/download/${type}/${fileName}`;
  };

  const sendEmail = e => {
    e.preventDefault();
    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE,
        import.meta.env.VITE_EMAILJS_TEMPLATE,
        contactFormRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => alert('Email sent successfully!'))
      .catch(() => alert('Failed to send email.'));
    e.target.reset();
  };

  const socialIcons = {
    linked: <FaLinkedin />,
    git: <FaGithub />,
    mail: <FaEnvelope />,
    ph: <FaPhone />,
  };

  const statusText = user.currentStatus?.asPresent ? 'Working' : 'Open to work';

  const scrollToSection = id => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 right-5 w-full bg-gray-900 bg-opacity-95 shadow z-50 flex justify-end gap-6 p-2 text-sm md:text-base">
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

      <main className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 p-4 pt-16">
        {/* Left column: Profile + Contact + Email form */}
        <section className="md:col-span-1 flex flex-col gap-4">
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
            <h2 className="text-xl font-bold">{user.bio?.name}</h2>
            <p className="text-gray-400">{user.bio?.summary}</p>
            <p className="mt-2 text-gray-400">{user.title}</p>

            {/* Contact Info */}
            <div className="bg-gray-800 p-4 rounded mt-4 w-full text-left">
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p>
                Email:{' '}
                <a href={`mailto:${user.email}`} className="text-teal-400">
                  {user.email}
                </a>
              </p>
              <p>Location: {user.bio?.currentLocation || 'N/A'}</p>
              <p>Status: {statusText}</p>

              {/* Social Icons */}
              <div className="flex gap-3 mt-3">
                {user.social?.map(s => {
                  const platform = s.platform.toLowerCase();
                  if (!socialIcons[platform] || !s.link) return null;
                  const href =
                    platform === 'mail' && !s.link.startsWith('mailto:')
                      ? `mailto:${s.link}`
                      : platform === 'ph'
                      ? `tel:${s.link}`
                      : s.link.startsWith('http')
                      ? s.link
                      : `https://${s.link}`;
                  return (
                    <a
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded hover:bg-teal-500 transition"
                      title={platform}
                    >
                      {socialIcons[platform]}
                    </a>
                  );
                })}
              </div>

              {/* Resume / CV download */}
              <div className="mt-4 flex flex-col gap-2">
                {user.resumePdf && (
                  <a
                    href={getDownloadUrl(user.resumePdf)}
                    className="px-4 py-2 bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600"
                  >
                    Download Resume
                  </a>
                )}

                {user.cvPdf && (
                  <a
                    href={getDownloadUrl(user.cvPdf)}
                    className="px-4 py-2 bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600"
                  >
                    Download CV
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
                {/* <a
                  href={`mailto:${user.email}?subject=Hello ${user.bio?.name}&body=Hi ${user.bio?.name},`}
                  className="px-4 py-2 bg-teal-500 text-gray-900 rounded font-semibold hover:bg-teal-600 transition"
                >
                  Email Me Directly
                </a> */}
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
          </div>
        </section>

        {/* Right column: About, Skills, Experience, Education */}
        <section className="md:col-span-2 flex flex-col gap-6">
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

      {/* Projects - Full Width Grid */}
      {/* Projects - Full Width Grid */}
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
                        onClick={e => e.stopPropagation()} // so click on GitHub doesn't trigger card click
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
                        onClick={e => e.stopPropagation()} // so click on Live link doesn't trigger card click
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
      )}

      {/* Certificates Section */}
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
