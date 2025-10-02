import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserHook } from '../../Hooks/userHook';
import authStore from '../../Store/authStore';

function Home() {
  const { userId } = authStore();

  // Simple ObjectId validation
  const isValidObjectId = id => /^[0-9a-fA-F]{24}$/.test(id);

  // Fetch user data only if userId is valid
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await getUserHook(userId);
      return res?.data?.data;
    },
    enabled: userId && isValidObjectId(userId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !user) return <div>User not found</div>;

  const backendUrl = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000';

  const getFileUrl = filePath => `${backendUrl}/public/${filePath}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      {/* Profile Image */}
      {user.image && (
        <img
          src={getFileUrl(user.image)}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover mb-4"
        />
      )}

      <h1 className="text-3xl font-bold mb-2">{user.bio?.name}</h1>
      <p className="text-gray-600 mb-4">{user.title}</p>

      {/* Contact Info */}
      <div className="bg-white shadow-md rounded p-4 w-full max-w-xl mb-4">
        <h2 className="text-xl font-semibold mb-2">Contact Info</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Current Location:</strong> {user.bio?.currentLocation}</p>
        <p><strong>Original Location:</strong> {user.bio?.location}</p>
      </div>

      {/* Bio */}
      <div className="bg-white shadow-md rounded p-4 w-full max-w-xl mb-4">
        <h2 className="text-xl font-semibold mb-2">About</h2>
        <p>{user.bio?.about}</p>
        <h3 className="text-lg font-semibold mt-2">Summary</h3>
        <p>{user.bio?.summary}</p>
      </div>

      {/* Resume / CV Download */}
      <div className="bg-white shadow-md rounded p-4 w-full max-w-xl mb-4 flex flex-col gap-2">
        <h2 className="text-xl font-semibold mb-2">Documents</h2>
        {user.resumePdf && (
          <a
            href={getFileUrl(user.resumePdf)}
            download
            className="text-blue-600 hover:underline"
          >
            Download Resume
          </a>
        )}
        {user.cvPdf && (
          <a
            href={getFileUrl(user.cvPdf)}
            download
            className="text-blue-600 hover:underline"
          >
            Download CV
          </a>
        )}
      </div>

      {/* Skills */}
      {user.skills?.length > 0 && (
        <div className="bg-white shadow-md rounded p-4 w-full max-w-xl mb-4">
          <h2 className="text-xl font-semibold mb-2">Skills</h2>
          {user.skills.map((cat, idx) => (
            <div key={idx} className="mb-2">
              <strong>{cat.category}:</strong> {cat.skills.join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {user.projects?.length > 0 && (
        <div className="bg-white shadow-md rounded p-4 w-full max-w-xl mb-4">
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          {user.projects.map((project, idx) => (
            <div key={idx} className="mb-2">
              <strong>{project.title}</strong> - {project.description}
              <div>
                {project.gitLink && (
                  <a
                    href={project.gitLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mr-2"
                  >
                    GitHub
                  </a>
                )}
                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Live
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {user.experience?.length > 0 && (
        <div className="bg-white shadow-md rounded p-4 w-full max-w-xl mb-4">
          <h2 className="text-xl font-semibold mb-2">Experience</h2>
          {user.experience.map((exp, idx) => (
            <div key={idx} className="mb-2">
              <strong>{exp.position}</strong> at {exp.company} ({exp.location})
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {user.education?.length > 0 && (
        <div className="bg-white shadow-md rounded p-4 w-full max-w-xl mb-4">
          <h2 className="text-xl font-semibold mb-2">Education</h2>
          {user.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <strong>{edu.course}</strong> at {edu.institute} ({edu.startDate?.split('T')[0]} - {edu.endDate?.split('T')[0]})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
