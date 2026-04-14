(function(root, factory) {
  var shared = factory(root);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = shared;
  }

  if (root.APP && root.APP.register) {
    root.APP.register('playerShared', shared);
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function(root) {
  var mediaRules = [
    ['music.163.com.*song.*id=(\\d+)', 'netease', 'song'],
    ['music.163.com.*album.*id=(\\d+)', 'netease', 'album'],
    ['music.163.com.*artist.*id=(\\d+)', 'netease', 'artist'],
    ['music.163.com.*playlist.*id=(\\d+)', 'netease', 'playlist'],
    ['music.163.com.*discover/toplist.*id=(\\d+)', 'netease', 'playlist'],
    ['y.qq.com.*song/(\\w+).html', 'tencent', 'song'],
    ['y.qq.com.*album/(\\w+).html', 'tencent', 'album'],
    ['y.qq.com.*singer/(\\w+).html', 'tencent', 'artist'],
    ['y.qq.com.*playsquare/(\\w+).html', 'tencent', 'playlist'],
    ['y.qq.com.*playlist/(\\w+).html', 'tencent', 'playlist'],
    ['xiami.com.*song/(\\w+)', 'xiami', 'song'],
    ['xiami.com.*album/(\\w+)', 'xiami', 'album'],
    ['xiami.com.*artist/(\\w+)', 'xiami', 'artist'],
    ['xiami.com.*collect/(\\w+)', 'xiami', 'playlist']
  ];

  function randomInt(size) {
    return Math.floor(Math.random() * size);
  }

  function parseMediaLink(link) {
    var result = null;

    mediaRules.forEach(function(rule) {
      var match = new RegExp(rule[0]).exec(link);
      if (match) {
        result = {
          server: rule[1],
          type: rule[2],
          id: match[1]
        };
      }
    });

    return result;
  }

  function normalizeTrack(item, group) {
    return Object.assign({}, item, {
      group: group,
      name: item.name || item.title || 'Meida name',
      artist: item.artist || item.author || 'Anonymous',
      cover: item.cover || item.pic,
      type: item.type || 'normal'
    });
  }

  function secondToTime(second) {
    function add0(num) {
      return isNaN(num) ? '00' : (num < 10 ? '0' + num : '' + num);
    }

    var hour = Math.floor(second / 3600);
    var min = Math.floor((second - hour * 3600) / 60);
    var sec = Math.floor(second - hour * 3600 - min * 60);
    return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(':');
  }

  function getDragEvents(userAgent) {
    var isMobile = /mobile/i.test(userAgent || '');
    return {
      dragStart: isMobile ? 'touchstart' : 'mousedown',
      dragMove: isMobile ? 'touchmove' : 'mousemove',
      dragEnd: isMobile ? 'touchend' : 'mouseup'
    };
  }

  function parseLyrics(lrcText) {
    if (!lrcText) {
      return [];
    }

    var normalized = lrcText.replace(/([^\]^\n])\[/g, function(match, prefix) {
      return prefix + '\n[';
    });
    var lyricLines = normalized.split('\n');
    var parsed = [];

    lyricLines.forEach(function(line) {
      var lrcTimes = line.match(/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g);
      var text = line
        .replace(/.*\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g, '')
        .replace(/<(\d{2}):(\d{2})(\.(\d{2,3}))?>/g, '')
        .replace(/^\s+|\s+$/g, '');

      if (!lrcTimes) {
        return;
      }

      lrcTimes.forEach(function(timeTag) {
        var oneTime = /\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/.exec(timeTag);
        var minutes = oneTime[1] * 60;
        var seconds = parseInt(oneTime[2], 10);
        var milliseconds = oneTime[4]
          ? parseInt(oneTime[4], 10) / ((oneTime[4] + '').length === 2 ? 100 : 1000)
          : 0;
        parsed.push([minutes + seconds + milliseconds, text]);
      });
    });

    return parsed
      .filter(function(item) {
        return item[1];
      })
      .sort(function(left, right) {
        return left[0] - right[0];
      });
  }

  function fetchLyrics(url, fetchImpl) {
    return fetchImpl(url)
      .then(function(response) {
        return response.text();
      })
      .catch(function() {
        return '';
      });
  }

  function fetchTrackList(source, deps) {
    return Promise.all(source.map(function(raw) {
      var meta = parseMediaLink(raw);

      if (!meta) {
        return Promise.resolve([raw]);
      }

      var cacheKey = JSON.stringify(meta);
      var cached = deps.store.get(cacheKey);
      if (cached) {
        return Promise.resolve(JSON.parse(cached));
      }

      var apiUrl = 'https://api.i-meto.com/meting/api?server=' + meta.server + '&type=' + meta.type + '&id=' + meta.id + '&r=' + Math.random();
      return deps.fetch(apiUrl)
        .then(function(response) {
          return response.json();
        })
        .then(function(list) {
          deps.store.set(cacheKey, JSON.stringify(list));
          return list;
        })
        .catch(function() {
          return [];
        });
    })).then(function(groups) {
      return groups.reduce(function(list, items) {
        list.push.apply(list, items);
        return list;
      }, []);
    });
  }

  return {
    fetchLyrics: fetchLyrics,
    fetchTrackList: fetchTrackList,
    getDragEvents: getDragEvents,
    normalizeTrack: normalizeTrack,
    parseLyrics: parseLyrics,
    parseMediaLink: parseMediaLink,
    randomInt: randomInt,
    secondToTime: secondToTime
  };
});
