document.addEventListener('DOMContentLoaded', () => {
    const glassCard = document.querySelector('.glass-card');
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        glassCard.style.transform = `
            perspective(1000px)
            rotateY(${x * 10 - 5}deg)
            rotateX(${y * -10 + 5}deg)
        `;
    });

    document.addEventListener('mouseleave', () => {
        glassCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    });
}); 
