import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DialogLoginComponent } from '../dialog-login/dialog-login.component';
import { AuthService } from '../../auth.service';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FirebaseApp } from '@angular/fire/app';
import { getApps } from 'firebase/app';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-dialog-create-account',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dialog-create-account.component.html',
  styleUrl: './dialog-create-account.component.scss'
})
export class DialogCreateAccountComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  errorMessage : string |null = null;

  @Output()goBackEvent = new EventEmitter<string>
  @Output() accountCreated = new EventEmitter<void>();

  registerData={
    name:"",
    email:"",
    password:"",
    pPolicyAccepted: false,
  }
  
  onSubmit() {
    this.authService.register(this.registerData.email, this.registerData.name, this.registerData.password)
      .subscribe({
        next: async () => {
          try {
            this.authService.login(this.registerData.email, this.registerData.password);
            this.accountCreated.emit();
          } catch (err) {
            console.error('Error saving user data to Firebase:', err);
            this.errorMessage = 'Error saving user data';
          }
        },
        error: (err) => {
          this.errorMessage = err.code;
        },
      });
  }
  
  goBackToLogin(){
    this.goBackEvent.emit();
  }
}
