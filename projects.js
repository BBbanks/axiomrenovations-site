(() => {
  const base = 'https://bbbanks.github.io/axiomrenovations-site/';

  function makeAbsolute(url) {
    if (!url) return url;
    if (/^(https?:)?\/\//i.test(url)) return url;
    if (url.startsWith('/')) return base + url.replace(/^\//, '');

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
    const container = document.getElementById('projects-list');
    const manifestPath = container?.dataset.manifest || 'data/projects.json';
    const absolutePath = makeAbsolute(manifestPath) + '?v=2';

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

      const gallery = document.createElement('div');
      gallery.className = 'axiom-project-gallery';

      const main = document.createElement('div');
      main.className = 'axiom-project-gallery-main';

      const mainImg = document.createElement('img');
      mainImg.className = 'axiom-project-main-image';
      const mainImageUrl = makeAbsolute(
        p.mainImage || (p.images && p.images.length ? p.images[p.images.length - 1] : 'placeholder.txt')
      );
      mainImg.src = mainImageUrl;
      mainImg.alt = p.title || '';

      main.appendChild(mainImg);
      gallery.appendChild(main);

      const thumbs = document.createElement('div');
      thumbs.className = 'axiom-project-thumbs';

      (p.images || []).forEach((imgSrc, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'axiom-project-thumb' + (idx === 0 ? ' active' : '');

        const abs = makeAbsolute(imgSrc);
        btn.setAttribute('data-fullsrc', abs);
        btn.setAttribute('data-alt', p.title || '');

        const im = document.createElement('img');
        im.src = abs;
        im.alt = p.title || '';

        btn.appendChild(im);

        btn.addEventListener('click', () => {
          const mainImage = gallery.querySelector('.axiom-project-main-image');
          if (mainImage) {
            mainImage.src = btn.getAttribute('data-fullsrc') || im.getAttribute('src');
            mainImage.alt = btn.getAttribute('data-alt') || im.alt || '';
          }
          thumbs.querySelectorAll('.axiom-project-thumb').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
        });

        thumbs.appendChild(btn);
      });

      mainImg.addEventListener('click', () => {
        const currentMain = gallery.querySelector('.axiom-project-main-image');
        if (currentMain) {
          currentMain.src = mainImageUrl;
          currentMain.alt = p.title || '';
        }
        thumbs.querySelectorAll('.axiom-project-thumb').forEach((b) => b.classList.remove('active'));
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