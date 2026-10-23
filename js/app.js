/* ═══════════════════════════════════════════════════════
   LIFE DASHBOARD — app.js
   Challenges: Light/Dark mode · Custom name · Change Pomodoro
               Prevent duplicate tasks · Sort tasks
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ─── STORAGE HELPERS ────────────────────────────────── */
const store = {
  get: (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

/* ─── DOM REFS ───────────────────────────────────────── */
const $ = id => document.getElementById(id);

// Greeting
const clockEl     = $('clock');
const dateStrEl   = $('dateStr');
const greetingEl  = $('greeting');

// Profile / name
const displayName   = $('displayName');
const editNameBtn   = $('editNameBtn');
const nameModal     = $('nameModal');
const nameInput     = $('nameInput');
const saveNameBtn   = $('saveNameBtn');
const cancelNameBtn = $('cancelNameBtn');

// Avatar / photo
const avatarBtn       = $('avatarBtn');
const avatarPhoto     = $('avatarPhoto');
const avatarInitials  = $('avatarInitials');
const avatarFileInput = $('avatarFileInput');

// Timer
const timerDisplay = $('timerDisplay');
const timerProgress= $('timerProgress');
const timerStatus  = $('timerStatus');
const startBtn     = $('startBtn');
const pauseBtn     = $('pauseBtn');
const resetBtn     = $('resetBtn');
const pomodoroInput= $('pomodoroInput');
const setPomBtn    = $('setPomodoroBtn');

// Tasks
const taskInput    = $('taskInput');
const addTaskBtn   = $('addTaskBtn');
const taskList     = $('taskList');
const emptyState   = $('emptyState');
const duplicateMsg = $('duplicateMsg');
const sortSelect   = $('sortSelect');

// Links
const linkName     = $('linkName');
const linkUrl      = $('linkUrl');
const addLinkBtn   = $('addLinkBtn');
const linksGrid    = $('linksGrid');

// Theme
const themeToggle  = $('themeToggle');

/* ═══════════════════════════════════════════════════════
   1. CLOCK & GREETING
   ═══════════════════════════════════════════════════════ */
function updateClock() {
  const now  = new Date();
  const h    = String(now.getHours()).padStart(2, '0');
  const m    = String(now.getMinutes()).padStart(2, '0');
  const s    = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = `${h}:${m}:${s}`;

  const days    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months  = ['January','February','March','April','May','June',
                   'July','August','September','October','November','December'];
  dateStrEl.textContent =
    `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  const hour = now.getHours();
  let msg;
  if      (hour < 5)  msg = 'Good Night 🌙';
  else if (hour < 12) msg = 'Good Morning ✨';
  else if (hour < 17) msg = 'Good Afternoon ☀️';
  else if (hour < 21) msg = 'Good Evening 🌤️';
  else                msg = 'Good Night 🌙';
  greetingEl.textContent = msg;
}

setInterval(updateClock, 1000);
updateClock();

/* ═══════════════════════════════════════════════════════
   2. CUSTOM NAME  [Challenge]
   ═══════════════════════════════════════════════════════ */
function loadName() {
  const saved = store.get('userName', 'Your Name');
  displayName.textContent = saved;
  // Update avatar initials
  const initials = saved.split(' ').map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2);
  avatarInitials.textContent = initials || 'TT';
}

editNameBtn.addEventListener('click', () => {
  nameInput.value = store.get('userName', 'Your Name');
  nameModal.classList.remove('hidden');
  nameInput.focus();
});

cancelNameBtn.addEventListener('click', () => nameModal.classList.add('hidden'));

saveNameBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });

function saveName() {
  const val = nameInput.value.trim();
  if (!val) return;
  store.set('userName', val);
  loadName();
  nameModal.classList.add('hidden');
}

loadName();

/* ═══════════════════════════════════════════════════════
   2b. AVATAR / PROFILE PHOTO
   ═══════════════════════════════════════════════════════ */
function loadAvatar() {
  const saved = store.get('avatarPhoto', null);
  if (saved) {
    avatarPhoto.src = saved;
    avatarPhoto.classList.remove('hidden');
    avatarInitials.classList.add('hidden');
  } else {
    avatarPhoto.classList.add('hidden');
    avatarInitials.classList.remove('hidden');
  }
}

// Click or keyboard on avatar → open file picker
avatarBtn.addEventListener('click', () => avatarFileInput.click());
avatarBtn.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); avatarFileInput.click(); }
});

avatarFileInput.addEventListener('change', () => {
  const file = avatarFileInput.files[0];
  if (!file) return;

  // Limit to ~2MB to stay within localStorage budget
  if (file.size > 2 * 1024 * 1024) {
    alert('Image too large. Please choose a file under 2 MB.');
    avatarFileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    try {
      store.set('avatarPhoto', dataUrl);
    } catch {
      alert('Could not save photo — storage may be full. Try a smaller image.');
      return;
    }
    loadAvatar();
  };
  reader.readAsDataURL(file);
  avatarFileInput.value = ''; // reset so same file can be re-selected
});

loadAvatar();

/* ═══════════════════════════════════════════════════════
   3. LIGHT / DARK MODE  [Challenge]
   ═══════════════════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
  store.set('theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Load saved theme or prefer OS
(function initTheme() {
  const saved = store.get('theme', null);
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
})();

/* ═══════════════════════════════════════════════════════
   4. FOCUS TIMER  (with Change Pomodoro time [Challenge])
   ═══════════════════════════════════════════════════════ */
let timerDuration  = store.get('pomoDuration', 25) * 60; // seconds
let timerRemaining = timerDuration;
let timerInterval  = null;
let timerRunning   = false;

pomodoroInput.value = Math.round(timerDuration / 60);

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerUI() {
  timerDisplay.textContent = formatTime(timerRemaining);
  const pct = timerDuration > 0 ? (timerRemaining / timerDuration) * 100 : 100;
  timerProgress.style.width = pct + '%';
}

function setTimerState(state) {
  // state: 'idle' | 'running' | 'paused' | 'done'
  timerDisplay.classList.remove('running', 'done');
  if (state === 'running') timerDisplay.classList.add('running');
  if (state === 'done')    timerDisplay.classList.add('done');

  const statuses = {
    idle:    'Ready to focus',
    running: 'Stay focused…',
    paused:  'Paused — take a breath',
    done:    'Session complete!'
  };
  timerStatus.textContent = statuses[state] || '';
}

startBtn.addEventListener('click', () => {
  if (timerRunning) return;
  timerRunning = true;
  setTimerState('running');
  timerInterval = setInterval(() => {
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      setTimerState('done');
      return;
    }
    timerRemaining--;
    updateTimerUI();
  }, 1000);
});

pauseBtn.addEventListener('click', () => {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  setTimerState('paused');
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning   = false;
  timerRemaining = timerDuration;
  updateTimerUI();
  setTimerState('idle');
});

setPomBtn.addEventListener('click', setPomodoro);
pomodoroInput.addEventListener('keydown', e => { if (e.key === 'Enter') setPomodoro(); });

function setPomodoro() {
  let mins = parseInt(pomodoroInput.value, 10);
  if (isNaN(mins) || mins < 1) mins = 1;
  if (mins > 120) mins = 120;
  pomodoroInput.value = mins;
  store.set('pomoDuration', mins);
  timerDuration  = mins * 60;
  timerRemaining = timerDuration;
  clearInterval(timerInterval);
  timerRunning = false;
  updateTimerUI();
  setTimerState('idle');
}

updateTimerUI();
setTimerState('idle');

/* ═══════════════════════════════════════════════════════
   5. TO-DO LIST
      Challenges: Prevent duplicate tasks · Sort tasks
   ═══════════════════════════════════════════════════════ */
let tasks = store.get('tasks', []);
// Each task: { id, text, done }

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── ADD TASK ──────────────────────────────────────────
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  // [Challenge] Prevent duplicate tasks (case-insensitive)
  const isDuplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
  if (isDuplicate) {
    duplicateMsg.classList.remove('hidden');
    setTimeout(() => duplicateMsg.classList.add('hidden'), 2500);
    taskInput.select();
    return;
  }

  duplicateMsg.classList.add('hidden');
  tasks.push({ id: generateId(), text, done: false });
  store.set('tasks', tasks);
  taskInput.value = '';
  renderTasks();
}

// ── SORT ──────────────────────────────────────────────
sortSelect.addEventListener('change', renderTasks);

function getSortedTasks() {
  const mode = sortSelect.value;
  const copy = [...tasks];
  if (mode === 'az')   copy.sort((a, b) => a.text.localeCompare(b.text));
  if (mode === 'za')   copy.sort((a, b) => b.text.localeCompare(a.text));
  if (mode === 'done') copy.sort((a, b) => Number(a.done) - Number(b.done));
  return copy;
}

// ── RENDER ────────────────────────────────────────────
function renderTasks() {
  taskList.innerHTML = '';
  const sorted = getSortedTasks();

  if (sorted.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} aria-label="Mark done" />
      <span class="task-text" title="Double-click to edit">${escapeHTML(task.text)}</span>
      <div class="task-actions">
        <button class="btn-icon edit" title="Edit">✏️</button>
        <button class="btn-icon del"  title="Delete">🗑️</button>
      </div>
    `;

    // Toggle done
    li.querySelector('.task-checkbox').addEventListener('change', e => {
      toggleTask(task.id, e.target.checked);
    });

    // Edit on button click
    li.querySelector('.btn-icon.edit').addEventListener('click', () => startEdit(li, task));

    // Edit on double-click text
    li.querySelector('.task-text').addEventListener('dblclick', () => startEdit(li, task));

    // Delete
    li.querySelector('.btn-icon.del').addEventListener('click', () => deleteTask(task.id));

    taskList.appendChild(li);
  });
}

