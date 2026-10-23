(function(){
  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  if (toggle && nav) toggle.addEventListener('click', function(){
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });
  if (nav) nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    });
  });

  // Theories dropdown
  var dd = document.querySelector('.has-dropdown');
  var ddBtn = dd && dd.querySelector('.dropdown-toggle');
  function setDropdown(open){
    if (!dd) return;
    dd.classList.toggle('open', open);
    ddBtn.setAttribute('aria-expanded', String(open));
  }
  if (dd && ddBtn){
    ddBtn.addEventListener('click', function(e){
      e.stopPropagation();
      setDropdown(ddBtn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('click', function(e){
      if (!dd.contains(e.target)) setDropdown(false);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && ddBtn.getAttribute('aria-expanded') === 'true'){
        setDropdown(false); ddBtn.focus();
      }
    });
    if (toggle) toggle.addEventListener('click', function(){ setDropdown(false); });
  }

  // Problem filter tabs
  var filterBtns = document.querySelectorAll('.filter-btn');
  var rows = document.querySelectorAll('.problem-row, .tl-item[data-cat]');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.setAttribute('aria-pressed','false'); });
      btn.setAttribute('aria-pressed','true');
      var f = btn.getAttribute('data-filter');
      rows.forEach(function(row){
        row.hidden = !(f === 'all' || row.getAttribute('data-cat') === f);
      });
    });
  });

  // On-page TOC scroll-spy (subpages only — no-op when there's no .toc-nav)
  var tocLinks = document.querySelectorAll('.toc-link');
  if (tocLinks.length){
    var tocMap = [];
    tocLinks.forEach(function(link){
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) tocMap.push({ section:section, link:link });
    });
    if ('IntersectionObserver' in window && tocMap.length){
      var tocObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (!entry.isIntersecting) return;
          var match = tocMap.find(function(m){ return m.section === entry.target; });
          if (!match) return;
          tocLinks.forEach(function(l){ l.classList.remove('is-active'); });
          match.link.classList.add('is-active');
        });
      }, { rootMargin:'-45% 0px -50% 0px', threshold:0 });
      tocMap.forEach(function(m){ tocObserver.observe(m.section); });
    }
  }

  // KaTeX rendering for every [data-katex] node
  function renderMath(){
    if (typeof katex === 'undefined') { return setTimeout(renderMath, 150); }
    document.querySelectorAll('[data-katex]').forEach(function(el){
      try{
        katex.render(el.getAttribute('data-katex'), el, { throwOnError:false, displayMode:false });
      }catch(e){ /* leave as text on failure */ }
    });
  }
  renderMath();
})();

