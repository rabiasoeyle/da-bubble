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
import { StartNewChatComponent } from "./start-new-chat/start-new-chat.component";


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [StartNewChatComponent,HeaderComponent, ReactiveFormsModule, SidenavComponent, ChatComponent, ChannelComponent, StartNewChatComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})

export class MainComponent{
  router = inject(Router);
  fb = inject(FormBuilder);
  // booleans
  sidenavIsOpen:boolean = true;
  addChannelOpen:boolean = false;
  memberDetails:boolean= false;
  //forms
  addChannelForm = this.fb.nonNullable.group({
      channelname:['', Validators.required],
      description:['', Validators.required],
  })
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
  currentChatId:number=0;
  constructor(private authService: AuthService, private chatService:ChatService) {
  }
  ngOnInit() {
    this.loadLiveUserData();
    this.loadUserChats();
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
  onAddChannel(){
    const rawForm = this.addChannelForm.getRawValue();
    this.chatService.createChannel(rawForm.channelname, rawForm.description);
    setTimeout(()=>this.loadLiveUserData(),4000);
    this.addChannelDialog();
  }
  openChannel(channelName: string) {
    this.currentChannelName = channelName;
    this.currentChannel={
      name: "string",
      description: "string",
      messages: [],
      created:{createdFrom:"any",createdAt:"string",},
      members:[],
      membersAmount:1,
    }
  }
  openChat(idx:number){
    this.currentChannel = null;
    this.currentChat = null;
    this.currentChatId = idx;
    this.currentChat={
            chatId:this.userChats[idx].chatId,
            chatData:{createdAt:"data.createdAt",members: [],messages: [],},
            chatPartner:{uid:"uid",name:"name",email:"email",fotolink:"fotolink",} 
    };
  }
  loadAllUsers(){

  }
  
}