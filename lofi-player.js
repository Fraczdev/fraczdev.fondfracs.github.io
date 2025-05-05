document.addEventListener('DOMContentLoaded', () => {
    const lofiPlayer = document.createElement('div');
    lofiPlayer.className = 'lofi-player';
    
    const lofiButton = document.createElement('button');
    lofiButton.className = 'lofi-button';
    lofiButton.innerHTML = '<i class="fas fa-music"></i>';
    
    lofiPlayer.appendChild(lofiButton);
    document.body.appendChild(lofiPlayer);

    const audio = new Audio('song1.mp3');
    audio.loop = true;
    
    let isPlaying = false;
    let vibrationInterval;

    function startVibration() {
        document.body.classList.add('vibrating');
    }

    function stopVibration() {
        document.body.classList.remove('vibrating');
    }

    lofiButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            lofiButton.classList.remove('playing');
            stopVibration();
        } else {
            audio.play();
            lofiButton.classList.add('playing');
            startVibration();
        }
        isPlaying = !isPlaying;
    });

    audio.addEventListener('ended', () => {
        lofiButton.classList.remove('playing');
        stopVibration();
        isPlaying = false;
    });
}); 
