var shell = APP.modules.globals;
var playerModule = APP.modules.player;
var pageModule = APP.modules.page;
var sidebarModule = APP.modules.sidebar;
var utilsModule = APP.modules.utils;

const domInit = function() {
  $.each('.overview .menu > .item', function(el) {
    siteNav.child('.menu').appendChild(el.cloneNode(true));
  })

  loadCat.addEventListener('click', shell.Loader.vanish);
  menuToggle.addEventListener('click', sidebarModule.sideBarToggleHandle);
  $('.dimmer').addEventListener('click', sidebarModule.sideBarToggleHandle);

  quickBtn.child('.down').addEventListener('click', sidebarModule.goToBottomHandle);
  quickBtn.child('.up').addEventListener('click', sidebarModule.backToTopHandle);

  if(!toolBtn) {
    toolBtn = siteHeader.createChild('div', {
      id: 'tool',
      innerHTML: '<div class="item player"></div><div class="item contents"><i class="ic i-list-ol"></i></div><div class="item chat"><i class="ic i-comments"></i></div><div class="item back-to-top"><i class="ic i-arrow-up"></i><span>0%</span></div>'
    });
  }

  toolPlayer = toolBtn.child('.player');
  backToTop = toolBtn.child('.back-to-top');
  goToComment = toolBtn.child('.chat');
  showContents = toolBtn.child('.contents');

  shell.setToolRefs({
    toolBtn: toolBtn,
    toolPlayer: toolPlayer,
    backToTop: backToTop,
    goToComment: goToComment,
    showContents: showContents
  });

  backToTop.addEventListener('click', sidebarModule.backToTopHandle);
  goToComment.addEventListener('click', sidebarModule.goToCommentHandle);
  showContents.addEventListener('click', sidebarModule.sideBarToggleHandle);

  playerModule.mediaPlayer(toolPlayer)
  $('main').addEventListener('click', function() {
    toolPlayer.player.mini()
  })
}

const pjaxReload = function () {
  shell.pagePosition()

  if(sideBar.hasClass('on')) {
    transition(sideBar, function () {
        sideBar.removeClass('on');
        menuToggle.removeClass('close');
      }); // 'transition.slideRightOut'
  }

  $('#main').innerHTML = ''
  $('#main').appendChild(loadCat.lastChild.cloneNode(true));
  pageScroll(0);
}

const siteRefresh = function (reload) {
  LOCAL_HASH = 0
  LOCAL_URL = window.location.href

  utilsModule.vendorCss('katex');
  utilsModule.vendorJs('copy_tex');
  utilsModule.vendorCss('mermaid');
  utilsModule.vendorJs('chart');
  if (utilsModule.hasValineCredentials()) {
    utilsModule.vendorJs('valine', function() {
      var options = Object.assign({}, CONFIG.valine);
      options = Object.assign(options, LOCAL.valine || {});
      options.el = '#comments';
      options.pathname = LOCAL.path;
      options.pjax = pjax;
      options.lazyload = shell.lazyload;

      new MiniValine(options);

      setTimeout(function(){
        shell.positionInit(1);
        pageModule.postFancybox('.v');
      }, 1000);
    }, window.MiniValine);
  } else if (goToComment) {
    goToComment.display("none");
  }

  if(!reload) {
    $.each('script[data-pjax]', utilsModule.pjaxScript);
  }

  originTitle = document.title

  shell.resizeHandle()

  sidebarModule.menuActive()

  sidebarModule.sideBarTab()
  shell.syncSidebarHeight()
  sidebarModule.sidebarTOC()

  pageModule.registerExtURL()
  pageModule.postBeauty()
  pageModule.tabFormat()

  toolPlayer.player.load(LOCAL.audio || CONFIG.audio || {})

  shell.Loader.hide()

  setTimeout(function(){
    shell.positionInit()
  }, 500);

  pageModule.cardActive()

  shell.lazyload.observe()
}

const siteInit = function () {

  domInit()

  pjax = new Pjax({
            selectors: [
              'head title',
              '.languages',
              '.pjax',
              'script[data-config]'
            ],
            analytics: false,
            cacheBust: false
          })
  APP.state.navigation.pjax = pjax;

  CONFIG.quicklink.ignores = LOCAL.ignores
  quicklink.listen(CONFIG.quicklink)

  shell.visibilityListener()
  shell.themeColorListener()

  pageModule.algoliaSearch(pjax)

  window.addEventListener('scroll', shell.scrollHandle)

  window.addEventListener('resize', shell.resizeHandle)

  window.addEventListener('pjax:send', pjaxReload)

  window.addEventListener('pjax:success', siteRefresh)

  window.addEventListener('beforeunload', function() {
    shell.pagePosition()
  })

  siteRefresh(1)
}

window.addEventListener('DOMContentLoaded', siteInit);

console.log('%c Theme.HeyOnePiece v' + CONFIG.version + ' %c https://heyonepiece.com/ ', 'color: white; background: #e9546b; padding:5px 0;', 'padding:4px;border:1px solid #e9546b;')
