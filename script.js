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

    let playlistTracks = [];
    let currentTrackIndex = 0;
    let isPlayingSpotifyPlaylist = false;

    
    async function fetchPlaylistTracks() {
        try {
            const response = await fetch('/.netlify/functions/spotify/playlist-tracks');
            const data = await response.json();
            playlistTracks = data.items.map(item => ({
                name: item.track.name,
                artist: item.track.artists[0].name,
                duration: item.track.duration_ms,
                album: item.track.album
            }));
            console.log('Playlist tracks loaded:', playlistTracks);
        } catch (err) {
            console.error('Error fetching playlist:', err);
        }
    }

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

    const volumeSlider = document.getElementById('volume-slider');
    const sliderProgress = document.querySelector('.slider-progress');
    let volumeTimeout;

    function updateSliderProgress(value) {
        sliderProgress.style.width = `${value}%`;
    }

    volumeSlider.addEventListener('input', (e) => {
        const volume = parseInt(e.target.value);
        updateSliderProgress(volume);
        
        const volumeIcon = document.querySelector('.volume-control i');
        if (volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 50) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
        
        clearTimeout(volumeTimeout);
        volumeTimeout = setTimeout(async () => {
            try {
                await fetch('/.netlify/functions/spotify/set-volume', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ volume })
                });
            } catch (err) {
                console.error('Error setting volume:', err);
            }
        }, 200);
    });

    async function checkPlaybackStatus() {
        try {
            const response = await fetch('/.netlify/functions/spotify/current-playback');
            const data = await response.json();
            console.log('Full playback data:', data);
            
            const disk = document.querySelector('.vinyl-disk');
            
            if (data && data.item) {
                console.log('Album images:', data.item.album?.images);
                
                if (data.item.album?.images?.[0]?.url) {
                    const img = disk.querySelector('img') || document.createElement('img');
                    img.src = data.item.album.images[0].url;
                    img.alt = 'Album art';
                    if (!disk.contains(img)) {
                        disk.insertBefore(img, disk.firstChild);
                    }
                    console.log('Updated image src to:', img.src);
                }

                disk.style.animationPlayState = data.is_playing ? 'running' : 'paused';
            }
        } catch (err) {
            console.error('Full error:', err);
        }
    }

    fetchPlaylistTracks();
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

    document.querySelector('.vinyl-disk').addEventListener('click', async () => {
        try {
            await fetch('/.netlify/functions/spotify/toggle-playback', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (err) {
            console.error('Error toggling playback:', err);
        }
    });

    animate();

    window.onSpotifyWebPlaybackSDKReady = () => {
        const token = 'YOUR_ACCESS_TOKEN'; // We'll get this from our backend
        const player = new Spotify.Player({
            name: 'Fracz\'s Portfolio Player',
            getOAuthToken: cb => { 
                fetch('/.netlify/functions/spotify/get-token')
                    .then(response => response.json())
                    .then(data => cb(data.access_token));
            }
        });

        // Error handling
        player.addListener('initialization_error', ({ message }) => { console.error(message); });
        player.addListener('authentication_error', ({ message }) => { console.error(message); });
        player.addListener('account_error', ({ message }) => { console.error(message); });
        player.addListener('playback_error', ({ message }) => { console.error(message); });

        // Playback status updates
        player.addListener('player_state_changed', state => {
            if (state) {
                updatePlayerState(state);
            }
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            // Transfer playback to our player
            fetch('/.netlify/functions/spotify/transfer-playback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ device_id })
            });
        });

        // Connect to the player!
        player.connect();
    };
}); 
