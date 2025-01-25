import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserData } from '../../auth.service';
import { DialogChooseAvatarComponent } from '../dialog-choose-avatar/dialog-choose-avatar.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-dialog-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dialog-change-password.component.html',
  styleUrl: './dialog-change-password.component.scss'
})
export class DialogChangePasswordComponent implements OnInit{
      fb = inject(FormBuilder);
      http = inject(HttpClient);
      router = inject(Router);
      authService = inject(AuthService);
      form = this.fb.nonNullable.group({
          password:['', Validators.required],
          passwordCheck:['', Validators.required]
      })
      userData: UserData | null = null;
      oobCode!: string;
      newPassword: string = '';
      isCodeValid: boolean = false;
      private route = inject(ActivatedRoute);
  constructor() {

  }
  // ngOnInit(): void {
  //   this.authService.userData$.subscribe((data) => {
  //     this.userData = data;
  //     if(this.userData == null){
  //         this.router.navigateByUrl('');
  //     }
  //     console.log('Aktuelle Benutzerdaten:', this.userData);
  //   });
  // }
  
  ngOnInit(): void {
    // oobCode aus den URL-Parametern lesen
    this.route.queryParams.subscribe((params) => {
      this.oobCode = params['oobCode']; // Query-Parameter auslesen
      console.log("oobCode:"+this.oobCode)
      if (this.oobCode) {
        this.authService.verifyResetCode(this.oobCode).then(
          () => {
            this.isCodeValid = true; // Link ist gültig
          },
          () => {
            this.isCodeValid = false; // Link ist ungültig
          }
        );
      }
    });
  }

  changePassword(): void {
    const rawForm = this.form.getRawValue();
    if (this.oobCode && this.newPassword) {
      this.authService.resetPassword(this.oobCode, this.newPassword)
      .then(()=>{
        alert('Passwort wurde geändert');
      })
      .catch((error) => {
        console.error('Error resetting password:', error);
      });
    }
  }
  goBackToLogin(){
    
  }
  // onSubmit(){

  // }
}
