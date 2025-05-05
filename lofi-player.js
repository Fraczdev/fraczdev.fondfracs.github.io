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

    function startVibe() {
        function updateVibe() {
            analyser.getByteFrequencyData(dataArray);
            
            const bassFreq = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
            
            const midFreq = dataArray.slice(10, 50).reduce((a, b) => a + b) / 40;
            
            const highFreq = dataArray.slice(50).reduce((a, b) => a + b) / (bufferLength - 50);
            
                document.body.style.transform = `
                scale(${1 + (bassFreq / 5120)})
                rotate(${(midFreq - 128) / 128}deg)
            `;
            
            document.body.style.filter = `
                hue-rotate(${highFreq}deg)
                brightness(${1 + (bassFreq / 5120)})
            `;
            
            animationFrame = requestAnimationFrame(updateVibe);
        }
        
        updateVibe();
    }

    function stopVibe() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        document.body.style.transform = '';
        document.body.style.filter = '';
    }

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
