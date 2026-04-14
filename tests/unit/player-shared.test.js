const test = require('node:test');
const assert = require('node:assert/strict');

const playerShared = require('../../themes/onePiece/source/js/_app/player_shared');

test('player shared parses supported music urls', () => {
  assert.deepEqual(
    playerShared.parseMediaLink('https://music.163.com/#/playlist?id=2943811283'),
    { server: 'netease', type: 'playlist', id: '2943811283' }
  );
  assert.deepEqual(
    playerShared.parseMediaLink('https://y.qq.com/n/ryqq/song/003OUlho2HcRHC.html'),
    { server: 'tencent', type: 'song', id: '003OUlho2HcRHC' }
  );
  assert.equal(playerShared.parseMediaLink('/local/audio.mp3'), null);
});

test('player shared formats track time and drag events', () => {
  assert.equal(playerShared.secondToTime(5), '00:05');
  assert.equal(playerShared.secondToTime(65), '01:05');
  assert.equal(playerShared.secondToTime(3665), '01:01:05');
  assert.deepEqual(playerShared.getDragEvents('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile'), {
    dragStart: 'touchstart',
    dragMove: 'touchmove',
    dragEnd: 'touchend'
  });
});

test('player shared parses lyrics and preserves ordering', () => {
  const lyrics = playerShared.parseLyrics('[00:05.00]第二句\n[00:01.20]第一句');

  assert.deepEqual(lyrics, [
    [1.2, '第一句'],
    [5, '第二句']
  ]);
});

test('player shared fetches track list with cache support', async () => {
  const storeState = new Map();
  const deps = {
    fetch: async url => ({
      async json() {
        return [{ title: 'Binks no Sake', author: 'Brook', url }];
      }
    }),
    store: {
      get(key) {
        return storeState.get(key) || null;
      },
      set(key, value) {
        storeState.set(key, value);
      }
    }
  };

  const firstList = await playerShared.fetchTrackList(['https://music.163.com/#/song?id=42'], deps);
  const secondList = await playerShared.fetchTrackList(['https://music.163.com/#/song?id=42'], deps);

  assert.equal(firstList[0].title, 'Binks no Sake');
  assert.deepEqual(secondList, firstList);
  assert.equal(storeState.size, 1);
});
