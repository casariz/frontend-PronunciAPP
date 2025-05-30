import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'frontend-PronunciAPP' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('frontend-PronunciAPP');
  });

  // Eliminar o comentar esta prueba porque 'PronunciAPP' no aparece en el DOM principal
  // it('should render app title somewhere in the DOM', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.nativeElement as HTMLElement;
  //   expect(compiled.textContent).toContain('PronunciAPP');
  // });

  it('should render sidebar or footer content in the DOM', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('TG');
    expect(compiled.textContent).toContain('Universidad del Valle');
  });

  // Eliminar o comentar esta prueba porque 'onButtonClick' no existe en AppComponent
  // it('should call a method when button is clicked', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   spyOn(app, 'onButtonClick'); // Cambia 'onButtonClick' por el método real
  //   fixture.detectChanges();
  //   const button = fixture.nativeElement.querySelector('button');
  //   if (button) {
  //     button.click();
  //     expect(app.onButtonClick).toHaveBeenCalled();
  //   }
  // });
});
