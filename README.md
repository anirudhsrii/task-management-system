# Task Management System

A complete, full-featured Task Management System built with Node.js, Express, and vanilla JavaScript. This system includes user authentication, task CRUD operations, priority management, and a modern, responsive UI.

## Features

✅ **Task Creation** - Create tasks with title, description, due date, and priority  
✅ **Task List** - View all tasks with pagination and Ajax loading  
✅ **Task Details** - View complete details of any task  
✅ **Task Editing** - Edit task title, description, due date, and priority  
✅ **Task Deletion** - Delete tasks with confirmation dialog  
✅ **Task Status Update** - Mark tasks as completed or pending  
✅ **User Authentication** - Secure login/register system with JWT tokens  
✅ **Priority Management** - Drag and drop tasks between priority lists (High, Medium, Low)  
✅ **Visual Representation** - Color-coded priority lists for quick identification  
✅ **Responsive Design** - Works on desktop and mobile devices  

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

The server will run on port 3000. Make sure this port is available.

## Usage

### First Time Setup

1. **Register a new account:**
   - Click on the "Register" tab
   - Enter a username, email (optional), and password
   - Click "Register"

2. **Login:**
   - Enter your username and password
   - Click "Login"

### Managing Tasks

1. **Create a Task:**
   - Fill in the task form with title, description, due date, and priority
   - Click "Create Task"

2. **View Tasks:**
   - All tasks are displayed in the "All Tasks" section with pagination
   - Tasks are also organized by priority in the color-coded columns

3. **View Task Details:**
   - Click the "View" button on any task to see full details

4. **Edit a Task:**
   - Click the "Edit" button on any task
   - Modify the details in the modal
   - Click "Update Task"

5. **Change Task Status:**
   - Click "Mark Complete" or "Mark Pending" to toggle task status

6. **Change Task Priority:**
   - Drag and drop tasks between the High, Medium, and Low priority columns
   - Or edit a task and change the priority in the edit form

7. **Delete a Task:**
   - Click the "Delete" button
   - Confirm the deletion in the dialog

### Priority Lists

- **High Priority** (Red) - Urgent tasks
- **Medium Priority** (Orange) - Normal tasks
- **Low Priority** (Green) - Low priority tasks

You can drag tasks between these columns to change their priority.

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks (with pagination)
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/priority/:priority` - Get tasks by priority

## Data Storage

Tasks and users are stored in a `data.json` file. This file is automatically created when you first run the server.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Storage:** JSON file-based storage

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- User-specific task access (users can only see their own tasks)
- Secure API endpoints with authentication middleware

**Tasks not loading:**
- Check browser console for errors
- Verify you're logged in
- Check server logs for errors
