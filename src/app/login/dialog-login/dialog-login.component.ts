import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormBuilder, FormsModule,NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-dialog-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dialog-login.component.html',
  styleUrl: './dialog-login.component.scss'
})
export class DialogLoginComponent implements OnInit{
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  errorMessage : string |null = null;
  @Output() switchToForgotPassword = new EventEmitter<void>(); // EventEmitter erstellen
  loginData = {
    email:"",
    password:"",
  };
  
  constructor(){
  }
  ngOnInit(){
  }
  onLogin() {
    this.authService.login(this.loginData.email, this.loginData.password)
      .subscribe({
        next: async () => {
          this.router.navigateByUrl('main');
        },
        error: (err) => {
          this.errorMessage = err.code;
          if (this.errorMessage === "auth/invalid-email") {
            this.errorMessage = "Bitte geben Sie eine gültige E-Mail ein";
          } else if (this.errorMessage === "auth/missing-password") {
            this.errorMessage = "Bitte geben Sie ein gültiges Passwort ein";
          } else if (this.errorMessage === "auth/invalid-password") {
            this.errorMessage = "Bitte geben Sie ein gültiges Passwort ein";
          }else 
          if (this.errorMessage === "auth/invalid-credential") {
            this.errorMessage = "Leider ist das Passwort oder die E-Mail falsch";
          } else 
          {
            this.errorMessage = "Unbekannter Fehler";
          }
          console.error('Login error:', err);
        }
      });
  }
  loginWithGoogle() {
    console.log("Google-Login gestartet")
    this.authService.googleSignin()
    .then(() => {
      console.log("login daten gefunden")
      // this.authService.handleGoogleRedirect();
      this.router.navigateByUrl('main');
    })
      .catch((error) => console.error('Anmeldung fehlgeschlagen:', error));
      this.router.navigateByUrl('');
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
