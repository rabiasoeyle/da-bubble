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
export class DialogChangePasswordComponent{
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
      // private route = inject(ActivatedRoute)


  
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
  
  // ngOnInit(): void {
  //   // Aus der URL den oobCode auslesen
  //   this.route.queryParams.subscribe((params) => {
  //     this.oobCode = params['oobCode'];
  //     if (this.oobCode) {
  //       // Überprüfen, ob der oobCode gültig ist
  //       this.authService.verifyPasswordResetCode(this.oobCode).then(
  //         () => {
  //           this.isCodeValid = true;
  //         },
  //         (error) => {
  //           this.isCodeValid = false;
  //           console.error('Ungültiger oder abgelaufener Link:', error);
  //         }
  //       );
  //     }
  //   });
  // }

  changePassword(): void {
  //   if (this.newPassword && this.oobCode) {
  //     this.authService.confirmPasswordReset(this.oobCode, this.newPassword).then(
  //       () => {
  //         alert('Passwort erfolgreich geändert!');
  //       },
  //       (error) => {
  //         console.error('Fehler beim Ändern des Passworts:', error);
  //       }
  //     );
  //   }
  }
  goBackToLogin(){
    
  }
  // onSubmit(){

  // }
}
