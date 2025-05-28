import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import * as WavEncoder from 'wav-encoder';
import { SendAudioService } from '../../services/send-audio.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule], // Agregar FormsModule aquí
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  isRecording = false;
  isProcessing = false;
  audioBlob: Blob | null = null;
  audioUrl: string | null = null;
  processedAudioUrl: string | null = null;
  textOutput: string | null = null;
  errorMessage: string | null = null;
  warningMessage: string | null = null; // <-- Añadido para mostrar advertencias

  showNameInput = false; // Nuevo: para controlar la visibilidad del input de nombre
  userName: string = ''; // Nuevo: para almacenar el nombre del usuario

  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioChunks: Float32Array[] = [];
  private scriptProcessor: ScriptProcessorNode | null = null;

  constructor(private sendAudioService: SendAudioService) {}

  private sendAudioToBackend() {
    if (!this.audioBlob) return;
    
    this.isProcessing = true;
    this.errorMessage = null;
    this.warningMessage = null; // Limpiar advertencia previa
    
    console.log('Dashboard: Sending audio to backend, blob size:', this.audioBlob.size, 'bytes');
    console.log('Dashboard: User name:', this.userName); // Log del nombre de usuario
    console.log('Dashboard: Using API URL:', this.sendAudioService['apiUrl']);
    
    this.sendAudioService.sendAudio(this.audioBlob, this.userName).subscribe({ // Pasar this.userName aquí
      next: (response) => {
        console.log('Dashboard: Successfully received response from backend');
        
        // Process the text output to extract content between [EN] tags
        this.textOutput = this.extractTextBetweenTags(response.text_output);
        
        // First try to use the base64 audio data if available
        if (response.audio_data) {
          console.log('Dashboard: Using base64 audio data');
          this.processedAudioUrl = this.sendAudioService.createAudioFromBase64(response.audio_data);
        } else {
          // Fallback to the URL if base64 data is not available
          console.log('Dashboard: Using audio URL from server');
          this.processedAudioUrl = this.sendAudioService.getFullAudioUrl(response.audio_url);
        }
        
        // Procesar advertencia si existe
        if (response.warning) {
          this.warningMessage = response.warning;
        } else {
          this.warningMessage = null;
        }
        
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Dashboard: Error sending audio to the backend:', error);
        
        // More specific error messages based on the error
        if (error.message && error.message.includes('CORS')) {
          this.errorMessage = 'Error de CORS: El servidor no permite solicitudes desde esta aplicación. Verifica la configuración CORS en el backend.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en ' + 
            this.sendAudioService['apiUrl'];
        } else {
          this.errorMessage = 'Ocurrió un error al procesar el audio: ' + (error.message || 'Error desconocido');
        }
        
        this.isProcessing = false;
      }
    });
  }

  // Helper method to extract text between [EN] tags
  private extractTextBetweenTags(text: string): string {
    if (!text) return '';
    
    const regex = /\[EN\](.*?)\[EN\]/;
    const match = text.match(regex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // If no match found, return the original text
    return text;
  }

  // Add a method to test the backend connection directly
  testBackendConnection() {
    this.errorMessage = null;
    console.log('Dashboard: Testing backend connection...');
    
    this.sendAudioService.testBackendConnection().subscribe({
      next: (response) => {
        console.log('Dashboard: Backend connection test successful:', response);
        alert('¡Conexión exitosa al backend!');
      },
      error: (error) => {
        console.error('Dashboard: Backend connection test failed:', error);
        this.errorMessage = 'No se pudo conectar con el backend. Verifica la consola para más detalles.';
      }
    });
  }

  downloadRecording() {
    if (!this.audioBlob) return;
    
    const url = URL.createObjectURL(this.audioBlob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = 'grabacion.wav';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Add a method for clearing audio data when starting a new recording
  resetAudioData() {
    this.audioBlob = null;
    this.audioUrl = null;
    this.processedAudioUrl = null;
    this.textOutput = null;
    this.errorMessage = null;
    this.warningMessage = null; // Limpiar advertencia al resetear
    // No reseteamos userName aquí, podría querer usar el mismo nombre para otra grabación
  }

  async startRecording() {
    if (this.isRecording) {
      this.stopRecording();
      return;
    }
    // En lugar de iniciar la grabación directamente, mostramos el input para el nombre
    this.showNameInput = true;
  }

  cancelNameInput() {
    this.showNameInput = false;
    // Opcionalmente, resetear userName si se cancela:
    // this.userName = ''; 
  }

  async confirmAndStartRecording() {
    if (!this.userName || this.userName.trim() === '') {
      alert('Por favor, digita tu nombre para continuar.');
      return;
    }
    this.showNameInput = false;

    // Lógica original de startRecording movida aquí
    this.resetAudioData();
    
    if (this.isRecording) { // Doble chequeo, aunque startRecording ya lo hace
      this.stopRecording();
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.audioChunks = [];

      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isRecording) return;
        const channelData = event.inputBuffer.getChannelData(0);
        this.audioChunks.push(new Float32Array(channelData));
      };

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);
      this.isRecording = true;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  }

  stopRecording() {
    if (!this.isRecording) return;
    
    this.isRecording = false;
    
    // Detener componentes de audio
    this.scriptProcessor?.disconnect();
    this.mediaStream?.getTracks().forEach(track => track.stop());
    
    // Generar archivo WAV y enviar al backend
    this.generateWavFile();
  }

  private async generateWavFile() {
    if (!this.audioContext || this.audioChunks.length === 0) return;

    const mergedChunks = this.mergeAudioChunks();
    const audioData: WavEncoder.AudioData = {
      sampleRate: this.audioContext.sampleRate,
      channelData: [mergedChunks]
    };

    try {
      const wavBuffer = await WavEncoder.encode(audioData);
      this.audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      this.audioUrl = URL.createObjectURL(this.audioBlob);
      
      // Send the audio to the backend automatically
      this.sendAudioToBackend();
    } catch (error) {
      console.error('Error generating WAV:', error);
    }
  }

  private mergeAudioChunks(): Float32Array {
    const length = this.audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Float32Array(length);
    let offset = 0;
    
    for (const chunk of this.audioChunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result;
  }

  // Update the downloadProcessedAudio method to handle blob URLs
  downloadProcessedAudio() {
    if (!this.processedAudioUrl) return;
    
    // If it's a blob URL, we can use it directly
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = this.processedAudioUrl;
    a.download = 'audio_procesado.wav';
    a.click();
    
    // Only revoke the URL if it's a blob URL we created (not a server URL)
    if (this.processedAudioUrl.startsWith('blob:')) {
      window.URL.revokeObjectURL(this.processedAudioUrl);
    }
  }

  abrirFormulario() {
    window.open('https://forms.gle/VL6d1MnbriaJntiE9', '_blank', 'noopener');
  }
}