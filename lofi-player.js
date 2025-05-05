document.addEventListener('DOMContentLoaded', () => {
    const lofiPlayer = document.createElement('div');
    lofiPlayer.className = 'lofi-player';
    
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

    const audio = new Audio('song1.mp3');
    audio.loop = true;
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    let isPlaying = false;
    let animationFrame;

    const elements = document.querySelectorAll('.glass-card, .info-card, .profile-image, .contact-icon, .skill-bar, .language-tag, .hobbies-icons li');

    function startVibe() {
        function updateVibe() {
            analyser.getByteFrequencyData(dataArray);
            
            const bassFreq = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
            const midFreq = dataArray.slice(10, 50).reduce((a, b) => a + b) / 40;
            
            elements.forEach((element, index) => {
                if (element.classList.contains('glass-card')) {
                    element.style.transform = `scale(${1 + (bassFreq / 10240)})`;
                } else if (element.classList.contains('info-card')) {
                    const rotation = (midFreq - 128) / 256;
                    element.style.transform = `scale(${1 + (bassFreq / 15360)}) rotate(${rotation}deg)`;
                } else if (element.classList.contains('profile-image')) {   
                    element.style.transform = `scale(${1 + (bassFreq / 20480)})`;
                } else if (element.classList.contains('contact-icon')) {
                    const bounce = Math.sin(Date.now() / 200) * (bassFreq / 5120);
                    element.style.transform = `translateY(${bounce}px)`;
                } else if (element.classList.contains('skill-bar')) {
                    const width = element.querySelector('.skill-level').style.width;
                    const baseWidth = parseFloat(width);
                    const pulse = (bassFreq / 10240);
                    element.querySelector('.skill-level').style.width = `${baseWidth * (1 + pulse)}%`;
                } else if (element.classList.contains('language-tag')) {
                    const float = Math.sin(Date.now() / 300 + index) * (bassFreq / 10240);
                    element.style.transform = `translateY(${float}px)`;
                } else if (element.classList.contains('hobbies-icons')) {
                    const rotation = Math.sin(Date.now() / 400 + index) * (midFreq / 5120);
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
            if (element.classList.contains('skill-bar')) {
                const baseWidth = element.getAttribute('data-original-width') || '100%';
                element.querySelector('.skill-level').style.width = baseWidth;
            }
        });
    }

    document.querySelectorAll('.skill-bar .skill-level').forEach(bar => {
        bar.setAttribute('data-original-width', bar.style.width);
    });

    lofiButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            lofiButton.classList.remove('playing');
            stopVibe();
        } else {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            audio.play();
            lofiButton.classList.add('playing');
            startVibe();
        }
        isPlaying = !isPlaying;
    });

    audio.addEventListener('ended', () => {
        lofiButton.classList.remove('playing');
        stopVibe();
        isPlaying = false;
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            audio.pause();
            stopVibe();
            lofiButton.classList.remove('playing');
            isPlaying = false;
        }
    });
}); 
