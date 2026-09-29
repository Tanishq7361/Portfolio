/* ==========================================================================
   ULTIMATE CYBER-LUXE WIDE PORTFOLIO JAVASCRIPT
   Sound FX • Magnetic Physics • Terminal • 3D Tilt • Confetti • Laser
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==================== 1. ZERO-DEPENDENCY WEB AUDIO API ====================
  let audioEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freqStart, freqEnd, type, duration, volume = 0.035) {
    if (!audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  const soundFX = {
    hover: () => playTone(1400, 1800, 'sine', 0.05, 0.015),
    click: () => playTone(800, 300, 'triangle', 0.08, 0.04),
    switch: () => playTone(500, 950, 'sine', 0.07, 0.03),
    success: () => {
      if (!audioEnabled || !audioCtx) return;
      [440, 554, 659, 880].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, freq * 1.05, 'sine', 0.15, 0.04), idx * 70);
      });
    }
  };

  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      initAudio();
      audioEnabled = !audioEnabled;
      if (audioEnabled) {
        audioToggleBtn.classList.remove('muted');
        audioIcon.className = 'fas fa-volume-up';
        audioToggleBtn.querySelector('.tooltip').textContent = 'Sound: ON';
        soundFX.switch();
        showToast('🔊 Audio Effects Enabled');
      } else {
        audioToggleBtn.classList.add('muted');
        audioIcon.className = 'fas fa-volume-mute';
        audioToggleBtn.querySelector('.tooltip').textContent = 'Sound: OFF';
        showToast('🔇 Audio Muted');
      }
    });
  }

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-sound="hover"], .nav-link, .btn, .sfilter-btn, .social-circle, .dock-item, .laser-box');
    if (target) {
      initAudio();
      soundFX.hover();
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-sound="click"], .btn, button, .proj-action-btn');
    if (target) {
      initAudio();
      soundFX.click();
    }
  });


  // ==================== 2. MAGNETIC CURSOR & FOLLOWER ====================
  const cursorDot = document.getElementById('customCursor');
  const cursorFollower = document.getElementById('cursorFollower');

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  function renderCursor() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;
    if (cursorFollower) {
      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;
    }
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  document.querySelectorAll('a, button, input, textarea, .laser-box, .skill-card-wide').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot?.classList.add('hovering');
      cursorFollower?.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursorDot?.classList.remove('hovering');
      cursorFollower?.classList.remove('hovering');
    });
  });


  // ==================== 3. SCROLL PROGRESS & QUICK DOCK ====================
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const mainHeader = document.getElementById('mainHeader');
  const quickDock = document.getElementById('quickDock');
  const dockScrollTop = document.getElementById('dockScrollTop');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${progress}%`;
    }

    if (window.scrollY > 40) {
      mainHeader?.classList.add('scrolled');
    } else {
      mainHeader?.classList.remove('scrolled');
    }

    if (window.scrollY > 350) {
      quickDock?.classList.add('visible');
    } else {
      quickDock?.classList.remove('visible');
    }

    const scrollPos = window.scrollY + 200;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  dockScrollTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    soundFX.click();
  });


  // ==================== 4. DYNAMIC HERO TYPEWRITER ====================
  const typingElement = document.getElementById('typingText');
  const phrases = [
    'Full-Stack Developer',
    'DA-IICT Undergraduate',
    'MERN & Next.js Systems',
    'Creative Web Engineering'
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isBackspacing = false;
  let typeSpeed = 85;

  function typeLoop() {
    if (!typingElement) return;
    const current = phrases[phraseIdx];

    if (isBackspacing) {
      typingElement.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      typeSpeed = 40;
    } else {
      typingElement.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      typeSpeed = 85;
    }

    if (!isBackspacing && charIdx === current.length) {
      isBackspacing = true;
      typeSpeed = 2000;
    } else if (isBackspacing && charIdx === 0) {
      isBackspacing = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      typeSpeed = 400;
    }

    setTimeout(typeLoop, typeSpeed);
  }
  typeLoop();


  // ==================== 5. 3D HERO CARD TILT ====================
  const heroTiltCard = document.getElementById('heroTiltCard');
  if (heroTiltCard) {
    heroTiltCard.addEventListener('mousemove', (e) => {
      const rect = heroTiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / (rect.height / 2)) * 12;
      const rotateY = (x / (rect.width / 2)) * 12;
      heroTiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    heroTiltCard.addEventListener('mouseleave', () => {
      heroTiltCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }


  // ==================== 6. ANIMATED METRICS COUNTER ====================
  let countersDone = false;
  function triggerCounters() {
    const strip = document.querySelector('.stats-strip');
    if (!strip || countersDone) return;

    const rect = strip.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.9) {
      countersDone = true;
      document.querySelectorAll('.stat-num').forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1500;
        const startTime = performance.now();

        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const val = Math.floor((1 - Math.pow(1 - progress, 3)) * target);
          counter.textContent = val;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            counter.textContent = target;
          }
        }
        requestAnimationFrame(step);
      });
    }
  }
  window.addEventListener('scroll', triggerCounters);
  triggerCounters();


  // ==================== 7. INTERACTIVE TERMINAL ====================
  const terminalInput = document.getElementById('terminalInput');
  const terminalHistory = document.getElementById('terminalHistory');
  const terminalBody = document.getElementById('terminalBody');

  const termCommands = {
    help: () => `Commands: <span class="term-hl">skills</span>, <span class="term-hl">projects</span>, <span class="term-hl">contact</span>, <span class="term-hl">bio</span>, <span class="term-hl">clear</span>`,
    skills: () => `Stack: JavaScript, TypeScript, React, Node.js, Express, MongoDB, Next.js, C++, Python, Git`,
    projects: () => `Featured: Portfolio, Cloud Clone, Analytics Dashboard, Brand Portal`,
    contact: () => `Email: <span class="term-hl">tanishq7361@gmail.com</span> | GitHub: github.com/Tanishq7361`,
    bio: () => `Tanishq Shah: Undergrad at DA-IICT (Gandhinagar/Ahmedabad). Passionate full-stack engineer.`,
    clear: () => ''
  };

  function runTermCommand(cmdText) {
    const cmd = cmdText.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'clear') {
      if (terminalHistory) terminalHistory.innerHTML = '';
      return;
    }

    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = `<span class="prompt">➜</span> <span class="cmd">${cmdText}</span>`;

    const out = document.createElement('div');
    out.className = 'term-output';
    out.innerHTML = termCommands[cmd] ? termCommands[cmd]() : `command not found: ${cmdText}. Type 'help'.`;

    terminalHistory?.appendChild(line);
    terminalHistory?.appendChild(out);
    if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  terminalInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = terminalInput.value;
      terminalInput.value = '';
      runTermCommand(val);
      soundFX.click();
    }
  });

  document.querySelectorAll('.tcmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.getAttribute('data-cmd');
      if (c) {
        runTermCommand(c);
        soundFX.click();
      }
    });
  });


  // ==================== 8. SKILLS MATRIX WITH SPOTLIGHT ====================
  const skillsData = [
    { name: 'JavaScript', category: 'frontend languages', level: 92, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
    { name: 'React.js', category: 'frontend', level: 90, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
    { name: 'Node.js', category: 'backend', level: 86, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
    { name: 'TypeScript', category: 'frontend languages', level: 85, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
    { name: 'Next.js', category: 'frontend', level: 85, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
    { name: 'MongoDB', category: 'backend', level: 85, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
    { name: 'Express', category: 'backend', level: 88, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
    { name: 'Tailwind', category: 'frontend', level: 88, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
    { name: 'HTML5', category: 'frontend', level: 96, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
    { name: 'CSS3', category: 'frontend', level: 94, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
    { name: 'C / C++', category: 'languages', level: 89, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
    { name: 'Python', category: 'languages', level: 80, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
    { name: 'Git', category: 'languages', level: 90, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
    { name: 'GitHub', category: 'languages', level: 92, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
  ];

  const skillsContainer = document.getElementById('skillsContainer');
  function renderSkills(filter = 'all') {
    if (!skillsContainer) return;
    skillsContainer.innerHTML = '';

    const list = filter === 'all' ? skillsData : skillsData.filter(s => s.category.includes(filter));

    list.forEach(skill => {
      const card = document.createElement('div');
      card.className = 'skill-card-wide';
      card.innerHTML = `
        <div class="skill-img-wrap">
          <img src="${skill.icon}" alt="${skill.name}" loading="lazy">
        </div>
        <div class="skill-name">${skill.name}</div>
        <div class="skill-bar">
          <div class="skill-fill" style="width: ${skill.level}%"></div>
        </div>
      `;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--m-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--m-y', `${e.clientY - rect.top}px`);
      });

      skillsContainer.appendChild(card);
    });
  }
  renderSkills();

  document.querySelectorAll('.sfilter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sfilter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSkills(btn.getAttribute('data-filter'));
      soundFX.switch();
    });
  });


  // ==================== 9. PROJECT MODAL INSPECTOR ====================
  const projectDetailsMap = {
    1: {
      title: 'Developer Portfolio',
      image: './img/web1.jpeg',
      desc: 'High-performance portfolio built with Web Audio API sound synthesis, dynamic laser borders, and 3D card physics.',
      github: 'https://github.com/Tanishq7361/My-first-Webpage'
    },
    2: {
      title: 'Full-Stack Cloud Clone',
      image: './img/web2.jpeg',
      desc: 'MERN stack web application with JWT authentication, MongoDB schemas, and REST APIs.',
      github: 'https://github.com/Tanishq7361'
    },
    3: {
      title: 'Analytics Dashboard',
      image: './img/web3.jpeg',
      desc: 'Data visualization web dashboard engineered with Next.js App Router, TypeScript, and Tailwind CSS.',
      github: 'https://github.com/Tanishq7361'
    },
    4: {
      title: 'Interactive Brand Portal',
      image: './img/web4.jpg',
      desc: 'Creative responsive portal focusing on typography, CSS keyframe animations, and micro-interactions.',
      github: 'https://github.com/Tanishq7361'
    }
  };

  const projectModalBackdrop = document.getElementById('projectModalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');

  function openProjectModal(pid) {
    const data = projectDetailsMap[pid];
    if (!data || !modalBody) return;

    modalBody.innerHTML = `
      <img src="${data.image}" alt="${data.title}" class="modal-img-preview">
      <h2 class="modal-title">${data.title}</h2>
      <p class="modal-desc">${data.desc}</p>
      <div style="display:flex; gap:1.2rem; flex-wrap:wrap;">
        <a href="${data.github}" target="_blank" rel="noopener" class="btn btn-laser">
          <i class="fab fa-github"></i>
          <span>GitHub Source</span>
        </a>
        <button class="btn btn-glass" onclick="document.getElementById('projectModalBackdrop').classList.remove('active')">
          <span>Close</span>
        </button>
      </div>
    `;

    projectModalBackdrop?.classList.add('active');
    soundFX.click();
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.preview-modal-trigger');
    if (trigger) {
      e.preventDefault();
      const pid = trigger.getAttribute('data-pid');
      if (pid) openProjectModal(pid);
    }
  });

  modalCloseBtn?.addEventListener('click', () => {
    projectModalBackdrop?.classList.remove('active');
    soundFX.click();
  });

  projectModalBackdrop?.addEventListener('click', (e) => {
    if (e.target === projectModalBackdrop) {
      projectModalBackdrop.classList.remove('active');
    }
  });


  // ==================== 10. COPY EMAIL & TOASTS ====================
  document.querySelectorAll('.copy-email-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email') || 'tanishq7361@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        soundFX.click();
        showToast('📋 Copied email to clipboard!');
      }).catch(() => {
        showToast(email);
      });
    });
  });

  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-circle-check"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = '0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }


  // ==================== 11. CONFETTI BURST & CONTACT SUBMIT ====================
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitMessageBtn');
    if (!btn) return;

    const original = btn.innerHTML;
    btn.innerHTML = '<span>Transmitted! 🚀</span> <i class="fas fa-check"></i>';
    btn.style.background = '#10b981';

    soundFX.success();
    runConfetti();
    showToast('🚀 Message transmitted! Tanishq will reply soon.');

    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      contactForm.reset();
    }, 3000);
  });

  function runConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#7c3aed', '#06b6d4', '#f43f5e', '#fbbf24', '#10b981', '#a78bfa'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.65,
        radius: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: -(Math.random() * 12 + 6),
        gravity: 0.3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1
      });
    }

    let frame;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach(p => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.01;

        if (p.opacity > 0) {
          active = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(p.opacity, 0);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 1.5);
          ctx.restore();
        }
      });

      if (active) {
        frame = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(frame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }


  // ==================== 12. MOBILE HAMBURGER ====================
  const hamburger = document.getElementById('hamburger');
  const navLinksList = document.getElementById('navLinks');

  if (hamburger && navLinksList) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksList.classList.toggle('active');
      soundFX.click();
    });

    navLinksList.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksList.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinksList.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinksList.classList.remove('active');
      }
    });
  }


  // ==================== 13. INITIALIZE AOS ====================
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 750,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }

});
