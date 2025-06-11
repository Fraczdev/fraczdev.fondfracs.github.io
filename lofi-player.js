document.addEventListener('DOMContentLoaded', () => {
    const lofiPlayer = document.createElement('div');
    lofiPlayer.className = 'lofi-player';
    
    const nowPlaying = document.createElement('div');
    nowPlaying.className = 'now-playing-text';
    nowPlaying.textContent = 'Now Playing: None';
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
    
    // Store original skill bar widths
    const skillBars = new Map();
    document.querySelectorAll('.skill').forEach(skill => {
        const skillName = skill.querySelector('span').textContent;
        const skillLevel = skill.querySelector('.skill-level');
        if (skillLevel) {
            skillBars.set(skillName, skillLevel.style.width);
        }
    });

    function startVibe() {
        function updateVibe() {
            analyser.getByteFrequencyData(dataArray);
            
            const bassFreq = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
            const midFreq = dataArray.slice(10, 50).reduce((a, b) => a + b) / 40;
            
            elements.forEach((element, index) => {
                if (element.classList.contains('glass-card')) {
                    element.style.transform = `scale(${1 + (bassFreq / 1024)})`; 
                } else if (element.classList.contains('info-card')) {
                    const rotation = (midFreq - 128) / 64; 
                    element.style.transform = `scale(${1 + (bassFreq / 2048)}) rotate(${rotation}deg)`;
                } else if (element.classList.contains('profile-image')) {   
                    element.style.transform = `scale(${1 + (bassFreq / 2048)})`;
                } else if (element.classList.contains('contact-icon')) {
                    const bounce = Math.sin(Date.now() / 100) * (bassFreq / 512); 
                    element.style.transform = `translateY(${bounce}px)`;
                } else if (element.classList.contains('language-tag')) {
                    const float = Math.sin(Date.now() / 150 + index) * (bassFreq / 1024); 
                    element.style.transform = `translateY(${float}px)`;
                } else if (element.classList.contains('hobbies-icons')) {
                    const rotation = Math.sin(Date.now() / 200 + index) * (midFreq / 512); 
                    element.style.transform = `rotate(${rotation}deg)`;
                }
            });

            // Restore original skill bar widths
            skillBars.forEach((originalWidth, skillName) => {
                const skill = Array.from(document.querySelectorAll('.skill')).find(s => 
                    s.querySelector('span').textContent === skillName
                );
                if (skill) {
                    const skillLevel = skill.querySelector('.skill-level');
                    if (skillLevel) {
                        skillLevel.style.width = originalWidth;
                    }
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
       
        // Restore original skill bar widths
        skillBars.forEach((originalWidth, skillName) => {
            const skill = Array.from(document.querySelectorAll('.skill')).find(s => 
                s.querySelector('span').textContent === skillName
            );
            if (skill) {
                const skillLevel = skill.querySelector('.skill-level');
                if (skillLevel) {
                    skillLevel.style.width = originalWidth;
                }
            }
        });
    }

    function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        audio.src = songs[currentSongIndex].file;
        audio.load();
        nowPlaying.textContent = `Now Playing: ${songs[currentSongIndex].title}`;
        if (isPlaying) {
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                isPlaying = false;
                lofiButton.classList.remove('playing');
                stopVibe();
                nowPlaying.textContent = 'Now Playing: None';
            });
        }
    }

    lofiButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            lofiButton.classList.remove('playing');
            stopVibe();
            nowPlaying.textContent = 'Now Playing: None';
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
                nowPlaying.textContent = 'Now Playing: None';
            });
            lofiButton.classList.add('playing');
            startVibe();
            nowPlaying.textContent = `Now Playing: ${songs[currentSongIndex].title}`;
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
            nowPlaying.textContent = 'Now Playing: None';
            isPlaying = false;
        }
    });
});
