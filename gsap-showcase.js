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
}); 