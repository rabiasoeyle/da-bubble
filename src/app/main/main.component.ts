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
import { ChatComponent } from './chat/chat.component';
import { ChatService } from '../chat.service';
import { ChannelComponent } from './channel/channel.component';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent,ReactiveFormsModule, SidenavComponent, ChatComponent, ChannelComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})

export class MainComponent{
  router = inject(Router);
  fb = inject(FormBuilder);
  // booleans
  sidenavIsOpen:boolean = true;
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
  messageIdx:number= 0;
  currentChannelName:string= "kein Channel";
  constructor(private authService: AuthService, private chatService:ChatService) {
  }
  ngOnInit() {
    this.loadLiveUserData();
    this.loadUserChats();
  }
  async loadUserChats(){
    this.userChats = [];
    if(this.userData){
       const userChat: Chat[] = await this.chatService.getUserChats(this.userData?.uid);
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
  addChannelDialog(){
    this.addChannelOpen = !this.addChannelOpen;
  }
  onAddChannel(){
    const rawForm = this.addChannelForm.getRawValue();
    this.chatService.createChannel(rawForm.channelname, rawForm.description);
    setTimeout(()=>this.loadLiveUserData(),4000);
    this.addChannelDialog();
  }
  sendMessage(message:string){
    const rawForm = this.sendMessageForm.getRawValue();
    if(this.currentChannel){
      this.chatService.sendMessage(message, this.currentChannel.name);
    }
  }
  openDetailsAboutChannel(){
    this.openDetailsOfChannel = !this.openDetailsOfChannel;
  }
  openChannel(channelName: string) {
    this.currentChannelName = channelName;
    console.log(this.currentChannelName)
    this.currentChannel={
      name: "string",
      description: "string",
      messages: [],
      created:{
        createdFrom:"any",
        createdAt:"string",
      },
      members:[],
      membersAmount:1,
    }
  }
  saveCurrentChannelValue(Channel:Channel){

  }
  addMembersToChannelDialog(){
    this.membersOfChannelList=false;
    this.addMemberToChannel =!this.addMemberToChannel;
  }
  addMembersToChannel(chnnlnme:string){
    const rawForm = this.addMemberForm.getRawValue();
    this.chatService.addMembersToChannel(chnnlnme, rawForm.name);
  }
  deleteChannelAtUser(channelname:string){
    this.chatService.deleteChannelAtMember(channelname);
    if(this.editChannel){
      this.editChannel=false;
    }
    this.openDetailsAboutChannel();
    if(this.currentChannel){
      this.deletedChannelname = this.currentChannel.name;
    }
    this.channelDeleted = true;
    this.currentChannel = null;
    this.chatService.unsubscribeFromChannel();
  }
  openEditChannel(){
    this.editChannel = !this.editChannel;
  }
  changeChannelName(){
    const rawForm = this.changeChannelNameForm.getRawValue();
    if(this.currentChannel && rawForm.name !=""){
      this.chatService.changeChannelName(this.currentChannel.name, rawForm.name);
      this.chatService.changeChannelNameForUsers(this.currentChannel.name, rawForm.name);
    }
    setTimeout(()=>{
      this.openEditChannel(),this.openChannel(rawForm.name), this.openDetailsAboutChannel()
    },200);
  }
  changeChannelDescription(){
    const rawForm = this.changeChannelDescrForm.getRawValue();
    if(this.currentChannel && rawForm.description !=""){
    this.chatService.changeChannelDescription(this.currentChannel.name, rawForm.description);
    }
    this.openEditChannel();
  }
  startEditMessage(id:number){
    this.messageIdx= id;
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
  editMessage(message:string){
    // const rawForm = this.editMessageForm.getRawValue();
    if(this.currentChannel && message !=""){
      this.chatService.editMessage(this.currentChannel.name, message, this.messageIdx);
    }
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
    this.memberDetails = !this.memberDetails;
  }
  async goToPersonalMessages(){
    if(this.userData){
      const messagesWMembers = await this.chatService.createChat(this.userData?.uid, this.currentProfileDetail.uid )
    } await this.loadUserChats().then(() => {
      setTimeout(() => {
        for (let i = 0; i < this.userChats.length; i++) {
          if (this.userChats[i].chatPartner.uid == this.currentProfileDetail.uid) {
            this.openChat(i);
          }
        }
      }, 200);
    });
    this.memberDetails = false;
  }
  async openChat(idx:number){
    this.currentChannel = null;
    this.currentChat = null;
    await this.chatService.getChatLiveUpdates(this.userChats[idx].chatId);
    this.chatService.currentChat$.subscribe(async (data) => {
    if (!data) {this.currentChat = null ; return;}
    const messagesWithUserData = data.messages ? await this.chatService.loadMessages(data.messages): [];
    const membersWithUserData = data.members ? await this.chatService.loadMembers(data.members):[];
    const chatpartner = this.showChatPartner(membersWithUserData);
    this.currentChat={
          uid:data.uid || this.userChats[idx].chatId,
          createdAt:data.createdAt,
          members: membersWithUserData,
          messages: messagesWithUserData,
          chatpartner: chatpartner,
        };
    })
    console.log(this.currentChannel);
  }
  showChatPartner(members:Member[]){
    for(let i = 0; i < members.length; i++){
      if(members[i].uid !== this.userData?.uid){
        return members[i].username;
      }
    }return "Unbekannt";
  }
  
}