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
  var rows = document.querySelectorAll('.problem-row');
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
