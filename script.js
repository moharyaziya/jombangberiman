// ===== 1. Klik kartu (di luar foto) buat "meratakan" polaroid sejenak =====
document.querySelectorAll('.memory').forEach((card) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.photo')) return; // biar gak bentrok sama lightbox
    card.classList.toggle('flat');
  });
});

const flatStyle = document.createElement('style');
flatStyle.textContent = `.memory.flat { transform: rotate(0deg) scale(1.03); transition: transform 0.3s ease; z-index: 5; }`;
document.head.appendChild(flatStyle);


// ===== 2. Lightbox — klik foto buat lihat versi besarnya =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(photoEl) {
  // determine image src
  let src = photoEl.dataset.full || '';
  const imgEl = photoEl.querySelector('img');
  if (!src && imgEl) src = imgEl.src;
  if (!src) {
    const bg = getComputedStyle(photoEl).backgroundImage || '';
    const m = bg.match(/url\((?:"|'|)(.*?)(?:"|'|)\)/);
    if (m) src = m[1];
  }

  // determine caption: prefer member info, else memory caption
  let caption = '';
  const member = photoEl.closest('.member-card');
  if (member) {
    const name = member.querySelector('.member-name')?.textContent?.trim() || '';
    const meta = member.querySelector('.member-meta')?.textContent?.trim() || '';
    caption = [name, meta].filter(Boolean).join(' — ');
  } else {
    caption = photoEl.closest('.memory')?.querySelector('.caption')?.textContent || '';
  }

  if (!src) return; // nothing to show
  lightboxImg.src = src;
  lightboxImg.alt = caption;
  lightboxCaption.textContent = caption;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('.photo').forEach((photo) => {
  photo.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(photo); });
});

// also open lightbox for member photos (cards)
document.querySelectorAll('.member-photo').forEach((mp) => {
  mp.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(mp); });
});

// open event documentation images in fullscreen lightbox
const docFrames = document.querySelectorAll('.doc-frame');
docFrames.forEach((frame) => {
  frame.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox(frame);
  });
});

document.querySelectorAll('.doc-frame img').forEach((img) => {
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox(img);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

// note: member photos open the central lightbox (hover scale remains for pointer devices)

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    document.querySelectorAll('.tab-btn').forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('.tab-panel').forEach((panel) => {
      const isActivePanel = panel.id === `${target}-panel`;
      panel.classList.toggle('active', isActivePanel);
      panel.hidden = !isActivePanel;
    });
  });
});

// ===== 3. Dark / Light mode toggle — tersimpan di localStorage =====
const modeToggle = document.getElementById('mode-toggle');
if (modeToggle) {
  const modeIcon = modeToggle.querySelector('.mode-icon');
  function applyMode(isLight) {
    document.body.classList.toggle('light', isLight);
    if (modeIcon) modeIcon.textContent = isLight ? '🌙' : '☀️';
  }
  const savedMode = localStorage.getItem('kenangan-mode');
  applyMode(savedMode === 'light');
  modeToggle.addEventListener('click', () => {
    const isLight = !document.body.classList.contains('light');
    applyMode(isLight);
    localStorage.setItem('kenangan-mode', isLight ? 'light' : 'dark');
  });
}

const bgAudio = document.getElementById('bg-audio');
const audioControl = document.getElementById('audio-control');

function playBackgroundAudio() {
  if (!bgAudio) return;
  const playPromise = bgAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        if (audioControl) audioControl.hidden = true;
      })
      .catch(() => {
        if (audioControl) audioControl.hidden = false;
      });
  }
}

if (audioControl) {
  audioControl.addEventListener('click', () => {
    if (!bgAudio) return;
    bgAudio.play().then(() => {
      audioControl.hidden = true;
    }).catch(() => {
      /* ignore */
    });
  });
}

window.addEventListener('load', playBackgroundAudio);
// fallback for browsers that require a gesture before audio starts
window.addEventListener('click', playBackgroundAudio, { once: true });
