/* Not White — Baaz Kora White. Scroll choreography. */
(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const themeMeta = $('meta[name=theme-color]');
  const THEME_COLORS = { white: '#ffffff', kora: '#eed8b8', tan: '#996738', ink: '#1c2a8c' };

  /* ── theme of the fixed chrome follows whichever section owns the viewport centre ── */
  const state = { section: 'bleach', bleached: true, lace: 'kora' };
  function applyTheme() {
    let t = 'kora';
    if (state.section === 'bleach') t = state.bleached ? 'white' : 'kora';
    else if (state.section === 'laces') t = state.lace === 'tan' ? 'tan' : 'kora';
    else if (state.section === 'hands') t = 'ink';
    if (root.dataset.theme !== t) {
      root.dataset.theme = t;
      themeMeta && themeMeta.setAttribute('content', THEME_COLORS[t]);
      const tone = $('.bar__tone'); if (tone) tone.textContent = t === 'white' ? 'White' : 'Kora White';
    }
  }

  /* ── lace toggle (works with or without motion) ── */
  const laces = $('#laces');
  function setLace(v) {
    state.lace = v; laces.dataset.lace = v;
    $$('.toggle__b').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.set === v)));
    applyTheme();
  }
  $$('.toggle__b').forEach(b => b.addEventListener('click', () => setLace(b.dataset.set)));

  const motion = root.classList.contains('motion') && window.gsap && window.ScrollTrigger;
  if (!motion) {
    root.classList.remove('motion');
    state.bleached = false; root.dataset.theme = 'kora'; $('.bar__tone').textContent = 'Kora White';
    $('.again').addEventListener('click', () => window.scrollTo(0, 0));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const coarse = matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ── smooth wheel scrolling on desktop; touch keeps native momentum ── */
  let lenis = null;
  if (!coarse && window.Lenis) {
    lenis = new Lenis({ lerp: 0.105, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const SCRUB = lenis ? true : 0.28;
  $('.again').addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0, { duration: 2.6, easing: t => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('.bar__mark').addEventListener('click', e => { if (lenis) { e.preventDefault(); lenis.scrollTo(0, { duration: 2 }); } });

  /* ── section ownership + running-stitch progress ── */
  $$('main > section').forEach(sec => ScrollTrigger.create({
    trigger: sec, start: 'top 50%', end: 'bottom 50%',
    onToggle: self => { if (self.isActive) { state.section = sec.id; applyTheme(); } }
  }));
  const stitch = $('.stitch');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => stitch.style.setProperty('--prog', s.progress.toFixed(4)) });

  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 800px)', mob: '(max-width: 799px)' }, ctx => {
    const mob = ctx.conditions.mob;

    /* ═════════ 1. BLEACH — the white is drawn out of the page weft by weft ═════════ */
    const white = $('.bleach__layer--white');
    const N = mob ? 13 : 19;
    // fixed pseudo-random pull order so the page unweaves the same way every time
    const order = [...Array(N).keys()];
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const DUR = 0.4, delay = order.map(o => (o / (N - 1)) * (1 - DUR));
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function strips(p) {
      const wasBleached = state.bleached; state.bleached = p < 0.5;
      if (wasBleached !== state.bleached) applyTheme();
      if (p >= 0.999) { white.style.visibility = 'hidden'; return; }
      white.style.visibility = 'visible';
      if (p <= 0.001) { white.style.clipPath = 'none'; return; }
      const pts = [], anchors = [];
      for (let i = 0; i < N; i++) {
        const l = clamp((p - delay[i]) / DUR); if (l >= 1) continue;
        const e = ease(l) * 100, y0 = (i / N * 100).toFixed(3), y1 = ((i + 1) / N * 100 + 0.03).toFixed(3);
        const x0 = i % 2 ? 0 : e.toFixed(2), x1 = i % 2 ? (100 - e).toFixed(2) : 100;
        anchors.push(`${x0}% ${y0}%`);
        pts.push(`${x0}% ${y0}%`, `${x1}% ${y0}%`, `${x1}% ${y1}%`, `${x0}% ${y1}%`, `${x0}% ${y0}%`);
      }
      for (let k = anchors.length - 2; k >= 0; k--) pts.push(anchors[k]); // retrace bridges → zero area
      white.style.clipPath = `polygon(${pts.join(',')})`;
    }
    const bp = { p: 0 };
    const tlB = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#bleach', start: 'top top', end: 'bottom bottom', scrub: SCRUB } });
    tlB.to('.bleach__hint', { autoAlpha: 0, duration: .05 }, .02)
      .to(bp, { p: 1, duration: .56, onUpdate: () => strips(bp.p) }, .05)
      .from('.bleach__layer--kora .bleach__chip', { autoAlpha: 0, duration: .06 }, .56)
      .from('.bleach__def > *', { autoAlpha: 0, y: 26, duration: .09, stagger: .045, ease: 'power2.out' }, .6)
      .to({}, { duration: .12 });
    // entrance, once
    gsap.from('.bleach__layer--white .bleach__pre, .bleach__layer--white .bleach__word', { yPercent: 28, autoAlpha: 0, duration: 1.3, ease: 'expo.out', stagger: .09, delay: .15 });
    gsap.from('.bleach__layer--white .bleach__chip, .bleach__hint', { autoAlpha: 0, duration: 1, delay: .9 });

    /* ═════════ 2. THE LINE — a camera follows the trail as it is drawn, then the cloth arrives ═════════ */
    const pin = $('.line__pin'), cam = $('.cam'), shoe = $('.shoe'), lineImg = $('.shoe__line'), tilt = $('.shoe__tilt');
    const Z = mob ? 3.1 : 1.42;
    const cs = { fx: .08, fy: .4, s: Z, r: 0, tilt: 0, lift: 1 };
    let W = 0, H = 0, off = 0, lift = 0;
    const measure = () => { W = shoe.offsetWidth; H = shoe.offsetHeight; off = innerHeight * (mob ? -0.035 : -0.04); lift = innerHeight * (mob ? -0.05 : -0.075); };
    const applyCam = () => {
      const tx = -(cs.fx - .5) * W * cs.s, ty = -(cs.fy - .5) * H * cs.s + off + lift * cs.lift;
      cam.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${cs.s.toFixed(4)})`;
      lineImg.style.setProperty('--r', (cs.r * 100).toFixed(2));
    };
    measure(); applyCam();
    ScrollTrigger.addEventListener('refreshInit', measure);
    ScrollTrigger.addEventListener('refresh', applyCam);

    const beats = $$('.beat');
    const tlL = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#line', start: 'top top', end: 'bottom bottom', scrub: SCRUB } });
    const beatIn = (i, at) => tlL.fromTo(beats[i], { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: .45, ease: 'power2.out' }, at);
    const beatOut = (i, at) => tlL.to(beats[i], { autoAlpha: 0, y: -20, duration: .35, ease: 'power2.in' }, at);
    gsap.set(beats[0], { autoAlpha: 1 });
    beatOut(0, .9);
    // the draw: reveal edge leads the camera centre a little, heel → toe
    tlL.to(cs, { fx: .83, fy: .58, r: .98, duration: 4.4, ease: 'sine.inOut', onUpdate: applyCam }, 1);
    beatIn(1, 1.3); beatOut(1, 2.75);
    beatIn(2, 3.15); beatOut(2, 5.1);
    tlL.fromTo('.line__ghost', { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'power1.out' }, 5.2);
    // pull back
    tlL.to(cs, { fx: .5, fy: .5, s: 1, r: 1.08, lift: 0, duration: 1.7, ease: 'power2.inOut', onUpdate: applyCam }, 5.4);
    beatIn(3, 5.7);
    // the cloth takes shape: full shoe fades up out of a page that is exactly its colour
    tlL.to('.shoe__full', { opacity: 1, duration: 1.5, ease: 'power1.inOut' }, 6.7)
      .to('.shoe__shadow', { opacity: 1, duration: 1.2 }, 7.2)
      .to('.line__ghost', { opacity: 0, duration: 1.1 }, 7.3)
      .to(cs, { tilt: 1, duration: .6 }, 7.8);
    if (mob) tlL.to(tilt, { rotation: -7, y: -10, duration: 1.4, ease: 'power2.inOut' }, 7.4);
    beatOut(3, 8.2);
    tlL.to('.dots li', { opacity: 1, scale: 1, duration: .4, stagger: .09, ease: 'back.out(2)' }, 8.5)
      .to('.legend li', { opacity: 1, y: 0, duration: .45, stagger: .09, ease: 'power2.out' }, 8.5)
      .to({}, { duration: .9 });

    // the finished shoe leans toward the pointer
    let rx, ry;
    if (!coarse) {
      rx = gsap.quickTo(tilt, 'rotationX', { duration: .9, ease: 'power3.out' });
      ry = gsap.quickTo(tilt, 'rotationY', { duration: .9, ease: 'power3.out' });
      const onMove = e => {
        const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
        ry(nx * 11 * cs.tilt); rx(-ny * 8 * cs.tilt);
      };
      pin.addEventListener('pointermove', onMove);
      ctx.add(() => () => pin.removeEventListener('pointermove', onMove));
    }

    /* ═════════ 3. RAW — sideways along the details ═════════ */
    const raw = $('#raw'), track = $('.raw__track');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const sizeRaw = () => raw.style.setProperty('--h', (innerHeight + dist() * (mob ? 1.15 : 1)) + 'px');
    sizeRaw(); ScrollTrigger.addEventListener('refreshInit', sizeRaw);
    const slide = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: raw, start: 'top top', end: 'bottom bottom', scrub: SCRUB, invalidateOnRefresh: true } });
    $$('.card').forEach(card => {
      gsap.fromTo($('img', card), { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true } });
    });

    /* ═════════ 4. THE PAIR — the heels meet and the name completes ═════════ */
    const tlP = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#pair', start: 'top top', end: 'bottom bottom', scrub: SCRUB } });
    tlP.from('.pair__l', { x: () => -innerWidth * .78, rotation: -16, duration: .52, ease: 'power3.out' }, 0)
      .from('.pair__hl', { autoAlpha: 0, x: -40, duration: .2, ease: 'power2.out' }, .08)
      .from('.pair__r', { x: () => innerWidth * .78, rotation: 16, duration: .52, ease: 'power3.out' }, .16)
      .from('.pair__hr', { autoAlpha: 0, x: 40, duration: .2, ease: 'power2.out' }, .3)
      .to('.pair__shoes', { scale: .965, duration: .05, ease: 'power2.out' }, .66)
      .to('.pair__shoes', { scale: 1, duration: .1, ease: 'back.out(3)' }, .71)
      .from('.pair__foot', { autoAlpha: 0, y: 24, duration: .14, ease: 'power2.out' }, .7)
      .to({}, { duration: .16 });

    /* ═════════ 5. LACES — passing the midpoint re-laces the pair and floods the page tan ═════════ */
    let zone = null;
    ScrollTrigger.create({
      trigger: laces, start: 'top top', end: 'bottom bottom',
      onUpdate: self => {
        const z = self.progress > .4 ? 'tan' : 'kora';
        if (z !== zone) { if (zone !== null || z === 'tan') setLace(z); zone = z; }
      }
    });
    gsap.from('.laces__stage', { yPercent: 14, rotation: 3, ease: 'none', scrollTrigger: { trigger: laces, start: 'top bottom', end: 'top top', scrub: SCRUB } });

    /* ═════════ 6–8. reveals, stamp, collage ═════════ */
    $$('.reveal').forEach(el => gsap.from(el, { y: 44, autoAlpha: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } }));
    gsap.to('.stamp svg', { rotation: 260, ease: 'none', scrollTrigger: { trigger: '.hands', start: 'top bottom', end: 'bottom top', scrub: SCRUB } });

    $$('.ph').forEach(ph => {
      const sp = parseFloat(ph.dataset.speed) * (mob ? .55 : 1);
      gsap.fromTo(ph, { yPercent: -sp }, { yPercent: sp, ease: 'none', scrollTrigger: { trigger: ph, start: 'top bottom', end: 'bottom top', scrub: SCRUB } });
      gsap.fromTo(ph, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: ph, start: 'top 92%', toggleActions: 'play none none reverse' } });
      gsap.fromTo($('img', ph), { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: ph, start: 'top 92%', toggleActions: 'play none none reverse' } });
    });
    gsap.fromTo('.shout--1', { x: () => innerWidth * .3 }, { x: () => -innerWidth * .25, ease: 'none', scrollTrigger: { trigger: '.shout--1', start: 'top bottom', end: 'bottom top', scrub: SCRUB } });
    gsap.fromTo('.shout--2', { x: () => -innerWidth * .3 }, { x: () => innerWidth * .12, ease: 'none', scrollTrigger: { trigger: '.shout--2', start: 'top bottom', end: 'bottom top', scrub: SCRUB } });

    // the page ends where the shoe began: the line, drawn once more
    const endLine = $('.end__line'); endLine.classList.add('is-mask');
    gsap.fromTo(endLine, { '--r': 0 }, { '--r': 108, duration: 2.4, ease: 'power2.inOut', scrollTrigger: { trigger: endLine, start: 'top 78%', toggleActions: 'play none none reverse' } });
    gsap.from('.end__in > :not(.end__line)', { y: 40, autoAlpha: 0, duration: 1, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: '.end__in', start: 'top 55%', toggleActions: 'play none none reverse' } });

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure);
      ScrollTrigger.removeEventListener('refresh', applyCam);
      ScrollTrigger.removeEventListener('refreshInit', sizeRaw);
      white.style.clipPath = ''; white.style.visibility = ''; cam.style.transform = '';
      endLine.classList.remove('is-mask');
    };
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
