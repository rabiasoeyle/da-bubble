import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DialogLoginComponent } from '../dialog-login/dialog-login.component';
import { AuthService } from '../../../service/auth.service';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FirebaseApp } from '@angular/fire/app';
import { getApps } from 'firebase/app';

console.log(getApps());

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

  form = this.fb.nonNullable.group({
    name:['', Validators.required],
    email:['', Validators.required],
    password:['', Validators.required],
    
  })
  
  // onSubmit(){
  //   const rawForm = this.form.getRawValue();
  //   this.authService.register(rawForm.email, rawForm.name, rawForm.password)
  //   .subscribe({
  //     // this.router.navigateByUrl('');
  //     next:()=>{
  //       console.log('Successfully saved new user')
  //     },
  //     error:(err)=>{
  //       this.errorMessage = err.code
  //       console.log('Error')
  //     }
      
  //   })
  // }
  onSubmit() {
    const rawForm = this.form.getRawValue();
  
    // Registriere den Benutzer und speichere seine Daten in der Firebase-Datenbank
    this.authService.register(rawForm.email, rawForm.name, rawForm.password)
      .subscribe({
        next: async () => {
          try {
            // Hole die aktuell angemeldete Benutzer-ID
            const user = await this.authService.getCurrentUser();
            // async saveUserData(userId: string, userData: any) 
            // {\n     
            // return firebase.database().ref(`/users/${userId}`).set(userData);\n   }

            if (user && user.uid) {
              const userId = user.uid;
  
              // Bereite die Benutzerdaten vor
              const userData = {
                name: rawForm.name,
                email: rawForm.email,
                // photo: rawForm.photo || '', // Optional: Füge ein Standardbild hinzu
                groups: [], // Initialisiere Gruppen als leeres Array
                chats: [], // Initialisiere Chats als leeres Array
                contacts: [], // Initialisiere Kontakte als leeres Array
              };
  
              // Speichere die Benutzerdaten unter "/users" in Firebase
              await this.authService.saveUserData(userId, userData);
  
              console.log('Successfully saved new user');
              this.router.navigateByUrl('/'); // Weiterleitung nach erfolgreicher Registrierung
            } else {
              console.error('No user ID available after registration');
            }
          } catch (err) {
            console.error('Error saving user data to Firebase:', err);
            this.errorMessage = 'Error saving user data';
          }
        },
        error: (err) => {
          this.errorMessage = err.code;
          console.log('Error during registration:', err);
        },
      });
  }
  
  goBackToLogin(){
    this.goBackEvent.emit();
  }
}
