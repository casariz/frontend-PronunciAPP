import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AudioInferenceResponse {
  text_output: string;
  audio_url: string;
  audio_data: string; // Base64 encoded audio data
}

@Injectable({
  providedIn: 'root'
})
export class SendAudioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sendAudio(audioBlob: Blob): Observable<AudioInferenceResponse> {
    console.log('SendAudioService: Preparing to send audio to:', `${this.apiUrl}/infer_audio/`);
    
    const formData = new FormData();
    formData.append('upload_audio_prompt', audioBlob, 'recording.wav');
    
    // Log the form data for debugging
    console.log('SendAudioService: FormData created with audio blob size:', audioBlob.size, 'bytes');
    
    // Adding headers for debugging
    const headers = new HttpHeaders({
      // No custom headers needed as CORS is handled on the server side
    });

    return this.http.post<AudioInferenceResponse>(
      `${this.apiUrl}/infer_audio/`, 
      formData,
      { headers: headers }
    ).pipe(
      tap(response => {
        console.log('SendAudioService: Successfully received response');
        console.log('SendAudioService: Text output length:', response.text_output?.length);
        console.log('SendAudioService: Audio URL:', response.audio_url);
        console.log('SendAudioService: Base64 audio data available:', !!response.audio_data);
      }),
      catchError(this.handleError)
    );
  }

  // Creates an audio URL from base64 data
  createAudioFromBase64(base64Data: string): string {
    try {
      // Convert base64 string to binary data
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create a blob from the binary data
      const blob = new Blob([bytes.buffer], { type: 'audio/wav' });
      
      // Create a URL from the blob
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('SendAudioService: Error creating audio from base64:', error);
      return '';
    }
  }

  // Test backend connection
  testBackendConnection(): Observable<any> {
    console.log('SendAudioService: Testing backend connection to:', this.apiUrl);
    
    return this.http.get(`${this.apiUrl}/docs`, { 
      responseType: 'text'
    }).pipe(
      tap(response => {
        console.log('SendAudioService: Backend connection successful');
      }),
      catchError(this.handleError)
    );
  }

  getFullAudioUrl(audioPath: string): string {
    // If the path already includes the full URL, return it as is
    if (audioPath.startsWith('http') || audioPath.startsWith('blob:')) {
      return audioPath;
    }
    // Otherwise, prepend the API URL
    return `${this.apiUrl}${audioPath}`;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('SendAudioService Error:', error);

    if (error.status === 0) {
      console.error('SendAudioService: Network error occurred. This is likely a CORS issue or the server is not running.');
      console.error('SendAudioService: Check if your FastAPI backend has CORS enabled with:');
      console.error('from fastapi.middleware.cors import CORSMiddleware');
      console.error('app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:4200"], allow_methods=["*"], allow_headers=["*"])');
    } else {
      console.error(`SendAudioService: Backend returned error code ${error.status}, body:`, error.error);
    }

    return throwError(() => new Error(`SendAudioService: ${error.message || 'Error connecting to server. See console for details.'}`));
  }
}
