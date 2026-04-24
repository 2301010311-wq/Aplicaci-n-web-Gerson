// Utilidad para reproducir sonidos de alerta
export const playNotificationSound = () => {
  try {
    // Crear un AudioContext para reproducir sonido
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Crear un oscilador para un sonido de alerta (beep)
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Configurar el sonido (frecuencia, duración, volumen)
    oscillator.frequency.value = 1000 // Hz
    oscillator.type = 'sine'
    
    // Crear una secuencia de beeps
    const now = audioContext.currentTime
    
    // Primer beep
    gainNode.gain.setValueAtTime(0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
    oscillator.start(now)
    oscillator.stop(now + 0.1)
    
    // Segundo beep
    const osc2 = audioContext.createOscillator()
    osc2.connect(gainNode)
    osc2.frequency.value = 1200
    osc2.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, now + 0.15)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.25)
    
    // Tercer beep
    const osc3 = audioContext.createOscillator()
    osc3.connect(gainNode)
    osc3.frequency.value = 1400
    osc3.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, now + 0.3)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
    osc3.start(now + 0.3)
    osc3.stop(now + 0.4)
  } catch (error) {
    console.error("Error reproduciendo sonido:", error)
  }
}

// Función para reproducir sonido de alarma más fuerte
export const playAlarmSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'square'
    
    const now = audioContext.currentTime
    
    // Secuencia de alarma más fuerte
    for (let i = 0; i < 3; i++) {
      const startTime = now + i * 0.3
      gainNode.gain.setValueAtTime(0.4, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)
      
      const osc = audioContext.createOscillator()
      osc.connect(gainNode)
      osc.frequency.value = 800 + i * 200
      osc.type = 'square'
      osc.start(startTime)
      osc.stop(startTime + 0.15)
    }
  } catch (error) {
    console.error("Error reproduciendo alarma:", error)
  }
}