/* ---- Figure animations (pairs with the FIGURE ANIMATIONS block in styles.css) ----
   Append after the closing })(); of js/script.js. (If you already pasted the
   first version of this snippet, replace it with this one.) Does four things:
   1. adds .is-inview to an animated figure while it is on screen (and removes it
      when it leaves), so loops only run when someone can see them;
   2. injects the few moving shapes the static SVGs do not contain (photon dots,
      playhead and trace dots), skipped entirely when reduced motion is requested;
   3. gives each crystal-figure dot the offset of its own arrow, each clock tick
      and each patchwork circle its own start delay.
   4. works on the homepage too: its two concept-card figures are in the list.
   Without this script, or with reduced motion, every figure stays the static drawing. */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var NS = 'http://www.w3.org/2000/svg';
  function add(svg, tag, attrs){
    var n = document.createElementNS(NS, tag);
    for (var k in attrs){ if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]); }
    n.setAttribute('aria-hidden', 'true');
    svg.appendChild(n);
    return n;
  }
  function dot(svg, cls, r){
    return add(svg, 'circle', { 'class': 'fa-extra ' + cls, cx: 0, cy: 0, r: r });
  }

  function num(str, re){
    var m = (str || '').match(re);
    return m ? parseFloat(m[1]) : NaN;
  }

  var setup = {
    'fig-cloud': null,
    'fig-c_cloud': null,
    'fig-c_entropy': null,
    'fig-massgap': null,
    'fig-worlds': null,
    'fig-slit': null,
    'fig-entropy': null,
    'fig-balance': null,

    // Photon dots for the quantum-eraser layout.
    'fig-eraser': function(svg){
      dot(svg, 'fa-ph1 f-steel k-ink w15', 4.5);
      dot(svg, 'fa-ph1a f-steel k-ink w1', 3.2);
      dot(svg, 'fa-ph1b f-steel k-ink w1', 3.2);
      dot(svg, 'fa-ph2 f-steel k-ink w15', 4.5);
    },

    // Playhead and two trace-following dots for the half-wave rectification.
    'fig-rectify': function(svg){
      add(svg, 'line', { 'class': 'fa-extra fa-rect-head k-ink w1 dash-s', x1: 0, y1: 40, x2: 0, y2: 250 });
      dot(svg, 'fa-rect-top f-steel k-ink w15', 4.5);
      dot(svg, 'fa-rect-bot f-steel k-ink w15', 4.5);
    },

    // Time cursor for the two clocks; each tick starts its pop when the cursor
    // reaches it (x runs 40-600, the cursor takes 96% of the 10 s loop).
    'fig-clocks': function(svg){
      add(svg, 'line', { 'class': 'fa-extra fa-clk-head k-ink w1 dash-s', x1: 0, y1: 72, x2: 0, y2: 240 });
      var ticks = svg.querySelectorAll('path.k-steel.w2, path.k-ink.w3');
      for (var i = 0; i < ticks.length; i++){
        var x = num(ticks[i].getAttribute('d'), /^M\s*(-?\d+(?:\.\d+)?)/);
        if (isNaN(x)) continue;
        var t = Math.max(0, Math.min(1, (x - 40) / 560)) * 9.6;
        ticks[i].style.setProperty('--fa-d', t.toFixed(2) + 's');
      }
    },

    // A pulse for the slow-light panel and a photon for the crystal panel.
    'fig-delay': function(svg){
      dot(svg, 'fa-del-sl f-steel k-ink w15', 4.5);
      dot(svg, 'fa-del-cr f-steel k-ink w15', 4.5);
    },

    // Straight-line dot (hollow) and zig-zag dot (solid).
    'fig-zigzag': function(svg){
      dot(svg, 'fa-zz-s f-cream k-ink w15', 4.5);
      dot(svg, 'fa-zz-w f-steel k-ink w15', 4.5);
    },

    // Right-panel circles start growing left to right.
    'fig-spaces': function(svg){
      var circles = svg.querySelectorAll('g[clip-path$="spaces-c1)"] circle');
      for (var i = 0; i < circles.length; i++){
        var cx = parseFloat(circles[i].getAttribute('cx'));
        if (isNaN(cx)) continue;
        var t = Math.max(0, Math.min(1, (cx - 330) / 300)) * 1.6;
        circles[i].style.setProperty('--fa-d', t.toFixed(2) + 's');
      }
    },

    // Each ordinary-matter dot is followed by its arrow: M x1 y1 L x2 y2.
    // Send the dot to the arrow's tip.
    'fig-crystal': function(svg){
      var dots = svg.querySelectorAll('circle[r="3.2"]');
      for (var i = 0; i < dots.length; i++){
        var d = dots[i], arrow = d.nextElementSibling;
        if (!arrow || arrow.tagName.toLowerCase() !== 'path') continue;
        var n = (arrow.getAttribute('d') || '').match(/-?\d+(?:\.\d+)?/g);
        if (!n || n.length < 4) continue;
        var dx = parseFloat(n[2]) - parseFloat(d.getAttribute('cx'));
        var dy = parseFloat(n[3]) - parseFloat(d.getAttribute('cy'));
        d.style.setProperty('--fa-dx', dx.toFixed(1) + 'px');
        d.style.setProperty('--fa-dy', dy.toFixed(1) + 'px');
      }
    }
  };

  var figs = [];
  Object.keys(setup).forEach(function(id){
    var fig = document.getElementById(id);
    if (!fig || fig.tagName.toLowerCase() !== 'figure') return;
    var svg = fig.querySelector('svg');
    if (svg && setup[id] && !svg.getAttribute('data-fa')){
      svg.setAttribute('data-fa', '1');
      setup[id](svg);
    }
    figs.push(fig);
  });
  if (!figs.length) return;

  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        entry.target.classList[entry.isIntersecting ? 'add' : 'remove']('is-inview');
      });
    }, { threshold: 0.25 });
    figs.forEach(function(fig){ io.observe(fig); });
  } else {
    figs.forEach(function(fig){ fig.classList.add('is-inview'); });
  }
})();
