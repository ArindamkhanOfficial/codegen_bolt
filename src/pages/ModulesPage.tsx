import React from 'react';
import { Database } from 'lucide-react';
import ModuleList from '../components/ModuleList';

const ModulesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Database className="text-indigo-600 mr-2" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Modules</h1>
      </div>
      
      <ModuleList />
    </div>
  );
};

export default ModulesPage;