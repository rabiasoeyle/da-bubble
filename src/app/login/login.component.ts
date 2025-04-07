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
    DialogSendEmailPwComponent, DialogChooseAvatarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent{
  start:boolean=false;
  startLogin:boolean=true;
  createNewAccount:boolean = false;
  forgotPassword:boolean = false;
  chooseAvatar:boolean=false;
  userId: string | null = null;
  registerData:any=null;

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
  fromChooseAvatar(){
    this.startLogin = true;
    this.chooseAvatar = false;
  }
  loginUserAfterAvatarChosen(avatar:string){
    this.authService.login(this.registerData.email, this.registerData.password);
    if(this.userId){
      this.authService.updateUserProfile(this.userId, avatar)
    }
  }
}