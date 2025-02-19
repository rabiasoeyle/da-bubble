import { Component, inject} from '@angular/core';
import { AuthService } from '../auth.service';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserData } from '../../modules/user';
import { Message } from '../../modules/messages';
import { Channel } from '../../modules/channel';
import { Member } from '../../modules/member';
import { Chat } from '../../modules/chat';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent,ReactiveFormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})

export class MainComponent{
  router = inject(Router);
  fb = inject(FormBuilder);
  // booleans
  sidenavIsOpen:boolean = true;
  directMessagesOpen:boolean = true;
  channelsOpen:boolean = true;
  addChannelOpen:boolean = false;
  addMemberToChannel:boolean = false;
  openDetailsOfChannel:boolean = false;
  editChannel:boolean=false;
  channelDeleted:boolean=false;
  membersOfChannelList:boolean=false;
  memberDetails:boolean= false;
  //forms
  addChannelForm = this.fb.nonNullable.group({
      channelname:['', Validators.required],
      description:['', Validators.required],
    })
  sendMessageForm = this.fb.nonNullable.group({
    message:['', Validators.required],
    })
  addMemberForm = this.fb.nonNullable.group({
    name:['', Validators.required],
  })
  changeChannelNameForm = this.fb.nonNullable.group({
    name:['', Validators.required],
  })
  changeChannelDescrForm =this.fb.nonNullable.group({
    description:['', Validators.required],
  })
  editMessageForm= this.fb.nonNullable.group({
    message:['', Validators.required],
    })
  
