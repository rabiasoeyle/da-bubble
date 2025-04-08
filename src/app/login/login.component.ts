import { Component, inject, OnInit } from '@angular/core';
import { trigger, style, animate, transition, keyframes} from '@angular/animations';
import { DialogLoginComponent } from './dialog-login/dialog-login.component';
import { DialogChangePasswordComponent } from './dialog-change-password/dialog-change-password.component';
import { DialogCreateAccountComponent } from './dialog-create-account/dialog-create-account.component';
import { DialogSendEmailPwComponent } from './dialog-send-email-pw/dialog-send-email-pw.component';
import { DialogChooseAvatarComponent } from './dialog-choose-avatar/dialog-choose-avatar.component';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink, DialogLoginComponent, DialogCreateAccountComponent, 
    DialogSendEmailPwComponent, DialogChooseAvatarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent{
  router = inject(Router);
  start:boolean=false;
  startLogin:boolean=true;
  createNewAccount:boolean = false;
  forgotPassword:boolean = false;
  chooseAvatar:boolean=false;
  userId: string | null = null;
  registerData:any=null;
  errorMessage:any ="";

  constructor(private authService: AuthService) {
    this.authService.userData$.subscribe((user) => {
      this.userId = user?.uid || null;
    });
    if(this.registerData !== null){
      this.handleAccountCreated(this.registerData);
    }
  }
  forgotPasswordPage(){
    this.startLogin=false;
    this.forgotPassword= true;
  }
  goBackToLoginAfterPasswordChanged(){
    this.startLogin=true;
    this.forgotPassword= false;
  }
  goToCreateAccount(){
    this.startLogin=false;
    this.createNewAccount=true;
  }
  handleAccountCreated(registerData:any) {
    this.registerData = registerData;
    this.createNewAccount = false;
    this.startLogin = false;
    this.chooseAvatar = true;
  }
  fromCreateBackToLogin(){
    this.createNewAccount = false;
    this.startLogin=true;
  }
  goBackToRegistration(){
    this.chooseAvatar=false;
    this.createNewAccount=true;
  }
  
  // async loginUserAfterAvatarChosen(avatar:string){
  //    this.authService.register(this.registerData.email, this.registerData.name, this.registerData.password)
  //     .subscribe({
  //       next: async () => {
  //         try {
  //           this.authService.login(this.registerData.email, this.registerData.password);
  //           setTimeout(()=>{
  //             if(this.userId){
  //               this.authService.updateUserProfile(this.userId, avatar),
  //               this.router.navigateByUrl('main');
  //             }},1000)
  //         } catch (err) {
  //           console.error('Error saving user data to Firebase:', err);
  //         }
  //       },
  //       error: (err) => {
  //         this.errorMessage = err.code;
  //       },
  //     });
  // }
  async loginUserAfterAvatarChosen(avatar: string) {
    this.authService.register(this.registerData.email, this.registerData.name, this.registerData.password)
      .subscribe({
        next: async () => {
          try {
            await this.authService.login(this.registerData.email, this.registerData.password); // Beachte das 'await'
            setTimeout(async () => { // Beachte das 'async'
              if (this.userId) {
                await this.authService.updateUserProfile(this.userId, avatar); // Beachte das 'await'
                this.router.navigateByUrl('main');
              }
            }, 1000);
          } catch (err) {
            console.error('Error saving user data to Firebase:', err);
            // Hier könntest du dem Benutzer eine Fehlermeldung anzeigen, falls die Anmeldung fehlschlägt.
          }
        },
        error: (err) => {
          if (err.message == 'Firebase: Error (auth/email-already-in-use).') {
            this.goBackToRegistration();
            // Spezifische Fehlerbehandlung für doppelte E-Mail
            this.errorMessage = 'Diese E-Mail-Adresse ist bereits registriert.';
            // Oder zeige eine Meldung im UI an.
            alert('Diese E-Mail-Adresse ist bereits registriert.');
          } else {
            // Allgemeine Fehlerbehandlung
            this.errorMessage = err.message || 'Ein Fehler ist aufgetreten.';
            // Oder zeige eine Meldung im UI an.
            alert('Ein Fehler ist aufgetreten: ' + (err.message || 'Unbekannter Fehler'));
          }
        },
      });
  }
}