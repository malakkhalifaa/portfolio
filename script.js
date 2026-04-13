(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Sidebar (Explorer) toggle */
  var sidebar = document.querySelector('.vscode-sidebar');
  var sidebarToggle = document.getElementById('sidebar-toggle');
  var explorerToggleMobile = document.getElementById('explorer-toggle-mobile');
  var scrim = document.getElementById('vscode-scrim');

  function isMobileExplorer() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function syncExplorerScrim() {
    if (!scrim || !sidebar) return;
    var open = sidebar.classList.contains('open') && isMobileExplorer();
    scrim.classList.toggle('is-visible', open);
    scrim.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function toggleSidebar() {
    if (!sidebar) return;
    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('open', !sidebar.classList.contains('collapsed'));
    if (sidebarToggle) sidebarToggle.setAttribute('aria-label', sidebar.classList.contains('collapsed') ? 'Show sidebar' : 'Hide sidebar');
    if (explorerToggleMobile) explorerToggleMobile.setAttribute('aria-label', sidebar.classList.contains('collapsed') ? 'Open Explorer' : 'Close Explorer');
    syncExplorerScrim();
  }

  if (sidebar && sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
  if (sidebar && explorerToggleMobile) explorerToggleMobile.addEventListener('click', toggleSidebar);
  if (sidebar && window.matchMedia('(max-width: 768px)').matches) sidebar.classList.add('collapsed');

  if (scrim && sidebar) {
    scrim.addEventListener('click', function () {
      if (!isMobileExplorer()) return;
      sidebar.classList.add('collapsed');
      sidebar.classList.remove('open');
      if (sidebarToggle) sidebarToggle.setAttribute('aria-label', 'Show sidebar');
      if (explorerToggleMobile) explorerToggleMobile.setAttribute('aria-label', 'Open Explorer');
      syncExplorerScrim();
    });
  }

  window.addEventListener('resize', function () {
    syncExplorerScrim();
    if (!isMobileExplorer() && scrim) scrim.classList.remove('is-visible');
  });

  syncExplorerScrim();

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

  /* Index only: low-opacity monospace typing wash (fixed stacking; no pointer / layout impact) */
  var typingRoot = document.querySelector('.code-typing-backdrop');
  if (typingRoot) {
    var typingPre = typingRoot.querySelector('.code-typing-pre');
    if (typingPre) {
      var typingSource =
        '// ~/portfolio — scratchpad\n' +
        'const stack = ["PyTorch", "Verilog", "C++", "TypeScript"];\n' +
        'async function route(map, opts) {\n' +
        '  const g = buildGraph(map, { osm: true });\n' +
        '  return astar(g, opts.from, opts.to, opts.heuristic);\n' +
        '}\n' +
        'model.fit(X_train, y_train); // NeuroTech · IMU tremor\n' +
        'for (let epoch = 0; epoch < EPOCHS; epoch++) {\n' +
        '  loss.backward();\n' +
        '  optim.step();\n' +
        '}\n' +
        '# RISC-V\n' +
        '  lw   t0, 0(a0)\n' +
        '  addi t1, t0, 4\n' +
        '  jalr ra, 0(t1)\n' +
        '$ git commit -m "ECE297: GIS + safety routing"\n' +
        '$ ollama run llama3 "summarize reviews"\n' +
        'export PATH="$HOME/.local/bin:$PATH"\n';

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        typingPre.textContent = typingSource;
      } else {
        var typingPos = 0;
        var typingBuf = '';
        var typingMax = 4800;
        var typingMs = window.matchMedia('(max-width: 768px)').matches ? 96 : 64;
        function typingTick() {
          if (document.hidden) return;
          var n = 1;
          if (Math.random() > 0.78) n += 1;
          if (Math.random() > 0.94) n += 2;
          for (var i = 0; i < n; i++) {
            typingBuf += typingSource.charAt(typingPos % typingSource.length);
            typingPos++;
          }
          if (typingBuf.length > typingMax) typingBuf = typingBuf.slice(-typingMax);
          typingPre.textContent = typingBuf;
        }
        window.setInterval(typingTick, typingMs);
      }
    }
  }

})();
