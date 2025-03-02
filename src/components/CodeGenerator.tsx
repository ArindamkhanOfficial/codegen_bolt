import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Cpu, Loader2 } from 'lucide-react';
import { generateCode } from '../api';
import { CodegenRequest, CodegenResponse } from '../types';

const CodeGenerator: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<CodegenRequest>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodegenResponse | null>(null);

  const onSubmit = async (data: CodegenRequest) => {
    setLoading(true);
    try {
      const response = await generateCode(data);
      setResult(response);
      toast.success('Code generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Cpu className="text-indigo-600 mr-2" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Code Generator</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            What would you like to build?
          </label>
          <textarea
            id="prompt"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., address book, phone book, task manager..."
            {...register('prompt', { required: 'Prompt is required' })}
          />
          {errors.prompt && (
            <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="engine" className="block text-sm font-medium text-gray-700 mb-1">
            LLM Engine
          </label>
          <select
            id="engine"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            {...register('engine', { required: 'Engine is required' })}
          >
            <option value="">Select an engine</option>
            <option value="gpt-4">GPT-4</option>
            <option value="llama-3">LLaMA 3</option>
            <option value="claude">Claude</option>
          </select>
          {errors.engine && (
            <p className="mt-1 text-sm text-red-600">{errors.engine.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Generating...
            </>
          ) : (
            'Generate Code'
          )}
        </button>
      </form>

      {result && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Generation Results</h3>
          
          <div className="space-y-4">
            {result.project && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-indigo-700 mb-2">Project Created/Found</h4>
                <p><span className="font-medium">Name:</span> {result.project.PROJECT_NAME}</p>
                <p><span className="font-medium">Description:</span> {result.project.PROJECT_DESCRIPTION}</p>
              </div>
            )}
            
            {result.module && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-indigo-700 mb-2">Module Created/Found</h4>
                <p><span className="font-medium">Name:</span> {result.module.MODULE_NAME}</p>
                <p><span className="font-medium">Description:</span> {result.module.MODULE_DESCRIPTION}</p>
                <p><span className="font-medium">Database Table:</span> {result.module.DATABASE_TABLE}</p>
              </div>
            )}
            
            {result.moduleDatabase && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-indigo-700 mb-2">Database Table Created/Found</h4>
                <p><span className="font-medium">Table Name:</span> {result.moduleDatabase.DATABASE_TABLE}</p>
                <details>
                  <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800">
                    View Creation Statement
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {result.moduleDatabase.CREATION_STATEMENT}
                  </pre>
                </details>
              </div>
            )}
            
            {result.generatedCode && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-indigo-700 mb-2">Generated Code</h4>
                <details open>
                  <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800">
                    View Code
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {result.generatedCode}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;