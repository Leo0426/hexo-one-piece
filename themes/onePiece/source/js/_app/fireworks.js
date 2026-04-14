var canvasEl = document.createElement('canvas');
canvasEl.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999999';
document.body.appendChild(canvasEl);

var ctx = canvasEl.getContext('2d');
var numberOfParticules = 28;
var pointerX = 0;
var pointerY = 0;
var tap = 'click'; // ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown'
var colors = CONFIG.fireworks || ["rgba(217,45,32,.92)", "rgba(246,196,69,.95)", "rgba(0,166,200,.9)", "rgba(22,119,199,.82)", "rgba(255,255,255,.9)"];
var ringColors = ["rgba(246,196,69,.9)", "rgba(217,45,32,.72)", "rgba(255,255,255,.86)"];
var trailColors = ["rgba(0,166,200,.6)", "rgba(77,208,225,.55)", "rgba(255,255,255,.72)", "rgba(246,196,69,.48)"];
var canUseMouseEffects = !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches;
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var trailEnabled = canUseMouseEffects && !reduceMotion;
var lastTrailAt = 0;
var activeTrailAnimations = 0;
var maxTrailAnimations = 18;
var quietTargetSelector = "input, textarea, select, option, [contenteditable='true'], [disabled], .disabled, .disabled-item";
var actionTargetSelector = "a, button, summary, label, [role='button'], [onclick], .clickable, .search, .theme, .toggle, .close-btn, .copy-btn, .breakline-btn, .fullscreen-btn, .show-btn, .page-number, .menu .item, #quick .item, #tool .item, .tabs .nav li, .quiz > p, .quiz > ul.options li";
var waitCursor = null;
if(!colors.length)
  colors = ["rgba(217,45,32,.92)", "rgba(246,196,69,.95)", "rgba(0,166,200,.9)", "rgba(22,119,199,.82)", "rgba(255,255,255,.9)"];

function setCanvasSize() {
  canvasEl.width = window.innerWidth * 2;
  canvasEl.height = window.innerHeight * 2;
  canvasEl.style.width = window.innerWidth + 'px';
  canvasEl.style.height = window.innerHeight + 'px';
  canvasEl.getContext('2d').scale(2, 2);
}

function updateCoords(e) {
  pointerX = e.clientX || e.touches && e.touches[0].clientX;
  pointerY = e.clientY || e.touches && e.touches[0].clientY;
}

function targetMatches(target, selector) {
  while(target && target !== document) {
    if(target.matches && target.matches(selector))
      return true;

    target = target.parentNode;
  }

  return false;
}

function ensureWaitCursor() {
  if(waitCursor || !canUseMouseEffects)
    return waitCursor;

  waitCursor = APP.dom.createElement('div');
  waitCursor.className = 'op-cursor-wait';
  waitCursor.innerHTML = '<span></span>';
  document.body.appendChild(waitCursor);
  return waitCursor;
}

function isWaitingCursor() {
  return BODY && (!BODY.hasClass('loaded') || BODY.hasClass('pace-running') || HTML.hasClass('pace-running') || !!$('[aria-busy="true"]'));
}

function syncWaitCursor(x, y) {
  if(!canUseMouseEffects)
    return;

  var cursor = ensureWaitCursor();
  if(!cursor)
    return;

  if(isWaitingCursor()) {
    cursor.style.transform = 'translate3d(' + (x - 16) + 'px,' + (y - 16) + 'px,0)';
    cursor.addClass('is-visible');
  } else {
    cursor.removeClass('is-visible');
  }
}

function setParticuleDirection(p, mode) {
  var angle = anime.random(0, 360) * Math.PI / 180;
  var value = mode === 'action' ? anime.random(56, 154) : anime.random(44, 136);
  var radius = [-1, 1][anime.random(0, 1)] * value;
  return {
    x: p.x + radius * Math.cos(angle),
    y: p.y + radius * Math.sin(angle)
  }
}

function setTrailDirection(p) {
  var angle = anime.random(0, 360) * Math.PI / 180;
  var value = anime.random(8, 28);
  return {
    x: p.x + value * Math.cos(angle),
    y: p.y + value * Math.sin(angle)
  }
}

function drawParticuleShape(p) {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  if(p.type === 'star') {
    ctx.beginPath();
    ctx.moveTo(0, -p.radius * 1.7);
    ctx.lineTo(p.radius * .45, -p.radius * .45);
    ctx.lineTo(p.radius * 1.7, 0);
    ctx.lineTo(p.radius * .45, p.radius * .45);
    ctx.lineTo(0, p.radius * 1.7);
    ctx.lineTo(-p.radius * .45, p.radius * .45);
    ctx.lineTo(-p.radius * 1.7, 0);
    ctx.lineTo(-p.radius * .45, -p.radius * .45);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
  } else if(p.type === 'slash') {
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.moveTo(-p.radius, 0);
    ctx.quadraticCurveTo(0, -p.radius * .55, p.radius, 0);
    ctx.lineWidth = p.lineWidth;
    ctx.strokeStyle = p.color;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * .75, p.radius * 1.35, 0, 0, 2 * Math.PI);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  ctx.restore();
}

