import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Database, Home, Layers } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Code2 size={28} />
            <span className="text-xl font-bold">Codegen Agent Platform</span>
          </Link>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="flex items-center space-x-1 hover:text-blue-200 transition-colors">
                  <Home size={18} />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/projects" className="flex items-center space-x-1 hover:text-blue-200 transition-colors">
                  <Layers size={18} />
                  <span>Projects</span>
                </Link>
              </li>
              <li>
                <Link to="/modules" className="flex items-center space-x-1 hover:text-blue-200 transition-colors">
                  <Database size={18} />
                  <span>Modules</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;