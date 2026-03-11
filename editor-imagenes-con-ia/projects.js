/**
 * projects.js — Project and gallery management
 */
const Projects = (() => {
  const renderProjects = () => {
    const user = Auth.getUser();
    if (!user) return;
    const projects = ProjectDB.getProjects(user.id);
    const grid = document.getElementById('projectsGrid');
    if (!projects.length) {
      grid.innerHTML = '<div style="color:var(--text-2);grid-column:1/-1;text-align:center;padding:60px;font-size:14px;">No projects yet. Create your first project!</div>';
      return;
    }
    grid.innerHTML = projects.map(p => `
      <div class="project-card" data-id="${p.id}">
        <div class="project-thumb" style="font-size:40px">🖼</div>
        <div class="project-info">
          <h3>${p.name}</h3>
          <p>${new Date(p.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    `).join('');
    grid.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        // Switch to editor
        App.setView('editor');
        Toast.show('Project opened: ' + projects.find(p => p.id === card.dataset.id)?.name, 'info');
      });
    });
  };

  const renderGallery = (filter = 'all') => {
    const user = Auth.getUser();
    if (!user) return;
    const items = GalleryDB.getItems(user.id).filter(item => filter === 'all' || item.type === filter);
    const grid = document.getElementById('galleryGrid');
    if (!items.length) {
      grid.innerHTML = '<div style="color:var(--text-2);grid-column:1/-1;text-align:center;padding:60px;font-size:14px;">No generated images yet. Start creating!</div>';
      return;
    }
    grid.innerHTML = items.map(item => `
      <div class="gallery-item">
        <div style="width:100%;height:100%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:32px">✦</div>
        <div class="gallery-item-label">${item.type} · ${new Date(item.createdAt).toLocaleDateString()}</div>
      </div>
    `).join('');
  };

  document.getElementById('newProjectBtn')?.addEventListener('click', () => {
    const user = Auth.getUser();
    if (!user) return;
    const name = prompt('Project name:', 'Untitled Project');
    if (!name) return;
    ProjectDB.addProject(user.id, { name, canvasData: null });
    renderProjects();
    Toast.show('Project created: ' + name, 'success');
  });

  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      renderGallery(tag.dataset.gfilter || 'all');
    });
  });

  return { renderProjects, renderGallery };
})();
