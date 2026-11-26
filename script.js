(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Buka pesan ---------- */
  $('openBtn').addEventListener('click', () => {
    $('intro').hidden = true;
    const main = $('main');
    main.hidden = false;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => main.classList.add('show'));
  });

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
})();
    "words": [
      {
        "text": "Kau",
        "start": 57.721,
        "end": 58.164
      },
      {
        "text": "terluka",
        "start": 58.164,
        "end": 59.348
      },
      {
        "text": "lagi",
        "start": 59.348,
        "end": 61.895
      }
    ]
  },
  {
    "start": 62.16,
    "text": "Dari cinta rumit yang kau jalani",
    "words": [
      {
        "text": "Dari",
        "start": 62.164,
        "end": 62.755
      },
      {
        "text": "cinta",
        "start": 62.755,
        "end": 63.555
      },
      {
        "text": "rumit",
        "start": 63.555,
        "end": 64.339
      },
      {
        "text": "yang",
        "start": 64.339,
        "end": 64.978
      },
      {
        "text": "kau",
        "start": 64.978,
        "end": 65.206
      },
      {
        "text": "jalani",
        "start": 65.206,
        "end": 67.324
      }
    ]
  },
  {
    "start": 67.74,
    "text": "Aku ingin kau merasa",
    "words": [
      {
        "text": "Aku",
        "start": 67.749,
        "end": 69.037
      },
      {
        "text": "ingin",
        "start": 69.037,
        "end": 70.653
      },
      {
        "text": "kau",
        "start": 70.653,
        "end": 71.005
      },
      {
        "text": "merasa",
        "start": 71.005,
        "end": 73.803
      }
    ]
  },
  {
    "start": 74.16,
    "text": "Kamu mengerti aku mengerti kamu",
    "words": [
      {
        "text": "Kamu",
        "start": 74.167,
        "end": 75.33500000000001
      },
      {
        "text": "mengerti",
        "start": 75.33500000000001,
        "end": 76.33500000000001
      },
      {
        "text": "aku",
        "start": 76.33500000000001,
        "end": 77.119
      },
      {
        "text": "mengerti",
        "start": 77.119,
        "end": 78.602
      },
      {
        "text": "kamu",
        "start": 78.602,
        "end": 80.18
      }
    ]
  },
  {
    "start": 80.56,
    "text": "Aku ingin kau sadari",
    "words": [
      {
        "text": "Aku",
        "start": 80.564,
        "end": 81.79
      },
      {
        "text": "ingin",
        "start": 81.79,
        "end": 83.39
      },
      {
        "text": "kau",
        "start": 83.39,
        "end": 83.739
      },
      {
        "text": "sadari",
        "start": 83.739,
        "end": 86.379
      }
    ]
  },
  {
    "start": 86.56,
    "text": "Cintamu bukanlah dia",
    "words": [
      {
        "text": "Cintamu",
        "start": 86.56700000000001,
        "end": 88.392
      },
      {
        "text": "bukanlah",
        "start": 88.392,
        "end": 89.76
      },
      {
        "text": "dia",
        "start": 89.76,
        "end": 92.565
      }
    ]
  },
  {
    "start": 91.74,
    "text": "Dengar laraku",
    "words": [
      {
        "text": "Dengar",
        "start": 91.749,
        "end": 92.95
      },
      {
        "text": "laraku",
        "start": 92.95,
        "end": 97.34700000000001
      }
    ]
  },
  {
    "start": 98.12,
    "text": "Suara hati ini memanggil namamu",
    "words": [
      {
        "text": "Suara",
        "start": 98.126,
        "end": 99.339
      },
      {
        "text": "hati",
        "start": 99.339,
        "end": 100.13900000000001
      },
      {
        "text": "ini",
        "start": 100.13900000000001,
        "end": 100.989
      },
      {
        "text": "memanggil",
        "start": 100.989,
        "end": 101.939
      },
      {
        "text": "namamu",
        "start": 101.939,
        "end": 103.93
      }
    ]
  },
  {
    "start": 104.56,
    "text": "Karena separuh aku dirimu",
    "words": [
      {
        "text": "Karena",
        "start": 104.568,
        "end": 105.727
      },
      {
        "text": "separuh",
        "start": 105.727,
        "end": 107.778
      },
      {
        "text": "aku",
        "start": 107.778,
        "end": 110.693
      },
      {
        "text": "dirimu",
        "start": 111.01,
        "end": 114.507
      }
    ]
  },
  {
    "start": 115.02,
    "text": "Uh, uh",
    "words": [
      {
        "text": "Uh,",
        "start": 115.022,
        "end": 118.18
      },
      {
        "text": "uh",
        "start": 118.18,
        "end": 121.436
      }
    ]
  },
  {
    "start": 121.98,
    "text": "Ah-ah-ah",
    "words": [
      {
        "text": "Ah-ah-ah",
        "start": 121.985,
        "end": 124.665
      }
    ]
  },
  {
    "start": 124.97,
    "text": "Ku ada di sini",
    "words": [
      {
        "text": "Ku",
        "start": 124.974,
        "end": 125.205
      },
      {
        "text": "ada",
        "start": 125.205,
        "end": 125.919
      },
      {
        "text": "di",
        "start": 125.919,
        "end": 126.503
      },
      {
        "text": "sini",
        "start": 126.503,
        "end": 129.047
      }
    ]
  },
  {
    "start": 129.36,
    "text": "Pahamilah kau tak pernah sendiri",
    "words": [
      {
        "text": "Pahamilah",
        "start": 129.369,
        "end": 130.762
      },
      {
        "text": "kau",
        "start": 130.762,
        "end": 131.346
      },
      {
        "text": "tak",
        "start": 131.346,
        "end": 131.591
      },
      {
        "text": "pernah",
        "start": 131.591,
        "end": 132.346
      },
      {
        "text": "sendiri",
        "start": 132.346,
        "end": 135.007
      }
    ]
  },
  {
    "start": 137.76,
    "text": "Karena aku selalu",
    "words": [
      {
        "text": "Karena",
        "start": 137.769,
        "end": 138.57
      },
      {
        "text": "aku",
        "start": 138.57,
        "end": 139.37
      },
      {
        "text": "selalu",
        "start": 139.37,
        "end": 141.579
      }
    ]
  },
  {
    "start": 142.18,
    "text": "Di dekatmu saat engkau terjatuh",
    "words": [
      {
        "text": "Di",
        "start": 142.182,
        "end": 142.596
      },
      {
        "text": "dekatmu",
        "start": 142.596,
        "end": 143.54500000000002
      },
      {
        "text": "saat",
        "start": 143.54500000000002,
        "end": 144.364
      },
      {
        "text": "engkau",
        "start": 144.364,
        "end": 145.436
      },
      {
        "text": "terjatuh",
        "start": 145.436,
        "end": 147.444
      }
    ]
  },
  {
    "start": 147.77,
    "text": "Aku ingin kau merasa",
    "words": [
      {
        "text": "Aku",
        "start": 147.773,
        "end": 148.962
      },
      {
        "text": "ingin",
        "start": 148.962,
        "end": 150.365
      },
      {
        "text": "kau",
        "start": 150.584,
        "end": 150.989
      },
      {
        "text": "merasa",
        "start": 150.989,
        "end": 153.784
      }
    ]
  },
  {
    "start": 154.17,
    "text": "Kamu mengerti aku mengerti kamu",
    "words": [
      {
        "text": "Kamu",
        "start": 154.176,
        "end": 155.337
      },
      {
        "text": "mengerti",
        "start": 155.337,
        "end": 156.377
      },
      {
        "text": "aku",
        "start": 156.377,
        "end": 157.169
      },
      {
        "text": "mengerti",
        "start": 157.169,
        "end": 158.569
      },
      {
        "text": "kamu",
        "start": 158.569,
        "end": 160.28
      }
    ]
  },
  {
    "start": 160.58,
    "text": "Aku ingin kau pahami",
    "words": [
      {
        "text": "Aku",
        "start": 160.589,
        "end": 161.774
      },
      {
        "text": "ingin",
        "start": 161.774,
        "end": 163.214
      },
      {
        "text": "kau",
        "start": 163.424,
        "end": 163.758
      },
      {
        "text": "pahami",
        "start": 163.758,
        "end": 166.348
      }
    ]
  },
  {
    "start": 166.6,
    "text": "Cintamu bukanlah dia",
    "words": [
      {
        "text": "Cintamu",
        "start": 166.6,
        "end": 168.406
      },
      {
        "text": "bukanlah",
        "start": 168.406,
        "end": 169.774
      },
      {
        "text": "dia",
        "start": 169.774,
        "end": 173.028
      }
    ]
  },
  {
    "start": 175.0,
    "text": "Dengar laraku",
    "words": [
      {
        "text": "Dengar",
        "start": 175.008,
        "end": 176.201
      },
      {
        "text": "laraku",
        "start": 176.201,
        "end": 181.055
      }
    ]
  },
  {
    "start": 181.35,
    "text": "Suara hati ini memanggil namamu",
    "words": [
      {
        "text": "Suara",
        "start": 181.354,
        "end": 182.553
      },
      {
        "text": "hati",
        "start": 182.553,
        "end": 183.369
      },
      {
        "text": "ini",
        "start": 183.369,
        "end": 184.169
      },
      {
        "text": "memanggil",
        "start": 184.169,
        "end": 185.169
      },
      {
        "text": "namamu",
        "start": 185.169,
        "end": 187.431
      }
    ]
  },
  {
    "start": 187.76,
    "text": "Karena separuh aku dirimu, oh",
    "words": [
      {
        "text": "Karena",
        "start": 187.764,
        "end": 188.913
      },
      {
        "text": "separuh",
        "start": 188.913,
        "end": 190.964
      },
      {
        "text": "aku",
        "start": 190.964,
        "end": 193.755
      },
      {
        "text": "dirimu,",
        "start": 194.196,
        "end": 198.965
      },
      {
        "text": "oh",
        "start": 198.965,
        "end": 199.858
      }
    ]
  },
  {
    "start": 200.57,
    "text": "Ah-ah-ah",
    "words": [
      {
        "text": "Ah-ah-ah",
        "start": 200.575,
        "end": 203.369
      }
    ]
  },
  {
    "start": 203.77,
    "text": "Oh-oh",
    "words": [
      {
        "text": "Oh-oh",
        "start": 203.774,
        "end": 206.775
      }
    ]
  },
  {
    "start": 207.0,
    "text": "Dengar laraku",
    "words": [
      {
        "text": "Dengar",
        "start": 207.002,
        "end": 208.123
      },
      {
        "text": "laraku",
        "start": 208.123,
        "end": 212.996
      }
    ]
  },
  {
    "start": 213.34,
    "text": "Suara hati ini memanggil namamu",
    "words": [
      {
        "text": "Suara",
        "start": 213.344,
        "end": 214.541
      },
      {
        "text": "hati",
        "start": 214.541,
        "end": 215.373
      },
      {
        "text": "ini",
        "start": 215.373,
        "end": 216.157
      },
      {
        "text": "memanggil",
        "start": 216.157,
        "end": 217.162
      },
      {
        "text": "namamu",
        "start": 217.162,
        "end": 219.395
      }
    ]
  },
  {
    "start": 219.75,
    "text": "Karena separuh aku",
    "words": [
      {
        "text": "Karena",
        "start": 219.754,
        "end": 220.906
      },
      {
        "text": "separuh",
        "start": 220.906,
        "end": 223.024
      },
      {
        "text": "aku",
        "start": 223.024,
        "end": 225.575
      }
    ]
  },
  {
    "start": 225.77,
    "text": "Menyentuh laramu",
    "words": [
      {
        "text": "Menyentuh",
        "start": 225.775,
        "end": 227.394
      },
      {
        "text": "laramu",
        "start": 227.394,
        "end": 231.951
      }
    ]
  },
  {
    "start": 232.57,
    "text": "Semua lukamu telah menjadi lirihku",
    "words": [
      {
        "text": "Semua",
        "start": 232.57,
        "end": 233.712
      },
      {
        "text": "lukamu",
        "start": 233.712,
        "end": 234.746
      },
      {
        "text": "telah",
        "start": 234.746,
        "end": 235.346
      },
      {
        "text": "menjadi",
        "start": 235.346,
        "end": 236.346
      },
      {
        "text": "lirihku",
        "start": 236.346,
        "end": 238.348
      }
    ]
  },
  {
    "start": 238.99,
    "text": "Karena separuh aku dirimu",
    "words": [
      {
        "text": "Karena",
        "start": 238.991,
        "end": 240.159
      },
      {
        "text": "separuh",
        "start": 240.159,
        "end": 242.341
      },
      {
        "text": "aku",
        "start": 242.341,
        "end": 245.003
      },
      {
        "text": "dirimu",
        "start": 245.391,
        "end": 248.804
      }
    ]
  }
];

// Mendukung penggunaan langsung lewat <script src="lyrics-data.js"></script>
window.lyricsData = lyricsData;
