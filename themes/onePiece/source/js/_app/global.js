var statics = APP.state.statics;
var scrollAction = APP.state.scrollAction;
var diffY = APP.state.diffY || 0;
var originTitle = APP.state.originTitle;
var titleTime = APP.state.titleTime;

const BODY = APP.dom.enhance(document.body);
const HTML = APP.dom.enhance(document.documentElement);
const Container = $('#container');
const loadCat = $('#loading');
const siteNav = $('#nav');
const siteHeader = $('#header');
const menuToggle = siteNav.child('.toggle');
const quickBtn = $('#quick');
const sideBar = $('#sidebar');
const siteBrand = $('#brand');
var toolBtn = $('#tool'), toolPlayer, backToTop, goToComment, showContents;
var siteSearch = $('#search');
var siteNavHeight = APP.state.siteNavHeight;
var headerHightInner = APP.state.headerHightInner;
var headerHight = APP.state.headerHight;
var oWinHeight = APP.state.viewport.height;
var oWinWidth = APP.state.viewport.width;
var sidebarNaturalHeight = APP.state.sidebarNaturalHeight || 0;
var LOCAL_HASH = APP.state.navigation.localHash;
var LOCAL_URL = APP.state.navigation.localUrl;
var pjax = APP.state.navigation.pjax;
const lazyload = lozad('img, [data-background-image]', {
    loaded: function(el) {
        APP.dom.enhance(el).addClass('lozaded');
    }
});

APP.elements = Object.assign(APP.elements || {}, {
  BODY: BODY,
  HTML: HTML,
  Container: Container,
  loadCat: loadCat,
  siteNav: siteNav,
  siteHeader: siteHeader,
  menuToggle: menuToggle,
  quickBtn: quickBtn,
  sideBar: sideBar,
  siteBrand: siteBrand
});

const syncGlobalState = function() {
  APP.state.diffY = diffY;
  APP.state.originTitle = originTitle;
  APP.state.titleTime = titleTime;
  APP.state.siteNavHeight = siteNavHeight;
  APP.state.headerHightInner = headerHightInner;
  APP.state.headerHight = headerHight;
  APP.state.viewport.height = oWinHeight;
  APP.state.viewport.width = oWinWidth;
  APP.state.sidebarNaturalHeight = sidebarNaturalHeight;
  APP.state.navigation.localHash = LOCAL_HASH;
  APP.state.navigation.localUrl = LOCAL_URL;
  APP.state.navigation.pjax = pjax;
};

const rememberSidebarNaturalHeight = function () {
  if (!sideBar || document.body.offsetWidth <= 991)
    return 0;

  if (!sideBar.hasClass('affix')) {
    sidebarNaturalHeight = Math.ceil(sideBar.offsetHeight || 0);
  }

  return sidebarNaturalHeight;
}

const Loader = {
  timer: null,
  lock: false,
  show: function() {
    clearTimeout(this.timer);
    document.body.removeClass('loaded');
    loadCat.attr('style', 'display:flex');
    Loader.lock = false;
  },
  hide: function(sec) {
    if(!CONFIG.loader.start)
      sec = -1
    this.timer = setTimeout(this.vanish, sec||3000);
  },
  vanish: function() {
    if(Loader.lock)
      return;
    if(CONFIG.loader.start)
      transition(loadCat, 0)
    document.body.addClass('loaded');
    Loader.lock = true;
  }
}

const changeTheme = function(type) {
  var btn = $('.theme .ic')
  if(type == 'dark') {
    HTML.attr('data-theme', type);
    btn.removeClass('i-sun')
    btn.addClass('i-moon')
  } else {
    HTML.attr('data-theme', null);
    btn.removeClass('i-moon');
    btn.addClass('i-sun');
  }

  changeMetaTheme(currentMetaTheme());
}

const changeMetaTheme = function(color) {
  if(HTML.attr('data-theme') == 'dark')
    color = '#101923'

  $('meta[name="theme-color"]').attr('content', color);
}

const currentMetaTheme = function() {
  return window.pageYOffset > (headerHightInner || 0) ? '#FFF' : '#101923';
}

