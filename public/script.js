// API Configuration
// Use relative API path for production, localhost for development
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : '/api';

// State Management
let currentUser = null;
let authToken = null;
let currentPage = 1;
let tasksPerPage = 10;
let currentStatusFilter = '';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showApp();
    } else {
        showAuthModal();
    }
}

// Show/Hide UI
function showAuthModal() {
    document.getElementById('authModal').classList.add('show');
    document.getElementById('app').classList.add('hidden');
}

function showApp() {
    document.getElementById('authModal').classList.remove('show');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('usernameDisplay').textContent = currentUser.username;
    loadTasks();
    loadPriorityTasks();
}

// Event Listeners
function setupEventListeners() {
    // Auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchAuthTab(tab);
        });
    });

    // Login form
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Task form
    document.getElementById('taskForm').addEventListener('submit', handleCreateTask);
    
    // Edit task form
    document.getElementById('editTaskForm').addEventListener('submit', handleUpdateTask);
    
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        currentStatusFilter = e.target.value;
        currentPage = 1;
        loadTasks();
    });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            modal.classList.remove('show');
        });
    });
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
}

// Auth Tab Switching
function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.getElementById('loginForm').classList.toggle('active', tab === 'login');
    document.getElementById('registerForm').classList.toggle('active', tab === 'register');
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showApp();
        } else {
            errorEl.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        errorEl.textContent = 'Network error. Make sure the server is running';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorEl = document.getElementById('registerError');
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showApp();
        } else {
            errorEl.textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        errorEl.textContent = 'Network error. Make sure the server is running';
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    showAuthModal();
    document.getElementById('loginFormElement').reset();
    document.getElementById('registerFormElement').reset();
}

// Task CRUD Operations
async function handleCreateTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, description, dueDate, priority })
        });
        
        if (response.ok) {
            document.getElementById('taskForm').reset();
            loadTasks();
            loadPriorityTasks();
        } else {
            alert('Failed to create task');
        }
    } catch (error) {
        alert('Network error');
    }
}

