(() => {
function cacheBust(url) {
  if (!url) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
}
function normalizeImage(entry, projectTitle = '') {
    if (typeof entry === 'string') {
      return { src: entry, caption: '', 
        alt: projectTitle 
      };
    }
      if (entry && typeof entry === 'object') {
        return {
          src: entry.src || '',
          caption: entry.caption || '',
          alt: entry.alt || entry.caption || projectTitle
        };
      }
      return {
        src: '',
        caption: '',
        alt: projectTitle
      };
      }
      function setCaption(captionEl, text) {
        const clean = (text || '').trim();
        captionEl.textContent = clean;
        captionEl.hidden = !clean;
      }
  function resolveAssetPath(url) {
    if (!url || typeof url !== 'string') return '';
   if (/^(https?:)?\/\//i.test(url)) return url;
   let path = url.replace(/^\.\//,'').replace(/^\//, '');
   if (!path.includes('/')) {
    path = 'img/' + path;    
   }
   return path;
  }

  async function loadProjectData() {
    const container = document.getElementById('projects-list');
    const manifestPath = container?.dataset.manifest || 'data/projects.json';
    const manifestUrl = cacheBust(resolveAssetPath(manifestPath));

    try {
      const res = await fetch(manifestUrl);
      if (!res.ok) throw new Error(`Manifest load failed: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        console.log('Loaded projects from manifest:', data[0].title);
        return data;
      }
    } catch (err) {
      console.warn('Could not load projects manifest.', err);
    }

    return [];
  }

  function renderProjects(projectData) {
  const container = document.getElementById('projects-list');
  if (!container) return;

  container.innerHTML = '';

  if (!projectData.length) {
    const article = document.createElement('article');
    article.className = 'axiom-project-card';

    const content = document.createElement('div');
    content.className = 'axiom-project-content';

    const title = document.createElement('h2');
    title.className = 'axiom-project-title';
    title.textContent = 'Projects could not be loaded.';

    const copy = document.createElement('div');
    copy.className = 'axiom-project-copy';

    const message = document.createElement('p');
    message.textContent = 'Please refresh the page or check back soon.';

    copy.appendChild(message);
    content.appendChild(title);
    content.appendChild(copy);
    article.appendChild(content);
    container.appendChild(article);
    return;
  }

  projectData.forEach((p) => {
    const article = document.createElement('article');
    article.className = 'axiom-project-card';
    const projectId = typeof p.id === 'string'
      ? p.id.trim().replace(/[^A-Za-z0-9_-]/g, '-')
      : '';
    if (projectId) {
      article.id = projectId;
      article.setAttribute('aria-labelledby', `${projectId}-title`);
    }

    const rawImages = Array.isArray(p.images) ? p.images : [];
    const images = rawImages
      .map((entry) => normalizeImage(entry, p.title || 'Project image'))
      .filter((img) => img.src);

    const explicitMain = p.mainImage ? normalizeImage(p.mainImage, p.title || 'Project image') : null;
    const mainImageData = explicitMain && explicitMain.src
      ? explicitMain
      : images[0] || { src: '', caption: '', alt: p.title || 'Project image' };

    const gallery = document.createElement('div');
    gallery.className = 'axiom-project-gallery';

    const main = document.createElement('div');
    main.className = 'axiom-project-gallery-main';

    const mainImg = document.createElement('img');
    mainImg.className = 'axiom-project-main-image';
    mainImg.src = resolveAssetPath(mainImageData.src);
    mainImg.alt = mainImageData.alt || p.title || '';
    mainImg.loading = 'lazy';
    mainImg.decoding = 'async';

    const caption = document.createElement('div');
    caption.className = 'axiom-project-caption';
    setCaption(caption, mainImageData.caption);

    main.appendChild(mainImg);
    main.appendChild(caption);
    gallery.appendChild(main);

    const thumbs = document.createElement('div');
    thumbs.className = 'axiom-project-thumbs';

    let activeIndex = images.findIndex((img) => {
      return resolveAssetPath(img.src) === resolveAssetPath(mainImageData.src);
    });

    if (activeIndex < 0 && images.length && !explicitMain) {
      activeIndex = 0;
    }

    function activateImage(imageData, button) {
      mainImg.src = resolveAssetPath(imageData.src);
      mainImg.alt = imageData.alt || p.title || '';
      setCaption(caption, imageData.caption);

      thumbs.querySelectorAll('.axiom-project-thumb').forEach((thumb) => {
        thumb.classList.remove('active');
        thumb.setAttribute('aria-pressed', 'false');
      });

      if (button) {
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
      }
    }

    images.forEach((imageData, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'axiom-project-thumb';
      btn.setAttribute('aria-pressed', 'false');

      const labelText = imageData.caption
        ? `View image: ${imageData.caption}`
        : `View ${p.title || 'project'} image ${idx + 1}`;

      btn.setAttribute('aria-label', labelText);

      const im = document.createElement('img');
      im.src = resolveAssetPath(imageData.src);
      im.alt = imageData.alt || p.title || '';
      im.loading = 'lazy';
      im.decoding = 'async';

      btn.appendChild(im);

      btn.addEventListener('click', () => {
        activateImage(imageData, btn);
      });

      thumbs.appendChild(btn);

      if (idx === activeIndex) {
        activateImage(imageData, btn);
      }
    });

    gallery.appendChild(thumbs);
    article.appendChild(gallery);

    const content = document.createElement('div');
    content.className = 'axiom-project-content';
    content.innerHTML = `
      <div class="axiom-section-label">${p.label || ''}</div>
      <h2 class="axiom-project-title"${projectId ? ` id="${projectId}-title"` : ''}>${p.title || ''}</h2>
      <div class="axiom-project-location">${p.location || ''}</div>
      <div class="axiom-project-copy"><p>${p.description || ''}</p></div>
      <div class="axiom-project-details">
        <div class="axiom-project-detail"><strong>Scope</strong><span>${p.scope || ''}</span></div>
        <div class="axiom-project-detail"><strong>Result</strong><span>${p.result || ''}</span></div>
      </div>
    `;

    article.appendChild(content);
    container.appendChild(article);
  });
}
  async function init() {
    const projectData = await loadProjectData();
    renderProjects(projectData);
  }

  init();
})();
