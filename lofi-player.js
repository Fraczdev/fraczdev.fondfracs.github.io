document.addEventListener('DOMContentLoaded', () => {
    const lofiPlayer = document.createElement('div');
    lofiPlayer.className = 'lofi-player';


    const nowPlaying = document.createElement('div');
    nowPlaying.className = 'lofi-bubble now-playing-text';

    const nowPlayingTextContent = document.createElement('span');
    nowPlayingTextContent.textContent = 'Now Playing: None';
    nowPlaying.appendChild(nowPlayingTextContent);
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
                    element.style.transform = `scale(${0.98 + (bassFreq / 1500)})`;
                } else if (element.classList.contains('info-card')) {
                    const rotation = (midFreq - 128) / 32;
                    element.style.transform = `scale(${0.98 + (bassFreq / 3000)}) rotate(${rotation}deg)`;
                } else if (element.classList.contains('profile-image')) {   
                    element.style.transform = `scale(${0.98 + (bassFreq / 3000)})`;
                } else if (element.classList.contains('contact-icon')) {
                    const bounce = Math.sin(Date.now() / 100) * (bassFreq / 1024);
                    element.style.transform = `translateY(${bounce}px)`;
                } else if (element.classList.contains('language-tag')) {
                    const float = Math.sin(Date.now() / 150 + index) * (bassFreq / 2048);
                    element.style.transform = `translateY(${float}px)`;
                } else if (element.classList.contains('hobbies-icons')) {
                    const rotation = Math.sin(Date.now() / 200 + index) * (midFreq / 1024);
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
        if (nowPlayingTextContent && nowPlaying) {
            if (nowPlayingTextContent.scrollWidth > nowPlaying.clientWidth) {
                nowPlayingTextContent.classList.add('scroll');
            } else {
                nowPlayingTextContent.classList.remove('scroll');
            }
        }
    }

    function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        audio.src = songs[currentSongIndex].file;
        audio.load(); 
        nowPlayingTextContent.textContent = `Now Playing: ${songs[currentSongIndex].title}`;
        checkNowPlayingTextOverflow(); 
        if (isPlaying) {
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                isPlaying = false;
                lofiButton.classList.remove('playing');
                stopVibe();
                nowPlayingTextContent.textContent = 'Now Playing: None';
            });
        }
    }

    lofiButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            lofiButton.classList.remove('playing');
            stopVibe();
            nowPlayingTextContent.textContent = 'Now Playing: None'; 
            checkNowPlayingTextOverflow(); 
        } else {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            audio.src = songs[currentSongIndex].file; 
            audio.load(); 
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                isPlaying = false;
                lofiButton.classList.remove('playing');
                stopVibe();
                nowPlayingTextContent.textContent = 'Now Playing: None'; 
            });
            lofiButton.classList.add('playing');
            startVibe();
            nowPlayingTextContent.textContent = `Now Playing: ${songs[currentSongIndex].title}`;
            checkNowPlayingTextOverflow(); 
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
            nowPlayingTextContent.textContent = 'Now Playing: None'; 
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
