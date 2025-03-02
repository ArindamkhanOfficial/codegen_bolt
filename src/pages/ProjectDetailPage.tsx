import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Database, Folder, Loader2 } from 'lucide-react';
import { getProjects, getModules } from '../api';
import { Project, Module } from '../types';
import ModuleList from '../components/ModuleList';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const projects = await getProjects();
        const foundProject = projects.find((p: Project) => p.PROJECT_ID === parseInt(projectId!));
        
        if (foundProject) {
          setProject(foundProject);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        setError('Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Project not found'}
        </div>
        <div className="mt-4">
          <Link to="/projects" className="flex items-center text-indigo-600 hover:text-indigo-800">
            <ArrowLeft size={16} className="mr-1" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/projects" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft size={16} className="mr-1" />
          Back to Projects
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <Folder className="text-indigo-600 mr-2" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">{project.PROJECT_NAME}</h1>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{project.PROJECT_DESCRIPTION}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span> {new Date(project.INSERT_DATE_TIME).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Created By:</span> {project.INSERT_ID}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Database className="text-indigo-600 mr-2" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Project Modules</h2>
        </div>
        
        <ModuleList />
      </div>
    </div>
  );
};

export default ProjectDetailPage;