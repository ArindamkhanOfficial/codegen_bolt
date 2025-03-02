import axios from 'axios';
import { CodegenRequest, CodegenResponse } from '../types';

const API_URL = 'http://localhost:5000/api';

export const generateCode = async (data: CodegenRequest): Promise<CodegenResponse> => {
  try {
    const response = await axios.post(`${API_URL}/generate`, data);
    return response.data;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/projects`);
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const getModules = async (projectId?: number) => {
  try {
    const url = projectId 
      ? `${API_URL}/modules?projectId=${projectId}` 
      : `${API_URL}/modules`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
};

export const getModuleDatabases = async (moduleId?: number) => {
  try {
    const url = moduleId 
      ? `${API_URL}/module-databases?moduleId=${moduleId}` 
      : `${API_URL}/module-databases`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching module databases:', error);
    throw error;
  }
};