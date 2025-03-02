from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
import json
import datetime
import uuid
import re
try:
    from dotenv import load_dotenv
    # Load environment variables
    load_dotenv()
except ImportError:
    print("python-dotenv not installed. Environment variables must be set manually.")

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'codegen_platform')
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return None

def init_db():
    """Initialize the database with required tables if they don't exist"""
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database for initialization")
        return False
    
    cursor = conn.cursor()
    
    # Create AIA_PROJECT table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS AIA_PROJECT (
        PROJECT_ID INT AUTO_INCREMENT PRIMARY KEY,
        PROJECT_NAME VARCHAR(255) NOT NULL,
        PROJECT_DESCRIPTION TEXT,
        MODULE_DESCRIPTION TEXT,
        INSERT_ID VARCHAR(255),
        INSERT_DATE_TIME DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create AIA_MODULE table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS AIA_MODULE (
        MODULE_ID INT AUTO_INCREMENT PRIMARY KEY,
        MODULE_NAME VARCHAR(255) NOT NULL,
        MODULE_DESCRIPTION TEXT,
        PROJECT_ID INT,
        DATABASE_TABLE VARCHAR(255),
        INSERT_ID VARCHAR(255),
        INSERT_DATE_TIME DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (PROJECT_ID) REFERENCES AIA_PROJECT(PROJECT_ID)
    )
    ''')
    
    # Create AIA_MODULE_DATABASES table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS AIA_MODULE_DATABASES (
        MODULE_DATABASE_ID INT AUTO_INCREMENT PRIMARY KEY,
        MODULE_ID INT,
        DATABASE_TABLE VARCHAR(255),
        CREATION_STATEMENT TEXT,
        INSERT_ID VARCHAR(255),
        INSERT_DATE_TIME DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (MODULE_ID) REFERENCES AIA_MODULE(MODULE_ID)
    )
    ''')
    
    # Create AIA_LLM_OUTPUTS table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS AIA_LLM_OUTPUTS (
        OUTPUT_ID INT AUTO_INCREMENT PRIMARY KEY,
        PROMPT TEXT,
        ENGINE VARCHAR(255),
        OUTPUT TEXT,
        INSERT_ID VARCHAR(255),
        INSERT_DATE_TIME DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("Database initialized successfully")
    return True

# Initialize database on startup
init_db()

