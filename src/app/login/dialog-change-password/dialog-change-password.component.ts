import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserData } from '../../auth.service';
import { DialogChooseAvatarComponent } from '../dialog-choose-avatar/dialog-choose-avatar.component';

@Component({
  selector: 'app-dialog-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, DialogChooseAvatarComponent],
  templateUrl: './dialog-change-password.component.html',
  styleUrl: './dialog-change-password.component.scss'
})
export class DialogChangePasswordComponent {
      fb = inject(FormBuilder);
      http = inject(HttpClient);
      router = inject(Router);
      authService = inject(AuthService);
      form = this.fb.nonNullable.group({
          password:['', Validators.required],
          passwordCheck:['', Validators.required]
      })
      userData: UserData | null = null;
  
  constructor() {

  }

  ngOnInit(): void {
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      if(this.userData == null){
          this.router.navigateByUrl('');
      }
      console.log('Aktuelle Benutzerdaten:', this.userData);
    });
  }
  goBackToLogin(){
    
  }
  onSubmit(){

  }
}
