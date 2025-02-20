import { inject, Injectable } from '@angular/core';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, Firestore, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { Chat } from '../modules/chat';
import { Message } from '../modules/messages';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  firebaseDatabase = inject(Firestore);
  authService = inject(AuthService);
  currentUid: string | null = null;
  currentChannel = new BehaviorSubject<any>(null);
  // currentChat = new BehaviorSubject<any>(null);
  private chatUnsubscribe: (() => void) | null = null;
  private channelUnsubscribe: (() => void) | null = null;
  private currentChatSubject = new BehaviorSubject<any | null>(null);
  currentChat$ = this.currentChatSubject.asObservable();



  constructor() { }
  async loadMessages(messages:Message[]){
      const messagesWithUserData = await Promise.all(
        messages.map(async (msg: Message) => {
          const userInfo = await this.authService.getUserInfo(msg.uid);
          const time = msg.timestamp
          const formattedDateMessage = this.formatDate(time);
          return {
            uid: msg.uid, 
            timestamp: formattedDateMessage,
            message:msg.message,
            username: userInfo? userInfo['name'] : "Unbekannt",
            fotolink: userInfo? userInfo['fotolink'] : "default.png",
            editing:false,
          };
        })
      );
      return messagesWithUserData;
    }
    async loadMembers(members:string[]){
      const membersWithUserData = await Promise.all(
        members.map(async (uid: string) => {
          const userInfo = await this.authService.getUserInfo(uid);
          return {
            uid: uid,
            username: userInfo ? userInfo['name'] : "Unbekannt",
            fotolink: userInfo ? userInfo['fotolink'] : "default.png",
            email:userInfo ? userInfo['email'] : "default.png"
          };
        })
      );
      return membersWithUserData;
    }
    formatDate(createdAt:any){
      const formattedDate = new Date(createdAt).toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return formattedDate;
    }
  updateChat(chat: Chat) {
  this.currentChatSubject.next(chat); // Löst Update aus
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
    this.authService.getUserLiveUpdates();
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
    async changeChannelNameForUsers(oldChannelName: string, newChannelName: string) {
      const usersCollectionRef = collection(this.firebaseDatabase, "users");
      const usersSnapshot = await getDocs(usersCollectionRef);
      const updatePromises = usersSnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          if (userData['channels'] && userData['channels'].includes(oldChannelName)) {
              await updateDoc(doc(this.firebaseDatabase, `users/${userDoc.id}`), {
                  channels: arrayRemove(oldChannelName) // Entfernt den alten Namen
              });
              await updateDoc(doc(this.firebaseDatabase, `users/${userDoc.id}`), {
                  channels: arrayUnion(newChannelName) // Fügt den neuen Namen hinzu
              });
          }
      });
      await Promise.all(updatePromises);
      this.authService.getUserLiveUpdates();
    }
  async editMessage(channelName:string, newMessage:string, id:number){
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
      const channelSnap = await getDoc(channelDocRef);
      const channelData = channelSnap.data();
      if(channelData){
        const updatedMessages = [...channelData['messages']];
      updatedMessages[id] = {
          ...updatedMessages[id], // Bestehende Daten beibehalten
          message: newMessage
      };
      await updateDoc(channelDocRef, {
          messages: updatedMessages
      });
      }
      
  }
  async editPrivateMessage(chatId:string, newMessage:string, id:number){
    console.log("Blablablub", chatId,newMessage, id )
    const chatDocRef = doc(this.firebaseDatabase, `chats/${chatId}`);
      const chatSnap = await getDoc(chatDocRef);
      const chatData = chatSnap.data();
      if(chatData){
        const updatedMessages = [...chatData['messages']];
        updatedMessages[id] = {
            ...updatedMessages[id], // Bestehende Daten beibehalten
            message: newMessage
        };
      await updateDoc(chatDocRef, {
          messages: updatedMessages
      });
      }
      
  }
  async createChat(userId:string, memberId:string){
    const chatsRef = collection(this.firebaseDatabase, "chats");
    const querySnapshot = await getDocs(chatsRef);
    for (const docSnap of querySnapshot.docs) {
      const chatData = docSnap.data();
      if (chatData['members'] && chatData['members'].includes(userId) && chatData['members'].includes(memberId)) {
        return docSnap.id;
      }
    }
    const newChatRef = await addDoc(chatsRef, {
      members: [userId, memberId],
      createdAt: new Date(),
      messages:[]
    });
    const userDocRef = doc(this.firebaseDatabase, `users/${userId}`);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, { chats:newChatRef.id }); // Erstes Array erstellen
      } else {
        await updateDoc(userDocRef, {
          chats: arrayUnion(newChatRef.id) // Neuen Channel zum Array hinzufügen
        });
      }
      const userDocRefTwo = doc(this.firebaseDatabase, `users/${memberId}`);
      const docSnapTwo = await getDoc(userDocRef);
      if (!docSnapTwo.exists()) {
        await setDoc(userDocRefTwo, { chats:newChatRef.id }); // Erstes Array erstellen
      } else {
        await updateDoc(userDocRefTwo, {
          chats: arrayUnion(newChatRef.id) // Neuen Channel zum Array hinzufügen
        });
      }
    return newChatRef.id;
  }
  async getUserChats(userId: string) {
    const userRef = doc(this.firebaseDatabase, `users/${userId}`);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    if (!userData || !userData['chats']) return [];
    const chatIds: string[] = userData['chats'];
    const chatDetails = [];
    for (const chatId of chatIds) {
      const chatRef = doc(this.firebaseDatabase, `chats/${chatId}`);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        const chatMembers: string[] = chatData['members'];
        const chatPartnerId = chatMembers.find((id) => id !== userId);
        if (!chatPartnerId) continue;
        const partnerRef = doc(this.firebaseDatabase, `users/${chatPartnerId}`);
        const partnerSnap = await getDoc(partnerRef);
        const partnerData = partnerSnap.exists() ? partnerSnap.data() : {};
        chatDetails.push({
          chatId,
          chatData,
          chatPartner: { 
            uid: chatPartnerId,
            name: partnerData['name'],                
            email: partnerData['email'],              
            fotolink: partnerData['fotolink'], 
            channels:partnerData['channels'],
            chats:partnerData['chats'], 
          }
        });
      }
    }
    console.log("ChatDetails: ", chatDetails);
    return chatDetails;
  }
  
  async getChatLiveUpdates(chatId: string) {
    const chatDocRef = await doc(this.firebaseDatabase, `chats/${chatId}`);
    this.unsubscribeFromChat();
    this.unsubscribeFromChannel();
    return this.chatUnsubscribe = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        this.currentChatSubject.next(docSnap.data()); // Daten direkt setzen
      } else {
        this.currentChatSubject.next(null); // Falls der Channel nicht existiert
      }
    }, (error) => {
      console.error("Firestore Live-Update Fehler:", error);
    });
  }
  unsubscribeFromChat() {
  if (this.chatUnsubscribe) {
    this.chatUnsubscribe(); // Live-Update deaktivieren
    this.chatUnsubscribe = null;
    this.currentChatSubject.next(null); // Channel beim User entfernen
  }
  }
  async loadChatData(chatId:string){
    const chatRef = doc(this.firebaseDatabase, `chats/${chatId}`);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        console.log("chatData:  ", chatData);
    }
  }
  async sendPrivateMessage(message:string, chatId:string){
    const userId = localStorage.getItem("userId");
    const time = new Date();
    const channelRef = doc(this.firebaseDatabase, `chats/${chatId}`);
    await updateDoc(channelRef, {
      messages: arrayUnion({
        uid: userId,
        message: message,
        timestamp: new Date().toISOString()
      })
    });
  }
  getChannelLiveUpdates(channelName: string) {
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
    this.unsubscribeFromChannel();
    this.unsubscribeFromChat();
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
}
