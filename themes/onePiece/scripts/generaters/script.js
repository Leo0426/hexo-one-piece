'use strict';
const fs = require('hexo-fs');
const { buildClientConfig } = require('../builders/client_config');


hexo.extend.generator.register('script', function(locals){
  const config = hexo.config;
  const theme = hexo.theme.config;

  var env = require('../../package.json');
  var siteConfig = buildClientConfig({
    hexoConfig: config,
    themeConfig: theme,
    version: env.version,
    posts: locals.posts
  });

  var text = '';

  ['runtime', 'dom', 'utils', 'player_shared', 'player', 'global', 'sidebar', 'page', 'pjax'].forEach(function(item) {
    text += fs.readFileSync('themes/onePiece/source/js/_app/'+item+'.js').toString();
  });

  if(theme.fireworks && theme.fireworks.enable) {
    text += fs.readFileSync('themes/onePiece/source/js/_app/fireworks.js').toString();
    siteConfig.fireworks = theme.fireworks.color || ["rgba(217,45,32,.92)", "rgba(246,196,69,.95)", "rgba(0,166,200,.9)", "rgba(22,119,199,.82)", "rgba(255,255,255,.9)"]
  }

  text = 'var CONFIG = ' + JSON.stringify(siteConfig) + ';' + text;

  return {
      path: theme.js + '/app.js',
      data: function(){
        return hexo.render.renderSync({text:  text, engine: 'js'});
      }
    };
});
