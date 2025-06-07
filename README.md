# PronunciAPP

Una aplicación web desarrollada en Angular para práctica de pronunciación en inglés utilizando tecnología de síntesis de voz con VALL-E-X.

## Descripción del Proyecto

PronunciAPP es una aplicación educativa que permite a los usuarios practicar su pronunciación en inglés. La aplicación graba la voz del usuario, la procesa utilizando un modelo de inteligencia artificial (VALL-E-X) y genera una versión mejorada de la pronunciación.

## Arquitectura del Proyecto

### Frontend (Angular 19.1.6)
- **Framework**: Angular con TypeScript
- **Estilo**: CSS personalizado con diseño responsivo
- **Iconos**: Font Awesome 6.5.1
- **Build**: Angular CLI con optimizaciones para producción

### Backend Integration
- **API**: Comunicación con backend VALL-E-X via HTTP
- **Endpoints**: `/api/infer_audio/` para procesamiento de audio
- **Formato**: Envío de archivos WAV y recepción de audio procesado

## Estructura de Componentes

### 1. AppComponent (`app.component.ts`)
Componente principal que estructura la aplicación:

**Funcionalidades:**
- Configura el layout general con sidebar y footer
- Implementa el fondo decorativo con patrón visual usando CSS
- Gestiona el router-outlet para navegación entre rutas
- Estructura de capas con z-index para el patrón de fondo

**Implementación técnica:**
```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
```

### 2. DashboardComponent (`dashboard.component.ts`)
Componente principal de la funcionalidad de pronunciación:

**Funcionalidades principales:**
- **Grabación de Audio**: Utiliza Web Audio API con AudioContext y ScriptProcessorNode
- **Procesamiento WAV**: Convierte audio a formato WAV usando wav-encoder
- **UI de Pasos**: Sistema visual de 2 pasos (grabar → formulario)
- **Gestión de Estado**: Múltiples estados (isRecording, isProcessing, showNameInput)
- **Validación**: Control de entrada de nombre de usuario obligatorio

**Características técnicas:**
- Uso de MediaStream API para acceso al micrófono
- Procesamiento en tiempo real con Float32Array chunks
- FormData para envío de archivos al backend
- Manejo de Blob URLs para reproducción de audio
- Indicadores visuales con CSS animations

**Propiedades principales:**
```typescript
isRecording: boolean = false;
isProcessing: boolean = false;
audioBlob: Blob | null = null;
audioUrl: string | null = null;
processedAudioUrl: string | null = null;
textOutput: string | null = null;
showNameInput: boolean = false;
userName: string = '';
```

**Métodos críticos:**
- `startRecording()`: Inicializa AudioContext y MediaStream
- `stopRecording()`: Termina grabación y genera archivo WAV
- `generateWavFile()`: Convierte chunks de audio a WAV
- `sendAudioToBackend()`: Envía audio y nombre al servicio

### 3. SidebarComponent (`sidebar.component.ts`)
Componente de navegación superior:

**Características:**
- Estructura de navbar responsive con CSS Grid
- Título "TG" (Trabajo de Grado)
- Contenedor flexible para contenido principal
- Sistema de navegación extensible para futuras funciones
- Diseño mobile-first con breakpoints CSS

**Implementación:**
```typescript
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule],
})
```

### 4. FooterComponent (`footer.component.ts`)
Pie de página informativo con enlaces institucionales:

**Elementos:**
- Logo institucional de la Universidad del Valle
- Enlaces directos a repositorios GitHub (Frontend y Backend)
- Información del desarrollador y código estudiantil
- Diseño responsive con CSS Flexbox
- Iconos Font Awesome para GitHub

**Estructura visual:**
- Layout horizontal en desktop, vertical en móvil
- Estilos hover para interactividad
- Enlaces externos con target="_blank" y rel="noopener"

## Servicios

### SendAudioService (`send-audio.service.ts`)
Servicio principal para comunicación con el backend:

**Interfaz de respuesta:**
```typescript
interface AudioInferenceResponse {
  text_output: string;
  audio_url: string;
  audio_data: string; // Base64 encoded audio data
  warning?: string;   // Campo opcional para advertencias
}
```

**Métodos principales:**
- **sendAudio()**: Envía archivo de audio y nombre de usuario al backend
- **createAudioFromBase64()**: Convierte datos base64 a objetos de audio reproducibles
- **testBackendConnection()**: Verifica conectividad con el backend
- **getFullAudioUrl()**: Construye URLs completas para recursos de audio

