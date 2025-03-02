import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Loader2 } from 'lucide-react';
import { getProjects } from '../api';
import { Project } from '../types';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        setError('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded text-center">
        <p className="text-lg mb-4">No projects found</p>
        <p className="text-sm text-gray-500">
          Generate your first project using the code generator.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link 
          key={project.PROJECT_ID} 
          to={`/projects/${project.PROJECT_ID}`}
          className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Folder className="text-indigo-600 mr-2" size={24} />
              <h3 className="text-xl font-semibold text-gray-800 truncate">
                {project.PROJECT_NAME}
              </h3>
            </div>
            <p className="text-gray-600 line-clamp-3 mb-4">
              {project.PROJECT_DESCRIPTION}
            </p>
            <div className="text-sm text-gray-500">
              Created: {new Date(project.INSERT_DATE_TIME).toLocaleDateString()}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProjectList;