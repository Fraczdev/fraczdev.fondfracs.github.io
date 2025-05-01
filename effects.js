class CursorTrail {
    constructor() {
        this.points = [];
        this.maxPoints = 50;
        this.trailColor = '#ffffff';
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';
        document.body.appendChild(this.canvas);

        window.addEventListener('resize', () => this.resize());
        this.resize();

        window.addEventListener('mousemove', (e) => {
            this.addPoint(e.clientX, e.clientY);
        });

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addPoint(x, y) {
        this.points.push({ x, y, age: 0 });
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.points.length - 1; i++) {
            const point = this.points[i];
            const nextPoint = this.points[i + 1];
            const alpha = 1 - (i / this.points.length);
            
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);
            this.ctx.lineTo(nextPoint.x, nextPoint.y);
            this.ctx.stroke();
            
            point.age++;
        }
        
        this.points = this.points.filter(point => point.age < 50);
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

class CardTilt {
    constructor() {
        this.card = document.querySelector('.glass-card');
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseLeave = this.handleMouseLeave.bind(this);
        this.init();
    }

    init() {
        if (this.card) {
            window.addEventListener('mousemove', this.boundMouseMove);
            this.card.addEventListener('mouseleave', this.boundMouseLeave);
        }
    }

    handleMouseMove(e) {
        const rect = this.card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        this.card.style.transform = `
            perspective(1000px)
            rotateY(${(x * 2 - 1) * 10}deg)
            rotateX(${(y * 2 - 1) * -10}deg)
        `;
    }

    handleMouseLeave() {
        this.card.style.transform = `
            perspective(1000px)
            rotateY(0deg)
            rotateX(0deg)
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CursorTrail();
    new CardTilt();
}); 
