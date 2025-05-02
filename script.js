    document.addEventListener('DOMContentLoaded', () => {
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

        const glassCard = document.querySelector('.glass-card');
        const audio = document.getElementById('player');
        let lastPlayedSong = null;
        let lastPlayedArtist = null;
        
    
        document.addEventListener('mousemove', (e) => {
            const rect = glassCard.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const tiltX = 20;
            const tiltY = 20;
            const scale = 1.02;
            
            glassCard.style.transform = `
                perspective(1000px)
                rotateY(${x * tiltX - tiltX/2}deg)
                rotateX(${y * -tiltY + tiltY/2}deg)
                scale(${scale})
            `;
        });

        document.addEventListener('mouseleave', () => {
            glassCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
        });

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

            if (payload.op === 1 && payload.d && payload.d.heartbeat_interval) {
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                heartbeatInterval = setInterval(() => {
                    lanyardSocket.send(JSON.stringify({ op: 3 }));
                }, payload.d.heartbeat_interval);

                lanyardSocket.send(JSON.stringify({
                    op: 2,
                    d: { subscribe_to_id: userId }
                }));
                console.log('[Lanyard] Sent subscribe_to_id');
            }

            if (payload.t === 'INIT_STATE' || payload.t === 'PRESENCE_UPDATE') {
                receivedPresence = true;
                const d = payload.d;
                const statusColors = {
                    online: '#43b581',
                    dnd: '#f04747',
                    idle: '#faa61a',
                    offline: '#747f8d'
                };
                const status = d.discord_status;
                let activity = d.activities.find(a => a.type === 0 || a.type === 1 || a.type === 2);
                let activityText = '';
                if (activity) {
                    if (activity.type === 2) activityText = `Listening to ${activity.name}`;
                    else if (activity.type === 0) activityText = `Playing ${activity.name}`;
                    else activityText = activity.name;
                }
                const statusDot = document.getElementById('discord-status-dot');
                if (statusDot) {
                    statusDot.style.background = statusColors[status] || '#747f8d';
                    statusDot.style.display = 'block';
                } else {
                    console.log('Status dot element not found');
                }
                const activityDiv = document.getElementById('discord-activity-text');
                if (activityDiv) {
                    activityDiv.textContent = activityText;
                }
            }
        });

        setTimeout(() => {
            if (!receivedPresence) {
                console.warn('[Lanyard] No presence data received after 3s. Setting fallback.');
                const statusDot = document.getElementById('discord-status-dot');
                if (statusDot) {
                    statusDot.style.background = '#747f8d';
                }
                const activityDiv = document.getElementById('discord-activity-text');
                if (activityDiv) {
                    activityDiv.textContent = '';
                }
            }
        }, 3000);

        const disk = document.querySelector('.vinyl-disk');
        const songTitle = document.querySelector('.song-title');
        const songArtist = document.querySelector('.song-artist');
        const progressBar = document.querySelector('.progress');
        const timestamp = document.querySelector('.timestamp');
        const musicPlayer = document.querySelector('.music-player');
        const lastSongElement = document.querySelector('.last-song');
        
        function updateMusicInfo(title, artist, currentTime, duration, imageUrl = null) {
            songTitle.textContent = title;
            songArtist.textContent = artist;
            
            const current = Math.floor(currentTime / 1000);
            const total = Math.floor(duration / 1000);
            const progress = (currentTime / duration) * 100;
            
            progressBar.style.width = `${progress}%`;
            timestamp.textContent = `${formatTime(current)} / ${formatTime(total)}`;
        }

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        function checkTextOverflow() {
            const songTitle = document.querySelector('.song-title');
            const songArtist = document.querySelector('.song-artist');
            const titleWrapper = document.querySelector('.song-title-wrapper');
            const artistWrapper = document.querySelector('.song-artist-wrapper');

            if (songTitle && titleWrapper) {
                if (songTitle.offsetWidth > titleWrapper.offsetWidth) {
                    songTitle.classList.add('scroll');
                } else {
                    songTitle.classList.remove('scroll');
                }
            }

            if (songArtist && artistWrapper) {
                if (songArtist.offsetWidth > artistWrapper.offsetWidth) {
                    songArtist.classList.add('scroll');
                } else {
                    songArtist.classList.remove('scroll');
                }
            }
        }

        async function checkPlaybackStatus() {
            try {
                const response = await fetch('/.netlify/functions/spotify/current-playback');
                const data = await response.json();
                
                const musicPlayer = document.querySelector('.music-player');
                const songTitle = document.querySelector('.song-title');
                const songArtist = document.querySelector('.song-artist');
                const progressBar = document.querySelector('.progress');
                const timestamp = document.querySelector('.timestamp');
                const disk = document.querySelector('.vinyl-disk');
                
                if (!data || !data.item) {
                    songTitle.textContent = "No song playing";
                    songArtist.textContent = "";  
                    progressBar.style.width = '0';
                    timestamp.textContent = '0:00 / 0:00';
                    
                    const img = disk.querySelector('img') || document.createElement('img');
                    img.src = 'https://i.imgur.com/HmxbLzY.png';
                    img.alt = 'No music playing';
                    if (!disk.contains(img)) {
                        disk.insertBefore(img, disk.firstChild);
                    }
                    
                    disk.style.animationPlayState = 'running';

                    
                    if (lastPlayedSong && lastPlayedArtist) {
                        lastSongElement.textContent = `Last played: ${lastPlayedSong} - ${lastPlayedArtist}`;
                        lastSongElement.style.display = 'block';
                    }
                } else {
                    
                    lastPlayedSong = data.item.name;
                    lastPlayedArtist = data.item.artists[0].name;
                    
                    songTitle.textContent = data.item.name;
                    songArtist.textContent = data.item.artists[0].name;
                    lastSongElement.style.display = 'none';
                    
                    setTimeout(checkTextOverflow, 100);
                    
                    const progress = (data.progress_ms / data.item.duration_ms) * 100;
                    progressBar.style.width = `${progress}%`;
                    timestamp.textContent = `${formatTime(Math.floor(data.progress_ms / 1000))} / ${formatTime(Math.floor(data.item.duration_ms / 1000))}`;
                    
                    if (data.item.album?.images?.[0]?.url) {
                        const originalUrl = data.item.album.images[0].url;
                        const proxiedUrl = `/.netlify/functions/proxy-image?url=${encodeURIComponent(originalUrl)}`;
                        const img = disk.querySelector('img') || document.createElement('img');
                        img.src = proxiedUrl;
                        img.alt = 'Album art';
                        if (!disk.contains(img)) {
                            disk.insertBefore(img, disk.firstChild);
                        }
                        if (currentTheme === 'vinyl') {
                            if (img.complete) {
                                setVinylThemeFromImage(img);
                            } else {
                                img.onload = () => setVinylThemeFromImage(img);
                            }
                        }
                    }
                    
                    disk.style.animationPlayState = data.is_playing ? 'running' : 'paused';
                }

                if (data && data.is_playing) {
                    disk.classList.remove('paused');
                } else {
                    disk.classList.add('paused');
                }

                if (currentTheme === 'vinyl' && !data.item) {
                    document.body.style.removeProperty('--background');
                    document.body.style.removeProperty('--accent-color');
                }
            } catch (err) {
                console.error('Error:', err);
            }
        }

        checkPlaybackStatus();
        setInterval(checkPlaybackStatus, 1000);

        const resizeObserver = new ResizeObserver(() => {
            checkTextOverflow();
        });

        const titleWrapper = document.querySelector('.song-title-wrapper');
        const artistWrapper = document.querySelector('.song-artist-wrapper');
        if (titleWrapper) resizeObserver.observe(titleWrapper);
        if (artistWrapper) resizeObserver.observe(artistWrapper);

        const listenWithMeBtn = document.querySelector('.listen-with-me');
        listenWithMeBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/.netlify/functions/spotify/current-playback');
                const data = await response.json();
                if (!data || !data.item) {
                    alert('No song is currently playing!');
                    return;
                }
                const trackId = data.item.id;
                const progressMs = data.progress_ms || 0;
                // Since the spotify web player supports t=seconds for podcasts but not for songs, I'm going to use the URI for the song.
                // However, the Spotify URI can be opened at a specific time using the Spotify app with a deep link, although it's not reliable on web. I tried my best to make it work.
                const url = `https://open.spotify.com/track/${trackId}?si=listenwithme&t=${Math.floor(progressMs/1000)}`;
                window.open(url, '_blank');
            } catch (err) {
                alert('Could not get current song info.');
            }
        });

        const themes = ['gradient', 'light', 'dark', 'vinyl'];
        let currentTheme = localStorage.getItem('theme') || 'gradient';

        function applyTheme(theme) {
            document.body.classList.remove('theme-light', 'theme-dark', 'theme-vinyl');
            if (theme === 'light') document.body.classList.add('theme-light');
            else if (theme === 'dark') document.body.classList.add('theme-dark');
            else if (theme === 'vinyl') document.body.classList.add('theme-vinyl');
            else document.body.classList.remove('theme-light', 'theme-dark', 'theme-vinyl');
            if (theme !== 'vinyl') {
                document.body.style.removeProperty('--background');
                document.body.style.removeProperty('--accent-color');
            }
            localStorage.setItem('theme', theme);
        }

        applyTheme(currentTheme);

        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                let idx = themes.indexOf(currentTheme);
                currentTheme = themes[(idx + 1) % themes.length];
                applyTheme(currentTheme);
            });
        }

        function setVinylThemeFromImage(img) {
            if (window.ColorThief && img.complete) {
                try {
                    const colorThief = new ColorThief();
                    const rgb = colorThief.getColor(img);
                
                    document.body.style.setProperty('--background', `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
                   
                    document.body.style.setProperty('--accent-color', `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.8)`);
                } catch (e) {
              
                    document.body.style.removeProperty('--background');
                    document.body.style.removeProperty('--accent-color');
                }
            }
        }
    }); 