const themeColorListener = function () {
  var darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  var handleSystemThemeChange = function(mediaQueryList) {
    if (store.get('theme') || CONFIG.darkmode) {
      return;
    }

    if(mediaQueryList.matches){
      changeTheme('dark');
    } else {
      changeTheme();
    }
  };

  if (darkMediaQuery.addEventListener) {
    darkMediaQuery.addEventListener('change', handleSystemThemeChange);
  } else if (darkMediaQuery.addListener) {
    darkMediaQuery.addListener(handleSystemThemeChange);
  }

  var t = store.get('theme');
  if(t) {
    changeTheme(t);
  } else {
    if(CONFIG.darkmode || darkMediaQuery.matches) {
      changeTheme('dark');
    } else {
      changeTheme();
    }
  }

  $('.theme').addEventListener('click', function(event) {
    var btn = event.currentTarget.child('.ic')
    var shipWheel = statics + 'images/op-icons/ship-wheel.png';
    var jollyRoger = statics + 'images/op-icons/jolly-roger.png';

    var stars = '';
    for(var i = 0; i < 76; i++) {
      var sz = (Math.random() * 2.8 + 1).toFixed(1);
      var sl = (Math.random() * 95).toFixed(1);
      var st = (Math.random() * 82).toFixed(1);
      stars += '<span class="theme-voyage__star" style="width:' + sz + 'px;height:' + sz + 'px;left:' + sl + '%;top:' + st + '%"></span>';
    }

    var clouds = '<div class="theme-voyage__clouds"><span class="theme-voyage__cloud theme-voyage__cloud--1"></span><span class="theme-voyage__cloud theme-voyage__cloud--2"></span><span class="theme-voyage__cloud theme-voyage__cloud--3"></span><span class="theme-voyage__cloud theme-voyage__cloud--4"></span><span class="theme-voyage__cloud theme-voyage__cloud--5"></span><span class="theme-voyage__cloud theme-voyage__cloud--6"></span><span class="theme-voyage__cloud theme-voyage__cloud--7"></span><span class="theme-voyage__cloud theme-voyage__cloud--8"></span><span class="theme-voyage__cloud theme-voyage__cloud--9"></span><span class="theme-voyage__cloud theme-voyage__cloud--10"></span></div>';

    var neko = BODY.createChild('div', {
      id: 'neko',
      innerHTML: '<div class="theme-voyage" aria-hidden="true"><div class="theme-voyage__sky"><span class="theme-voyage__sun"></span><span class="theme-voyage__moon"></span></div>' + clouds + '<div class="theme-voyage__stars">' + stars + '</div><div class="theme-voyage__mark"><img class="theme-voyage__wheel" src="' + shipWheel + '" alt="" draggable="false"><img class="theme-voyage__jolly" src="' + jollyRoger + '" alt="" draggable="false"></div><div class="theme-voyage__caption"><span class="caption--light">出航！驶向冒险的大海！</span><span class="caption--dark">乘风破浪，进入新世界！</span></div><div class="theme-voyage__wave theme-voyage__wave--back"></div><div class="theme-voyage__wave theme-voyage__wave--mid"></div><div class="theme-voyage__wave theme-voyage__wave--front"></div></div>'
    });

    var hideNeko = function() {
        transition(neko, {
          delay: 2500,
          opacity: 0
        }, function() {
          BODY.removeChild(neko)
        });
    }

    if(btn.hasClass('i-sun')) {
      var c = function() {
          neko.addClass('dark');
          changeTheme('dark');
          store.set('theme', 'dark');
          hideNeko();
        }
    } else {
      neko.addClass('dark');
      var c = function() {
          neko.removeClass('dark');
          changeTheme();
          store.set('theme', 'light');
          hideNeko();
        }
    }
    transition(neko, 1, function() {
      setTimeout(c, 210)
    })
  });
}

const visibilityListener = function () {
  document.addEventListener('visibilitychange', function() {
    switch(document.visibilityState) {
      case 'hidden':
        $('[rel="icon"]').attr('href', statics + CONFIG.favicon.hidden);
        document.title = LOCAL.favicon.hide;
        if(CONFIG.loader.switch)
          Loader.show()
        clearTimeout(titleTime);
      break;
      case 'visible':
        $('[rel="icon"]').attr('href', statics + CONFIG.favicon.normal);
        document.title = LOCAL.favicon.show;
        if(CONFIG.loader.switch)
          Loader.hide(1000)
        titleTime = setTimeout(function () {
          document.title = originTitle;
        }, 2000);
      break;
    }
    syncGlobalState();
  });
}

