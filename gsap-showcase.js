// GSAP Animation Showcase

document.addEventListener('DOMContentLoaded', () => {
  // Card entrance
  gsap.to('.gsap-card', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' });

  // Icon entrance (staggered, bounce)
  gsap.to('.gsap-icon', {
    opacity: 1,
    scale: 1,
    duration: 1.1,
    ease: 'back.out(1.7)',
    stagger: 0.15,
    delay: 0.5
  });

  // SVG morph/scale entrance
  gsap.to('.gsap-svg-demo', {
    opacity: 1,
    scale: 1,
    duration: 1.2,
    ease: 'elastic.out(1, 0.5)',
    delay: 1
  });

  // Button entrance
  gsap.to('.gsap-btn', {
    opacity: 1,
    y: 0,
    duration: 1.1,
    ease: 'power3.out',
    delay: 1.2
  });

  // Button click: crazy animation
  document.querySelector('.gsap-btn').addEventListener('click', () => {
    // Animate card: shake and color flash
    gsap.fromTo('.gsap-card',
      { x: 0, backgroundColor: '#232323' },
      { x: 30, backgroundColor: '#C850C0', duration: 0.15, yoyo: true, repeat: 5, ease: 'power1.inOut', onComplete: () => {
        gsap.to('.gsap-card', { x: 0, backgroundColor: '#232323', duration: 0.3 });
      }}
    );
    // Animate icons: spin and scale
    gsap.to('.gsap-icon', {
      rotate: 360,
      scale: 1.3,
      duration: 0.7,
      ease: 'expo.inOut',
      yoyo: true,
      repeat: 1,
      stagger: 0.07
    });
    // Animate SVG: morph and pulse
    gsap.to('.gsap-svg-demo circle', {
      attr: { r: 20 },
      fill: '#C850C0',
      duration: 0.5,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
    gsap.to('.gsap-svg-demo rect', {
      attr: { width: 60, height: 60, x: 20, y: 20 },
      fill: '#4158D0',
      duration: 0.5,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  });

  // Scroll effect: parallax icons
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    document.querySelectorAll('.gsap-icon').forEach((icon, i) => {
      gsap.to(icon, {
        y: Math.sin(scrollY / 100 + i) * 18,
        scale: 1 + Math.abs(Math.sin(scrollY / 200 + i)) * 0.2,
        duration: 0.4,
        overwrite: 'auto'
      });
    });
  });

  // === More GSAP Demo Animations ===
  // Text reveal
  gsap.to('.gsap-text-reveal', { opacity: 1, y: 0, duration: 1.2, delay: 1.5, ease: 'power2.out' });
  gsap.from('.gsap-text-reveal', { x: -80, duration: 1.2, delay: 1.5, ease: 'power2.out' });
  // Staggered list
  gsap.to('.gsap-stagger-list li', { opacity: 1, y: 0, duration: 1, stagger: 0.18, delay: 2, ease: 'back.out(1.7)' });
  gsap.from('.gsap-stagger-list li', { y: 40, duration: 1, stagger: 0.18, delay: 2, ease: 'back.out(1.7)' });
  // Morphing SVG
  gsap.to('.gsap-morph-svg', { opacity: 1, scale: 1, duration: 1.2, delay: 2.5, ease: 'elastic.out(1, 0.5)' });
  gsap.from('.gsap-morph-svg', { scale: 0.7, duration: 1.2, delay: 2.5, ease: 'elastic.out(1, 0.5)' });
  // Morph path on hover
  const morphPath = document.querySelector('.gsap-morph-svg path');
  if (morphPath) {
    morphPath.addEventListener('mouseenter', () => {
      gsap.to(morphPath, { attr: { d: 'M20 20 Q80 50 20 80 Q50 20 80 80 Z' }, fill: '#FFCC70', duration: 1, ease: 'power2.inOut' });
    });
    morphPath.addEventListener('mouseleave', () => {
      gsap.to(morphPath, { attr: { d: 'M50 10 Q90 50 50 90 Q10 50 50 10 Z' }, fill: '#C850C0', duration: 1, ease: 'power2.inOut' });
    });
  }
  // Bouncing ball
  gsap.to('.gsap-bounce-ball', { opacity: 1, scale: 1, duration: 1, delay: 3, ease: 'back.out(1.7)' });
  gsap.from('.gsap-bounce-ball', { scale: 0.7, duration: 1, delay: 3, ease: 'back.out(1.7)' });
  // Infinite bounce
  gsap.to('.gsap-bounce-ball', { y: -60, duration: 0.7, repeat: -1, yoyo: true, ease: 'bounce.inOut', delay: 3.2 });
  // Timeline sequence for card, icons, svg, text, list, morph, ball
  const tl = gsap.timeline({ delay: 0.2 });
  tl.to('.gsap-card', { boxShadow: '0 0 32px 0 #C850C0', duration: 0.5, yoyo: true, repeat: 1 })
    .to('.gsap-icon', { color: '#FFCC70', duration: 0.3, stagger: 0.1, yoyo: true, repeat: 1 }, '-=0.3')
    .to('.gsap-svg-demo', { rotate: 20, duration: 0.4, yoyo: true, repeat: 1 }, '-=0.2')
    .to('.gsap-text-reveal', { color: '#C850C0', duration: 0.4, yoyo: true, repeat: 1 }, '-=0.2')
    .to('.gsap-stagger-list li', { backgroundColor: '#4158D0', duration: 0.3, stagger: 0.1, yoyo: true, repeat: 1 }, '-=0.2')
    .to('.gsap-morph-svg', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }, '-=0.2')
    .to('.gsap-bounce-ball', { backgroundColor: '#C850C0', duration: 0.3, yoyo: true, repeat: 1 }, '-=0.2');
}); 
