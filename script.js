document.addEventListener('DOMContentLoaded', () => {
    // Animate skill bars on scroll
    const skillBars = document.querySelectorAll('.skill-level');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.parentElement.getAttribute('data-level');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => {
        const level = bar.style.width;
        bar.style.width = '0';
        bar.parentElement.setAttribute('data-level', level);
        observer.observe(bar);
    });

    // Add parallax effect to the glass card
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

    // Reset transform when mouse leaves
    document.addEventListener('mouseleave', () => {
        glassCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    });

    // Add typing effect to the name
    const nameElement = document.querySelector('.name');
    const name = nameElement.textContent;
    nameElement.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < name.length) {
            nameElement.textContent += name.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    };
    
    setTimeout(typeWriter, 1000);

    // Discord live status/activity widget (real-time with WebSocket and heartbeat)
    const lanyardSocket = new WebSocket('wss://api.lanyard.rest/socket');
    const userId = '1235621597776445480';
    let heartbeatInterval;
    let receivedPresence = false;

    lanyardSocket.addEventListener('open', () => {
        console.log('[Lanyard] WebSocket opened');
    });

    lanyardSocket.addEventListener('error', (e) => {
        console.error('[Lanyard] WebSocket error:', e);
    });

    lanyardSocket.addEventListener('close', (e) => {
        console.warn('[Lanyard] WebSocket closed:', e);
    });

    lanyardSocket.addEventListener('message', (event) => {
        const payload = JSON.parse(event.data);
        console.log('[Lanyard] Message received:', payload);

        // Handle Hello (op: 1)
        if (payload.op === 1 && payload.d && payload.d.heartbeat_interval) {
            // Start heartbeat
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            heartbeatInterval = setInterval(() => {
                lanyardSocket.send(JSON.stringify({ op: 3 }));
            }, payload.d.heartbeat_interval);

            // Now subscribe to your user
            lanyardSocket.send(JSON.stringify({
                op: 2,
                d: { subscribe_to_id: userId }
            }));
            console.log('[Lanyard] Sent subscribe_to_id');
        }

        // Handle presence updates
        if (payload.t === 'INIT_STATE' || payload.t === 'PRESENCE_UPDATE') {
            receivedPresence = true;
            const d = payload.d;
            // Status
            const statusColors = {
                online: '#43b581',
                dnd: '#f04747',
                idle: '#faa61a',
                offline: '#747f8d'
            };
            const status = d.discord_status;
            // Activity
            let activity = d.activities.find(a => a.type === 0 || a.type === 1 || a.type === 2);
            let activityText = '';
            if (activity) {
                if (activity.type === 2) activityText = `Listening to ${activity.name}`;
                else if (activity.type === 0) activityText = `Playing ${activity.name}`;
                else activityText = activity.name;
            }
            // Set status dot
            const statusDot = document.getElementById('discord-status-dot');
            if (statusDot) {
                statusDot.style.background = statusColors[status] || '#747f8d';
            }
            // Set activity text
            const activityDiv = document.getElementById('discord-activity-text');
            if (activityDiv) {
                activityDiv.textContent = activityText;
            }
        }
    });

    // Fallback: set default status dot and text if no data after 3 seconds
    setTimeout(() => {
        if (!receivedPresence) {
            console.warn('[Lanyard] No presence data received after 3s. Setting fallback.');
            const statusDot = document.getElementById('discord-status-dot');
            if (statusDot) {
                statusDot.style.background = '#747f8d'; // offline
            }
            const activityDiv = document.getElementById('discord-activity-text');
            if (activityDiv) {
                activityDiv.textContent = '';
            }
        }
    }, 3000);

    // Optionally: handle socket close/reconnect logic if you want it to be robust
}); 
