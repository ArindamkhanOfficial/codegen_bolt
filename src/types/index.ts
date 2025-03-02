export interface Project {
  PROJECT_ID: number;
  PROJECT_NAME: string;
  PROJECT_DESCRIPTION: string;
  MODULE_DESCRIPTION: string;
  INSERT_ID: string;
  INSERT_DATE_TIME: string;
}

export interface Module {
  MODULE_ID: number;
  MODULE_NAME: string;
  MODULE_DESCRIPTION: string;
  PROJECT_ID: number;
  DATABASE_TABLE: string;
  INSERT_ID: string;
  INSERT_DATE_TIME: string;
}

export interface ModuleDatabase {
  MODULE_DATABASE_ID: number;
  MODULE_ID: number;
  DATABASE_TABLE: string;
  CREATION_STATEMENT: string;
  INSERT_ID: string;
  INSERT_DATE_TIME: string;
}

export interface LLMOutput {
  OUTPUT_ID: number;
  PROMPT: string;
  ENGINE: string;
  OUTPUT: string;
  INSERT_ID: string;
  INSERT_DATE_TIME: string;
}

export interface CodegenRequest {
  prompt: string;
  engine: string;
}

export interface CodegenResponse {
  success: boolean;
  message: string;
  project?: Project;
  module?: Module;
  moduleDatabase?: ModuleDatabase;
  llmOutput?: LLMOutput;
  generatedCode?: string;
}