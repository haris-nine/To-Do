// src/modules/ToDo.js
import { isAfter, isToday, isBefore, parseISO, format } from 'date-fns';

class Project {
    constructor(name, todos = []) {
        this.name = name;
        this.todos = todos;
    }

    addTodo(todo) {
        this.todos.push(todo);
    }

    deleteTodo(todoIndex) {
        if (todoIndex >= 0 && todoIndex < this.todos.length) {
            this.todos.splice(todoIndex, 1);
        }
    }
}

class ToDo {
    constructor(title, description, dueDate, priority, status = "pending") {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.status = status;
    }

    toggleStatus() {
        this.status = this.status === "pending" ? "done" : "pending";
    }

    // New method to format date nicely
    getFormattedDueDate() {
        return format(parseISO(this.dueDate), 'PP');
    }

    // New method to check if todo is overdue
    isOverdue() {
        const today = new Date();
        return isBefore(parseISO(this.dueDate), today) && !isToday(parseISO(this.dueDate));
    }
}

const ProjectList = {
    projects: [new Project("Default")],

    addProject(name) {
        if (this.projects.some(project => project.name === name)) {
            alert("Project already exists!");
            return false;
        }
        const newProject = new Project(name);
        this.projects.push(newProject);
        saveToLocalStorage();
        return true;
    },

    deleteProject(name) {
        if (name === "Default") {
            alert("Cannot delete default project!");
            return false;
        }
        const index = this.projects.findIndex(project => project.name === name);
        if (index !== -1) {
            this.projects.splice(index, 1);
            saveToLocalStorage();
            return true;
        }
        return false;
    },

    addTodoToProject(projectName, todo) {
        const project = this.projects.find(project => project.name === projectName);
        if (project) {
            project.addTodo(todo);
            saveToLocalStorage();
            return true;
        }
        return false;
    },

    deleteTodoFromProject(projectName, todoIndex) {
        const project = this.projects.find(project => project.name === projectName);
        if (project) {
            project.deleteTodo(todoIndex);
            saveToLocalStorage();
            return true;
        }
        return false;
    }
};

// Save to localStorage
const saveToLocalStorage = () => {
    const data = JSON.stringify(ProjectList.projects);
    localStorage.setItem('projects', data);
};

// Load from localStorage
const loadFromLocalStorage = () => {
    const data = JSON.parse(localStorage.getItem('projects'));
    if (data && Array.isArray(data)) {
        ProjectList.projects = data.map(projectData => {
            const project = new Project(projectData.name);
            project.todos = projectData.todos.map(todoData => new ToDo(
                todoData.title,
                todoData.description,
                todoData.dueDate,
                todoData.priority,
                todoData.status
            ));
            return project;
        });
    }
};

export { ToDo, Project, ProjectList, saveToLocalStorage, loadFromLocalStorage };