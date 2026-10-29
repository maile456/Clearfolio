(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const storageKey = 'clearfolio-home-notes-v2';
  const originals = [
    { title: '慢慢读的书单', theme: 'rose', body: '关于日常\n把生活里的细节，一点点收集起来。\n\n小小的实验\n带着好奇心，试一件平时不会做的事。' },
    { title: '一周运动计划', theme: 'white', body: '星期一\n晨间拉伸，舒展身体。\n\n星期三\n沿着河边散步半小时。\n\n星期五\n轻松跑步，不着急。' },
    { title: '周末去哪里', theme: 'lemon', body: '和朋友约一个没有闹钟的周末。\n\n星期五傍晚\n去城市另一边的小书店，在那里选一本没读过的书。\n\n星期六\n找一家有阳光的咖啡馆。' },
    { title: '课程笔记', theme: 'sage', body: '01. 观察光线\n02. 记录声音\n03. 多问一个问题\n04. 留下自己的判断\n\n今天的任务\n整理前三节课的笔记。' },
    { title: '想去的美术馆', theme: 'sky', body: '周末的展览\n慢慢地看，不急着拍照。\n\n下次想看\n建筑、摄影与日常生活。' },
    { title: '10 月 29 日', theme: 'purple', body: '清晨醒来，窗外的树影落在墙面上。\n\n新的一天，不必装下所有事情。让一部分时间留白，也是一种很好的安排。' },
    { title: '走路时的想法', theme: 'blue', body: '那些在散步途中突然出现的点子，值得有一个自己的小角落。\n\n下次出门，换一条回家的路。' },
    { title: '一束午后的光', theme: 'white', body: '光线让普通的墙面也有了表情。\n\n今天想记住这个片刻。' }
  ];
  let notes = structuredClone(originals);
  try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (Array.isArray(saved) && saved.length >= 8 && saved.every(note => typeof note.title === 'string' && typeof note.body === 'string')) notes = saved; } catch {}
  let currentMode = 'notes';
  let editingIndex = null;
  function escape(value) { return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }
  function renderNotes() {
    const query = $('#note-search').value.trim().toLocaleLowerCase();
    const visible = notes.map((note, index) => ({ note, index })).filter(({ note }) => `${note.title} ${note.body}`.toLocaleLowerCase().includes(query));
    $('#document-grid').innerHTML = visible.map(({ note, index }) => {
      const lines = note.body.split('\n').filter(Boolean);
      const body = index === 0 ? `<div class="book-line"><span></span><div>关于日常<br>一本随身的小书</div></div><p>${escape(lines[1] || '')}</p><div class="book-line green"><span></span><div>小小的实验<br>带着好奇心</div></div>` : index === 1 ? lines.map((line, lineIndex) => `<${lineIndex % 2 ? 'div class="card-check"' : 'p class="small-heading"'}>${escape(line)}</${lineIndex % 2 ? 'div' : 'p'}>`).join('') : lines.map(line => `<p>${escape(line)}</p>`).join('');
      return `<button type="button" class="document-card ${escape(note.theme || 'white')}" data-open-note="${index}" aria-label="打开文档：${escape(note.title)}"><h3>${escape(note.title)}</h3><div class="card-body">${body}${index === 7 ? '<img src="images/interior-1.jpg" alt="安静的室内与自然光" width="600" height="400">' : ''}</div></button>`;
    }).join('');
    $('#no-documents').hidden = visible.length > 0;
  }
  function setMode(mode) {
    currentMode = mode;
    const names = { notes: '全部文档', tasks: '任务', calendar: '日历' };
    $('#collection-title').textContent = names[mode]; $('#location-label').textContent = names[mode];
    $('#mobile-mode').value = mode;
    $('#document-grid').hidden = mode !== 'notes'; $('#task-view').hidden = mode !== 'tasks'; $('#calendar-view').hidden = mode !== 'calendar';
    $('.view-tools').hidden = mode !== 'notes'; $('.search-row').hidden = true; $('#no-documents').hidden = true;
    $$('[data-mode]').forEach(button => { const active = button.dataset.mode === mode; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); });
    if (mode === 'notes') renderNotes();
  }
  function openNote(index) {
    editingIndex = index; const note = index === null ? { title: '新的想法', body: '' } : notes[index];
    $('#note-title').value = note.title; $('#note-body').value = note.body; $('#note-status').textContent = '保存在当前浏览器';
    $('#note-dialog').showModal(); $('#note-title').focus();
  }
  document.addEventListener('click', event => { const noteButton = event.target.closest('[data-open-note]'); if (noteButton) openNote(Number(noteButton.dataset.openNote)); if (event.target.closest('[data-new-note]')) openNote(null); });
  $('#save-note').addEventListener('click', () => {
    const title = $('#note-title').value.trim(); if (!title) { $('#note-status').textContent = '请为文档起一个名字。'; $('#note-title').focus(); return; }
    const note = { title, body: $('#note-body').value, theme: editingIndex === null ? 'white' : notes[editingIndex].theme };
    if (editingIndex === null) { notes.unshift(note); editingIndex = 0; } else notes[editingIndex] = note;
    try { localStorage.setItem(storageKey, JSON.stringify(notes)); $('#note-status').textContent = '已保存'; } catch { $('#note-status').textContent = '当前会话已保存，浏览器存储暂不可用。'; }
    renderNotes();
  });
  $('#note-dialog').addEventListener('click', event => { if (event.target === $('#note-dialog')) $('#note-dialog').close(); });
  $$('[data-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  const modes = ['notes', 'tasks', 'calendar'];
  $('#previous-mode').addEventListener('click', () => setMode(modes[(modes.indexOf(currentMode) + 2) % 3]));
  $('#next-mode').addEventListener('click', () => setMode(modes[(modes.indexOf(currentMode) + 1) % 3]));
  $$('button[data-layout]').forEach(button => button.addEventListener('click', () => { $('#document-grid').dataset.layout = button.dataset.layout; $$('button[data-layout]').forEach(other => { const active = other === button; other.classList.toggle('active', active); other.setAttribute('aria-pressed', active); }); }));
  $('#search-toggle').addEventListener('click', () => { setMode('notes'); $('.search-row').hidden = false; $('#note-search').focus(); });
  $('#search-close').addEventListener('click', () => { $('#note-search').value = ''; $('.search-row').hidden = true; renderNotes(); }); $('#note-search').addEventListener('input', renderNotes);
  function updateTasks() { const tasks = $$('#task-view input'); $('.task-summary').textContent = `${tasks.filter(input => input.checked).length} / ${tasks.length} 项已完成`; }
  $$('#task-view input').forEach(input => input.addEventListener('change', updateTasks));
  $('#calendar-grid').innerHTML = ['一', '二', '三', '四', '五', '六', '日'].map(day => `<span class="day-label">${day}</span>`).join('') + Array.from({ length: 35 }, (_, index) => { const day = index - 2; return `<span class="${day < 1 || day > 31 ? 'muted' : day === 29 ? 'today' : ''}">${day < 1 ? day + 30 : day > 31 ? day - 31 : day}${day === 29 ? '<br>今日' : ''}</span>`; }).join('');
  const purposes = {
    notes: ['把想法留下来', '从一句话，<br>到一个新点子。', '一段读书感想、一个突然的念头，或是刚刚路过的美好。打开一页，写下来，让思绪慢慢成形。'],
    plans: ['把日子安排妥当', '小小的计划，<br>刚刚好的节奏。', '把待办清单放进日历，为重要的事情留出时间。安排一天，也给意料之外的好事留一点余地。'],
    collections: ['让喜欢的事物相遇', '一些片刻，<br>值得慢慢收集。', '一张照片、一段文字、一处想去的地方。把零散的灵感放在一起，让它们在合适的时候重新点亮你。']
  };
  const purposeButtons = $$('[data-purpose]');
  function selectPurpose(button) { purposeButtons.forEach(other => { other.setAttribute('aria-selected', other === button); other.tabIndex = other === button ? 0 : -1; }); const content = purposes[button.dataset.purpose]; $('#purpose-eyebrow').textContent = content[0]; $('#purpose-title').innerHTML = content[1]; $('#purpose-description').textContent = content[2]; }
  purposeButtons.forEach((button, index) => { button.addEventListener('click', () => selectPurpose(button)); button.addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); const next = purposeButtons[(index + (event.key === 'ArrowRight' ? 1 : 2)) % 3]; selectPurpose(next); next.focus(); } }); }); selectPurpose(purposeButtons[0]);
  $$('button[data-paper-theme]').forEach(button => button.addEventListener('click', () => { $('.theme-preview').dataset.paperTheme = button.dataset.paperTheme; $$('button[data-paper-theme]').forEach(other => other.setAttribute('aria-pressed', other === button)); }));
  $$('[data-billing]').forEach(button => button.addEventListener('click', () => { const yearly = button.dataset.billing === 'yearly'; $$('[data-billing]').forEach(other => other.setAttribute('aria-pressed', other === button)); $('#plan-price').innerHTML = `¥ ${yearly ? '28' : '36'}<span>/ 月</span>`; $('#billing-caption').textContent = `${yearly ? '按年' : '按月'}计费 · 示例方案`; }));
  $('.menu-toggle').addEventListener('click', () => { const open = $('.site-header').classList.toggle('menu-open'); $('.menu-toggle').setAttribute('aria-expanded', open); $('.menu-toggle').setAttribute('aria-label', open ? '关闭导航' : '打开导航'); });
  $$('#site-nav a').forEach(link => link.addEventListener('click', () => { $('.site-header').classList.remove('menu-open'); $('.menu-toggle').setAttribute('aria-expanded', 'false'); }));
  const mobileMode = document.createElement('select');
  mobileMode.id = 'mobile-mode'; mobileMode.className = 'mobile-mode'; mobileMode.setAttribute('aria-label', '选择文档视图');
  mobileMode.innerHTML = '<option value="notes">全部文档</option><option value="tasks">任务</option><option value="calendar">日历</option>';
  $('.document-location').after(mobileMode);
  mobileMode.addEventListener('change', () => setMode(mobileMode.value));
  renderNotes(); updateTasks(); window.lucide?.createIcons();
})();
