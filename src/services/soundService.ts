const sounds = {
    success: new Audio('/sounds/success.mp3'),
    error: new Audio('/sounds/error.mp3'),
    notification: new Audio('/sounds/notification.mp3'),
};

sounds.success.volume = 0.5;
sounds.error.volume = 0.5;
sounds.notification.volume = 0.5;


const playSound = (sound: HTMLAudioElement) => {
    sound.currentTime = 0;
    sound.play().catch(error => {
        console.error("Erro ao tocar o som:", error);
    });
};

export const soundService = {
    playSuccess: () => {
        playSound(sounds.success);
    },
    playError: () => {
        playSound(sounds.error);
    },
    playNotification: () => {
        playSound(sounds.notification);
    },
};