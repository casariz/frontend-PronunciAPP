import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SendAudioService, AudioInferenceResponse } from './send-audio.service';
import { environment } from '../../environments/environment';

describe('SendAudioService', () => {
  let service: SendAudioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SendAudioService]
    });
    service = TestBed.inject(SendAudioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send audio and receive response', () => {
    const dummyResponse: AudioInferenceResponse = {
      text_output: 'test',
      audio_url: '/audio/test.wav',
      audio_data: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
    };
    const blob = new Blob(['test'], { type: 'audio/wav' });
    const userName = 'testuser';

    service.sendAudio(blob, userName).subscribe(res => {
      expect(res.text_output).toBe('test');
      expect(res.audio_url).toBe('/audio/test.wav');
      expect(res.audio_data).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/infer_audio/`);
    expect(req.request.method).toBe('POST');
    req.flush(dummyResponse);
  });

  it('should create audio URL from base64', () => {
    const base64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    const url = service.createAudioFromBase64(base64);
    expect(url.startsWith('blob:')).toBeTrue();
  });

  it('should test backend connection', () => {
    service.testBackendConnection().subscribe(res => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/docs`);
    expect(req.request.method).toBe('GET');
    req.flush('ok');
  });

  it('should get full audio url', () => {
    const path = '/audio/test.wav';
    const fullUrl = service.getFullAudioUrl(path);
    expect(fullUrl).toBe(`${environment.apiUrl}/audio/test.wav`);
    const alreadyFull = service.getFullAudioUrl('http://example.com/audio.wav');
    expect(alreadyFull).toBe('http://example.com/audio.wav');
  });
});
