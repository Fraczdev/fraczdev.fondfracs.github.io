document.addEventListener('DOMContentLoaded', () => {
    const lofiPlayer = document.createElement('div');
    lofiPlayer.className = 'lofi-player';
    
    const nowPlaying = document.createElement('div');
    nowPlaying.className = 'now-playing-text';

    const nowPlayingInnerSpan = document.createElement('span');
    nowPlayingInnerSpan.textContent = 'Now Playing: None';
    nowPlaying.appendChild(nowPlayingInnerSpan);
    lofiPlayer.appendChild(nowPlaying);
    
    const lofiButton = document.createElement('button');
    lofiButton.className = 'lofi-button';
    lofiButton.innerHTML = '<i class="fas fa-music"></i>';
    
    lofiPlayer.appendChild(lofiButton);
    document.body.appendChild(lofiPlayer);

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const songs = [
        { file: 'song1.wav', title: 'Sogno Americano by Artie 5ive' },
        { file: 'song2.wav', title: 'FW/SS25 Freestyle by Artie 5ive' },
        { file: 'song3.wav', title: 'Fancy Clown by MF DOOM' }
    ];
    let currentSongIndex = 0;
    const audio = new Audio();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    let isPlaying = false;
    let animationFrame;

    const elements = document.querySelectorAll('.glass-card, .info-card, .profile-image, .contact-icon, .language-tag, .hobbies-icons li');
    
    function startVibe() {
        function updateVibe() {
            analyser.getByteFrequencyData(dataArray);
            
            const bassFreq = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
            const midFreq = dataArray.slice(10, 50).reduce((a, b) => a + b) / 40;
            
            elements.forEach((element, index) => {
                if (element.classList.contains('glass-card')) {
                    element.style.transform = `scale(${1 + (bassFreq / 4096)})`; 
                } else if (element.classList.contains('info-card')) {
                    const rotation = (midFreq - 128) / 64; 
                    element.style.transform = `scale(${1 + (bassFreq / 8192)}) rotate(${rotation}deg)`;
                } else if (element.classList.contains('profile-image')) {   
                    element.style.transform = `scale(${1 + (bassFreq / 8192)})`;
                } else if (element.classList.contains('contact-icon')) {
                    const bounce = Math.sin(Date.now() / 100) * (bassFreq / 2048); 
                    element.style.transform = `translateY(${bounce}px)`;
                } else if (element.classList.contains('language-tag')) {
                    const float = Math.sin(Date.now() / 150 + index) * (bassFreq / 4096); 
                    element.style.transform = `translateY(${float}px)`;
                } else if (element.classList.contains('hobbies-icons')) {
                    const rotation = Math.sin(Date.now() / 200 + index) * (midFreq / 2048); 
                    element.style.transform = `rotate(${rotation}deg)`;
                }
            });
            animationFrame = requestAnimationFrame(updateVibe);
        }
        
        updateVibe();
    }

    function stopVibe() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        
        elements.forEach(element => {
            element.style.transform = '';
        });
    }

    function checkNowPlayingTextOverflow() {
        if (nowPlayingInnerSpan && nowPlaying) {
            // Compare inner span's scrollWidth with container's clientWidth
            if (nowPlayingInnerSpan.scrollWidth > nowPlaying.clientWidth) {
                nowPlayingInnerSpan.classList.add('scroll');
            } else {
                nowPlayingInnerSpan.classList.remove('scroll');
            }
        }
    }

    function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        audio.src = songs[currentSongIndex].file;
        audio.load(); // Explicitly load the new song
        nowPlayingInnerSpan.textContent = `Now Playing: ${songs[currentSongIndex].title}`;
        checkNowPlayingTextOverflow(); // Check overflow when song changes
        if (isPlaying) {
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                isPlaying = false;
                lofiButton.classList.remove('playing');
                stopVibe();
                nowPlayingInnerSpan.textContent = 'Now Playing: None'; // Update inner span
            });
        }
    }

    lofiButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            lofiButton.classList.remove('playing');
            stopVibe();
            nowPlayingInnerSpan.textContent = 'Now Playing: None'; // Update inner span
            checkNowPlayingTextOverflow(); // Check overflow when stopped
        } else {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            audio.src = songs[currentSongIndex].file; // Set src here for initial play
            audio.load(); // Explicitly load the initial song
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                isPlaying = false;
                lofiButton.classList.remove('playing');
                stopVibe();
                nowPlayingInnerSpan.textContent = 'Now Playing: None'; // Update inner span
            });
            lofiButton.classList.add('playing');
            startVibe();
            nowPlayingInnerSpan.textContent = `Now Playing: ${songs[currentSongIndex].title}`;
            checkNowPlayingTextOverflow(); // Check overflow when playing
        }
        isPlaying = !isPlaying;
    });

    audio.addEventListener('ended', () => {
        playNextSong();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            audio.pause();
            stopVibe();
            lofiButton.classList.remove('playing');
            nowPlayingInnerSpan.textContent = 'Now Playing: None'; // Update inner span
            isPlaying = false;
        }
    });

    const resizeObserver = new ResizeObserver(() => {
        checkNowPlayingTextOverflow();
    });

    if (nowPlaying) {
        resizeObserver.observe(nowPlaying);
    }
});
