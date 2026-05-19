const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = {
    x: undefined,
    y: undefined,
    radius: 150
};

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        this.radius = Math.random() * 2 + 0.5;
        this.baseAlpha = Math.random() * 0.5 + 0.1;
        // Introduce some subtle blue/purple tints to particles
        const colors = ['255, 255, 255', '79, 172, 254', '142, 45, 226'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Interaction with mouse (repel effect)
        if (mouse.x != undefined && mouse.y != undefined) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = mouse.radius;
                const force = (maxDistance - distance) / maxDistance;
                const directionX = forceDirectionX * force * 3;
                const directionY = forceDirectionY * force * 3;

                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.baseAlpha})`;
        ctx.fill();
    }
}

function init() {
    particles = [];
    // Adjust particle density based on screen size
    const density = window.innerWidth < 768 ? 20000 : 12000;
    const numberOfParticles = Math.floor((width * height) / density);
    
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connect particles to each other
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Draw line if particles are close enough
            if (distance < 120) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                // Opacity depends on distance
                const opacity = 1 - (distance / 120);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
        
        // Connect particles to mouse
        if (mouse.x != undefined && mouse.y != undefined) {
            const dxMouse = particles[i].x - mouse.x;
            const dyMouse = particles[i].y - mouse.y;
            const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            if (distanceMouse < 150) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                const opacity = 1 - (distanceMouse / 150);
                ctx.strokeStyle = `rgba(79, 172, 254, ${opacity * 0.4})`; 
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}

// Initialize and start animation
init();
animate();

// Re-initialize particles on resize to maintain correct density
window.addEventListener('resize', () => {
    init();
});

// Vanilla JS 3D Tilt Effect on the card
const card = document.querySelector('.glass-container');
let isAnimating = true;

// Prevent tilt during the entrance animation
setTimeout(() => {
    isAnimating = false;
}, 1500);

document.addEventListener('mousemove', (e) => {
    if(isAnimating) return;
    // Calculate rotation based on mouse position relative to screen center
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    
    if(card) {
        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    }
});

// Reset tilt on mouse leave
document.addEventListener('mouseleave', () => {
    if(isAnimating) return;
    if(card) {
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        card.style.transition = 'transform 0.5s ease';
    }
});

// Remove transition when entering to make it snappy
document.addEventListener('mouseenter', () => {
    if(isAnimating) return;
    if(card) {
        card.style.transition = 'none';
    }
});
