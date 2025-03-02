import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Code, Database, FileCode, Loader2 } from 'lucide-react';
import { getModules, getModuleDatabases } from '../api';
import { Module, ModuleDatabase } from '../types';

const ModuleDetailPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [moduleDatabase, setModuleDatabase] = useState<ModuleDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        const modules = await getModules();
        const foundModule = modules.find((m: Module) => m.MODULE_ID === parseInt(moduleId!));
        
        if (foundModule) {
          setModule(foundModule);
          
          const moduleDatabases = await getModuleDatabases(foundModule.MODULE_ID);
          if (moduleDatabases && moduleDatabases.length > 0) {
            setModuleDatabase(moduleDatabases[0]);
          }
        } else {
          setError('Module not found');
        }
      } catch (err) {
        setError('Failed to fetch module details');
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModuleDetails();
    }
  }, [moduleId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Module not found'}
        </div>
        <div className="mt-4">
          <Link to="/modules" className="flex items-center text-indigo-600 hover:text-indigo-800">
            <ArrowLeft size={16} className="mr-1" />
            Back to Modules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/modules" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft size={16} className="mr-1" />
          Back to Modules
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <FileCode className="text-indigo-600 mr-2" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">{module.MODULE_NAME}</h1>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{module.MODULE_DESCRIPTION}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>
            <span className="font-medium">Project ID:</span> {module.PROJECT_ID}
          </div>
          <div>
            <span className="font-medium">Database Table:</span> {module.DATABASE_TABLE}
          </div>
          <div>
            <span className="font-medium">Created:</span> {new Date(module.INSERT_DATE_TIME).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Created By:</span> {module.INSERT_ID}
          </div>
        </div>
        
        <div className="mt-6">
          <Link 
            to={`/projects/${module.PROJECT_ID}`} 
            className="text-indigo-600 hover:text-indigo-800"
          >
            View Parent Project
          </Link>
        </div>
      </div>

      {moduleDatabase && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Database className="text-indigo-600 mr-2" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Database Structure</h2>
          </div>
          
          <div className="mb-4">
            <span className="font-medium">Table Name:</span> {moduleDatabase.DATABASE_TABLE}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Creation Statement</h3>
            <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
              {moduleDatabase.CREATION_STATEMENT}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleDetailPage;