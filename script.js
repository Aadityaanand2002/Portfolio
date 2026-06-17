/* ============================================
   ADITYA ANAND — 3D PORTFOLIO v2.0
   Three.js · GSAP · Premium Interactivity
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // 1. PRELOADER
  // ============================================


  // ============================================
  // 2. THREE.JS — 3D HERO SCENE
  // ============================================
  const canvas = document.getElementById('heroCanvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25)); // Clamped pixel ratio to prevent fill-rate lag
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  camera.position.z = 5;

  // Mouse tracking
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  // Detect mobile
  const isMobile = window.innerWidth < 768;

  // --- The Morphing Liquid Blob (Centerpiece) ---
  const blobGeometry = new THREE.IcosahedronGeometry(1.8, isMobile ? 6 : 8); // Reduced detail to fix CPU lag
  const blobMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x22d3ee, // Base cyan
    roughness: 0.1,
    metalness: 0.2,
    transmission: isMobile ? 0 : 0.6, // Reduced transmission for better fill rate
    thickness: 1.5,     // Refraction thickness
    ior: 1.4,
    clearcoat: isMobile ? 0 : 0.5, // Reduced clearcoat
    clearcoatRoughness: 0.1,
    emissive: 0x6c63ff,
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: isMobile ? 0.8 : 1.0 // Fallback to simple transparency for mobile
  });
  const blob = new THREE.Mesh(blobGeometry, blobMaterial);
  blob.position.set(2, 0, -1);
  scene.add(blob);

  // Store original positions for morphing
  const positionAttribute = blobGeometry.attributes.position;
  const originalPositions = new Float32Array(positionAttribute.count * 3);
  for (let i = 0; i < positionAttribute.count * 3; i++) {
    originalPositions[i] = positionAttribute.array[i];
  }

  // Add deep space fog to blend particles and terrain into the distance
  scene.fog = new THREE.FogExp2(0x06060b, 0.035);

  // --- Interactive Particle Field ---
  const particleCount = isMobile ? 600 : 1200; // Reduced particle count
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  const particleSpeeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    particlePos[i * 3] = (Math.random() - 0.5) * 60;
    particlePos[i * 3 + 1] = (Math.random() - 0.5) * 60;
    particlePos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
    particleSpeeds[i] = Math.random() * 0.2 + 0.05;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  particleGeo.setAttribute('speed', new THREE.BufferAttribute(particleSpeeds, 1));

  const particleMat = new THREE.PointsMaterial({
    color: 0x22d3ee, // Cyan glow
    size: 0.05,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- Premium Flowing Wireframe Terrain ---
  const terrainGeo = new THREE.PlaneGeometry(120, 120, isMobile ? 20 : 30, isMobile ? 20 : 30); // Reduced segments
  const terrainMat = new THREE.MeshBasicMaterial({
    color: 0x6c63ff, // Purple accent
    wireframe: true,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending
  });
  const terrainBottom = new THREE.Mesh(terrainGeo, terrainMat);
  terrainBottom.rotation.x = -Math.PI / 2;
  terrainBottom.position.y = -7;
  scene.add(terrainBottom);

  const terrainTop = new THREE.Mesh(terrainGeo, terrainMat);
  terrainTop.rotation.x = Math.PI / 2;
  terrainTop.position.y = 7;
  scene.add(terrainTop);

  // Store original terrain vertices
  const terrainPosAttr = terrainGeo.attributes.position;
  const terrainOriginal = new Float32Array(terrainPosAttr.count * 3);
  for(let i=0; i<terrainPosAttr.count*3; i++) {
     terrainOriginal[i] = terrainPosAttr.array[i];
  }

  // --- Premium Dynamic Lighting ---
  const ambientLight = new THREE.AmbientLight(0x101020, 1.5);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x6c63ff, 5, 20); // Purple
  pointLight1.position.set(3, 2, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x22d3ee, 4, 15); // Cyan
  pointLight2.position.set(-3, -2, 2);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xf472b6, 3, 25); // Pink
  pointLight3.position.set(0, 4, -4);
  scene.add(pointLight3);

  // --- Animation Loop ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth mouse lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    // Morph the blob
    const morphTime = elapsed * 0.5;
    for (let i = 0; i < positionAttribute.count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const ox = originalPositions[ix];
      const oy = originalPositions[iy];
      const oz = originalPositions[iz];

      // Smooth noise combination for organic liquid feel
      const noise = Math.sin(ox * 2 + morphTime) * Math.cos(oy * 2 + morphTime) * Math.sin(oz * 2 + morphTime) * 0.25;

      positionAttribute.array[ix] = ox + (ox / 1.8) * noise;
      positionAttribute.array[iy] = oy + (oy / 1.8) * noise;
      positionAttribute.array[iz] = oz + (oz / 1.8) * noise;
    }
    positionAttribute.needsUpdate = true;
    
    // Throttle heavy geometry computation to every few frames to prevent CPU spikes
    if (Math.random() > 0.8) {
      blobGeometry.computeVertexNormals();
    }

    // Animate Flowing Terrain
    const terrainTime = elapsed * 0.5;
    for(let i=0; i<terrainPosAttr.count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;
      const ox = terrainOriginal[ix];
      const oy = terrainOriginal[iy];
      
      terrainPosAttr.array[iz] = Math.sin(ox * 0.15 + terrainTime) * Math.cos(oy * 0.15 + terrainTime) * 1.8;
    }
    terrainPosAttr.needsUpdate = true;

    // Rotate blob
    blob.rotation.y = elapsed * 0.15;
    blob.rotation.x = elapsed * 0.1;

    // Orbit lights around the blob
    pointLight1.position.x = Math.sin(elapsed * 0.5) * 4;
    pointLight1.position.z = Math.cos(elapsed * 0.5) * 4;

    pointLight2.position.y = Math.sin(elapsed * 0.8) * 3;
    pointLight2.position.z = Math.cos(elapsed * 0.8) * 3;

    // Particle field parallax and subtle rotation
    particles.rotation.y = elapsed * 0.03;
    particles.rotation.x = elapsed * 0.015;

    particles.position.x = mouse.x * -1.5;
    particles.position.y = mouse.y * -1.5;

    // Camera subtle parallax
    camera.position.x = mouse.x * 0.8;
    camera.position.y = mouse.y * 0.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    // Only trigger full resize if width changed to prevent address bar thrashing on mobile
    if (window.innerWidth !== lastWidth || !isMobile) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25)); // Clamped pixel ratio to prevent fill-rate lag
      lastWidth = window.innerWidth;
    }
  });

  // Mouse move
  document.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });



  // ============================================
  // 4. TYPED EFFECT
  // ============================================
  const typedTextEl = document.getElementById('typedText');
  const phrases = [
    'Full-Stack Developer.',
    'Problem Solver.',
    'Tech Enthusiast.',
    'Creative Builder.',
    'Lifelong Learner.'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function typeEffect() {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      typedTextEl.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 2200;
      } else {
        typingSpeed = 55 + Math.random() * 35;
      }
    } else {
      typedTextEl.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 500;
      } else {
        typingSpeed = 25;
      }
    }

    setTimeout(typeEffect, typingSpeed);
  }

  typeEffect();

  // ============================================
  // 5. NAVBAR
  // ============================================
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const mobileLinks = document.querySelectorAll('[data-mobile]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Active nav link on scroll - Optimized to prevent layout thrashing
  const sections = document.querySelectorAll('section[id]');
  let sectionData = [];

  function calculateSectionOffsets() {
    sectionData = Array.from(sections).map(section => ({
      id: section.getAttribute('id'),
      top: section.offsetTop,
      height: section.offsetHeight
    }));
  }

  // Initial calculation
  calculateSectionOffsets();
  // Recalculate on resize
  window.addEventListener('resize', calculateSectionOffsets);

  function updateActiveNav() {
    const scrollPos = window.scrollY + 200;

    sectionData.forEach(data => {
      if (scrollPos >= data.top && scrollPos < data.top + data.height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === data.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Use requestAnimationFrame to throttle scroll events
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        updateActiveNav();
        isScrolling = false;
      });
      isScrolling = true;
    }
  });

  // ============================================
  // 6. GSAP SCROLL ANIMATIONS
  // ============================================
  gsap.registerPlugin(ScrollTrigger);

  // 3D Background Scroll Interactivity
  gsap.to(camera.position, {
    z: 1.5,
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5
    }
  });

  gsap.to(blob.position, {
    y: 2,
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 2
    }
  });
  // Reveal animations
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');

  revealElements.forEach((el) => {
    const type = el.classList.contains('reveal-up') ? 'up' :
      el.classList.contains('reveal-left') ? 'left' :
        el.classList.contains('reveal-right') ? 'right' : 'scale';

    const fromVars = {
      up: { y: 50, opacity: 0 },
      left: { x: -50, opacity: 0 },
      right: { x: 50, opacity: 0 },
      scale: { scale: 0.85, opacity: 0 },
    };

    const toVars = {
      up: { y: 0, opacity: 1 },
      left: { x: 0, opacity: 1 },
      right: { x: 0, opacity: 1 },
      scale: { scale: 1, opacity: 1 },
    };

    gsap.fromTo(el, fromVars[type], {
      ...toVars[type],
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'top 50%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Stagger project cards
  gsap.fromTo('.project-card',
    { y: 60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 80%',
      },
    }
  );

  // Stagger timeline items per timeline container
  const timelinesContainers = document.querySelectorAll('.timeline');
  timelinesContainers.forEach(timeline => {
    gsap.fromTo(timeline.querySelectorAll('.timeline-item'),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: timeline,
          start: 'top 80%',
        },
      }
    );
  });

  // Section dividers glow animation
  gsap.utils.toArray('.section-divider').forEach(divider => {
    gsap.fromTo(divider,
      { opacity: 0, scaleX: 0 },
      {
        opacity: 0.5,
        scaleX: 1,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: divider,
          start: 'top 90%',
        },
      }
    );
  });

  // ============================================
  // 7. SKILL BARS ANIMATION
  // ============================================
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  skillBars.forEach(bar => {
    const width = bar.getAttribute('data-width');

    ScrollTrigger.create({
      trigger: bar,
      start: 'top 90%',
      onEnter: () => {
        bar.style.width = width + '%';
      },
    });
  });

  // ============================================
  // 8. STAT COUNTER ANIMATION
  // ============================================
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-count'));

    ScrollTrigger.create({
      trigger: stat,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(stat, {
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            const progress = this.progress();
            const current = Math.round(target * progress);
            stat.textContent = current + '+';
          },
        });
      },
    });
  });

  // ============================================
  // 9. TIMELINE LINE FILL
  // ============================================
  const timelinesFill = document.querySelectorAll('.timeline');

  timelinesFill.forEach(timeline => {
    const timelineFill = timeline.querySelector('.timeline-line-fill');
    if (timelineFill) {
      ScrollTrigger.create({
        trigger: timeline,
        start: 'top 60%',
        end: 'bottom 60%',
        scrub: true,
        onUpdate: (self) => {
          timelineFill.style.height = (self.progress * 100) + '%';
        },
      });
    }
  });

  // ============================================
  // 10. PROJECT CARD 3D TILT (Enhanced)
  // ============================================
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
      card.style.transition = 'none';

      // Inner glow effect based on mouse position
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(225, 29, 72, 0.08), rgba(14, 14, 24, 0.7) 60%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.background = '';
    });
  });

  // ============================================
  // 10B. MOUSE-TRACKING & RUNNING BORDER GLOW
  // ============================================
  const glowCards = document.querySelectorAll('.glass-card-glow');
  
  // Mouse tracking for hover spotlight
  glowCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ============================================
  // 11. CONTACT FORM — EmailJS Integration
  // ============================================

  const EMAILJS_PUBLIC_KEY  = 'jYxfPzI-98kMDYGtS';
  const EMAILJS_SERVICE_ID  = 'service_x418er9';
  const EMAILJS_TEMPLATE_ID = 'template_1pun8vm';

  // Initialise EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const contactForm = document.getElementById('contactForm');
  const submitBtn   = document.getElementById('formSubmitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name    = document.getElementById('contactName').value.trim();
      const email   = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) {
        shakeButton(submitBtn);
        return;
      }

      // Show sending state
      submitBtn.innerHTML           = '<span>Sending...</span>';
      submitBtn.style.pointerEvents = 'none';

      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          title:   'Portfolio Contact',
          name:    name,
          email:   email,
          message: message,
        });

        // Success
        submitBtn.innerHTML        = '<span>Message Sent! ✓</span>';
        submitBtn.style.background = 'linear-gradient(135deg, #34d399, #fcd34d)';
        submitBtn.style.boxShadow  = '0 4px 20px rgba(52, 211, 153, 0.4)';

        setTimeout(() => {
          submitBtn.innerHTML = `<span>Send Message</span><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
          submitBtn.style.background    = '';
          submitBtn.style.boxShadow     = '';
          submitBtn.style.pointerEvents = '';
          contactForm.reset();
        }, 3000);

      } catch (err) {
        console.error('EmailJS error:', err);
        submitBtn.innerHTML        = '<span>Failed — Try Again</span>';
        submitBtn.style.background = 'linear-gradient(135deg, #f87171, #fb923c)';
        submitBtn.style.boxShadow  = '0 4px 20px rgba(248, 113, 113, 0.4)';

        setTimeout(() => {
          submitBtn.innerHTML = `<span>Send Message</span><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
          submitBtn.style.background    = '';
          submitBtn.style.boxShadow     = '';
          submitBtn.style.pointerEvents = '';
        }, 3000);
      }
    });
  }

  function shakeButton(btn) {

    btn.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => { btn.style.animation = ''; }, 500);
  }

  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  // ============================================
  // 12. SMOOTH SCROLL (Native)
  // ============================================
  // We use native CSS scroll-behavior: smooth for maximum browser compatibility
  // and to perfectly support Mac trackpad two-finger scrolling.

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // 13. PREMIUM PROJECT IMAGE PLACEHOLDERS
  // ============================================
  function generatePlaceholderImage(id, colors, icon) {
    const cv = document.createElement('canvas');
    cv.width = 700;
    cv.height = 400;
    const ctx = cv.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, cv.width, cv.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2] || colors[0]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Subtle noise
    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(Math.random() * cv.width, Math.random() * cv.height, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Grid pattern
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < cv.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cv.height);
      ctx.stroke();
    }
    for (let y = 0; y < cv.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cv.width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Decorative circles (bokeh effect)
    for (let i = 0; i < 8; i++) {
      ctx.globalAlpha = 0.03 + Math.random() * 0.06;
      const radius = 30 + Math.random() * 100;
      const grd = ctx.createRadialGradient(
        Math.random() * cv.width, Math.random() * cv.height, 0,
        Math.random() * cv.width, Math.random() * cv.height, radius
      );
      grd.addColorStop(0, 'rgba(255,255,255,0.3)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(Math.random() * cv.width, Math.random() * cv.height, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Center mockup window
    const winW = 280, winH = 180;
    const winX = (cv.width - winW) / 2;
    const winY = (cv.height - winH) / 2;

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(winX + 4, winY + 4, winW, winH, 10);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Window bg
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, winH, 10);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, winH, 10);
    ctx.stroke();

    // Window dots
    const dotColors = ['#ff5f57', '#febc2e', '#28c840'];
    dotColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(winX + 18 + i * 16, winY + 16, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Code lines in window
    const lineColors = ['rgba(108,99,255,0.5)', 'rgba(167,139,250,0.4)', 'rgba(244,114,182,0.35)', 'rgba(34,211,238,0.4)', 'rgba(52,211,153,0.35)'];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = lineColors[i % lineColors.length];
      ctx.globalAlpha = 0.5;
      const lw = 60 + Math.random() * (winW - 120);
      ctx.beginPath();
      ctx.roundRect(winX + 18, winY + 36 + i * 20, lw, 6, 3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Icon text
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.15;
    ctx.fillText(icon, cv.width - 60, cv.height - 30);
    ctx.globalAlpha = 1;

    const img = document.getElementById(id);
    if (img) {
      img.src = cv.toDataURL();
    }
  }

  generatePlaceholderImage('project1Img', ['#1a0a3e', '#3d1f8a', '#e11d48'], '🔍');
  generatePlaceholderImage('project2Img', ['#0a2a3e', '#1a4a6a', '#fcd34d'], '📅');
  // generatePlaceholderImage('project3Img', ['#3e0a2a', '#6a1a4a', '#fb923c'], '🎤');
  // generatePlaceholderImage('project6Img', ['#0a3e2a', '#1a5a3a', '#34d399'], '🚗');
  // generatePlaceholderImage('project5Img', ['#3e1a0a', '#6a3d1f', '#fb923c'], '🤖');
  // ============================================
  // 14. FETCH CODING PROFILE STATS
  // ============================================
  async function fetchCodingStats() {
    try {
      // LeetCode Stats
      const lcSolvedRes = await fetch('https://alfa-leetcode-api.onrender.com/Aditya_Anand12/solved');
      const lcSolvedData = await lcSolvedRes.json();
      if (lcSolvedData && lcSolvedData.solvedProblem !== undefined) {
        document.getElementById('lc-solved').innerText = lcSolvedData.solvedProblem;
      }

      const lcContestRes = await fetch('https://alfa-leetcode-api.onrender.com/Aditya_Anand12/contest');
      const lcContestData = await lcContestRes.json();
      if (lcContestData && lcContestData.userContestRanking) {
        document.getElementById('lc-rating').innerText = Math.round(lcContestData.userContestRanking.rating);
      }

      // Codeforces Stats
      const cfInfoRes = await fetch('https://codeforces.com/api/user.info?handles=Coookies');
      const cfInfoData = await cfInfoRes.json();
      if (cfInfoData.status === 'OK' && cfInfoData.result.length > 0) {
        document.getElementById('cf-rating').innerText = cfInfoData.result[0].maxRating || 'N/A';
      }

      const cfStatusRes = await fetch('https://codeforces.com/api/user.status?handle=Coookies');
      const cfStatusData = await cfStatusRes.json();
      if (cfStatusData.status === 'OK') {
        const uniqueSolved = new Set();
        cfStatusData.result.forEach(submission => {
          if (submission.verdict === 'OK') {
            uniqueSolved.add(submission.problem.name);
          }
        });
        document.getElementById('cf-solved').innerText = uniqueSolved.size;
      }
    } catch (error) {
      console.log('Error fetching coding stats:', error);
    }
  }

  fetchCodingStats();

})();
