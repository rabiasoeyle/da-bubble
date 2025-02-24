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
  imports: [ReactiveFormsModule],
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

  form = this.fb.nonNullable.group({
    name:['', Validators.required],
    email:['', Validators.required],
    password:['', Validators.required],
    
  })
  
  onSubmit() {
    const rawForm = this.form.getRawValue();
    // Registriere den Benutzer und speichere seine Daten in der Firebase-Datenbank
    this.authService.register(rawForm.email, rawForm.name, rawForm.password)
      .subscribe({
        next: async () => {
          try {
            this.authService.login(rawForm.email, rawForm.password);
            this.accountCreated.emit(); // Signalisiert, dass der Account erstellt wurde
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
