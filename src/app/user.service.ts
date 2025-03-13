import { inject, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Auth } from '@angular/fire/auth';
import { collection, Firestore, getDocs} from '@angular/fire/firestore';
import { UserData } from '../modules/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  firebase = inject(FirebaseApp);
  firebaseAuth = inject(Auth);
  firebaseDatabase = inject(Firestore);
  // private db: Firestore = inject(Firestore);
  allUsers:UserData[]=[];

  constructor() {
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
          chats: user['chats'] || []
        });
      });
      // console.log("✅ [DEBUG] Alle User geladen:", this.allUsers);
    } catch (error) {
      // console.error("❌ Fehler beim Laden der User:", error);
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

}
