// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let isEditing = false;
let editId = null;

// Initialize
function init() {
  renderTasks();
  updateTheme();
}

// Render Tasks
function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchInput.value.toLowerCase());
    
    if (currentFilter === 'all') return matchesSearch;
    if (currentFilter === 'active') return !task.completed && matchesSearch;
    if (currentFilter === 'completed') return task.completed && matchesSearch;
  });

  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<p class="empty">No tasks found</p>';
    return;
  }

  filteredTasks.forEach(task => {
    const taskItem = document.createElement('li');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskItem.dataset.id = task.id;

    taskItem.innerHTML = `
      <span class="task-text">${task.text}</span>
      <div class="task-actions">
        <button class="edit-btn" aria-label="Edit task">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn" aria-label="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    taskList.appendChild(taskItem);
  });
}

// Add Task
function addTask(e) {
  e.preventDefault();
  const text = taskInput.value.trim();

  if (!text) return;

  if (isEditing) {
    tasks = tasks.map(task => 
      task.id === editId ? { ...task, text } : task
    );
    isEditing = false;
    editId = null;
    taskForm.querySelector('button').textContent = 'Add Task';
  } else {
    const newTask = {
      id: Date.now(),
      text,
      completed: false
    };
    tasks.push(newTask);
  }

  taskInput.value = '';
  saveTasks();
  renderTasks();
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Toggle Complete
function toggleComplete(id) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

// Edit Task
function editTask(id) {
  const task = tasks.find(task => task.id === id);
  taskInput.value = task.text;
  isEditing = true;
  editId = id;
  taskForm.querySelector('button').textContent = 'Update Task';
  taskInput.focus();
}

// Save to Local Storage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Filter Tasks
function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach(btn => 
    btn.classList.toggle('active', btn.dataset.filter === filter)
  );
  renderTasks();
}

// Search Tasks
function searchTasks() {
  renderTasks();
}

// Toggle Theme
function toggleTheme() {
  document.body.dataset.theme = 
    document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', document.body.dataset.theme);
  updateTheme();
}

function updateTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.dataset.theme = savedTheme;
  themeToggle.innerHTML = savedTheme === 'dark' 
    ? '<i class="fas fa-sun"></i>' 
    : '<i class="fas fa-moon"></i>';
}

// Event Listeners
taskForm.addEventListener('submit', addTask);
searchInput.addEventListener('input', searchTasks);
themeToggle.addEventListener('click', toggleTheme);

// Event Delegation
taskList.addEventListener('click', e => {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;

  const id = Number(taskItem.dataset.id);

  if (e.target.closest('.delete-btn')) {
    deleteTask(id);
  } else if (e.target.closest('.edit-btn')) {
    editTask(id);
  } else {
    toggleComplete(id);
  }
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

// Initialize App
init();