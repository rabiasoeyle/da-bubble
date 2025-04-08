import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
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
export class DialogCreateAccountComponent implements OnChanges {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  errorMessage : string |null = null;
  @Input() registerDataOld:any=null;
  @Output()goBackEvent = new EventEmitter<string>();
  @Output() accountCreated = new EventEmitter<any>();
  constructor(){
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['registerDataOld'] && changes['registerDataOld'].currentValue) {
      this.registerData.name = changes['registerDataOld'].currentValue.name;
      this.registerData.email = changes['registerDataOld'].currentValue.email;
      this.registerData.password = changes['registerDataOld'].currentValue.password;
      this.registerData.pPolicyAccepted = changes['registerDataOld'].currentValue.pPolicyAccepted;
      console.log(this.registerData);
    }
  }
  registerData={
    name:"",
    email:"",
    password:"",
    pPolicyAccepted: false,
  }
  
  onSubmit() {
    this.accountCreated.emit(this.registerData);
  }
  
  goBackToLogin(){
    this.goBackEvent.emit();
  }
}
