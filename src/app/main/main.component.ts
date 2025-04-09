import { Component, inject, OnInit} from '@angular/core';
import { AuthService } from '../auth.service';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule} from '@angular/forms';
import { UserData } from '../../modules/user';
import { Channel } from '../../modules/channel';
import { Chat } from '../../modules/chat';
import { ChatComponent } from './chat/chat.component';
import { ChatService } from '../chat.service';
import { ChannelComponent } from './channel/channel.component';
import { StartNewChatComponent } from "./start-new-chat/start-new-chat.component";
import { AddChannelDialogComponent } from './add-channel-dialog/add-channel-dialog.component';
import { NgClass} from '@angular/common';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [NgClass,AddChannelDialogComponent,StartNewChatComponent,HeaderComponent, ReactiveFormsModule, SidenavComponent, ChatComponent, ChannelComponent, StartNewChatComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})

export class MainComponent implements OnInit{
  router = inject(Router);
  fb = inject(FormBuilder);
  sidenavIsOpen:boolean = true;
  addChannelOpen:boolean = false;
  memberDetails:boolean= false;
  startNewChatBoolean:boolean=false;
  userData: UserData | null = null;
  sidenavButtonText:string="Workspace-Menü schließen";
  currentChannel: Channel|null = null;
  allDaBubbleUser:UserData[]=[];
  deletedChannelname:string="";
  currentProfileDetail:any;
  userChats:Chat[]=[];
  userChat:{}={};
  currentChat:Chat|null = null;
  messageIdx:number= 0;
  currentChannelName:string= "kein Channel";
  currentChatId:number=999;
  allUser:UserData[]=[];
  userStatuses: { [userId: string]: string } = {};
  userIds: string[] = ['user1', 'user2', 'user3']; 

  constructor(private authService: AuthService, private chatService:ChatService) {}

  ngOnInit() {
    this.loadLiveUserData();
    this.loadUserChats();  
  }

  isChatActive(): boolean {
    return this.currentChannel !== null || this.currentChat !== null || this.startNewChatBoolean;
  }

  async loadUserChats(){
    this.userChats = [];
    if(this.userData){
       const userChat = await this.chatService.getUserChats(this.userData?.uid);
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

  onAddChannel(data:{}){
    this.addChannelDialog();
  }

  sendMessageInChannel(message:string){
    if(this.currentChannel && message !=""){
      this.chatService.sendMessage(message, this.currentChannelName);
    }
  }

  openChannel(channelName: string) {
    this.currentChatId=999;
    this.currentChannelName = channelName;
    this.currentChannel={
      name: "string",
      description: "string",
      messages: [],
      created:{createdFrom:"any",createdAt:"string",},
      members:[],
      membersAmount:1,
    }
    this.startNewChatBoolean=false;
  }

  sendMessageInChat(message:string){
    if(this.currentChat && message !=""){
      this.chatService.sendPrivateMessage(message, this.currentChat.chatId);
    }
  }

  async openChat(idx:number){
    if(!this.userChats[idx]){
      await this.loadUserChats();
    }
    this.currentChannel = null;
    this.currentChat = null;
    this.currentChatId = idx;
    console.log(this.userChats[this.currentChatId].chatPartner.name)
    this.currentChat={
            chatId:this.userChats[idx].chatId,
            chatData:{createdAt:"data.createdAt",members: [],messages: [],},
            chatPartner:{uid:"uid",name:"name",email:"email",fotolink:"fotolink",presenceStatus:false} 
    };
    console.log("currentChat:",this.currentChat);
    this.startNewChatBoolean=false;
  }

  startNewChat(){
    this.currentChannel = null;
    this.currentChat = null;
    this.startNewChatBoolean = true;
  }

  dontStartNewChat(){
    this.currentChannel = null;
    this.currentChat = null;
    this.startNewChatBoolean = false;
  }

  startNewChatResp(){
    this.currentChannel = null;
    this.currentChat = null;
    this.startNewChatBoolean = true;
  }
}