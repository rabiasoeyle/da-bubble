import { inject, Injectable, Input } from '@angular/core';
import { FirebaseApp, getApps } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Database, getDatabase, ref, set } from '@angular/fire/database';
import { addDoc, collection, doc, DocumentData, DocumentReference, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, merge, Observable } from 'rxjs';
import { confirmPasswordReset, getAuth, isSignInWithEmailLink, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, sendSignInLinkToEmail, signInWithEmailLink, User, UserCredential, verifyPasswordResetCode } from "firebase/auth";
import {GoogleAuthProvider, signInWithPopup } from "@angular/fire/auth";
import { AngularFireAuth } from '@angular/fire/compat/auth';
export interface UserData {
    uid: string;
    name: string;
    email: string;
    freunde:[]|any;
    gruppe:{}|any;
    chats:{}|any;
    fotolink:string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  firebaseDatabase = inject(Firestore);
  // angularFireAuth = inject(AngularFireAuth);
  user = {};
  userData:any;
  currentUid: string | null = null;
  private userDataSubject = new BehaviorSubject<UserData | null>(null); // Initial null
  public userData$ = this.userDataSubject.asObservable(); // Observable für Komponenten
  
  

  
  constructor() {
  }
 
  register(email: string, name: string, password: string): Observable<void> {
   
    const createAccount = () => {
      return createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (response) => {
        const user = response.user; // Holen des aktuellen Benutzers aus der Antwort

        if (user) {
          // Verifikations-E-Mail senden
          await sendEmailVerification(user)
            .then(() => {
              alert("E-Mail-Verifikationslink wurde gesendet!");
            })
            .catch((error) => {
              console.error("Fehler beim Senden der Verifikations-E-Mail:", error);
            });

          const uid: string = user.uid; // UID des Benutzers
          return this.addData(uid, email, name); // Benutzerdaten speichern
        } else {
          throw new Error("Kein Benutzer vorhanden, E-Mail-Verifikation fehlgeschlagen.");
        }
      });
  };

    return from(createAccount());
  }

  async addData(uid: string, email:string|any, name:string|any) {
    const userDocRef = doc(this.firebaseDatabase, `users/${uid}`); // Dokument mit UID als Pfad
    await setDoc(userDocRef, {
      uid: uid,
      name: name,                // Key: name
      email: email,              // Key: email
      fotolink: "",              // Key: fotolink
      freunde: [],               // Key: freunde
      gruppe: {},                // Key: gruppe
      chats: {}
    }); // Beispiel-Daten
  }

  login(email: string, password: string): Observable<void> {
    const loginPromise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user) {
        const uid = user.uid;
        return this.getData(uid).then((data) => {
          this.userDataSubject.next(data);
        });
      }// Rückgabe für den Fall, dass user null ist
      return Promise.resolve(); // Gibt ein leeres Promise zurück
    });
    return from(loginPromise); // Promise in Observable umwandeln
  }

  logout(): void {
    this.firebaseAuth.signOut();
    this.userDataSubject.next(null); // Setzt die Benutzerdaten zurück
  }

  private async getData(uid: string): Promise<UserData | null> {
    const userDocRef = doc(this.firebaseDatabase, `users/${uid}`);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? (userDoc.data() as UserData) : null;
  }

  async updateUserProfile(uid: string, fotolink: string): Promise<void> {
    try {
      const userDocRef = doc(this.firebaseDatabase, `users/${uid}`);
      await setDoc(userDocRef, {fotolink }, { merge: true });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Profilbilds:', error);
    }
  }

  async googleSignin(): Promise<void> {
      try {
        const provider = new GoogleAuthProvider(); // Google-Provider initialisieren
        const credential = await signInWithPopup(this.firebaseAuth, provider); // Mit Popup anmelden
        const user = credential.user; // Angemeldeter Benutzer
    
        if (user) {
          this.addData(user.uid, user.email, user.displayName);
          return this.getData(user.uid).then((data) => {
            this.userDataSubject.next(data);
          });
        }
      } catch (error) {
        console.error('Fehler bei der Google-Authentifizierung:', error);
      }
    }

  forgotPassword(email:string){
    const actionCodeSettings = {
      url: 'http://localhost:4200/changePassword',
      handleCodeInApp: true,
    };
    sendPasswordResetEmail(this.firebaseAuth, email, actionCodeSettings)
    .then(()=>{
      alert("Your Password reset link was send")
    })
  }
  // Passwort-Zurücksetzungslink validieren
  verifyResetCode(oobCode: string): Promise<void> {
    return verifyPasswordResetCode(this.firebaseAuth, oobCode)
      .then(() => Promise.resolve()) // Link ist gültig
      .catch((error) => {
        console.error('Invalid or expired reset link:', error);
        return Promise.reject(error); // Fehler bei der Validierung
      });
  }

  // Neues Passwort setzen
  resetPassword(oobCode: string, newPassword: string): Promise<void> {
    return confirmPasswordReset(this.firebaseAuth, oobCode, newPassword)
      .then(() => {
        alert('Password successfully changed');
      })
      .catch((error) => {
        console.error('Error resetting password:', error);
        return Promise.reject(error); // Fehler bei der Änderung
      });
  }

  }

