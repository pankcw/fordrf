(function () {
  'use strict';

  function initWebsite() {
  const $ = (id) => document.getElementById(id);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Buka pesan ---------- */
  const openBtn = $('openBtn');
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      const intro = $('intro');
      const main = $('main');
      if (intro) intro.hidden = true;
      if (main) {
        main.hidden = false;
        window.scrollTo(0, 0);
        requestAnimationFrame(() => main.classList.add('show'));
      }
    });
  }

  /* ---------- Foto: tampilkan placeholder jika file belum ada ---------- */
  document.querySelectorAll('.photo img').forEach((img) => {
    const miss = () => img.closest('.photo').classList.add('missing');
    img.addEventListener('error', miss);
    if (img.complete && img.naturalWidth === 0) miss();
  });

  /* ---------- Ambil data lirik dari lyrics-data.js ---------- */
  // lyrics-data.js harus dimuat lebih dahulu di index.html.
  // File tersebut menyediakan array: window.lyricsData.
  const lines = Array.isArray(window.lyricsData)
    ? window.lyricsData.map((line) => ({
        start: Number(line.start),
        text: String(line.text || ''),
        words: Array.isArray(line.words)
          ? line.words.map((word) => ({
              text: String(word.text || ''),
              start: Number(word.start),
              end: Number(word.end)
            })).filter((word) =>
              word.text && Number.isFinite(word.start) && Number.isFinite(word.end)
            )
          : [],
        el: null
      })).filter((line) => Number.isFinite(line.start))
       .sort((a, b) => a.start - b.start)
    : [];
  const panel = $('lyrics');

  /* ---------- Render lirik ---------- */
  if (!lines.length) {
    panel.innerHTML = '<p class="empty">Data lirik belum terbaca. Pastikan lyrics-data.js dimuat sebelum script.js.</p>';
    panel.style.padding = '16px';
    panel.style.height = 'auto';
  } else {
    lines.forEach((L) => {
      const p = document.createElement('p');
      p.className = 'line';
      if (L.words.length) {
        L.words.forEach((w, i) => {
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = w.text;
          w.el = s;
          p.appendChild(s);
          if (i < L.words.length - 1) p.appendChild(document.createTextNode(' '));
        });
      } else {
        p.textContent = L.text;
      }
      L.el = p;
      panel.appendChild(p);
    });
  }

  /* ---------- Audio ---------- */
  const audio = $('audio'), playBtn = $('playBtn'), seek = $('seek');
  const cur = $('cur'), dur = $('dur'), note = $('audioNote');
  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    s = Math.floor(s);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };

  function ready() {
    playBtn.disabled = false;
    seek.disabled = false;
    seek.max = audio.duration;
    dur.textContent = fmt(audio.duration);
    note.hidden = true;
  }
  function missing() {
    playBtn.disabled = true;
    seek.disabled = true;
    note.hidden = false;
  }
  audio.addEventListener('loadedmetadata', ready);
  audio.addEventListener('error', missing);
  if (audio.readyState >= 1) ready();
  else if (audio.error || audio.networkState === 3) missing();

  playBtn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(missing);
    else audio.pause();
  });
  function setPlayState() {
    const playing = !audio.paused;
    $('icoPlay').hidden = playing;
    $('icoPause').hidden = !playing;
    playBtn.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
  }

  /* ---------- Seek ---------- */
  let dragging = false;
  seek.addEventListener('pointerdown', () => { dragging = true; });
  seek.addEventListener('pointerup', () => { dragging = false; });
  seek.addEventListener('input', () => {
    audio.currentTime = parseFloat(seek.value);
    cur.textContent = fmt(audio.currentTime);
    sync();
  });

  /* ---------- Sinkronisasi lirik dengan waktu audio ---------- */
  let activeIdx = -1;
  function clearLine(L) {
    L.el.classList.remove('active');
    L.words.forEach((w) => w.el.classList.remove('on', 'done'));
  }
  function center(el) {
    const top = el.offsetTop - panel.clientHeight / 2 + el.clientHeight / 2;
    panel.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }
  function sync() {
    if (!lines.length) return;
    const t = audio.currentTime;
    let idx = -1;
    if (!audio.ended) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].start <= t) idx = i; else break;
      }
    }
    if (idx !== activeIdx) {
      if (activeIdx >= 0) clearLine(lines[activeIdx]);
      activeIdx = idx;
      if (idx >= 0) { lines[idx].el.classList.add('active'); center(lines[idx].el); }
    }
    if (idx >= 0) {
      lines[idx].words.forEach((w) => {
        w.el.classList.toggle('on', t >= w.start && t < w.end);
        w.el.classList.toggle('done', t >= w.end);
      });
    }
  }

  /* Progres dan lirik selalu mengikuti audio.currentTime */
  let raf = 0;
  function loop() { sync(); raf = audio.paused ? 0 : requestAnimationFrame(loop); }
  audio.addEventListener('timeupdate', () => {
    if (!dragging) seek.value = audio.currentTime;
    cur.textContent = fmt(audio.currentTime);
    sync();
  });
  audio.addEventListener('play', () => { setPlayState(); if (!raf) raf = requestAnimationFrame(loop); });
  audio.addEventListener('pause', () => { setPlayState(); sync(); });
  audio.addEventListener('seeked', sync);
  audio.addEventListener('ended', () => { setPlayState(); sync(); });

  /* ---------- Tampilkan / sembunyikan lirik ---------- */
  const toggle = $('lyricToggle');
  toggle.addEventListener('click', () => {
    const show = panel.hidden;
    panel.hidden = !show;
    toggle.setAttribute('aria-expanded', String(show));
    toggle.textContent = show ? 'Sembunyikan lirik' : 'Tampilkan lirik';
    if (show && activeIdx >= 0) center(lines[activeIdx].el);
  });
  } // akhir initWebsite

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebsite, { once: true });
  } else {
    initWebsite();
  }
})();