**Características técnicas:**
- Uso de FormData para envío de archivos
- Manejo completo de errores HTTP con catchError
- Logging detallado para debugging
- Soporte para diferentes entornos con environment
- Conversión de base64 a Blob URLs para reproducción

## Configuración del Proyecto

### Configuración Angular (`angular.json`)
El proyecto está configurado con Angular CLI para:
- **Output**: `dist/frontend-pronunci-app`
- **Build**: Configuración de producción con optimizaciones
- **Assets**: Archivos estáticos desde `public/`
- **Styles**: CSS global desde `src/styles.css`
- **Budgets**: Límites de tamaño para bundles (500kB warning, 1MB error)

### Configuración TypeScript (`tsconfig.json`)
- **Target**: ES2022 con módulos ES2022
- **Strict mode**: Habilitado para mayor seguridad de tipos
- **Experimental Decorators**: Para Angular decorators
- **Module Resolution**: Bundler para optimización

### Configuración de Aplicación (`app.config.ts`)
- **Zone Change Detection**: Con event coalescing
- **Router**: Configurado para lazy loading
- **HTTP Client**: Proveedor para servicios HTTP

### Rutas (`app.routes.ts`)
```typescript
export const routes: Routes = [
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)},
];
```

## Configuración de Entornos

### Desarrollo (`environment.development.ts`)
```typescript
apiUrl: 'http://localhost:8000'
```

### Producción (`environment.ts`)
```typescript
apiUrl: 'https://pronunciapp.me'
```

## Tecnologías Web Utilizadas

### Audio Processing
- **Web Audio API**: Para captura de audio del micrófono
- **ScriptProcessorNode**: Procesamiento de audio en tiempo real
- **wav-encoder**: Conversión a formato WAV
- **MediaStream API**: Gestión de streams de audio

### UI/UX
- **CSS Grid/Flexbox**: Layout responsivo
- **CSS Animations**: Indicadores visuales y transiciones
- **Font Awesome**: Iconografía
- **Custom CSS**: Diseño personalizado sin frameworks externos

## Despliegue y Containerización

### Docker
El proyecto incluye configuración completa para despliegue:
- **Dockerfile**: Build multi-stage para optimización
- **nginx.conf**: Configuración de proxy inverso con SSL
- **Certificados SSL**: Soporte para HTTPS

### Características del Despliegue
- Redirección automática HTTP → HTTPS
- Proxy para API backend
- Servicio de archivos estáticos optimizado
- Configuración de CORS y headers de seguridad

## Testing

### Unit Tests
- **Jasmine**: Framework de testing
- **Karma**: Test runner
- Cobertura de componentes principales
- Tests de servicios con HttpClientTestingModule

### Archivos de Test
- `app.component.spec.ts`
- `dashboard.component.spec.ts`
- `footer.component.spec.ts`
- `sidebar.component.spec.ts`
- `send-audio.service.spec.ts`

## Desarrollo

### Servidor de Desarrollo
```bash
ng serve
```
La aplicación estará disponible en `http://localhost:4200/`

### Build de Producción
```bash
ng build
```
Los archivos se generan en `dist/frontend-pronunci-app/`

### Ejecutar Tests
```bash
ng test
```

### Build con Docker
```bash
docker build -t pronunciapp .
```

## Características Técnicas Avanzadas

### Responsive Design
- Diseño adaptativo para dispositivos móviles
- Breakpoints optimizados para diferentes tamaños de pantalla
- Navegación touch-friendly

### Performance
- Lazy loading de componentes
- Optimizaciones de bundle size
- Compresión de assets
- Service Worker ready

### Accessibility
- Navegación por teclado
- ARIA labels
- Indicadores visuales claros
- Contraste de colores optimizado

## Integración con Backend

La aplicación se integra con un backend basado en VALL-E-X que proporciona:
- Procesamiento de audio con IA
- Síntesis de voz mejorada
- API REST para comunicación
- Documentación Swagger en `/docs`

## Autor

**DANIEL FELIPE CASALLAS ORTIZ** - 2059974  
Universidad del Valle, sede Tuluá

## Repositorios

- **Frontend**: [https://github.com/casariz/frontend-PronunciAPP](https://github.com/casariz/frontend-PronunciAPP)
- **Backend**: [https://github.com/casariz/VALL-E-X](https://github.com/casariz/VALL-E-X)
