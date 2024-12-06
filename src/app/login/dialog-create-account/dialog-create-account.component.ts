import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DialogLoginComponent } from '../dialog-login/dialog-login.component';
import { AuthService } from '../../../service/auth.service';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-create-account',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dialog-create-account.component.html',
  styleUrl: './dialog-create-account.component.scss'
})
export class DialogCreateAccountComponent {
  fb = inject(FormBuilder);
  // http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  @Output()goBackEvent = new EventEmitter<string>
  form = this.fb.nonNullable.group({
    name:['', Validators.required],
    email:['', Validators.required],
    password:['', Validators.required],
    
  })
  onSubmit(){
    const rawForm = this.form.getRawValue();
    this.authService.register(rawForm.email, rawForm.name, rawForm.password)
    .subscribe(()=>{
      this.router.navigateByUrl('');
    })
  }
  goBackToLogin(){
    this.goBackEvent.emit();
  }
}