const showtip = function(msg) {
  if(!msg)
    return

  var tipbox = BODY.createChild('div', {
    innerHTML: msg,
    className: 'tip'
  });

  setTimeout(function() {
    tipbox.addClass('hide')
    setTimeout(function() {
      BODY.removeChild(tipbox);
    }, 300);
  }, 3000);
}

const syncSidebarHeight = function () {
  if (!sideBar)
    return;

  var panels = sideBar.child('.panels');
  var inner = sideBar.child('.inner');
  var main = $('#main');
  var isDesktop = document.body.offsetWidth > 991;
  var navOffset = 0;
  var naturalTop = 0;
  var naturalHeight = 0;
  var mainHeight = 0;
  var affixedHeight = 0;
  var stopAt = 0;

  if (!panels || !inner)
    return;

  if (siteNav && sideBar.hasClass('affix') && siteNav.hasClass('show') && !siteNav.hasClass('down')) {
    navOffset = siteNavHeight || siteNav.height() || 0;
  }

  if (!isDesktop) {
    panels.style.height = oWinHeight + 'px';
    inner.style.top = '';
    inner.style.position = '';
    inner.style.bottom = '';
    inner.style.height = '';
    sideBar.style.minHeight = '';
    return;
  }

  if (!sideBar.hasClass('affix')) {
    panels.style.height = '';
    inner.style.top = '';
    inner.style.position = '';
    inner.style.bottom = '';
    inner.style.height = '';
    sideBar.style.minHeight = '';
    return;
  }

  panels.style.height = '';
  inner.style.top = '';
  inner.style.position = '';
  inner.style.bottom = '';
  inner.style.height = '';
  sideBar.style.minHeight = '';

  sideBar.removeClass('affix');
  naturalTop = sideBar.getBoundingClientRect().top + window.pageYOffset;
  naturalHeight = Math.ceil(inner.offsetHeight);
  mainHeight = main ? Math.ceil(main.offsetHeight) : naturalHeight;
  affixedHeight = naturalHeight;

  if (naturalHeight > navOffset && naturalHeight > oWinHeight - navOffset) {
    panels.style.height = Math.max(oWinHeight - navOffset, 0) + 'px';
    affixedHeight = Math.max(oWinHeight - navOffset, 0);
  }

  sideBar.style.minHeight = Math.max(mainHeight, naturalHeight) + 'px';
  sideBar.addClass('affix');

  stopAt = naturalTop + Math.max(mainHeight - affixedHeight, 0) - navOffset;
  inner.style.height = affixedHeight + 'px';

  if (window.pageYOffset >= stopAt) {
    inner.style.position = 'absolute';
    inner.style.top = Math.max(mainHeight - affixedHeight, 0) + 'px';
  } else {
    inner.style.position = 'fixed';
    inner.style.top = navOffset + 'px';
  }
}

const updateSidebarAffix = function () {
  if (!sideBar)
    return;

  var navOffset = 0;
  var main = $('#main');
  var mainHeight = main ? Math.ceil(main.offsetHeight || 0) : 0;
  var naturalHeight = rememberSidebarNaturalHeight();
  if (siteNav && siteNav.hasClass('show') && !siteNav.hasClass('down')) {
    navOffset = siteNavHeight || siteNav.height() || 0;
  }

  var shouldAffix = window.pageYOffset >= Math.max(headerHight - navOffset, 0)
    && document.body.offsetWidth > 991
    && mainHeight > naturalHeight;

  if (sideBar.hasClass('affix') !== shouldAffix) {
    sideBar.toggleClass('affix', shouldAffix);
  }

  syncSidebarHeight();
}

const resizeHandle = function (event) {
  siteNavHeight = siteNav.height();
  headerHightInner = siteHeader.height();
  headerHight = headerHightInner + $('#waves').height();

  if(oWinWidth != window.innerWidth)
    sideBarToggleHandle(null, 1);

  oWinHeight = window.innerHeight;
  oWinWidth = window.innerWidth;
  rememberSidebarNaturalHeight();
  syncGlobalState();
  syncSidebarHeight();
}

