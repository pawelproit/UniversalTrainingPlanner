import { saveTrainingToDB } from './database.js';

export class TrainingService {
  constructor() {
    this.runningTasks = [];
    this.swimmingTasks = [];
    this.strengthTasks = [];
  }

  validateRunningTask(task) {
    const errors = [];
    
    if (!task.name || task.name.trim() === '') {
      errors.push('Nazwa zadania jest wymagana');
    }
    
    if (!task.distance || task.distance.trim() === '') {
      errors.push('Dystans jest wymagany');
    }
    
    if (!task.pace || task.pace.trim() === '') {
      errors.push('Tempo jest wymagane');
    }
    
    return errors;
  }

  validateSwimmingTask(task) {
    const errors = [];
    
    if (!task.distance || task.distance.trim() === '') {
      errors.push('Dystans jest wymagany');
    }
    
    if (!task.pace || task.pace.trim() === '') {
      errors.push('Tempo jest wymagane');
    }
    
    if (!task.description || task.description.trim() === '') {
      errors.push('Opis jest wymagany');
    }
    
    return errors;
  }

  validateStrengthTask(task) {
    const errors = [];
    
    if (!task.name || task.name.trim() === '') {
      errors.push('Nazwa ćwiczenia jest wymagana');
    }

    if (task.sets === '' || task.sets === undefined || task.sets === null) {
      errors.push('Liczba serii jest wymagana');
    } else {
      const sets = parseInt(task.sets);
      if (isNaN(sets) || sets <= 0) {
        errors.push('Liczba serii musi być większa od 0');
      }
    }

    if (task.reps === '' || task.reps === undefined || task.reps === null) {
      errors.push('Liczba powtórzeń jest wymagana');
    } else {
      const reps = parseInt(task.reps);
      if (isNaN(reps) || reps <= 0) {
        errors.push('Liczba powtórzeń musi być większa od 0');
      }
    }

    if (task.weight === '' || task.weight === undefined || task.weight === null) {
      errors.push('Obciążenie jest wymagane');
    } else {
      const weight = parseFloat(task.weight);
      if (isNaN(weight) || weight < 0) {
        errors.push('Obciążenie musi być liczbą nieujemną');
      }
    }
    
    return errors;
  }

  validateAllTasks(type) {
    const tasks = this.getTasksByType(type);
    const allErrors = [];
    
    tasks.forEach((task, index) => {
      let taskErrors = [];
      
      switch(type) {
        case 'running':
          taskErrors = this.validateRunningTask(task);
          break;
        case 'swimming':
          taskErrors = this.validateSwimmingTask(task);
          break;
        case 'strength':
          taskErrors = this.validateStrengthTask(task);
          break;
      }
      
      if (taskErrors.length > 0) {
        allErrors.push({
          taskIndex: index + 1,
          errors: taskErrors
        });
      }
    });
    
    return allErrors;
  }

  addRunningTask() {
    const taskId = "running-" + Date.now();
    this.runningTasks.push({ 
      id: taskId, 
      name: "", 
      distance: "", 
      pace: "" 
    });
    return taskId;
  }

  addSwimmingTask() {
    const taskId = "swimming-" + Date.now();
    this.swimmingTasks.push({ 
      id: taskId, 
      distance: "", 
      pace: "", 
      description: "" 
    });
    return taskId;
  }

  addStrengthExercise() {
    const taskId = "strength-" + Date.now();
    this.strengthTasks.push({ 
      id: taskId, 
      name: "", 
      sets: "", 
      reps: "", 
      weight: "" 
    });
    return taskId;
  }

  updateTask(type, id, field, value) {
    const tasks = this.getTasksByType(type);
    const task = tasks.find((t) => t.id === id);
    if (task) {
      if (field === 'sets' || field === 'reps' || field === 'weight') {
        task[field] = value;
      } else {
        task[field] = value;
      }
    }
  }

  removeTask(type, id) {
    const tasks = this.getTasksByType(type);
    const newTasks = tasks.filter((t) => t.id !== id);
    
    if (type === "running") this.runningTasks = newTasks;
    if (type === "swimming") this.swimmingTasks = newTasks;
    if (type === "strength") this.strengthTasks = newTasks;
  }

  getTasksByType(type) {
    switch(type) {
      case 'running': return this.runningTasks;
      case 'swimming': return this.swimmingTasks;
      case 'strength': return this.strengthTasks;
      default: return [];
    }
  }

  clearTasks(type) {
    switch(type) {
      case 'running': 
        this.runningTasks = [];
        break;
      case 'swimming': 
        this.swimmingTasks = [];
        break;
      case 'strength': 
        this.strengthTasks = [];
        break;
    }
  }

  async saveTraining(auth, type, name) {
    const user = auth.currentUser;
    if (!user) throw new Error("Musisz być zalogowany, aby zapisać trening.");

    if (!name || name.trim() === '') {
      throw new Error("Nazwa treningu jest wymagana!");
    }

    const tasks = this.getTasksByType(type);

    if (tasks.length === 0) {
      throw new Error("Dodaj przynajmniej jedno zadanie do treningu!");
    }

    const validationErrors = this.validateAllTasks(type);
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.map(error => 
        `Zadanie ${error.taskIndex}: ${error.errors.join(', ')}`
      ).join('\n');
      throw new Error(`Popraw następujące błędy:\n${errorMessages}`);
    }

    const trainingData = {
      name: name.trim(),
      tasks,
      type
    };

    return await saveTrainingToDB(user.uid, type, trainingData);
  }
}