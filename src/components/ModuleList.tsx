import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Database, Loader2 } from 'lucide-react';
import { getModules } from '../api';
import { Module } from '../types';

const ModuleList: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await getModules(projectId ? parseInt(projectId) : undefined);
        setModules(data);
      } catch (err) {
        setError('Failed to fetch modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [projectId]);

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

  if (modules.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded text-center">
        <p className="text-lg mb-4">No modules found</p>
        <p className="text-sm text-gray-500">
          {projectId 
            ? "This project doesn't have any modules yet." 
            : "Generate your first module using the code generator."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module) => (
        <Link 
          key={module.MODULE_ID} 
          to={`/modules/${module.MODULE_ID}`}
          className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Database className="text-indigo-600 mr-2" size={24} />
              <h3 className="text-xl font-semibold text-gray-800 truncate">
                {module.MODULE_NAME}
              </h3>
            </div>
            <p className="text-gray-600 line-clamp-3 mb-4">
              {module.MODULE_DESCRIPTION}
            </p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Table: {module.DATABASE_TABLE}</span>
              <span>Created: {new Date(module.INSERT_DATE_TIME).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ModuleList;