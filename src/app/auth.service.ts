import { inject, Injectable, Input } from '@angular/core';
import { FirebaseApp, getApps } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Database, getDatabase, ref, set } from '@angular/fire/database';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, DocumentData, DocumentReference, Firestore, getDoc, getDocs, onSnapshot, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { BehaviorSubject, from, merge, Observable } from 'rxjs';
import { confirmPasswordReset, getAuth, isSignInWithEmailLink, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, sendSignInLinkToEmail, signInWithEmailLink, User, UserCredential, verifyPasswordResetCode } from "firebase/auth";
import {GoogleAuthProvider, signInWithPopup } from "@angular/fire/auth";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { query } from '@angular/animations';

export interface UserData {
    uid: string;
    name: string;
    email: string;
    // friends:[];
    fotolink:string;
    channels:[];
    chats:[];
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  firebaseDatabase = inject(Firestore);
  currentUid: string | null = null;
  currentChannel = new BehaviorSubject<any>(null);
  private userDataSubject = new BehaviorSubject<UserData | null>(null); // Initial null
  public userData$ = this.userDataSubject.asObservable(); // Observable für Komponenten
  private userCache = new Map<string, any>();
  private unsubscribeUserUpdates!: () => void;

  constructor() {
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
      fotolink: "", 
      channels:[],
      chats:[],            
      // friends: ["2uVdcQYRRJUU84FFJmBeFxxVAII3"],               
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
      return Promise.resolve(); // Gibt ein leeres Promise zurück
    });
    return from(loginPromise); // Promise in Observable umwandeln
  }

  logout(): void {
    localStorage.removeItem("userId");
    this.firebaseAuth.signOut();
    this.userDataSubject.next(null);
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
        const credential = await signInWithPopup(this.firebaseAuth, provider);
        const user = credential.user;
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

  async createChannel(channelname:string, description:string){
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelname}`);
    const userId = localStorage.getItem("userId");
    await setDoc(channelDocRef, {
      description:description,
      messages:[
      ],
      created:{
        createdFrom:userId,
        createdAt:new Date(),
      },
      members:[userId],
    }); 
    this.addChannelToUser(channelname);
    this.getUserLiveUpdates();
    }

  async addChannelToUser(channelname:string){
    const userId = localStorage.getItem("userId");
    const userDocRef = doc(this.firebaseDatabase, `users/${userId}`);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      await setDoc(userDocRef, { channels: [channelname] }); // Erstes Array erstellen
    } else {
      await updateDoc(userDocRef, {
        channels: arrayUnion(channelname) // Neuen Channel zum Array hinzufügen
      });
    }
  }
  async addChannelToUserTwo(channelname:string, userId:string){
    const userDocRef = doc(this.firebaseDatabase, `users/${userId}`);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      await setDoc(userDocRef, { channels: [channelname] }); // Erstes Array erstellen
    } else {
      await updateDoc(userDocRef, {
        channels: arrayUnion(channelname) // Neuen Channel zum Array hinzufügen
      });
    }
  }
  private channelUnsubscribe: (() => void) | null = null;

  getChannelLiveUpdates(channelName: string) {
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
    this.unsubscribeFromChannel();
    return this.channelUnsubscribe = onSnapshot(channelDocRef, (docSnap) => {
      if (docSnap.exists()) {
        this.currentChannel.next(docSnap.data()); // Daten direkt setzen
      } else {
        this.currentChannel.next(null); // Falls der Channel nicht existiert
      }
    }, (error) => {
      console.error("Firestore Live-Update Fehler:", error);
    });
  }
  
  unsubscribeFromChannel() {
    if (this.channelUnsubscribe) {
        this.channelUnsubscribe(); // Live-Update deaktivieren
        this.channelUnsubscribe = null;
        this.currentChannel.next(null); // Channel beim User entfernen
    }
}

  async sendMessage(message:string, channelname:string){
    const userId = localStorage.getItem("userId");
    const time = new Date();
    const channelRef = doc(this.firebaseDatabase, `channels/${channelname}`);
    await updateDoc(channelRef, {
      messages: arrayUnion({
        uid: userId,
        message: message,
        timestamp: new Date().toISOString()
      })
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

  async addMembersToChannel(channelName:string, userName:string){
    console.log("userName: " + userName)
    try {
      const usersCollectionRef = collection(this.firebaseDatabase, "users");
      const userSnapshot = await getDocs(usersCollectionRef);
      let userId = null;
      userSnapshot.forEach((doc) => {
          const userData = doc.data();
          console.log("Userliste: " + userData['name']);
          if (userData['name'] == userName) {
              userId = doc.id;
              console.log("Die User Id"+userId)
              this.addChannelToUserTwo(channelName, userId)
          }
      });
      if (!userId) {
          console.log("Kein Benutzer mit diesem Namen gefunden.");
          return;
      }
      const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
      await updateDoc(channelDocRef, {
          members: arrayUnion(userId)
      });
      console.log(`Benutzer ${userName} wurde erfolgreich zum Channel ${channelName} hinzugefügt.`);
  } catch (error) {
      console.error("Fehler beim Hinzufügen des Benutzers zum Channel:", error);
  }
  }
  async deleteChannelAtMember(channelName:string){
    const userId = localStorage.getItem("userId");
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
    const channelDocSnap = await getDoc(channelDocRef);
    if (channelDocSnap.exists()) {
        await updateDoc(channelDocRef, {
            members: arrayRemove(userId)
        });
    }
    const userDocRef = doc(this.firebaseDatabase, `users/${userId}` );
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
      await updateDoc(userDocRef, {
          channels: arrayRemove(channelName)
      });
    }
  }
  async changeChannelDescription(channelName:string, newDescription:string){
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
    await updateDoc(channelDocRef, {
      description: newDescription
  })
}

  async changeChannelName(oldChannelName: string, newChannelName: string){
    const oldChannelDocRef = doc(this.firebaseDatabase, `channels/${oldChannelName}`);
    const newChannelDocRef = doc(this.firebaseDatabase, `channels/${newChannelName}`);
    const channelSnap = await getDoc(oldChannelDocRef);
    if (!channelSnap.exists()) {
        console.error("Der alte Channel existiert nicht!");
        return;
    }
    const channelData = channelSnap.data();
    await setDoc(newChannelDocRef, channelData);
    await deleteDoc(oldChannelDocRef);

  }
}