@app.route('/api/generate', methods=['POST'])
def generate_code():
    data = request.json
    prompt = data.get('prompt')
    engine = data.get('engine')
    
    if not prompt or not engine:
        return jsonify({'success': False, 'message': 'Prompt and engine are required'}), 400
    
    # Generate a unique ID for this request
    request_id = str(uuid.uuid4())
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Step 1: Store LLM output
        llm_output = f"Generated output for prompt: {prompt} using engine: {engine}"
        cursor.execute(
            "INSERT INTO AIA_LLM_OUTPUTS (PROMPT, ENGINE, OUTPUT, INSERT_ID) VALUES (%s, %s, %s, %s)",
            (prompt, engine, llm_output, request_id)
        )
        llm_output_id = cursor.lastrowid
        
        # Step 2: Check for similar projects
        cursor.execute(
            "SELECT * FROM AIA_PROJECT WHERE PROJECT_NAME LIKE %s OR PROJECT_DESCRIPTION LIKE %s LIMIT 1",
            (f"%{prompt}%", f"%{prompt}%")
        )
        existing_project = cursor.fetchone()
        
        if existing_project:
            project_id = existing_project['PROJECT_ID']
            project = existing_project
        else:
            # Create new project
            project_name = f"{prompt.title()} Project"
            project_description = f"Project generated from prompt: {prompt}"
            cursor.execute(
                "INSERT INTO AIA_PROJECT (PROJECT_NAME, PROJECT_DESCRIPTION, MODULE_DESCRIPTION, INSERT_ID) VALUES (%s, %s, %s, %s)",
                (project_name, project_description, "", request_id)
            )
            project_id = cursor.lastrowid
            project = {
                'PROJECT_ID': project_id,
                'PROJECT_NAME': project_name,
                'PROJECT_DESCRIPTION': project_description,
                'MODULE_DESCRIPTION': "",
                'INSERT_ID': request_id,
                'INSERT_DATE_TIME': datetime.datetime.now().isoformat()
            }
        
        # Step 3: Check for similar modules
        cursor.execute(
            "SELECT * FROM AIA_MODULE WHERE MODULE_NAME LIKE %s OR MODULE_DESCRIPTION LIKE %s LIMIT 1",
            (f"%{prompt}%", f"%{prompt}%")
        )
        existing_module = cursor.fetchone()
        
        if existing_module:
            module_id = existing_module['MODULE_ID']
            module = existing_module
        else:
            # Create new module
            module_name = f"{prompt.title()} Module"
            module_description = f"Module generated from prompt: {prompt}"
            table_name = f"{prompt.lower().replace(' ', '_')}_table"
            cursor.execute(
                "INSERT INTO AIA_MODULE (MODULE_NAME, MODULE_DESCRIPTION, PROJECT_ID, DATABASE_TABLE, INSERT_ID) VALUES (%s, %s, %s, %s, %s)",
                (module_name, module_description, project_id, table_name, request_id)
            )
            module_id = cursor.lastrowid
            module = {
                'MODULE_ID': module_id,
                'MODULE_NAME': module_name,
                'MODULE_DESCRIPTION': module_description,
                'PROJECT_ID': project_id,
                'DATABASE_TABLE': table_name,
                'INSERT_ID': request_id,
                'INSERT_DATE_TIME': datetime.datetime.now().isoformat()
            }
        
        # Step 4: Check for database table
        cursor.execute(
            "SELECT * FROM AIA_MODULE_DATABASES WHERE MODULE_ID = %s OR DATABASE_TABLE = %s LIMIT 1",
            (module_id, module.get('DATABASE_TABLE'))
        )
        existing_db = cursor.fetchone()
        
        if existing_db:
            module_database = existing_db
        else:
            # Create new database table definition
            table_name = module.get('DATABASE_TABLE')
            creation_statement = generate_table_creation_statement(table_name, prompt)
            cursor.execute(
                "INSERT INTO AIA_MODULE_DATABASES (MODULE_ID, DATABASE_TABLE, CREATION_STATEMENT, INSERT_ID) VALUES (%s, %s, %s, %s)",
                (module_id, table_name, creation_statement, request_id)
            )
            module_database_id = cursor.lastrowid
            module_database = {
                'MODULE_DATABASE_ID': module_database_id,
                'MODULE_ID': module_id,
                'DATABASE_TABLE': table_name,
                'CREATION_STATEMENT': creation_statement,
                'INSERT_ID': request_id,
                'INSERT_DATE_TIME': datetime.datetime.now().isoformat()
            }
            
            # Actually create the table in the database
            try:
                cursor.execute(creation_statement)
            except mysql.connector.Error as err:
                print(f"Error creating table: {err}")
        
        # Step 5: Generate application code
        generated_code = generate_application_code(prompt, module, module_database)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Code generated successfully',
            'project': project,
            'module': module,
            'moduleDatabase': module_database,
            'llmOutput': {
                'OUTPUT_ID': llm_output_id,
                'PROMPT': prompt,
                'ENGINE': engine,
                'OUTPUT': llm_output,
                'INSERT_ID': request_id,
                'INSERT_DATE_TIME': datetime.datetime.now().isoformat()
            },
            'generatedCode': generated_code
        })
        
    except Exception as e:
        print(f"Error generating code: {e}")
        return jsonify({'success': False, 'message': f'Error generating code: {str(e)}'}), 500

def generate_table_creation_statement(table_name, prompt):
    """Generate a SQL table creation statement based on the prompt"""
    # This is a simplified example - in a real application, you would use the LLM to generate this
    
    # Basic fields for common applications
    fields = [
        "id INT AUTO_INCREMENT PRIMARY KEY",
        "name VARCHAR(255) NOT NULL",
        "description TEXT",
        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ]
    
    # Add fields based on prompt keywords
    if "address" in prompt.lower() or "contact" in prompt.lower():
        fields.extend([
            "email VARCHAR(255)",
            "phone VARCHAR(20)",
            "address TEXT"
        ])
    
    if "task" in prompt.lower() or "todo" in prompt.lower():
        fields.extend([
            "status VARCHAR(50) DEFAULT 'pending'",
            "due_date DATETIME",
            "priority VARCHAR(20) DEFAULT 'medium'"
        ])
    
    if "product" in prompt.lower() or "inventory" in prompt.lower():
        fields.extend([
            "price DECIMAL(10, 2)",
            "quantity INT DEFAULT 0",
            "category VARCHAR(100)"
        ])
    
    creation_statement = f"CREATE TABLE {table_name} (\n  " + ",\n  ".join(fields) + "\n);"
    return creation_statement

