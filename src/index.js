// src/index.js

import "./styles.css";
import { ProjectList, loadFromLocalStorage } from './modules/ToDo.js';
import { 
    initProjectCreation, 
    initTodoCreation, 
    renderProjects,
    initProjectDropdownSync 
} from './modules/dom.js';

// Load saved data from localStorage
loadFromLocalStorage();

// Initialize event listeners and render projects
initProjectCreation();
initTodoCreation();
initProjectDropdownSync();
renderProjects();