// ── ACTIONS ───────────────────────────────────────────
function toggleTask(id, done) {
  tasks = tasks.map(t => t.id === id ? { ...t, done } : t);
  store.set('tasks', tasks);
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  store.set('tasks', tasks);
  renderTasks();
}

function startEdit(li, task) {
  const textEl  = li.querySelector('.task-text');
  const editBtn = li.querySelector('.btn-icon.edit');

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-text-edit';
  input.value = task.text;
  input.maxLength = 80;

  textEl.replaceWith(input);
  input.focus();
  input.select();
  editBtn.textContent = '✔️';

  const commit = () => {
    const newText = input.value.trim();
    if (newText && newText !== task.text) {
      // [Challenge] Prevent duplicate when editing
      const isDuplicate = tasks.some(t => t.id !== task.id && t.text.toLowerCase() === newText.toLowerCase());
      if (isDuplicate) {
        duplicateMsg.classList.remove('hidden');
        setTimeout(() => duplicateMsg.classList.add('hidden'), 2500);
        input.focus();
        return;
      }
      tasks = tasks.map(t => t.id === task.id ? { ...t, text: newText } : t);
      store.set('tasks', tasks);
    }
    renderTasks();
  };

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') renderTasks();
  });
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

renderTasks();

/* ═══════════════════════════════════════════════════════
   6. QUICK LINKS
   ═══════════════════════════════════════════════════════ */
