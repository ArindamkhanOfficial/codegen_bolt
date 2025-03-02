import React from 'react';
import { Layers } from 'lucide-react';
import ProjectList from '../components/ProjectList';

const ProjectsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Layers className="text-indigo-600 mr-2" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
      </div>
      
      <ProjectList />
    </div>
  );
};

export default ProjectsPage;