const scrollHandle = function (event) {
  var winHeight = window.innerHeight;
  var docHeight = getDocHeight();
  var contentVisibilityHeight = docHeight > winHeight ? docHeight - winHeight : document.body.scrollHeight - winHeight;
  var SHOW = window.pageYOffset > headerHightInner;
  var startScroll = window.pageYOffset > 0;

  if (SHOW) {
    changeMetaTheme('#FFF');
  } else {
    changeMetaTheme('#101923');
  }

  siteNav.toggleClass('show', SHOW);
  toolBtn.toggleClass('affix', startScroll);
  siteBrand.toggleClass('affix', startScroll);

  if (typeof scrollAction.y == 'undefined') {
    scrollAction.y = window.pageYOffset;
    //scrollAction.x = Container.scrollLeft;
    //scrollAction.y = Container.scrollTop;
  }
  //var diffX = scrollAction.x - Container.scrollLeft;
  diffY = scrollAction.y - window.pageYOffset;

  //if (diffX < 0) {
  // Scroll right
  //} else if (diffX > 0) {
  // Scroll left
  //} else
  if (diffY < 0) {
    // Scroll down
    siteNav.removeClass('up')
    siteNav.toggleClass('down', SHOW);
  } else if (diffY > 0) {
    // Scroll up
    siteNav.removeClass('down')
    siteNav.toggleClass('up', SHOW);
  } else {
    // First scroll event
  }

  updateSidebarAffix();

  //scrollAction.x = Container.scrollLeft;
  scrollAction.y = window.pageYOffset;
  APP.state.diffY = diffY;

  var scrollPercent = Math.round(Math.min(100 * window.pageYOffset / contentVisibilityHeight, 100)) + '%';
  backToTop.child('span').innerText = scrollPercent;
  $('.percent').width(scrollPercent);
  syncGlobalState();
}

const pagePosition = function() {
  if(CONFIG.auto_scroll)
    store.set(LOCAL_URL, scrollAction.y)
  syncGlobalState();
}

const positionInit = function(comment) {
  var anchor = window.location.hash
  var target = null;
  if(LOCAL_HASH) {
    store.del(LOCAL_URL);
    return
  }

  if(anchor)
    target = $(decodeURI(anchor))
  else {
    target = CONFIG.auto_scroll ? parseInt(store.get(LOCAL_URL)) : 0
  }

  if(target) {
    pageScroll(target);
    LOCAL_HASH = 1;
  }

  if(comment && anchor && !LOCAL_HASH) {
    pageScroll(target);
    LOCAL_HASH = 1;
  }

  syncGlobalState();
}

const clipBoard = function(str, callback) {
  var ta = BODY.createChild('textarea', {
    style: {
      top: window.scrollY + 'px', // Prevent page scrolling
      position: 'absolute',
      opacity: '0'
    },
    readOnly: true,
    value: str
  });

  const selection = document.getSelection();
  const selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
  ta.select();
  ta.setSelectionRange(0, str.length);
  ta.readOnly = false;
  var result = document.execCommand('copy');
  callback && callback(result);
  ta.blur(); // For iOS
  if (selected) {
    selection.removeAllRanges();
    selection.addRange(selected);
  }
  BODY.removeChild(ta);
}

APP.register('globals', {
  BODY: BODY,
  HTML: HTML,
  Container: Container,
  Loader: Loader,
  backToTopRef: function() {
    return backToTop;
  },
  changeMetaTheme: changeMetaTheme,
  changeTheme: changeTheme,
  clipBoard: clipBoard,
  currentMetaTheme: currentMetaTheme,
  lazyload: lazyload,
  pagePosition: pagePosition,
  positionInit: positionInit,
  resizeHandle: resizeHandle,
  scrollHandle: scrollHandle,
  setToolRefs: function(refs) {
    toolBtn = refs.toolBtn;
    toolPlayer = refs.toolPlayer;
    backToTop = refs.backToTop;
    goToComment = refs.goToComment;
    showContents = refs.showContents;
    APP.elements.toolBtn = toolBtn;
    APP.elements.toolPlayer = toolPlayer;
    APP.elements.backToTop = backToTop;
    APP.elements.goToComment = goToComment;
    APP.elements.showContents = showContents;
  },
  showtip: showtip,
  sideBar: sideBar,
  siteBrand: siteBrand,
  siteNav: siteNav,
  statics: statics,
  syncSidebarHeight: syncSidebarHeight,
  themeColorListener: themeColorListener,
  updateSidebarAffix: updateSidebarAffix,
  visibilityListener: visibilityListener
});