  userData: UserData | null = null;
  sidenavButtonText:string="Workspace-Menü schließen";
  currentChannel: Channel|null = null;
  allDaBubbleUser:[]=[];
  deletedChannelname:string="";
  currentProfileDetail:any;
  userChats:Chat[]=[];
  userChat:{}={};
  currentChat:any|null = null;
  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.loadLiveUserData();
    this.loadUserChats();
  }
  async loadUserChats(){
    this.userChats = [];
    if(this.userData){
       const userChat: Chat[] = await this.authService.getUserChats(this.userData?.uid);
       if (userChat) {
        this.userChats.push(...userChat);
      }
    }
  }
  loadLiveUserData(){
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      if(this.userData == null){
        this.router.navigateByUrl('');
      }
    });
  }
  changeSidenavStatus(){
    this.sidenavIsOpen = !this.sidenavIsOpen;
    if(this.sidenavIsOpen){
      this.sidenavButtonText="Workspace-Menü schließen"
    }else{
      this.sidenavButtonText="Workspace-Menü öffnen"
    }
  }
  changeChannelAreaStatus(){
    this.channelsOpen = !this.channelsOpen;
  }
  changeMessageAreaStatus(){
    this.directMessagesOpen = !this.directMessagesOpen;
  }
  addChannelDialog(){
    this.addChannelOpen = !this.addChannelOpen;
  }
  onAddChannel(){
    const rawForm = this.addChannelForm.getRawValue();
    this.authService.createChannel(rawForm.channelname, rawForm.description);
    setTimeout(()=>this.loadLiveUserData(),4000);
    this.addChannelDialog();
  }
  openChannel(channelName: string) {
    this.authService.getChannelLiveUpdates(channelName);
    this.authService.currentChannel.subscribe(async (data) => {
    if (!data) {
      this.currentChannel = null;
      return;
    }
    const messagesWithUserData = data.messages ? await this.loadMessages(data.messages): [];
    const membersWithUserData = data.members ? await this.loadMembers(data.members): [];
    const creatorUID: string = data.created.createdFrom; // Einzelne UID aus Firebase
    const creator = await this.authService.getUserInfo(creatorUID);
    const createdAt = data.created.createdAt? (data.created.createdAt.toDate() || new Date(data.created.createdAt)): null; // Timestamp umwandeln
    const formattedDate = this.formatDate(createdAt);
    this.currentChannel = {
      name: data.name || channelName,
      description: data.description || "Keine Beschreibung verfügbar",
      created: {
        createdFrom: creator['name'],
        createdAt:formattedDate,
      },
      messages: messagesWithUserData,
      members:membersWithUserData,
      membersAmount:data.members.length,
    };});
  }
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
  sendMessage(){
    const rawForm = this.sendMessageForm.getRawValue();
    if(this.currentChannel){
      this.authService.sendMessage(rawForm.message, this.currentChannel.name);
    }
  }
  sendPrivateMessage(){
    const rawForm = this.sendMessageForm.getRawValue();
    if(this.currentChat){
      this.authService.sendPrivateMessage(rawForm.message, this.currentChat.uid);
      console.log("test sendprivatemessages", this.currentChat)
    }
  }
  openDetailsAboutChannel(){
    this.openDetailsOfChannel = !this.openDetailsOfChannel;
  }
  addMembersToChannelDialog(){
    this.membersOfChannelList=false;
    this.addMemberToChannel =!this.addMemberToChannel;
  }
  addMembersToChannel(chnnlnme:string){
    const rawForm = this.addMemberForm.getRawValue();
    this.authService.addMembersToChannel(chnnlnme, rawForm.name);
  }
  deleteChannelAtUser(channelname:string){
    this.authService.deleteChannelAtMember(channelname);
    if(this.editChannel){
      this.editChannel=false;
    }
    this.openDetailsAboutChannel();
    if(this.currentChannel){
      this.deletedChannelname = this.currentChannel.name;
    }
    this.channelDeleted = true;
    this.currentChannel = null;
    this.authService.unsubscribeFromChannel();
  }
  openEditChannel(){
    this.editChannel = !this.editChannel;
  }
  changeChannelName(){
    const rawForm = this.changeChannelNameForm.getRawValue();
    if(this.currentChannel && rawForm.name !=""){
      this.authService.changeChannelName(this.currentChannel.name, rawForm.name);
      this.authService.changeChannelNameForUsers(this.currentChannel.name, rawForm.name);
    }
    setTimeout(()=>{
      this.openEditChannel(),this.openChannel(rawForm.name), this.openDetailsAboutChannel()
    },200);
  }
  changeChannelDescription(){
    const rawForm = this.changeChannelDescrForm.getRawValue();
    if(this.currentChannel && rawForm.description !=""){
    this.authService.changeChannelDescription(this.currentChannel.name, rawForm.description);
    }console.log(rawForm.description);
    this.openEditChannel();
  }
  startEditMessage(id:number){
    if(this.currentChannel){
      const msg = this.currentChannel.messages[id];
      msg.editing = true;
    }
  }
  closeEditMessage(id:number){
    if(this.currentChannel){
      const msg = this.currentChannel.messages[id];
      msg.editing = false;
    }
  }
  editMessage(id:number){
    const rawForm = this.editMessageForm.getRawValue();
    if(this.currentChannel && rawForm.message !=""){
      this.authService.editMessage(this.currentChannel.name, rawForm.message, id);
      }console.log(rawForm.message);
  }
  openMembersList(){
    this.membersOfChannelList = !this.membersOfChannelList;
  }
  async openUserDetails(idx:number){
    this.membersOfChannelList = false;
    this.addMemberToChannel = false;
    if(this.memberDetails = true && idx==9999){
      this.memberDetails = false;
      return
    }
    this.currentProfileDetail = await this.authService.getUserInfo(this.currentChannel?.members[idx].uid);
    console.log(this.currentProfileDetail);
    this.memberDetails = !this.memberDetails;
    
  }
  async goToPersonalMessages(){
    if(this.userData){
      const messagesWMembers = await this.authService.createChat(this.userData?.uid, this.currentProfileDetail.uid )
    } await this.loadUserChats().then(() => {
      setTimeout(() => {
        for (let i = 0; i < this.userChats.length; i++) {
          console.log("number:", i);
          console.log(this.userChats[i].chatPartner.uid, "&", this.currentProfileDetail.uid);
          if (this.userChats[i].chatPartner.uid == this.currentProfileDetail.uid) {
            this.openChat(i);
            console.log("number:", i);
          }
        }
      }, 200);
    });
    this.memberDetails = false;
  }
  async openChat(idx:number){
    this.currentChannel = null;
    this.currentChat = null;
    await this.authService.getChatLiveUpdates(this.userChats[idx].chatId);
    this.authService.currentChat.subscribe(async (data) => {
    if (!data) {
      this.currentChat = null;
      return;
    }
    const messagesWithUserData = data.messages ? await this.loadMessages(data.messages): [];
    const membersWithUserData = data.members ? await this.loadMembers(data.members):[];
    const chatpartner = this.showChatPartner(membersWithUserData);
    this.currentChat={
          uid:data.uid || this.userChats[idx].chatId,
          createdAt:data.createdAt,
          members: membersWithUserData,
          messages: messagesWithUserData,
          chatpartner: chatpartner,
        };
    })
  }
  showChatPartner(members:Member[]){
    for(let i = 0; i < members.length; i++){
      if(members[i].uid !== this.userData?.uid){
        return members[i].username;
      }
    }return "Unbekannt";
  }
  
}