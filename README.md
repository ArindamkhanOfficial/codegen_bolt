# Codegen Agent Platform

A full-stack application that generates code based on user prompts, leveraging existing components and database structures.

## Features

- Generate application code from natural language prompts
- Check for existing applications, modules, and database tables
- Create or reuse database tables as needed
- Store LLM engine outputs
- React frontend with TypeScript and Tailwind CSS
- Flask backend with MySQL database

## Project Structure

The project consists of two main parts:

1. **Frontend**: React application with TypeScript and Tailwind CSS
2. **Backend**: Flask API with MySQL database

### Database Tables

- **AIA_PROJECT**: Stores project metadata
- **AIA_MODULE**: Stores module metadata
- **AIA_MODULE_DATABASES**: Stores database table metadata and creation statements
- **AIA_LLM_OUTPUTS**: Stores LLM engine outputs

## Setup Instructions

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and configure your MySQL connection:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=codegen_platform
   ```

5. Start the Flask server:
   ```
   python app.py
   ```

## Usage

1. Open the application in your browser
2. Enter a prompt describing the application you want to build
3. Select an LLM engine
4. Click "Generate Code"
5. The system will:
   - Check for existing projects, modules, and database tables
   - Create new components as needed
   - Generate application code based on your requirements

## Development

### Frontend

The frontend is built with:
- React
- TypeScript
- Tailwind CSS
- React Router for navigation
- Axios for API requests

### Backend

The backend is built with:
- Flask
- MySQL database
- Python

## License

MIT