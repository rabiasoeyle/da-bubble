import { Component, inject } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-dialog-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dialog-login.component.html',
  styleUrl: './dialog-login.component.scss'
})
export class DialogLoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  errorMessage : string |null = null;
  form = this.fb.nonNullable.group({
    email:['', Validators.required],
    password:['', Validators.required]
  })
  onSubmit(){
    const rawForm = this.form.getRawValue();
    this.authService.login(rawForm.email, rawForm.password)
    .subscribe({
      
      next:()=>{
        this.router.navigateByUrl('main');
        console.log('Successfully load user')
      },
      error:(err)=>{
        this.errorMessage = err.code
        console.log('Error')
      }
      
    })
  }

}
