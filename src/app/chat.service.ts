import { inject, Injectable } from '@angular/core';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, Firestore, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Chat } from '../modules/chat';
import { Message, Reaction } from '../modules/messages';
import { Member } from '../modules/member';
import { Channel } from '../modules/channel';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  firebaseDatabase = inject(Firestore);
  currentUid: string | null = null;
  currentChannel = new BehaviorSubject<any>(null);
  allChats:any=[];
  allChannels:Channel[]=[];
  channelIsCreatable:boolean=false;
  channelNameIsAvailable:boolean=false;
  private chatUnsubscribe: (() => void) | null = null;
  private channelUnsubscribe: (() => void) | null = null;
  private currentChatSubject = new BehaviorSubject<any | null>(null);
  currentChat$ = this.currentChatSubject.asObservable();
  
  constructor(private userService:UserService) { 
  } 

  async loadMessages(messages:Message[]){
    const messagesWithUserData = await Promise.all(
      messages.map(async (msg: Message) => {
        const userInfo = await this.userService.getUserInfo(msg.uid);
        const time = msg.timestamp
        const formattedDateMessage = this.formatDate(time);
        const formatHour = this.formatHour(time);
        return {
          uid: msg.uid, 
          timestamp: formattedDateMessage,
          date:msg.timestamp,
          clock:formatHour,
          message:msg.message,
          name: userInfo? userInfo['name'] : "Unbekannt",
          fotolink: userInfo? userInfo['fotolink'] : "./assets/img/profile.png",
          editing:false,
          reactions:msg.reactions
        };
      })
    );
    return messagesWithUserData;
  }

  async getChannelMembers(channelName:string){
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
    const channelDocSnap = await getDoc(channelDocRef);
    if (channelDocSnap.exists()) {
      const data = channelDocSnap.data();
      const members = data['members']; // Das ist dann ein Array
      return this.loadMembers(members);
    }return null
  }

  async loadMembers(members:string[]):Promise<Member[]>{
    const membersWithUserData = await Promise.all(
      members.map(async (uid: string) => {
        const userInfo = await this.userService.getUserInfo(uid);
        return {
          uid: uid,
          name: userInfo ? userInfo['name'] : "Unbekannt",
          fotolink: userInfo ? userInfo['fotolink'] : "./assets/img/profile.png",
          email:userInfo ? userInfo['email'] : "default.png",
          presenceStatus:userInfo?userInfo['presenceStatus']:false,
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

  formatHour(createdAt:any){
    const formattedHour = new Date(createdAt).toLocaleString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formattedHour;
  }

  updateChat(chat: Chat) {
    this.currentChatSubject.next(chat);
  }

  async createChannel(channelname:string, description:string){
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelname}`);
    const channelSnapControle= await getDoc(channelDocRef);
    if (channelSnapControle.exists()) {
      this.channelIsCreatable=false;
    }else{
      this.channelIsCreatable=true;
      const userId = localStorage.getItem("userId");
      await setDoc(channelDocRef, {
        description:description,
        messages:[],
        created:{
          createdFrom:userId,
          createdAt:new Date(),
        },
        members:[userId],
      }); 
      this.addChannelToUser(channelname);
      this.userService.getUserLiveUpdates();
    }
  }

  async addChannelToUser(channelname:string){
    const userId = localStorage.getItem("userId");
    const userDocRef = doc(this.firebaseDatabase, `users/${userId}`);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      await setDoc(userDocRef, { channels: [channelname] });
    } else {
      await updateDoc(userDocRef, {
        channels: arrayUnion(channelname)
      });
    }
  }

  async addChannelToUserTwo(channelname:string, userId:string){
    const userDocRef = doc(this.firebaseDatabase, `users/${userId}`);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      await setDoc(userDocRef, { channels: [channelname] });
    } else {
      await updateDoc(userDocRef, {
        channels: arrayUnion(channelname)
      });
    }
  }
  
  async addMembersToChannel(channelName:string, userName:string){
    try {
      const usersCollectionRef = collection(this.firebaseDatabase, "users");
      const userSnapshot = await getDocs(usersCollectionRef);
      let userId = null;
      userSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData['name'] == userName) {
              userId = doc.id;
              this.addChannelToUserTwo(channelName, userId)
          }});
          if (!userId) {return;}
      const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
      await updateDoc(channelDocRef, {members: arrayUnion(userId)});
    }catch (error) {
      console.error("Fehler beim Hinzufügen des Benutzers zum Channel:", error);
    }
  }

  async deleteChannelAtMember(channelName:string){
    const userId = localStorage.getItem("userId");
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
    const channelDocSnap = await getDoc(channelDocRef);
    if (channelDocSnap.exists()) {
        await updateDoc(channelDocRef, {members: arrayRemove(userId)});
    }
    const userDocRef = doc(this.firebaseDatabase, `users/${userId}` );
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {await updateDoc(userDocRef, {channels: arrayRemove(channelName)});
    }
  }

  async changeChannelDescription(channelName:string, newDescription:string){
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
    await updateDoc(channelDocRef, {description: newDescription})
  }

  async checkIfNameAvailable(newChannelName:string){
    const newChannelDocRef = doc(this.firebaseDatabase, `channels/${newChannelName}`);
    const channelSnapControle= await getDoc(newChannelDocRef);
    if (channelSnapControle.exists()) {
      this.channelNameIsAvailable=false;
      return false;
    }else{
      this.channelNameIsAvailable=true;
      return true;
    }
  }

  async changeChannelName(oldChannelName: string, newChannelName: string){
    const oldChannelDocRef = doc(this.firebaseDatabase, `channels/${oldChannelName}`);
    const newChannelDocRef = doc(this.firebaseDatabase, `channels/${newChannelName}`);
    const channelSnap = await getDoc(oldChannelDocRef);
    if (!channelSnap.exists()) {return;}
      else{
        const channelData = channelSnap.data();
        await setDoc(newChannelDocRef, channelData);
        await deleteDoc(oldChannelDocRef);
        console.log("changeChannelName"+this.channelNameIsAvailable)
      }
    
  }

  async changeChannelNameForUsers(oldChannelName: string, newChannelName: string) {
    const usersCollectionRef = collection(this.firebaseDatabase, "users");
    const usersSnapshot = await getDocs(usersCollectionRef);
      const updatePromises = usersSnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          if (userData['channels'] && userData['channels'].includes(oldChannelName)) {
              await updateDoc(doc(this.firebaseDatabase, `users/${userDoc.id}`), {
                  channels: arrayRemove(oldChannelName)
              });
              await updateDoc(doc(this.firebaseDatabase, `users/${userDoc.id}`), {
                  channels: arrayUnion(newChannelName)
              });
          }
      });
      await Promise.all(updatePromises);
      this.userService.getUserLiveUpdates();
      console.log("changeChannelNameForUsers"+this.channelNameIsAvailable)
  }

  async removeEmojiReaction(channelName: string, messageIdx:number, reactionIdx:number, senderUid: string) {
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
    const channelSnap = await getDoc(channelDocRef);
    const channelData = channelSnap.data();
    if (channelData) {
      const updatedMessages = [...channelData['messages']];
      const message = updatedMessages[messageIdx];
      let reactions: { senderUid: string; reaction: any }[] = message.reactions || [];
      if (
        reactionIdx >= 0 &&
        reactionIdx < reactions.length &&
        reactions[reactionIdx].senderUid === senderUid
      ) {
        reactions.splice(reactionIdx, 1);
        updatedMessages[messageIdx] = {
          ...message,
          reactions: reactions
        };
        await updateDoc(channelDocRef, { messages: updatedMessages });
      } else {
        console.warn("Reaktion existiert nicht oder gehört nicht dem User.");
      }
    }
  }
  async removeEmojiReactionChat(chatId: string, messageIdx:number, reactionIdx:number, senderUid: string) {
    const chatDocRef = doc(this.firebaseDatabase, `chats/${chatId}`);
    const chatSnap = await getDoc(chatDocRef);
    const chatData = chatSnap.data();
    if (chatData) {
      const updatedMessages = [...chatData['messages']];
      const message = updatedMessages[messageIdx];
      let reactions: { senderUid: string; reaction: any }[] = message.reactions || [];
      if (reactionIdx >= 0 &&reactionIdx < reactions.length &&reactions[reactionIdx].senderUid === senderUid) {
        reactions.splice(reactionIdx, 1);
        updatedMessages[messageIdx] = {
          ...message,
          reactions: reactions
        };
        await updateDoc(chatDocRef, { messages: updatedMessages });
      } else {
      }
    }
  }

  async addEmojiReaction(channelName: string, emoji: any, idx: number, senderUid: string) {
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
    const channelSnap = await getDoc(channelDocRef);
    const channelData = channelSnap.data();
    if (channelData) {
      const updatedMessages = [...channelData['messages']];
      const message = updatedMessages[idx];
      const reactions: Reaction[] = message.reactions || [];
      const existingReactionIndex = reactions.findIndex(r => r.senderUid == senderUid);
      if (existingReactionIndex !== -1) {
        reactions[existingReactionIndex].reaction = emoji;
      } else {
        reactions.push({ senderUid, reaction: emoji });
      }
      updatedMessages[idx] = {
        ...message,
        reactions: reactions
      };
  
      await updateDoc(channelDocRef, { messages: updatedMessages });
    }
  }
  async addEmojiReactionChat(chatId: string, emoji: any, idx: number, senderUid: string) {
    const chatDocRef = doc(this.firebaseDatabase, `chats/${chatId}`);
    const chatSnap = await getDoc(chatDocRef);
    const chatData = chatSnap.data();
    if (chatData) {
      const updatedMessages = [...chatData['messages']];
      const message = updatedMessages[idx];
      const reactions: Reaction[] = message.reactions || [];
      const existingReactionIndex = reactions.findIndex(r => r.senderUid == senderUid);
      if (existingReactionIndex !== -1) {
        reactions[existingReactionIndex].reaction = emoji;
      } else {
        reactions.push({ senderUid, reaction: emoji });
      }
      updatedMessages[idx] = {
        ...message,
        reactions: reactions
      };
      await updateDoc(chatDocRef, { messages: updatedMessages });
    }
  }

  async editMessage(channelName:string, newMessage:string, id:number){
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
      const channelSnap = await getDoc(channelDocRef);
      const channelData = channelSnap.data();
      if(channelData){
        const updatedMessages = [...channelData['messages']];
      updatedMessages[id] = {
          ...updatedMessages[id],
          message: newMessage
      };
      await updateDoc(channelDocRef, {messages: updatedMessages});
      } 
  }

  async editPrivateMessage(chatId:string, newMessage:string, id:number){
    const chatDocRef = doc(this.firebaseDatabase, `chats/${chatId}`);
      const chatSnap = await getDoc(chatDocRef);
      const chatData = chatSnap.data();
      if(chatData){
        const updatedMessages = [...chatData['messages']];
        updatedMessages[id] = {
            ...updatedMessages[id],
            message: newMessage
        };
      await updateDoc(chatDocRef, {messages: updatedMessages});
      } 
  }
    
  async createChat(userId:string, memberId:string){
    const chatsRef = collection(this.firebaseDatabase, "chats");
    const querySnapshot = await getDocs(chatsRef);
    for (const docSnap of querySnapshot.docs) {
      const chatData = docSnap.data();
      if (chatData['members'] && chatData['members'].includes(userId) && chatData['members'].includes(memberId)) {
        return docSnap.id;}
    }
    const newChatRef = await addDoc(chatsRef, {
      members: [userId, memberId],
      createdAt: new Date(),
      messages:[]
    });
    this.saveNewChatAtBothUsers(userId,newChatRef,memberId);
    return newChatRef.id;
  }

  async saveNewChatAtBothUsers(userId:string,newChatRef:any,memberId:string){
    const userDocRef = doc(this.firebaseDatabase, `users/${userId}`);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, { chats:newChatRef.id });
      } else {
        await updateDoc(userDocRef, {
          chats: arrayUnion(newChatRef.id)
        });
      }
      const userDocRefTwo = doc(this.firebaseDatabase, `users/${memberId}`);
      const docSnapTwo = await getDoc(userDocRef);
      if (!docSnapTwo.exists()) {
        await setDoc(userDocRefTwo, { chats:newChatRef.id });
      } else {
        await updateDoc(userDocRefTwo, {chats: arrayUnion(newChatRef.id)});
      }
  }
    
  async getUserChats(userId: string): Promise<Chat[]> {
    const chatIds = await this.getUserChatIds(userId);
    return this.getChatDetails(chatIds, userId);
  }

  async getChatDetails(chatIds: string[], userId: string): Promise<Chat[]> {
    const chatDetails: Chat[] = [];
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
          chatId: chatId,
          chatData: chatData,
          chatPartner: {
            uid: chatPartnerId,
            name: partnerData['name'],
            email: partnerData['email'],
            fotolink: partnerData['fotolink'],
            presenceStatus: partnerData['presenceStatus'],
          },});}}
    return chatDetails;
  }

  async getUserChatIds(userId: string): Promise<string[]> {
    const userRef = doc(this.firebaseDatabase, `users/${userId}`);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    if (!userData || !userData['chats']) {
      return [];
    }
    return userData['chats'];
  }
    
  async getChatLiveUpdates(chatId: string) {
    const chatDocRef = await doc(this.firebaseDatabase, `chats/${chatId}`);
    this.unsubscribeFromChat();
    this.unsubscribeFromChannel();
    return this.chatUnsubscribe = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        this.currentChatSubject.next(docSnap.data());
      } else {
        this.currentChatSubject.next(null);
      }
    }, (error) => {
      console.error("Firestore Live-Update Fehler:", error);
    });
  }

  unsubscribeFromChat() {
  if (this.chatUnsubscribe) {
    this.chatUnsubscribe();
    this.chatUnsubscribe = null;
    this.currentChatSubject.next(null);
  }
  }

  async loadChatData(chatId:string){
    const chatRef = doc(this.firebaseDatabase, `chats/${chatId}`);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
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
        timestamp: new Date().toISOString(),
        reactions:[]
      })
    });
  }

  getChannelLiveUpdates(channelName: string) {
    const channelDocRef = doc(this.firebaseDatabase, `channels/${channelName}`);
    this.unsubscribeFromChannel();
    this.unsubscribeFromChat();
    return this.channelUnsubscribe = onSnapshot(channelDocRef, (docSnap) => {
      if (docSnap.exists()) {
        this.currentChannel.next(docSnap.data());
      } else {
        this.currentChannel.next(null);
      }
    }, (error) => {
      console.error("Firestore Live-Update Fehler:", error);
    });
  }

  unsubscribeFromChannel() {
    if (this.channelUnsubscribe) {
        this.channelUnsubscribe();
        this.channelUnsubscribe = null;
        this.currentChannel.next(null);
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
        timestamp: new Date().toISOString(),
        reactions:[]
      })
    });
  }
}