function createParticule(x,y,mode) {
  var p = {};
  p.x = x;
  p.y = y;
  p.color = colors[anime.random(0, colors.length - 1)];
  p.alpha = 1;
  p.rotation = anime.random(0, 360) * Math.PI / 180;
  p.type = ['splash', 'splash', 'star', 'slash'][anime.random(0, 3)];
  p.radius = p.type === 'slash' ? anime.random(10, 18) : anime.random(4, mode === 'action' ? 11 : 9);
  p.lineWidth = anime.random(2, 4);
  p.endPos = setParticuleDirection(p, mode);
  p.draw = function() {
    drawParticuleShape(p);
  }
  return p;
}

function createTrailParticule(x,y) {
  var p = {};
  p.x = x + anime.random(-4, 4);
  p.y = y + anime.random(-4, 4);
  p.color = trailColors[anime.random(0, trailColors.length - 1)];
  p.alpha = anime.random(45, 78) / 100;
  p.rotation = anime.random(0, 360) * Math.PI / 180;
  p.type = ['splash', 'splash', 'star'][anime.random(0, 2)];
  p.radius = p.type === 'star' ? anime.random(2, 4) : anime.random(2, 6);
  p.lineWidth = anime.random(1, 2);
  p.endPos = setTrailDirection(p);
  p.draw = function() {
    drawParticuleShape(p);
  }
  return p;
}

function createCircle(x,y,index) {
  var p = {};
  p.x = x;
  p.y = y;
  p.color = ringColors[index % ringColors.length];
  p.radius = 0.1;
  p.alpha = index === 1 ? .58 : .72;
  p.lineWidth = index === 1 ? 4 : 6;
  p.draw = function() {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
    ctx.lineWidth = p.lineWidth;
    ctx.strokeStyle = p.color;
    ctx.stroke();
    ctx.restore();
  }
  return p;
}

function renderParticule(anim) {
  for (var i = 0; i < anim.animatables.length; i++) {
    anim.animatables[i].target.draw();
  }
}

function animateParticules(x, y, mode) {
  mode = mode || 'normal';
  var circle = createCircle(x, y, 0);
  var innerCircle = createCircle(x, y, 1);
  var foamCircle = createCircle(x, y, 2);
  var particules = [];
  var amount = mode === 'action' ? numberOfParticules + 10 : numberOfParticules;
  for (var i = 0; i < amount; i++) {
    particules.push(createParticule(x, y, mode));
  }
  anime.timeline().add({
    targets: particules,
    x: function(p) { return p.endPos.x; },
    y: function(p) { return p.endPos.y; },
    radius: function(p) { return p.type === 'slash' ? 0.1 : p.radius * .3; },
    alpha: 0,
    rotation: function(p) { return p.rotation + anime.random(-120, 120) * Math.PI / 180; },
    duration: anime.random(900, 1300),
    easing: 'easeOutExpo',
    update: renderParticule
  }).add({
    targets: circle,
    radius: mode === 'action' ? anime.random(72, 116) : anime.random(56, 96),
    lineWidth: 0,
    alpha: {
      value: 0,
      easing: 'linear',
      duration: anime.random(540, 720),
    },
    duration: anime.random(850, 1200),
    easing: 'easeOutExpo',
    update: renderParticule
  }, 0).add({
    targets: innerCircle,
    radius: mode === 'action' ? anime.random(42, 66) : anime.random(30, 52),
    lineWidth: 0,
    alpha: 0,
    duration: anime.random(700, 980),
    easing: 'easeOutExpo',
    update: renderParticule
  }, 0).add({
    targets: foamCircle,
    radius: mode === 'action' ? anime.random(20, 32) : anime.random(14, 26),
    lineWidth: 0,
    alpha: 0,
    duration: anime.random(420, 640),
    easing: 'easeOutExpo',
    update: renderParticule
  }, 0);
}

function animateTrail(x, y) {
  if(!trailEnabled || activeTrailAnimations >= maxTrailAnimations)
    return;

  activeTrailAnimations++;

  var particules = [];
  for (var i = 0; i < anime.random(2, 4); i++) {
    particules.push(createTrailParticule(x, y));
  }

  anime({
    targets: particules,
    x: function(p) { return p.endPos.x; },
    y: function(p) { return p.endPos.y; },
    radius: 0.1,
    alpha: 0,
    rotation: function(p) { return p.rotation + anime.random(-90, 90) * Math.PI / 180; },
    duration: anime.random(450, 800),
    easing: 'easeOutQuad',
    update: renderParticule,
    complete: function() {
      activeTrailAnimations = Math.max(activeTrailAnimations - 1, 0);
    }
  });
}

var render = anime({
  duration: Infinity,
  update: function() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
});

document.addEventListener(tap, function(e) {
  updateCoords(e);
  syncWaitCursor(pointerX, pointerY);

  if(!canUseMouseEffects || reduceMotion || targetMatches(e.target, quietTargetSelector))
    return;

  render.play();
  animateParticules(pointerX, pointerY, targetMatches(e.target, actionTargetSelector) ? 'action' : 'normal');
}, false);

document.addEventListener('mousemove', function(e) {
  pointerX = e.clientX;
  pointerY = e.clientY;
  syncWaitCursor(pointerX, pointerY);

  if(!trailEnabled || targetMatches(e.target, quietTargetSelector))
    return;

  var now = Date.now();
  if(now - lastTrailAt < 48)
    return;

  lastTrailAt = now;
  render.play();
  animateTrail(e.clientX, e.clientY);
}, false);

['pjax:send', 'pjax:success', 'load'].forEach(function(name) {
  window.addEventListener(name, function() {
    syncWaitCursor(pointerX, pointerY);
  });
});

setCanvasSize();
window.addEventListener('resize', setCanvasSize, false);
