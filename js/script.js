document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  const header = document.getElementById('siteHeader');
  const waFloat = document.getElementById('waFloat');

  function onScroll(){
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
    if (window.scrollY > window.innerHeight * 0.7) waFloat.classList.add('is-visible');
    else waFloat.classList.remove('is-visible');
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  const menuBtn = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', false);
    document.body.classList.remove('no-scroll');
  }));

  if (!reduceMotion) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero-eyebrow', { opacity:0, y:16, duration:0.6 })
      .from('.hero-title .line', { opacity:0, y:44, stagger:0.12, duration:0.9 }, '-=0.3')
      .from('.hero-sub', { opacity:0, y:20, duration:0.7 }, '-=0.45')
      .from('.hero-ctas', { opacity:0, y:20, duration:0.6 }, '-=0.5')
      .from('.code-window', { opacity:0, y:30, scale:0.97, duration:0.9 }, '-=0.8')
      .from('.code-line', { opacity:0, x:-12, stagger:0.07, duration:0.35 }, '-=0.4');
  }

  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (reduceMotion) return;
    gsap.fromTo(el, { opacity:0, y:32 }, {
      opacity:1, y:0, duration:0.8, ease:'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  document.querySelectorAll('[data-reveal-group]').forEach(group => {
    const items = group.querySelectorAll('[data-reveal-item]');
    if (reduceMotion) return;
    gsap.fromTo(items, { opacity:0, y:26 }, {
      opacity:1, y:0, duration:0.65, stagger:0.09, ease:'power3.out',
      scrollTrigger: { trigger: group, start: 'top 82%' }
    });
  });

  const processTrack = document.querySelector('.process-track');
  if (processTrack && !reduceMotion) {
    gsap.to('.process-progress', {
      scaleY: 1, ease:'none',
      scrollTrigger: { trigger: processTrack, start:'top 65%', end:'bottom 75%', scrub:0.6 }
    });
  }

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width/2;
        const y = e.clientY - r.top - r.height/2;
        gsap.to(btn, { x:x*0.22, y:y*0.35, duration:0.4, ease:'power2.out' });
      });
      btn.addEventListener('mouseleave', () => gsap.to(btn, { x:0, y:0, duration:0.5, ease:'elastic.out(1,0.4)' }));
    });

    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width - 0.5;
        const py = (e.clientY - r.top)/r.height - 0.5;
        gsap.to(card, { rotateY: px*6, rotateX: -py*6, duration:0.4, ease:'power2.out', transformPerspective:800 });
      });
      card.addEventListener('mouseleave', () => gsap.to(card, { rotateY:0, rotateX:0, duration:0.6, ease:'power3.out' }));
    });
  }

  const compare = document.getElementById('compareSlider');
  if (compare) {
    const range = compare.querySelector('.compare__range');
    const before = compare.querySelector('.compare__before');
    const handle = compare.querySelector('.compare__handle');
    const update = v => {
      before.style.clipPath = `inset(0 ${100-v}% 0 0)`;
      handle.style.left = v + '%';
    };
    range.addEventListener('input', e => update(e.target.value));
    update(range.value);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('aether-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let particles = [];
  const mouse = { x: null, y: null, radius: 200 };

  // Classe das Partículas
  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }

      // Detecção de proximidade do mouse
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius + this.size) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= forceDirectionX * force * 5;
          this.y -= forceDirectionY * force * 5;
        }
      }

      this.x += this.directionX;
      this.y += this.directionY;
      this.draw();
    }
  }

  // Inicialização das partículas
  function init() {
    particles = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
      let size = (Math.random() * 2) + 1;
      let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
      let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
      let directionX = (Math.random() * 0.4) - 0.2;
      let directionY = (Math.random() * 0.4) - 0.2;
      let color = 'rgba(191, 128, 255, 0.8)'; // Roxo brilhante
      particles.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  // Ajuste do tamanho da tela
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Conexão por linhas entre as partículas próximas
  const connect = () => {
    let opacityValue = 1;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
          + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));

        if (distance < (canvas.width / 7) * (canvas.height / 7)) {
          opacityValue = 1 - (distance / 20000);

          let dx_mouse_a = particles[a].x - mouse.x;
          let dy_mouse_a = particles[a].y - mouse.y;
          let distance_mouse_a = Math.sqrt(dx_mouse_a * dx_mouse_a + dy_mouse_a * dy_mouse_a);

          if (mouse.x && distance_mouse_a < mouse.radius) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`;
          } else {
            ctx.strokeStyle = `rgba(200, 150, 255, ${opacityValue})`;
          }

          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  };

  // Loop de Animação
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
    }
    connect();
  };

  // Eventos do Mouse
  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  init();
  animate();
});
