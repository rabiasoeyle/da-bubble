import { Component, OnInit } from '@angular/core';
import { trigger, style, animate, transition, keyframes} from '@angular/animations';
import { DialogLoginComponent } from './dialog-login/dialog-login.component';
import { DialogChangePasswordComponent } from './dialog-change-password/dialog-change-password.component';
import { DialogCreateAccountComponent } from './dialog-create-account/dialog-create-account.component';
import { DialogSendEmailPwComponent } from './dialog-send-email-pw/dialog-send-email-pw.component';
import { DialogChooseAvatarComponent } from './dialog-choose-avatar/dialog-choose-avatar.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink, DialogLoginComponent, DialogCreateAccountComponent, 
    DialogSendEmailPwComponent, DialogChooseAvatarComponent, DialogChangePasswordComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent{
  start:boolean=false;
  startLogin:boolean=true;
  createNewAccount:boolean = false;
  forgotPassword:boolean = false;
  chooseAvatar:boolean=false;
  changePassword:boolean=false;
  userId: string | null = null;

  constructor(private authService: AuthService) {
    this.authService.userData$.subscribe((user) => {
      this.userId = user?.uid || null; // Hol dir die User-ID aus dem AuthService
    });
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
  handleAccountCreated() {
    this.createNewAccount = false;
    this.chooseAvatar = true; // Wechsel zu Avatar-Komponente
  }
}