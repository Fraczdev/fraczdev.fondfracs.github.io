class CursorTrail {
    constructor() {
        this.points = [];
        this.maxPoints = 20;
        this.trailColor = '#ffffff';
        this.delayQueue = [];
        this.delayFrames = 8; // delay, set it as you please
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
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.addPoint(x * scaleX, y * scaleY);
        });

        this.animate();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    addPoint(x, y) {
        this.points.push({ x, y, age: 0 });
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(255,255,255,0.5)';
        this.ctx.shadowBlur = 8;
        for (let i = 0; i < this.points.length - 1; i++) {
            const point = this.points[i];
            const nextPoint = this.points[i + 1];
            const alpha = 1 - (i / this.points.length);
            
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.35})`;
            this.ctx.lineWidth = 1.3 + (1.2 * alpha);
            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);
            this.ctx.lineTo(nextPoint.x, nextPoint.y);
            this.ctx.stroke();
            
            point.age++;
        }
        this.ctx.restore();
        
        this.points = this.points.filter(point => point.age < 20);
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
     // new CursorTrail()
}); 
