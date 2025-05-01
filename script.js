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
        const audio = document.getElementById('player');
        const waveform = document.getElementById('waveform');
        const songTitle = document.querySelector('.song-title');
        const songArtist = document.querySelector('.song-artist');
        const progressBar = document.querySelector('.progress');
        const timestamp = document.querySelector('.timestamp');
        const musicPlayer = document.querySelector('.music-player');

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

        async function checkPlaybackStatus() {
            try {
                const response = await fetch('/.netlify/functions/spotify/current-playback');
                const data = await response.json();
                console.log('Full playback data:', data);
                
                const songTitle = document.querySelector('.song-title');
                const songArtist = document.querySelector('.song-artist');
                const progressBar = document.querySelector('.progress');
                const timestamp = document.querySelector('.timestamp');
                const disk = document.querySelector('.vinyl-disk');
                const musicPlayer = document.querySelector('.music-player');
                
                if (data && data.item) {
                    musicPlayer.classList.remove('no-music');
                    songTitle.textContent = data.item.name;
                    songArtist.textContent = data.item.artists[0].name;
                    
                    const progress = (data.progress_ms / data.item.duration_ms) * 100;
                    progressBar.style.width = `${progress}%`;
                    timestamp.textContent = `${formatTime(Math.floor(data.progress_ms / 1000))} / ${formatTime(Math.floor(data.item.duration_ms / 1000))}`;
                    
                    const listenButton = document.querySelector('.listen-with-me');
                    if (listenButton) {
                        listenButton.style.display = 'inline-block';
                        listenButton.onclick = () => {
                            if (data.item.external_urls?.spotify) {
                                const timestampInSeconds = Math.floor(data.progress_ms / 1000);
                                const spotifyUrl = `${data.item.external_urls.spotify}#t=${timestampInSeconds}`;
                                window.open(spotifyUrl, '_blank');
                            }
                        };
                    }
                    
                    if (data.item.album?.images?.[0]?.url) {
                        const img = disk.querySelector('img') || document.createElement('img');
                        img.src = data.item.album.images[0].url;
                        img.alt = 'Album art';
                        if (!disk.contains(img)) {
                            disk.insertBefore(img, disk.firstChild);
                        }
                    }
                    
                    disk.style.animationPlayState = data.is_playing ? 'running' : 'paused';
                } else {
                    musicPlayer.classList.add('no-music');
                    songTitle.textContent = '';
                    songArtist.textContent = '';
                    progressBar.style.width = '0';
                    timestamp.textContent = '0:00 / 0:00';
                    
                    const img = disk.querySelector('img') || document.createElement('img');
                    img.src = 'https://i.imgur.com/bZkhX1Z.png';
                    img.alt = 'No music playing';
                    if (!disk.contains(img)) {
                        disk.insertBefore(img, disk.firstChild);
                    }
                    
                    disk.style.animationPlayState = 'paused';
                }

                if (data && data.is_playing) {
                    disk.classList.remove('paused');
                } else {
                    disk.classList.add('paused');
                }
            } catch (err) {
                console.error('Error:', err);
                const musicPlayer = document.querySelector('.music-player');
                musicPlayer.classList.add('no-music');
            }
        }

        setInterval(checkPlaybackStatus, 1000);

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const numBars = 60;
        const bars = [];

        for (let i = 0; i < numBars; i++) {
            const bar = document.createElement('div');
            bar.className = 'waveform-bar';
            bar.style.left = `${(i / numBars) * 100}%`;
            bar.style.transform = `rotate(${(i / numBars) * 360}deg)`;
            waveform.appendChild(bar);
            bars.push(bar);
        }

        function animate() {
            requestAnimationFrame(animate);
            analyser.getByteFrequencyData(dataArray);
            
            bars.forEach((bar, i) => {
                const dataIndex = Math.floor((i / numBars) * bufferLength);
                const height = (dataArray[dataIndex] / 255) * 100;
                bar.style.height = `${height}%`;
            });

            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            const vibration = (average / 255) * 5;
            glassCard.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale(${1 + vibration * 0.01})`;
        }

        animate();
    }); 
