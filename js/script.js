(function(){
  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  toggle.addEventListener('click', function(){
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    });
  });

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
