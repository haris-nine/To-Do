// src/modules/dom.js
import { ToDo, ProjectList, saveToLocalStorage } from './ToDo.js';
import MicroModal from 'micromodal';
import { isAfter, isToday, parseISO } from 'date-fns';

MicroModal.init();

function initProjectCreation() {
    const projectCreator = document.getElementById('create-project');
    const newProjectInput = document.getElementById('new-project');

    projectCreator.addEventListener('click', () => {
        const projectName = newProjectInput.value.trim();
        if (projectName) {
            if (ProjectList.addProject(projectName)) {
                renderProjects();
                newProjectInput.value = '';
            }
        }
    });
}

function renderProjects() {
    const projectDropdown = document.getElementById('project');
    const projectContainer = document.getElementById('project-container');

    projectDropdown.innerHTML = '';
    projectContainer.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a Project';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    projectDropdown.appendChild(defaultOption);

    ProjectList.projects.forEach(project => {
        const projectButton = document.createElement('button');
        projectButton.textContent = project.name;
        projectButton.classList.add('project-button');

        projectButton.addEventListener('click', () => {
            document.querySelectorAll('.project-button').forEach(btn => btn.classList.remove('active'));
            projectButton.classList.add('active');
            renderTodosForProject(project.name);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-project-button');

        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete the project "${project.name}"?`)) {
                if (ProjectList.deleteProject(project.name)) {
                    renderProjects();
                    const activeProject = document.querySelector('.project-button.active');
                    if (!activeProject) {
                        const defaultButton = Array.from(document.querySelectorAll('.project-button')).find(
                            btn => btn.textContent === 'Default'
                        );
                        if (defaultButton) {
                            defaultButton.classList.add('active');
                            renderTodosForProject('Default');
                        }
                    }
                }
            }
        });

        const projectDiv = document.createElement('div');
        projectDiv.classList.add('project-item');
        projectDiv.appendChild(projectButton);
        projectDiv.appendChild(deleteButton);
        projectContainer.appendChild(projectDiv);

        const dropdownOption = document.createElement('option');
        dropdownOption.value = project.name;
        dropdownOption.textContent = project.name;
        projectDropdown.appendChild(dropdownOption);
    });

    if (!document.querySelector('.project-button.active')) {
        const defaultButton = Array.from(document.querySelectorAll('.project-button')).find(
            btn => btn.textContent === 'Default'
        );
        if (defaultButton) {
            defaultButton.classList.add('active');
            renderTodosForProject('Default');
        }
    }
}

function initTodoCreation() {
    const todoForm = document.getElementById('To-Do');

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const dueDate = document.getElementById('dueDate').value;
        const priority = document.getElementById('priority').value;
        const status = document.getElementById('status').value;
        const project = document.getElementById('project').value;

        if (!project) {
            alert('Please select a project');
            return;
        }

        // Use date-fns for date validation
        const today = new Date();
        const selectedDate = parseISO(dueDate);

        if (!isAfter(selectedDate, today) && !isToday(selectedDate)) {
            alert('Due date must be today or in the future!');
            return;
        }

        const newTodo = new ToDo(title, description, dueDate, priority, status);
        ProjectList.addTodoToProject(project, newTodo);
        todoForm.reset();

        const activeProjectButton = document.querySelector('.project-button.active');
        if (activeProjectButton && activeProjectButton.textContent === project) {
            renderTodosForProject(project);
        }
    });
}

function renderTodosForProject(projectName) {
    const todoDisplay = document.getElementById('todo-display');
    todoDisplay.innerHTML = `<h2>${projectName} To-Dos</h2>`;

    const project = ProjectList.projects.find(p => p.name === projectName);

    if (!project || project.todos.length === 0) {
        todoDisplay.innerHTML += '<p>No todos in this project.</p>';
        return;
    }

    project.todos.forEach((todo, index) => {
        const todoElement = document.createElement('div');
        todoElement.classList.add('todo-item', `priority-${todo.priority}`);
        
        // Add overdue class if applicable
        if (todo.isOverdue()) {
            todoElement.classList.add('overdue');
        }
        
        if (todo.status === 'done') {
            todoElement.classList.add('completed');
        }

        todoElement.innerHTML = `
            <h3>${todo.title}</h3>
            <p><strong>Description:</strong> ${todo.description}</p>
            <p><strong>Due Date:</strong> ${todo.getFormattedDueDate()}</p>
            <p><strong>Priority:</strong> ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</p>
            <p><strong>Status:</strong> ${todo.status}</p>
            <button class="delete-todo" data-project="${projectName}" data-index="${index}">Delete</button>
            <button class="toggle-status" data-project="${projectName}" data-index="${index}">Toggle Status</button>
            <button class="edit-todo" data-project="${projectName}" data-index="${index}">Edit</button>
        `;

        todoElement.querySelector('.delete-todo').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the todo "${todo.title}"?`)) {
                ProjectList.deleteTodoFromProject(projectName, index);
                renderTodosForProject(projectName);
            }
        });

        todoElement.querySelector('.toggle-status').addEventListener('click', () => {
            todo.toggleStatus();
            saveToLocalStorage();
            renderTodosForProject(projectName);
        });

        todoElement.querySelector('.edit-todo').addEventListener('click', () => {
            const newTitle = prompt('Enter new title', todo.title);
            const newDescription = prompt('Enter new description', todo.description);
            const newDueDate = prompt('Enter new due date', todo.dueDate);
            const newPriority = prompt('Enter new priority', todo.priority);

            if (newTitle && newDescription && newDueDate && newPriority) {
                todo.title = newTitle;
                todo.description = newDescription;
                todo.dueDate = newDueDate;
                todo.priority = newPriority;
                saveToLocalStorage();
                renderTodosForProject(projectName);
            }
        });

        todoDisplay.appendChild(todoElement);
    });

    // Add "Delete All Completed" button
    const deleteAllCompletedButton = document.createElement('button');
    deleteAllCompletedButton.textContent = 'Delete All Completed Todos';
    deleteAllCompletedButton.addEventListener('click', () => {
        const completedTodos = project.todos.filter(todo => todo.status === 'done');
        if (completedTodos.length > 0 && confirm(`Are you sure you want to delete all completed todos?`)) {
            project.todos = project.todos.filter(todo => todo.status !== 'done');
            saveToLocalStorage();
            renderTodosForProject(projectName);
        }
    });
    todoDisplay.appendChild(deleteAllCompletedButton);
}

function initProjectDropdownSync() {
    const projectDropdown = document.getElementById('project');
    projectDropdown.addEventListener('change', (e) => {
        const selectedProject = e.target.value;
        if (selectedProject) {
            const projectButton = Array.from(document.querySelectorAll('.project-button')).find(
                btn => btn.textContent === selectedProject
            );
            if (projectButton) {
                projectButton.click();
            }
        }
    });
}

export { 
    initProjectCreation, 
    initTodoCreation, 
    renderProjects, 
    renderTodosForProject,
    initProjectDropdownSync
};