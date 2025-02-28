import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterState } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-dialog-send-email-pw',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dialog-send-email-pw.component.html',
  styleUrl: './dialog-send-email-pw.component.scss'
})
export class DialogSendEmailPwComponent {
    fb = inject(FormBuilder);
    http = inject(HttpClient);
    router = inject(Router);
    authService = inject(AuthService);
    errorMessage : string |null = null;
    form = this.fb.nonNullable.group({
      email:['', Validators.required]
    })
    @Output() switchBackToLogin = new EventEmitter<void>(); // EventEmitter erstellen
    constructor(){

    }

  onSubmit(){
    const rawForm = this.form.getRawValue();
    localStorage.setItem("email", rawForm.email);
    this.authService.forgotPassword(rawForm.email);
    this.goBackToLogin();
  }
  goBackToLogin(){
    this.switchBackToLogin.emit(); // Ereignis auslösen
  }
}