def generate_application_code(prompt, module, module_database):
    """Generate application code based on the prompt and database structure"""
    # This is a simplified example - in a real application, you would use the LLM to generate this
    
    table_name = module_database.get('DATABASE_TABLE')
    creation_statement = module_database.get('CREATION_STATEMENT')
    
    # Extract field names from creation statement
    field_matches = re.findall(r'(\w+)\s+[A-Z]+', creation_statement)
    fields = [field for field in field_matches if field.lower() not in ('table', 'create', 'primary', 'default', 'auto_increment')]
    
    # Generate form fields for React component
    form_fields = ""
    for field in fields:
        if field not in ('id', 'created_at', 'updated_at'):
            form_fields += f'''
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="{field}">{field.replace('_', ' ').title()}</label>
          <input
            type="text"
            id="{field}"
            name="{field}"
            value={{formData.{field}}}
            onChange={{handleInputChange}}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>'''
    
    # Generate table headers
    table_headers = ""
    for field in fields:
        table_headers += f'<th className="py-2 px-4 border-b">{field.replace("_", " ").title()}</th>'
    
    # Generate table cells
    table_cells = ""
    for field in fields:
        table_cells += f'<td className="py-2 px-4 border-b">{{item.{field}}}</td>'
    
    # Generate form data initialization
    form_data_fields = ", ".join([f"{field}: ''" for field in fields if field != 'id'])
    form_data_reset = ", ".join([f"{field}: ''" for field in fields if field != 'id'])
    
    # Generate React component
    react_component = f"""
// React component for {module.get('MODULE_NAME')}
import React, {{ useState, useEffect }} from 'react';
import axios from 'axios';

function {module.get('MODULE_NAME').replace(' ', '')}Component() {{
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({{
    {form_data_fields}
  }});
  const [loading, setLoading] = useState(false);

  useEffect(() => {{
    fetchItems();
  }}, []);

  const fetchItems = async () => {{
    setLoading(true);
    try {{
      const response = await axios.get('/api/{table_name}');
      setItems(response.data);
    }} catch (error) {{
      console.error('Error fetching data:', error);
    }} finally {{
      setLoading(false);
    }}
  }};

  const handleInputChange = (e) => {{
    const {{ name, value }} = e.target;
    setFormData(prev => ({{ ...prev, [name]: value }}));
  }};

  const handleSubmit = async (e) => {{
    e.preventDefault();
    try {{
      await axios.post('/api/{table_name}', formData);
      // Reset form
      setFormData({{ {form_data_reset} }});
      // Refresh list
      fetchItems();
    }} catch (error) {{
      console.error('Error creating item:', error);
    }}
  }};

  const handleDelete = async (id) => {{
    try {{
      await axios.delete(`/api/{table_name}/${{id}}`);
      fetchItems();
    }} catch (error) {{
      console.error('Error deleting item:', error);
    }}
  }};

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{module.get('MODULE_NAME')}</h1>
      
      <form onSubmit={{handleSubmit}} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
        {form_fields}
        
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Save
        </button>
      </form>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Items</h2>
        
        {{loading ? (
          <p>Loading...</p>
        ): items.length === 0 ? (
          <p>No items found.</p>
        ): (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  {table_headers}
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {{items.map(item => (
                  <tr key={{item.id}}>
                    {table_cells}
                    <td className="py-2 px-4 border-b">
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}}
              </tbody>
            </table>
          </div>
        )}}
      </div>
    </div>
  );
}}

export default {module.get('MODULE_NAME').replace(' ', '')}Component;
"""

    # Generate API fields
    api_fields = ", ".join([f"'{field}'" for field in fields if field not in ('id', 'created_at', 'updated_at')])
    
    # Generate Flask API
    flask_api = f"""
# Flask API for {module.get('MODULE_NAME')}
from flask import Blueprint, request, jsonify
from app import db

{table_name}_bp = Blueprint('{table_name}', __name__)

@{table_name}_bp.route('/api/{table_name}', methods=['GET'])
def get_all():
    cursor = db.cursor(dictionary=True)
    cursor.execute(f"SELECT * FROM {table_name}")
    items = cursor.fetchall()
    cursor.close()
    return jsonify(items)

@{table_name}_bp.route('/api/{table_name}/<int:id>', methods=['GET'])
def get_one(id):
    cursor = db.cursor(dictionary=True)
    cursor.execute(f"SELECT * FROM {table_name} WHERE id = %s", (id,))
    item = cursor.fetchone()
    cursor.close()
    
    if not item:
        return jsonify({{"error": "Item not found"}}), 404
        
    return jsonify(item)

@{table_name}_bp.route('/api/{table_name}', methods=['POST'])
def create():
    data = request.json
    fields = [{api_fields}]
    
    # Filter out any fields that aren't in our table
    filtered_data = {{k: v for k, v in data.items() if k in fields}}
    
    if not filtered_data:
        return jsonify({{"error": "No valid fields provided"}}), 400
    
    field_names = ', '.join(filtered_data.keys())
    placeholders = ', '.join(['%s'] * len(filtered_data))
    
    cursor = db.cursor()
    query = f"INSERT INTO {table_name} ({{field_names}}) VALUES ({{placeholders}})"
    
    cursor.execute(query, tuple(filtered_data.values()))
    db.commit()
    
    new_id = cursor.lastrowid
    cursor.close()
    
    return jsonify({{"id": new_id, "message": "Item created successfully"}}), 201

@{table_name}_bp.route('/api/{table_name}/<int:id>', methods=['PUT'])
def update(id):
    data = request.json
    fields = [{api_fields}]
    
    # Filter out any fields that aren't in our table
    filtered_data = {{k: v for k, v in data.items() if k in fields}}
    
    if not filtered_data:
        return jsonify({{"error": "No valid fields provided"}}), 400
    
    set_clause = ', '.join([f"{{field}} = %s" for field in filtered_data.keys()])
    
    cursor = db.cursor()
    query = f"UPDATE {table_name} SET {{set_clause}} WHERE id = %s"
    
    cursor.execute(query, tuple(filtered_data.values()) + (id,))
    db.commit()
    
    affected_rows = cursor.rowcount
    cursor.close()
    
    if affected_rows == 0:
        return jsonify({{"error": "Item not found or no changes made"}}), 404
        
    return jsonify({{"message": "Item updated successfully"}})

@{table_name}_bp.route('/api/{table_name}/<int:id>', methods=['DELETE'])
def delete(id):
    cursor = db.cursor()
    cursor.execute(f"DELETE FROM {table_name} WHERE id = %s", (id,))
    db.commit()
    
    affected_rows = cursor.rowcount
    cursor.close()
    
    if affected_rows == 0:
        return jsonify({{"error": "Item not found"}}), 404
        
    return jsonify({{"message": "Item deleted successfully"}})
"""

    # Combine all code
    combined_code = f"""
# Generated Code for {module.get('MODULE_NAME')}

## Database Schema
```sql
{creation_statement}
```

## React Component
```jsx
{react_component}
```

## Flask API
```python
{flask_api}
```
"""

    return combined_code

