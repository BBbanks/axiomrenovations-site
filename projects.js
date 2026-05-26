(() => {
  const base = 'https://bbbanks.github.io/axiomrenovations-site/';
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
      function setCaption(captionE1, text) {
        const clean = (text || '').trim();
        captionE1.textContent = clean;
        captionE1.hidden = !clean;
      }
  function makeAbsolute(url) {
    if (!url || typeof url !== 'string') return '';
   if (/^(https?:)?\/\//i.test(url)) return url;
   let path = url.replace(/^\.\//,'').replace(/^\//, '');
   if (!path.includes('/')) {
    path = 'images/' + path;    
   }
   return base + path;
  }

    let path = url.replace(/^\.\//, '');
    if (!path.includes('/')) {
      path = 'images/' + path;
    }

    return base + path.replace(/^\//, '');
  }

  const defaultProjectData = [
    {
      label: 'Interior Design & Remodel',
      title: 'Bonita Springs Bar Installation',
      location: 'Bonita Springs, FL',
      description: 'A trusted client had a useless attic access room upstairs, and we proposed a remodel to turn it into a functional bar area that would be more enjoyable and add value to the home.',
      scope: 'Before we finished installing the hardwood floors upstairs, we got the go-ahead for this transformation. The plumbing and electrical were already there for this bar, which led to the idea.',
      result: 'It has served to be an outstanding centerpiece in the upstairs family room.',
      images: [
        'kristenbarbefore.jpg',
        'kristenbarduring1.jpg',
        'kristenbarduring2.jpg',
        'kristenbarfinished.jpg'
      ]
    },
    {
      label: 'Bathroom Remodeling',
      title: 'Selection of Shower Builds and Bathroom Remodels',
      location: 'Southwest Florida and Athens, GA',
      description: 'A curated selection of bathroom remodel work showing shower construction, tile installation, finish details, and the kind of clean execution that makes the finished space feel more polished and functional.',
      scope: 'These projects include shower builds, tile work, fixture installation, trim details, and bathroom finish upgrades carried out with attention to layout, durability, and daily use.',
      result: 'The result is a bathroom that feels cleaner, sharper, and better suited to the way the homeowner actually lives in the space.',
      images: [
        'images/bathroom/james.jpg',
        'images/bathroom/brent.jpg',
        'images/kent/kentfinished.jpg',
        'images/kent/kentfinished1.jpg',
        'images/bathroom/melissa2.jpg',
        'images/bathroom/melissa3.jpg',
        'images/bathroom/melissa1.jpg'
      ]
    },
    {
      label: 'Backsplashes & Tile Work',
      title: 'Backsplash Installations and Tile Detail Work',
      location: 'Southwest Florida',
      description: 'A selection of backsplash and tile projects completed with an emphasis on alignment, clean transitions, pattern judgment, and the kind of finish quality that stands out without feeling overdone.',
      scope: 'These projects include kitchen backsplashes, tile layout, edge treatment, outlet cuts, trim integration, and clean installation around existing finishes.',
      result: 'The finished work adds character and refinement to the space while holding up to close inspection in the details.',
      images: [
        'images/backsplash/backsplash-detail-01.jpg',
        'images/backsplash/backsplash-detail-02.jpg',
        'images/backsplash/backsplash-detail-03.jpg',
        'images/backsplash/backsplash-main-finished.jpg'
      ]
    },
    {
      label: 'Creative Details & Finish Work',
      title: 'Trim Details, Finish Carpentry, and Creative Solutions',
      location: 'Southwest Florida',
      description: 'A collection of smaller but detail-sensitive projects that show how thoughtful finish work can sharpen a room, solve awkward conditions, and bring a more complete feel to the home.',
      scope: 'This category includes trim details, finish carpentry, custom touches, and other creative work where proportion, precision, and judgment matter as much as execution.',
      result: 'The result is work that feels intentional, integrated, and built to elevate the overall character of the space.',
      images: [
        'images/doors/trim-detail-01.jpg',
        'images/doors/trim-detail-02.jpg',
        'images/doors/trim-detail-03.jpg',
        'images/doors/trim-main-finished.jpg'
      ]
    }
  ];

  async function loadProjectData() {
    const absolutePath = cacheBust(makeAbsolute(manifestPath));
    const container = document.getElementById('projects-list');
    const manifestPath = container?.dataset.manifest || 'data/projects.json';
    const absolutePath = ;

    try {
      const res = await fetch(absolutePath);
      if (!res.ok) throw new Error(`Manifest load failed: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        console.log('Loaded projects from manifest:', data[0].title);
        return data;
      }
    } catch (err) {
      console.warn('Could not load projects manifest, using inline fallback.', err);
    }

    console.log('Using default projects:', defaultProjectData[0].title);
    return defaultProjectData;
  }

  function renderProjects(projectData) {
  const container = document.getElementById('projects-list');
  if (!container) return;

  container.innerHTML = '';

  projectData.forEach((p) => {
    const article = document.createElement('article');
    article.className = 'axiom-project-card';

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
    mainImg.src = makeAbsolute(mainImageData.src);
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
      return makeAbsolute(img.src) === makeAbsolute(mainImageData.src);
    });

    if (activeIndex < 0 && images.length && !explicitMain) {
      activeIndex = 0;
    }

    function activateImage(imageData, button) {
      mainImg.src = makeAbsolute(imageData.src);
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
      im.src = makeAbsolute(imageData.src);
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
      <h2 class="axiom-project-title">${p.title || ''}</h2>
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