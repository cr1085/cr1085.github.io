/**
 * storage.js — LocalStorage-backed persistence layer
 * Acts as the free-tier database (no backend required)
 */
const Storage = (() => {
  const PREFIX = 'pixelmind_';
  const get = (key) => { try { return JSON.parse(localStorage.getItem(PREFIX + key)); } catch { return null; } };
  const set = (key, val) => { try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); return true; } catch { return false; } };
  const remove = (key) => localStorage.removeItem(PREFIX + key);
  const keys = (prefix='') => Object.keys(localStorage).filter(k => k.startsWith(PREFIX + prefix)).map(k => k.slice(PREFIX.length));
  return { get, set, remove, keys };
})();

// Simple multi-user store
const UserDB = {
  getUsers: () => Storage.get('users') || [],
  saveUsers: (users) => Storage.set('users', users),
  findUser: (email) => UserDB.getUsers().find(u => u.email === email),
  addUser: (user) => {
    const users = UserDB.getUsers();
    users.push({ ...user, id: Date.now().toString(), createdAt: new Date().toISOString(), credits: 50, plan: 'free' });
    UserDB.saveUsers(users);
    return users[users.length - 1];
  },
  updateUser: (id, updates) => {
    const users = UserDB.getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
    UserDB.saveUsers(users);
  },
  // Seed demo user
  seed: () => {
    if (!UserDB.findUser('demo@pixelmind.ai')) {
      UserDB.addUser({ name: 'Demo', email: 'demo@pixelmind.ai', password: 'demo1234' });
    }
  }
};

const ProjectDB = {
  getProjects: (userId) => Storage.get('projects_' + userId) || [],
  saveProjects: (userId, projects) => Storage.set('projects_' + userId, projects),
  addProject: (userId, project) => {
    const projects = ProjectDB.getProjects(userId);
    const newProject = { ...project, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    projects.unshift(newProject);
    ProjectDB.saveProjects(userId, projects);
    return newProject;
  },
  updateProject: (userId, id, updates) => {
    const projects = ProjectDB.getProjects(userId).map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
    ProjectDB.saveProjects(userId, projects);
  },
  deleteProject: (userId, id) => {
    const projects = ProjectDB.getProjects(userId).filter(p => p.id !== id);
    ProjectDB.saveProjects(userId, projects);
  }
};

const GalleryDB = {
  getItems: (userId) => Storage.get('gallery_' + userId) || [],
  addItem: (userId, item) => {
    const items = GalleryDB.getItems(userId);
    const newItem = { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() };
    items.unshift(newItem);
    // Keep only last 50
    Storage.set('gallery_' + userId, items.slice(0, 50));
    return newItem;
  }
};

const HistoryDB = {
  getHistory: (userId, projectId) => Storage.get(`history_${userId}_${projectId}`) || [],
  addEntry: (userId, projectId, entry) => {
    const history = HistoryDB.getHistory(userId, projectId);
    history.unshift({ ...entry, id: Date.now().toString(), timestamp: new Date().toISOString() });
    Storage.set(`history_${userId}_${projectId}`, history.slice(0, 20));
  }
};

UserDB.seed();
