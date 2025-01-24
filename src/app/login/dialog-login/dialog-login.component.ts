import { Component, EventEmitter, inject, Output } from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-dialog-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dialog-login.component.html',
  styleUrl: './dialog-login.component.scss'
})
export class DialogLoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  errorMessage : string |null = null;
  form = this.fb.nonNullable.group({
    email:['', Validators.required],
    password:['', Validators.required]
  })
  @Output() switchToForgotPassword = new EventEmitter<void>(); // EventEmitter erstellen

  onSubmit(){
    const rawForm = this.form.getRawValue();
    this.authService.login(rawForm.email, rawForm.password)
    .subscribe({
      next:async ()=>{
        this.router.navigateByUrl('main');
      },
      error:(err)=>{
        this.errorMessage = err.code
        console.error('Could not find User');
      }
      
    })
  }
  loginWithGoogle() {
    this.authService.googleSignin()
    .then(() => {
      console.log('Anmeldung erfolgreich');
      // Nach erfolgreicher Anmeldung weiterleiten
      this.router.navigateByUrl('main');
    })
      .catch((error) => console.error('Anmeldung fehlgeschlagen:', error));
      this.router.navigateByUrl('main');
  }
  goToForgotPassword(){
    this.switchToForgotPassword.emit(); // Ereignis auslösen
  }
  visitorLogin(){
    this.authService.login("rabia1234@gmx.de", "Test1234")
    .subscribe({
      next:async ()=>{
        this.router.navigateByUrl('main');
      },
      error:(err)=>{
        this.errorMessage = err.code
        if(this.errorMessage =="auth/invalid-email"){
          this.errorMessage = "Bitte geben Sie eine E-Mail ein"
        }
        if(this.errorMessage =="auth/missing-password"){
          this.errorMessage = "Bitte geben Sie ein Passwort ein"
        }
        if(this.errorMessage =="auth/invalid-credential"){
          this.errorMessage = "Leider ist das Passwort falsch"
        }else{
          this.errorMessage="unbekannter Fehler"
        }

        console.error('Could not find User');
      }
  })
}

}
