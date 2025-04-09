import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormsModule,NgForm } from '@angular/forms';
import { Router} from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-dialog-send-email-pw',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dialog-send-email-pw.component.html',
  styleUrl: './dialog-send-email-pw.component.scss'
})
export class DialogSendEmailPwComponent {
    
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  errorMessage : string |null = null;
  emailData = {
  email:""};
  @Output() switchBackToLogin = new EventEmitter<void>(); 
    
  constructor(){}

  onSubmit(ngForm: NgForm){
    console.log("test",this.emailData.email)
    localStorage.setItem("email", this.emailData.email);
    this.authService.forgotPassword(this.emailData.email);
    this.goBackToLogin();
  }
  
  goBackToLogin(){
    this.switchBackToLogin.emit();
  }
}