let links = store.get('quickLinks', [
  { id: 'g1', name: 'Google',   url: 'https://google.com' },
  { id: 'g2', name: 'YouTube',  url: 'https://youtube.com' },
  { id: 'g3', name: 'GitHub',   url: 'https://github.com' }
]);

addLinkBtn.addEventListener('click', addLink);
linkUrl.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

function addLink() {
  const name = linkName.value.trim();
  let   url  = linkUrl.value.trim();
  if (!name || !url) return;

  // Auto-prefix protocol
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  links.push({ id: generateId(), name, url });
  store.set('quickLinks', links);
  linkName.value = '';
  linkUrl.value  = '';
  renderLinks();
}

function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  store.set('quickLinks', links);
  renderLinks();
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
  } catch { return ''; }
}

function renderLinks() {
  linksGrid.innerHTML = '';
  links.forEach(link => {
    const favicon = getFaviconUrl(link.url);

    const chip = document.createElement('div');
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';

    const a = document.createElement('a');
    a.href   = link.url;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    a.className = 'link-chip';

    if (favicon) {
      const img = document.createElement('img');
      img.src = favicon;
      img.className = 'link-favicon';
      img.alt = '';
      img.onerror = () => img.remove();
      a.appendChild(img);
    }

    const label = document.createElement('span');
    label.textContent = link.name;
    a.appendChild(label);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'link-remove';
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove';
    removeBtn.setAttribute('aria-label', `Remove ${link.name}`);
    removeBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      deleteLink(link.id);
    });

    a.appendChild(removeBtn);
    chip.appendChild(a);
    linksGrid.appendChild(chip);
  });
}

renderLinks();
