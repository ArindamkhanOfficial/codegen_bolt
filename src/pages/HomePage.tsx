import React from 'react';
import { Code, Database, FileCode, GitBranch, Layers } from 'lucide-react';
import CodeGenerator from '../components/CodeGenerator';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Codegen Agent Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate application code intelligently by analyzing your requirements and leveraging existing components.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h2>
            <ul className="space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full mr-3">1</span>
                <span>Enter your requirements as a prompt</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full mr-3">2</span>
                <span>Our AI analyzes your request and checks for existing components</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full mr-3">3</span>
                <span>Database tables are created or reused as needed</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full mr-3">4</span>
                <span>Application code is generated based on your requirements</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Features</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Layers className="flex-shrink-0 text-indigo-600 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Project Management</h3>
                  <p className="text-sm text-gray-600">Organize your generated code into projects</p>
                </div>
              </div>
              <div className="flex items-start">
                <Database className="flex-shrink-0 text-indigo-600 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Database Integration</h3>
                  <p className="text-sm text-gray-600">Automatically create or reuse database tables</p>
                </div>
              </div>
              <div className="flex items-start">
                <Code className="flex-shrink-0 text-indigo-600 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Code Generation</h3>
                  <p className="text-sm text-gray-600">Generate application code based on your requirements</p>
                </div>
              </div>
              <div className="flex items-start">
                <GitBranch className="flex-shrink-0 text-indigo-600 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium">Component Reuse</h3>
                  <p className="text-sm text-gray-600">Leverage existing modules and components</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CodeGenerator />
      </div>
    </div>
  );
};

export default HomePage;