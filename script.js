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

    lanyardSocket.addEventListener('open', () => {
        // Wait for Hello (op: 1) before subscribing!
    });

    lanyardSocket.addEventListener('message', (event) => {
        const payload = JSON.parse(event.data);

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
        }

        // Handle presence updates
        if (payload.t === 'INIT_STATE' || payload.t === 'PRESENCE_UPDATE') {
            const d = payload.d;
            // Avatar
            const avatarUrl = `https://cdn.discordapp.com/avatars/${d.discord_user.id}/${d.discord_user.avatar}.png`;
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
            // Render
            const discordLiveStatus = document.getElementById('discord-live-status');
            if (discordLiveStatus) {
                discordLiveStatus.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="position: relative; width: 38px; height: 38px;">
                            <img src="${avatarUrl}" alt="Discord Avatar" style="width: 38px; height: 38px; border-radius: 50%; border: 2.5px solid #23272a; background: #fff;" />
                            <span style="position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background: ${statusColors[status]}; border: 2px solid #23272a;"></span>
                        </div>
                        <span style="font-size: 1.08rem; color: #fff; opacity: 0.93;">${activityText ? activityText : status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </div>
                `;
            }
        }
    });

    // Optionally: handle socket close/reconnect logic if you want it to be robust
}); 
