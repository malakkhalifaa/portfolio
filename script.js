(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Sidebar (Explorer) toggle */
  var sidebar = document.querySelector('.vscode-sidebar');
  var sidebarToggle = document.getElementById('sidebar-toggle');
  var explorerToggleMobile = document.getElementById('explorer-toggle-mobile');

  function toggleSidebar() {
    if (!sidebar) return;
    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('open', !sidebar.classList.contains('collapsed'));
    if (sidebarToggle) sidebarToggle.setAttribute('aria-label', sidebar.classList.contains('collapsed') ? 'Show sidebar' : 'Hide sidebar');
    if (explorerToggleMobile) explorerToggleMobile.setAttribute('aria-label', sidebar.classList.contains('collapsed') ? 'Open Explorer' : 'Close Explorer');
  }

  if (sidebar && sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
  if (sidebar && explorerToggleMobile) explorerToggleMobile.addEventListener('click', toggleSidebar);
  if (sidebar && window.matchMedia('(max-width: 768px)').matches) sidebar.classList.add('collapsed');

  /* Folder expand/collapse in Explorer */
  document.querySelectorAll('.vscode-tree-folder').forEach(function (btn) {
    btn.addEventListener('click', function () {
      this.classList.toggle('is-open');
      this.setAttribute('aria-expanded', this.classList.contains('is-open'));
    });
  });

  /* Explorer: highlight active section on scroll */
  var treeItems = document.querySelectorAll('.vscode-tree-item[data-section]');
  function updateActiveSection() {
    treeItems.forEach(function (a) {
      var id = a.getAttribute('data-section');
      var el = id && document.getElementById(id);
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var inView = rect.top <= 120 && rect.bottom >= 100;
      a.classList.toggle('active', inView);
    });
  }
  if (treeItems.length) {
    window.addEventListener('scroll', updateActiveSection);
    window.addEventListener('load', updateActiveSection);
  }

  /* Theme toggle */
  var themeToggle = document.getElementById('theme-toggle');
  var html = document.documentElement;

  function getTheme() {
    try { return localStorage.getItem('theme') || 'dark'; } catch (e) { return 'dark'; }
  }
  function setTheme(theme) {
    html.setAttribute('data-theme', theme === 'light' ? 'light' : '');
    try { localStorage.setItem('theme', theme); } catch (e) {}
    if (themeToggle) themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  setTheme(getTheme());
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* Project images: drop skeleton on load/error (GitHub user-attachments work better with default Referer) */
  document.querySelectorAll('.project-img-wrap[data-img-loaded]').forEach(function (wrap) {
    var img = wrap.querySelector('img');
    if (!img) return;
    function reveal() {
      wrap.classList.add('loaded');
    }
    function onError() {
      wrap.classList.add('loaded', 'img-load-error');
    }
    if (img.complete) {
      if (img.naturalWidth > 0) reveal();
      else onError();
    } else {
      img.addEventListener('load', function () {
        if (img.naturalWidth > 0) reveal(); else onError();
      });
      img.addEventListener('error', onError);
    }
  });

})();