async function loadTasks() {
    try {
        const statusParam = currentStatusFilter ? `&status=${currentStatusFilter}` : '';
        const response = await fetch(
            `${API_BASE}/tasks?page=${currentPage}&limit=${tasksPerPage}${statusParam}`,
            {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }
        );
        
        const data = await response.json();
        
        if (response.ok) {
            displayTasks(data.tasks);
            displayPagination(data.totalPages, data.page);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadPriorityTasks() {
    const priorities = ['high', 'medium', 'low'];
    
    for (const priority of priorities) {
        try {
            const response = await fetch(`${API_BASE}/tasks/priority/${priority}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                displayPriorityTasks(priority, data);
                updatePriorityCount(priority, data.length);
            }
        } catch (error) {
            console.error(`Error loading ${priority} priority tasks:`, error);
        }
    }
}

function displayTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    
    if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No tasks found</p>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-info">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span><strong>Due:</strong> ${formatDate(task.dueDate)}</span>
                    <span class="task-status ${task.status}">${task.status}</span>
                    <span><strong>Priority:</strong> ${task.priority}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="viewTaskDetails('${task.id}')">View</button>
                <button class="btn-edit" onclick="editTask('${task.id}')">Edit</button>
                <button class="btn-status" onclick="toggleTaskStatus('${task.id}', '${task.status}')">
                    ${task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                </button>
                <button class="btn-danger" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function displayPriorityTasks(priority, tasks) {
    const container = document.getElementById(`${priority}Tasks`);
    
    if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px; font-size: 0.9em;">No tasks</p>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="priority-task-item ${priority} ${task.status === 'completed' ? 'completed' : ''}" 
             data-id="${task.id}" 
             data-priority="${task.priority}"
             draggable="true"
             ondragstart="handleDragStart(event)"
             ondragover="handleDragOver(event)"
             ondrop="handleDrop(event)"
             ondragend="handleDragEnd(event)">
            <div style="font-weight: 600; margin-bottom: 5px;">${escapeHtml(task.title)}</div>
            <div style="font-size: 0.85em; color: #666;">
                Due: ${formatDate(task.dueDate)} | ${task.status}
            </div>
        </div>
    `).join('');
}

function updatePriorityCount(priority, count) {
    document.getElementById(`${priority}Count`).textContent = count;
}

function displayPagination(totalPages, currentPageNum) {
    const container = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button onclick="changePage(${currentPageNum - 1})" ${currentPageNum === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPageNum - 2 && i <= currentPageNum + 2)) {
            html += `<button class="${i === currentPageNum ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPageNum - 3 || i === currentPageNum + 3) {
            html += `<span>...</span>`;
        }
    }
    
    // Next button
    html += `<button onclick="changePage(${currentPageNum + 1})" ${currentPageNum === totalPages ? 'disabled' : ''}>Next</button>`;
    
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadTasks();
}

// Task Details
async function viewTaskDetails(taskId) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const task = await response.json();
        
        if (response.ok) {
            const content = document.getElementById('taskDetailsContent');
            content.innerHTML = `
                <h2>Task Details</h2>
                <div class="task-details">
                    <p><strong>Title:</strong> ${escapeHtml(task.title)}</p>
                    <p><strong>Description:</strong> ${escapeHtml(task.description || 'No description')}</p>
                    <p><strong>Due Date:</strong> ${formatDate(task.dueDate)}</p>
                    <p><strong>Priority:</strong> ${task.priority}</p>
                    <p><strong>Status:</strong> <span class="task-status ${task.status}">${task.status}</span></p>
                    <p><strong>Created:</strong> ${formatDate(task.createdAt)}</p>
                </div>
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button class="btn-edit" onclick="editTask('${task.id}'); document.getElementById('taskDetailsModal').classList.remove('show');">Edit Task</button>
                    <button class="btn-danger" onclick="deleteTask('${task.id}'); document.getElementById('taskDetailsModal').classList.remove('show');">Delete Task</button>
                </div>
            `;
            document.getElementById('taskDetailsModal').classList.add('show');
        }
    } catch (error) {
        alert('Error loading task details');
    }
}

// Edit Task
async function editTask(taskId) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const task = await response.json();
        
        if (response.ok) {
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTaskTitle').value = task.title;
            document.getElementById('editTaskDescription').value = task.description || '';
            document.getElementById('editTaskDueDate').value = task.dueDate.split('T')[0];
            document.getElementById('editTaskPriority').value = task.priority;
            document.getElementById('editTaskStatus').value = task.status;
            document.getElementById('taskEditModal').classList.add('show');
        }
    } catch (error) {
        alert('Error loading task for editing');
    }
}

async function handleUpdateTask(e) {
    e.preventDefault();
    const taskId = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value;
    const description = document.getElementById('editTaskDescription').value;
    const dueDate = document.getElementById('editTaskDueDate').value;
    const priority = document.getElementById('editTaskPriority').value;
    const status = document.getElementById('editTaskStatus').value;
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, description, dueDate, priority, status })
        });
        
        if (response.ok) {
            document.getElementById('taskEditModal').classList.remove('show');
            loadTasks();
            loadPriorityTasks();
        } else {
            alert('Failed to update task');
        }
    } catch (error) {
        alert('Network error');
    }
}

// Delete Task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadTasks();
            loadPriorityTasks();
        } else {
            alert('Failed to delete task');
        }
    } catch (error) {
        alert('Network error');
    }
}

// Toggle Task Status
async function toggleTaskStatus(taskId, currentStatus) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            loadTasks();
            loadPriorityTasks();
        } else {
            alert('Failed to update task status');
        }
    } catch (error) {
        alert('Network error');
    }
}

// Drag and Drop for Priority Management
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const taskList = e.target.closest('.task-list');
    if (taskList) {
        taskList.classList.add('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    const taskList = e.target.closest('.task-list');
    if (taskList && draggedElement) {
        const newPriority = taskList.closest('.priority-column').dataset.priority;
        const taskId = draggedElement.dataset.id;
        
        updateTaskPriority(taskId, newPriority);
    }
    
    document.querySelectorAll('.task-list').forEach(list => {
        list.classList.remove('drag-over');
    });
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.task-list').forEach(list => {
        list.classList.remove('drag-over');
    });
}

async function updateTaskPriority(taskId, newPriority) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ priority: newPriority })
        });
        
        if (response.ok) {
            loadTasks();
            loadPriorityTasks();
        } else {
            alert('Failed to update task priority');
        }
    } catch (error) {
        alert('Network error');
    }
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available
window.viewTaskDetails = viewTaskDetails;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.toggleTaskStatus = toggleTaskStatus;
window.changePage = changePage;
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDrop = handleDrop;
window.handleDragEnd = handleDragEnd;