@app.route('/api/projects', methods=['GET'])
def get_projects():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM AIA_PROJECT ORDER BY INSERT_DATE_TIME DESC")
        projects = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime objects to strings for JSON serialization
        for project in projects:
            if 'INSERT_DATE_TIME' in project and project['INSERT_DATE_TIME']:
                project['INSERT_DATE_TIME'] = project['INSERT_DATE_TIME'].isoformat()
        
        return jsonify(projects)
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/modules', methods=['GET'])
def get_modules():
    project_id = request.args.get('projectId')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if project_id:
            cursor.execute("SELECT * FROM AIA_MODULE WHERE PROJECT_ID = %s ORDER BY INSERT_DATE_TIME DESC", (project_id,))
        else:
            cursor.execute("SELECT * FROM AIA_MODULE ORDER BY INSERT_DATE_TIME DESC")
            
        modules = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime objects to strings for JSON serialization
        for module in modules:
            if 'INSERT_DATE_TIME' in module and module['INSERT_DATE_TIME']:
                module['INSERT_DATE_TIME'] = module['INSERT_DATE_TIME'].isoformat()
        
        return jsonify(modules)
    except Exception as e:
        print(f"Error fetching modules: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/module-databases', methods=['GET'])
def get_module_databases():
    module_id = request.args.get('moduleId')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if module_id:
            cursor.execute("SELECT * FROM AIA_MODULE_DATABASES WHERE MODULE_ID = %s", (module_id,))
        else:
            cursor.execute("SELECT * FROM AIA_MODULE_DATABASES")
            
        module_databases = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime objects to strings for JSON serialization
        for db in module_databases:
            if 'INSERT_DATE_TIME' in db and db['INSERT_DATE_TIME']:
                db['INSERT_DATE_TIME'] = db['INSERT_DATE_TIME'].isoformat()
        
        return jsonify(module_databases)
    except Exception as e:
        print(f"Error fetching module databases: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)