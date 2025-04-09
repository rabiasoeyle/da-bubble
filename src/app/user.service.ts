import { inject, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, getDocs, onSnapshot, setDoc} from '@angular/fire/firestore';
import { UserData } from '../modules/user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  firebaseDatabase = inject(Firestore);
  allUsers:UserData[]=[];

  constructor(private authService:AuthService) {
    this.loadAllUsers();
  }

  private async loadAllUsers() {
    try {
      const usersCollection = collection(this.firebaseDatabase, 'users'); // Referenz zur Collection
      const userSnapshot = await getDocs(usersCollection); // Daten aus Firestore abrufen
      userSnapshot.forEach((doc) => {
        const user = doc.data();
        this.allUsers.push({
          uid: doc.id, // Firestore-Dokumenten-ID als UID speichern
          name: user['name'] || '',
          email: user['email'] || '',
          fotolink: user['fotolink'] || './assets/img/profile.png',
          channels: user['channels'] || [],
          chats: user['chats'] || [],
          presenceStatus:user['presenceStatus']||[]
        });
      });
    } catch (error) {
    }
  }

  searchUsers(searchTerm: string){
    if (!searchTerm.trim()) return [];
    searchTerm = searchTerm.toLowerCase(); 
    return this.allUsers
      .filter(user => user.name.toLowerCase().includes(searchTerm)) 
      .map(user => ({ name: user.name, uid: user.uid })); 
  }

  searchUsersWithMail(searchTerm: string){
    if (!searchTerm.trim()) return []; // Falls leer, nichts zurückgeben
    searchTerm = searchTerm.toLowerCase(); // Kleinbuchstaben für bessere Treffer
    return this.allUsers
    .filter(user => user.email.toLowerCase().includes(searchTerm)) // Filtere passende Nutzer
    .map(user => ({ name: user.name, email: user.email, uid: user.uid })); 
  }

  async getUserInfo(uid: string) {
      try {
        const userRef = doc(this.firebaseDatabase, `users/${uid}`);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          return userData;
        }
        else{
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
        this.authService.userDataSubject.next(data); // Daten direkt setzen
      } else {
        this.authService.userDataSubject.next(null);
      }
    }, (error) => {
      console.error("Firestore Live-Update Fehler:", error);
    });
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
      const currentData = this.authService.userDataSubject.value;
      if (currentData) {
        this.authService.userDataSubject.next({ ...currentData, name });
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Namens:', error);
    }
  }

}
