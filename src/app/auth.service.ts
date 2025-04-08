import { inject, Injectable, OnInit} from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from '@angular/fire/auth';
import { doc, Firestore, getDoc, onSnapshot, setDoc} from '@angular/fire/firestore';
import { BehaviorSubject, catchError, from, Observable, of, switchMap, throwError } from 'rxjs';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider,confirmPasswordReset, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, User, verifyPasswordResetCode, UserCredential, browserLocalPersistence, setPersistence, fetchSignInMethodsForEmail } from "firebase/auth";
  // import { GoogleAuthProvider, signInWithPopup,signInWithRedirect, getRedirectResult } from "@angular/fire/auth";
import { UserData } from '../modules/user';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { getAuth } from "firebase/auth";
import { getApps, initializeApp } from "firebase/app";

// import { , User } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})

export class AuthService{
  appConfig={
    "projectId":"da-bubble-85cd2",
            "appId":"1:1053306260929:web:934cf2ec44748823ffb340",
            "storageBucket":"da-bubble-85cd2.firebasestorage.app",
            "apiKey":"AIzaSyA71jwQ3pIqlVwMAWybxUTctoVCr3PvQmw",
            "authDomain":"da-bubble-85cd2.firebaseapp.com",
            "messagingSenderId":"1053306260929"
  };
  app = initializeApp(this.appConfig);
  auth = getAuth();
  // signInWithRedirect(this.auth, this.provider);
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
  if (!getApps().length) {
    initializeApp(this.appConfig);
}
console.log("🔥 Firebase wurde initialisiert!");
console.log("📢 Firebase Apps:", getApps());
console.log("🔐 Auth-Instanz:", getAuth());
  
  }
  // register(email: string, name: string, password: string): Observable<void> {
  //   const createAccount = () => {
  //     return createUserWithEmailAndPassword(this.firebaseAuth, email, password)
  //     .then(async (response) => {
  //       const user = response.user; // Holen des aktuellen Benutzers aus der Antwort
  //       if (user) {
  //         await sendEmailVerification(user)
  //           .then(() => {
  //             alert("E-Mail-Verifikationslink wurde gesendet!");
  //           })
  //           .catch((error) => {
  //             console.error("Fehler beim Senden der Verifikations-E-Mail:", error);
  //           });
  //         const uid: string = user.uid; // UID des Benutzers
  //         return this.addData(uid, email, name); // Benutzerdaten speichern
  //       } else {
  //         throw new Error("Kein Benutzer vorhanden, E-Mail-Verifikation fehlgeschlagen.");}
  //     });
  //   };
  //   return from(createAccount());
  // }
  register(email: string, name: string, password: string): Observable<void> {
    const checkEmailAndCreateAccount = () => {
      return from(fetchSignInMethodsForEmail(this.firebaseAuth, email)).pipe(
        switchMap((signInMethods) => {
          if (signInMethods && signInMethods.length > 0) {
            return throwError(new Error('E-Mail-Adresse bereits registriert.'));
          } else {
            return from(createUserWithEmailAndPassword(this.firebaseAuth, email, password)).pipe(
              switchMap(async (response) => {
                const user = response.user;
                if (user) {
                  await sendEmailVerification(user);
                  alert('E-Mail-Verifikationslink wurde gesendet!');
                  const uid: string = user.uid;
                  return this.addData(uid, email, name);
                } else {
                  throw new Error('Kein Benutzer vorhanden, E-Mail-Verifikation fehlgeschlagen.');
                }
              })
            );
          }
        })
      );
    };
  
    return checkEmailAndCreateAccount().pipe(
      catchError((error) => {
        console.error('Fehler bei der Registrierung:', error);
        return throwError(error); // Fehler weitergeben, damit er in der Komponente behandelt werden kann
      })
    );
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
  async googleSignin(): Promise<void> {
    try {
        console.log("🚀 googleSignin() wurde aufgerufen!");
        const provider = new GoogleAuthProvider();
        const auth = getAuth();
        // provider.setCustomParameters({ prompt: "select_account" });
        // const auth = getAuth();
signInWithPopup(auth,provider)
  .then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
    const googleParam = {
      id: user.uid,
      cover: user.photoURL,
      nickname: user.displayName,
      token: token,
    }
    this.loginNext(user)
    
    console.log(googleParam)
  })
    } catch (error) {
        console.error("❌ Fehler beim Google Login:", error);
    }
}
async loginNext(user:any){
      if (user && user.email) {
          console.log("Google-Login User gefunden");
          const userDocRef = doc(this.firebaseDatabase, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
              await this.addData(user.uid, user.email, user.displayName);
          }
          localStorage.setItem("userId", user.uid);
          console.log("User-ID gespeichert:", localStorage.getItem("userId"));
          const data = await this.getData(user.uid);
      }
}
// async handleGoogleRedirect(): Promise<void> {
//   console.log("handleGoogleRedirect wurde aufgerufen!");
//   try {
//       const auth = getAuth();
//       // Warten, falls Firebase noch nicht bereit ist
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       const result = await getRedirectResult(auth);
//       console.log("getRedirectResult abgeschlossen:", result);
//       if (result?.user) {
//         console.log("Google-Login User gefunden:", result.user);
//     } else {
//         console.warn("Kein User gefunden nach Redirect!");
//     }
//       if (!result) return; // Falls kein Login erfolgt ist
//       const user = result.user;
//       localStorage.setItem("userId", result.user.uid);
//       console.log("User-ID gespeichert:", localStorage.getItem("userId"));
//       if (user && user.email) {
//           console.log("Google-Login User gefunden");

//           const userDocRef = doc(this.firebaseDatabase, "users", user.uid);
//           const userDoc = await getDoc(userDocRef);

//           if (!userDoc.exists()) {
//               await this.addData(user.uid, user.email, user.displayName);
//           }

//           localStorage.setItem("userId", user.uid);
//           const data = await this.getData(user.uid);
//           this.userDataSubject.next(data);
//       } else {
//           console.error("Benutzer-E-Mail nicht gefunden.");
//       }
//   } catch (error) {
//       console.error("Fehler bei der Verarbeitung des Redirects:", error);
//   }
// }
// async handleGoogleRedirect(): Promise<void> {
//   console.log("🚀 handleGoogleRedirect wurde aufgerufen!");

//   try {
//       const auth = getAuth();
//       console.log("🔍 Warte auf Redirect-Result...");

//       const result = await getRedirectResult(auth);
//       console.log("📢 Redirect-Result erhalten:", result);

//       if (!result) {
//           console.warn("⚠️ Kein Redirect-Result! Wurde `signInWithRedirect()` vorher aufgerufen?");
//           return;
//       }

//       const user = result.user;
//       console.log("👤 Eingeloggter User:", user);

//       if (user) {
//           localStorage.setItem("userId", user.uid);
//       } else {
//           console.warn("⚠️ Kein User-Objekt gefunden!");
//       }
//   } catch (error) {
//       console.error("❌ Fehler bei der Verarbeitung des Redirects:", error);
//   }
// }


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