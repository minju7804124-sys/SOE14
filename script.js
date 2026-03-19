const sections = [...document.querySelectorAll('main > section')];
const currentLabel = document.getElementById('currentLabel');
const topButton = document.querySelector('.back-to-top');

const labels = {
  home: 'SoE!',
  about: 'ABOUT',
  film: 'FILM',
  animation: 'ANIMATION',
  commercial: 'COMMERCIAL',
  works: 'WORKS',
  contact: 'CONTACT'
};

function installVideos() {
  document.querySelectorAll('.video-frame').forEach((frame) => {
    const src = frame.dataset.video;
    if (!src) return;

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    if (frame.dataset.loop === 'true') {
  video.loop = true;
  video.setAttribute('loop', '');
}
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'auto');

    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    video.appendChild(source);

    frame.appendChild(video);

    video.addEventListener('loadeddata', () => {
      frame.classList.add('has-video');
    }, { once: true });

    video.addEventListener('ended', () => {
      video.pause();
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.max(video.duration - 0.001, 0);
      }
    });

    video.addEventListener('error', () => {
      frame.classList.add('video-fallback');
      video.remove();
    }, { once: true });

    frame.dataset.played = 'false';
  });
}

function activeGroup() {
  const midpoint = window.scrollY + Math.min(window.innerHeight * 0.3, 220);
  let current = sections[0]?.dataset.group || 'home';

  for (const section of sections) {
    if (midpoint >= section.offsetTop) current = section.dataset.group || 'home';
  }
  return current;
}

function updateUI() {
  const current = activeGroup();
  currentLabel.textContent = labels[current] || current.toUpperCase();

  document.querySelectorAll('.site-nav a').forEach((link) => {
    const key = link.dataset.nav;
    link.setAttribute('aria-current', key === current ? 'page' : 'false');
  });

  topButton.classList.toggle('show', window.scrollY > 700);
}

function tryPlayVisibleVideos() {
  document.querySelectorAll('.video-frame video').forEach((video) => {
    const frame = video.closest('.video-frame');
    if (!frame || frame.dataset.played === 'true') return;

    const rect = frame.getBoundingClientRect();
    const visible = rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.18;
    if (!visible) return;

    const playPromise = video.play();
    frame.dataset.played = 'true';

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        frame.dataset.played = 'false';
      });
    }
  });
}

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

installVideos();
updateUI();
tryPlayVisibleVideos();

window.addEventListener('scroll', () => {
  updateUI();
  tryPlayVisibleVideos();
}, { passive: true });

window.addEventListener('resize', updateUI);

topButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
