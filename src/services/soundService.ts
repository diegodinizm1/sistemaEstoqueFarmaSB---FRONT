

// Usamos um objeto para pré-carregar os sons e evitar criar um novo objeto Audio a cada chamada.
const sounds = {
    success: new Audio('/sounds/success.mp3'),
    error: new Audio('/sounds/error.mp3'),
    notification: new Audio('/sounds/notification.mp3'),
};

// Define o volume (opcional, 0.5 = 50% do volume)
sounds.success.volume = 0.5;
sounds.error.volume = 0.5;
sounds.notification.volume = 0.5;


const playSound = (sound: HTMLAudioElement) => {
    // Para o som caso ele já esteja tocando, e o reinicia do começo
    sound.currentTime = 0;
    sound.play().catch(error => {
        // Navegadores modernos podem bloquear a reprodução automática de áudio.
        // O áudio geralmente só é permitido após uma interação do usuário (clique, etc).
        // Este catch evita que um erro de bloqueio quebre a aplicação.
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