(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  /* Fixed cute cat: walks along bottom edge as you scroll (hidden if reduced motion) */
  (function initScrollCat() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var svg =
      '<svg class="scroll-cat__svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="58" height="58" aria-hidden="true">' +
      '<g class="scroll-cat__art">' +
      '<path class="scroll-cat__tail" d="M10 44 Q5 30 16 24" fill="none" stroke="#b8896a" stroke-width="3.5" stroke-linecap="round"/>' +
      '<ellipse cx="34" cy="41" rx="17" ry="13" fill="#d4a574"/>' +
      '<circle cx="45" cy="27" r="13.5" fill="#d4a574"/>' +
      '<path d="M33 17 L28 7 L36 14 Z" fill="#c49464"/>' +
      '<path d="M52 14 L58 6 L54 15 Z" fill="#c49464"/>' +
      '<path d="M33.5 15 L30 9 L35 12 Z" fill="#f5b8c8"/>' +
      '<path d="M53 12 L56 8 L54 14 Z" fill="#f5b8c8"/>' +
      '<ellipse cx="41" cy="52" class="scroll-cat__paw-l" rx="4.5" ry="2.8" fill="#c49464"/>' +
      '<ellipse cx="52" cy="52" class="scroll-cat__paw-r" rx="4.5" ry="2.8" fill="#c49464"/>' +
      '<circle cx="49" cy="25" r="2" fill="#2d2d2d"/>' +
      '<circle cx="41" cy="25" r="2" fill="#2d2d2d"/>' +
      '<circle cx="50" cy="24" r="0.65" fill="#fff" opacity="0.9"/>' +
      '<circle cx="42" cy="24" r="0.65" fill="#fff" opacity="0.9"/>' +
      '<path d="M42 31 Q45.5 33.5 49 31" fill="none" stroke="#2d2d2d" stroke-width="1.2" stroke-linecap="round"/>' +
      '<ellipse cx="45" cy="21" rx="2.5" ry="1.2" fill="#f0a8b8" opacity="0.55"/>' +
      '</g></svg>';

    var cat = document.createElement('div');
    cat.className = 'scroll-cat';
    cat.setAttribute('aria-hidden', 'true');
    cat.innerHTML = '<div class="scroll-cat__track"><div class="scroll-cat__bob">' + svg + '</div></div>';
    document.body.appendChild(cat);

    var track = cat.querySelector('.scroll-cat__track');
    var walkTimer;
    var lastY = window.scrollY || 0;

    function maxScroll() {
      var el = document.documentElement;
      var h = el.scrollHeight - window.innerHeight;
      return h > 1 ? h : 1;
    }

    function tick() {
      var y = window.scrollY || 0;
      var prog = y / maxScroll();
      if (prog < 0) prog = 0;
      if (prog > 1) prog = 1;
      var w = window.innerWidth;
      var catW = 58;
      var pad = 12;
      var span = Math.max(0, w - catW - pad * 2);
      var x = pad + prog * span;
      track.style.setProperty('--cat-x', x + 'px');

      if (y !== lastY) {
        cat.classList.toggle('scroll-cat--flipped', y < lastY);
        lastY = y;
      }

      cat.classList.add('scroll-cat--walking');
      clearTimeout(walkTimer);
      walkTimer = setTimeout(function () {
        cat.classList.remove('scroll-cat--walking');
      }, 220);
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  })();

})();
