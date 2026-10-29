(() => {
  const projects = [
    { id: 'daylight-order', number: '01', title: '白昼的秩序', english: 'The order of daylight', category: 'architecture', categoryName: '建筑', image: '../images/architecture-1.jpg', alt: '用于建筑观察系列的空间摄影', year: '2026', series: '光与结构', format: '建筑观察 / 单幅', description: '光线经过立面，留下明暗分明的边界。这组示例从空间的线条与比例出发，记录建筑安静而具体的表情。' },
    { id: 'quiet-interior', number: '02', title: '留白之间', english: 'A room to pause', category: 'interior', categoryName: '室内', image: '../images/interior-1.jpg', alt: '明亮客厅里的沙发、木质家具和室内光线', year: '2026', series: '停留片刻', format: '室内观察 / 单幅', description: '空间并不总需要被填满。在留白、材质与光线之间，寻找一种可以慢下来观看的日常尺度。名称与叙述为创作示例。' },
    { id: 'city-facets', number: '03', title: '城市的折面', english: 'Fragments of the city', category: 'city', categoryName: '城市', image: '../images/architecture-3.jpg', alt: '用于城市空间观察系列的建筑摄影', year: '2026', series: '街道旁边', format: '城市观察 / 单幅', description: '把熟悉的空间重新看一遍：从重复的轮廓到偶然的交界，城市里的片段在视线中连接成新的秩序。' },
    { id: 'geometry-study', number: '04', title: '几何与停顿', english: 'Notes on geometry', category: 'architecture', categoryName: '建筑', image: '../images/architecture-1.jpg', alt: '同一建筑素材用于几何构成研究的系列片段', year: '2026', series: '结构笔记', format: '构成研究 / 系列片段', description: '回到同一张影像，重新辨认线、面与空隙之间的关系。这是基于共享素材的第二组示例构成研究，而非另一项真实委托。' },
    { id: 'window-notes', number: '05', title: '一段安静', english: 'An ordinary stillness', category: 'interior', categoryName: '室内', image: '../images/interior-2.jpg', alt: '自然光下的室内陈设与简洁空间', year: '2026', series: '日常的尺度', format: '空间研究 / 单幅', description: '不用宏大的叙述，只记录一段空间带来的停顿。通过室内的材质与光线，组织一页关于日常尺度的示例笔记。' }
  ];

  const grid = document.querySelector('#project-grid');
  const dialog = document.querySelector('#project-dialog');
  const closeButton = document.querySelector('#dialog-close');
  const dialogImage = document.querySelector('#dialog-image');
  const previousButton = document.querySelector('#previous-project');
  const nextButton = document.querySelector('#next-project');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#site-nav');
  let currentFilter = 'all';
  let currentView = 'grid';
  let currentProject = null;
  let returnFocus = null;

  function drawIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function visibleProjects() {
    return projects.filter(project => currentFilter === 'all' || project.category === currentFilter);
  }

  function watchImage(image) {
    const error = image.parentElement.querySelector('.image-error');
    function showError() {
      if (error) error.hidden = false;
      image.style.visibility = 'hidden';
    }
    image.addEventListener('error', showError);
    image.addEventListener('load', () => {
      if (error) error.hidden = true;
      image.style.visibility = '';
    });
    if (image.complete && !image.naturalWidth) showError();
  }

  function renderProjects() {
    const visible = visibleProjects();
    grid.innerHTML = visible.map(project => `
      <article class="project" data-id="${project.id}">
        <button class="project-button" type="button" data-project="${project.id}" aria-label="查看作品：${project.title}">
          <span class="project-media"><img src="${project.image}" alt="${project.alt}" width="1200" height="900" ${project.number === '01' ? 'fetchpriority="high"' : 'loading="lazy"'}><span class="image-error" hidden><i data-lucide="image-off" aria-hidden="true"></i>图片暂未载入</span><span class="project-open" aria-hidden="true"><i data-lucide="arrow-up-right"></i></span></span>
          <span class="project-caption"><span><span class="project-title-line"><span class="project-number">${project.number}</span><span class="project-title">${project.title}</span></span><span class="project-subtitle">${project.english}</span></span><span class="project-caption-category">${project.categoryName} / ${project.year}</span></span>
        </button>
      </article>`).join('');
    grid.dataset.view = currentView;
    document.querySelector('#result-count').textContent = `${visible.length} 个项目`;
    grid.querySelectorAll('img').forEach(watchImage);
    drawIcons();
  }

  function updateDialog(project) {
    const visible = visibleProjects();
    const index = visible.findIndex(item => item.id === project.id);
    currentProject = project;
    document.querySelector('#dialog-title').textContent = project.title;
    document.querySelector('#dialog-description').textContent = project.description;
    document.querySelector('#dialog-category').textContent = `${project.categoryName} / ${project.english}`;
    document.querySelector('#dialog-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
    document.querySelector('#dialog-facts').innerHTML = `<div><dt>系列</dt><dd>${project.series}</dd></div><div><dt>记录年份</dt><dd>${project.year} · 示例</dd></div><div><dt>类型</dt><dd>${project.format}</dd></div><div><dt>素材</dt><dd>Unsplash 摄影</dd></div>`;
    dialogImage.style.visibility = '';
    dialogImage.parentElement.querySelector('.image-error').hidden = true;
    dialogImage.alt = project.alt;
    dialogImage.src = project.image;
    document.querySelector('#original-image').href = project.image;
    previousButton.disabled = index <= 0;
    nextButton.disabled = index >= visible.length - 1;
  }

  function openProject(id, trigger) {
    const project = projects.find(item => item.id === id);
    if (!project) return;
    returnFocus = trigger || document.activeElement;
    updateDialog(project);
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    dialog.scrollTop = 0;
    closeButton.focus();
  }

  function stepProject(direction) {
    if (!currentProject) return;
    const visible = visibleProjects();
    const index = visible.findIndex(item => item.id === currentProject.id);
    const next = visible[index + direction];
    if (next) updateDialog(next);
  }

  function setMenu(open) {
    if (menuButton.getAttribute('aria-expanded') === String(open)) return;
    navigation.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
    menuButton.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
    drawIcons();
  }

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderProjects();
    });
  });

  document.querySelectorAll('[data-view]').forEach(button => {
    if (button.tagName !== 'BUTTON') return;
    button.addEventListener('click', () => {
      currentView = button.dataset.view;
      grid.dataset.view = currentView;
      document.querySelectorAll('button[data-view]').forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    });
  });

  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-project]');
    if (button) openProject(button.dataset.project, button);
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    currentProject = null;
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  });
  previousButton.addEventListener('click', () => stepProject(-1));
  nextButton.addEventListener('click', () => stepProject(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); stepProject(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); stepProject(1); }
  });
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    const path = event.composedPath();
    if (!path.includes(navigation) && !path.includes(menuButton)) setMenu(false);
  });
  watchImage(dialogImage);
  renderProjects();
})();
