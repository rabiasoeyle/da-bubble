import { inject, Injectable} from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from '@angular/fire/auth';
import { doc, Firestore, getDoc, onSnapshot, setDoc} from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable, of, switchMap } from 'rxjs';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider,confirmPasswordReset, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, User, verifyPasswordResetCode, UserCredential } from "firebase/auth";
  // import { GoogleAuthProvider, signInWithPopup,signInWithRedirect, getRedirectResult } from "@angular/fire/auth";
import { UserData } from '../modules/user';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

// import { , User } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  // provider = new GoogleAuthProvider();
  
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  firebaseDatabase = inject(Firestore);
  private userDataSubject = new BehaviorSubject<UserData | null>(null); 
  public userData$ = this.userDataSubject.asObservable();
  private userCache = new Map<string, any>();
  private unsubscribeUserUpdates!: () => void;
  router = inject(Router);
  constructor() {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
          this.getData(user.uid).then((data) => {
              this.userDataSubject.next(data);
              this.router.navigateByUrl('main');
              console.log("neuer User eingeloggt",user)
          });
      }
  });
  }
  register(email: string, name: string, password: string): Observable<void> {
    const createAccount = () => {
      return createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (response) => {
        const user = response.user; // Holen des aktuellen Benutzers aus der Antwort
        if (user) {
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
          throw new Error("Kein Benutzer vorhanden, E-Mail-Verifikation fehlgeschlagen.");}
      });
    };
    return from(createAccount());
  }
  async addData(uid: string, email:string|any, name:string|any) {
    const userDocRef = doc(this.firebaseDatabase, `users/${uid}`); // Dokument mit UID als Pfad
    await setDoc(userDocRef, {
      uid: uid,
      name: name,                
      email: email,              
      fotolink: "./assets/img/profile.png", 
      channels:[],
      chats:[],                          
    }); 
  }
  login(email: string, password: string): Observable<void> {
    const loginPromise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user) {
        const uid = user.uid;
        localStorage.setItem("userId", uid)
        return this.getData(uid).then((data) => {
          this.userDataSubject.next(data);
        });
      }
      return Promise.resolve();
    });
    return from(loginPromise);
  }
  logout(): void {
    localStorage.removeItem("userId");
    this.firebaseAuth.signOut();
    this.userDataSubject.next(null);
  }
  
  async googleSigninRedirect(): Promise<void> {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(this.firebaseAuth, provider);
    } catch (error: any) {
        console.error('Fehler bei der Google-Redirect-Authentifizierung:', error);
    }
}
async handleRedirectResult(): Promise<void> {
  try {
      const result: UserCredential | null = await getRedirectResult(this.firebaseAuth);
      if (result) {
          const user = result.user;
          if (user && user.email) {
              const userDocRef = doc(this.firebaseDatabase, 'users', user.uid);
              const userDoc = await getDoc(userDocRef);
              if (!userDoc.exists()) {
                  await this.addData(user.uid, user.email, user.displayName);
              }
              localStorage.setItem("userId", user.uid);
              const data = await this.getData(user.uid);
              this.userDataSubject.next(data);
          } else {
              console.error('Benutzer-E-Mail nicht gefunden.');
          }
      }
  } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error?.customData?.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error('Fehler bei der Google-Redirect-Ergebnisverarbeitung:', error);
  }
}
  async googleSignin(): Promise<void> {
    try {
      console.log("Google-Login Try")
      const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result: UserCredential = await signInWithPopup(this.firebaseAuth, provider);
        const user = result.user;
        console.log("Userdaten",result);
        if (user && user.email) {
          console.log("Google-Login User gefunden")
            const userDocRef = doc(this.firebaseDatabase, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                await this.addData(user.uid, user.email, user.displayName);
            }
            localStorage.setItem("userId", user.uid);
            const data = await this.getData(user.uid);
            this.userDataSubject.next(data);
        } else {
            console.error('Benutzer-E-Mail nicht gefunden.');
        }
    } catch (error: any) {
        console.error('Fehler bei der Google-Authentifizierung:', error);
    }
}

// async googleSignin(): Promise<void> {
//   try {
//     console.log("Google-Login Try")
//     const provider = new GoogleAuthProvider(); // Google-Provider initialisieren
//     const credential = await signInWithPopup(this.firebaseAuth, provider); // Mit Popup anmelden
//     const user = credential.user; // Angemeldeter Benutzer
//     if (user) {
//       console.log("Google-Login User gefunden")
//       this.addData(user.uid, user.email, user.displayName);
//       return this.getData(user.uid).then((data) => {
//         this.userDataSubject.next(data);
//       });
//     }
//   } catch (error) {
//     console.error('Fehler bei der Google-Authentifizierung:', error);
//   }
// }

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
  async getUserInfo(uid: string) {
    try {
      const userRef = doc(this.firebaseDatabase, `users/${uid}`);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        this.userCache.set(uid, userData);
        return userData;
      }else{
         return { name: "Unbekannt", profilePic: "default.png" };
      }
    } catch (error) {
      return { name: "Fehler", profilePic: "error.png" };
    }
  }
  getUserLiveUpdates() {
    const userId = localStorage.getItem("userId");
    const userDocRef = doc(this.firebaseDatabase, `users/${userId}`);
    return onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = (docSnap.data() as UserData);
        this.userDataSubject.next(data); // Daten direkt setzen
      } else {
        this.userDataSubject.next(null);
      }
    }, (error) => {
      console.error("Firestore Live-Update Fehler:", error);
    });
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
  async updateUserName(uid: string, name: string): Promise<void> {
    try {
      const userDocRef = doc(this.firebaseDatabase, `users/${uid}`);
      await setDoc(userDocRef, { name }, { merge: true });
      const currentData = this.userDataSubject.value;
      if (currentData) {
        this.userDataSubject.next({ ...currentData, name });
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Namens:', error);
    }
  }

}