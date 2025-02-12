import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService, UserData } from '../auth.service';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, map, of, switchMap, Timestamp } from 'rxjs';
import { user } from '@angular/fire/auth';

interface Message {
  uid: string;
  message: string;
  timestamp: string;
  username?: string;
  profilePic?: string;
}

interface Channel {
  name: string;
  description: string;
  messages: any[];
  created:{
    createdFrom:any;
    createdAt:string;
  };
  members:any[];
  membersAmount:number;
}

interface Member {
  uid:string,
  username?:string,
  profilePic?: string,
}

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

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    // this.authService.getUserLiveUpdates();
    this.loadLiveUserData();
  }
  loadLiveUserData(){
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      if(this.userData == null){
        this.router.navigateByUrl('');
      }
      console.log("User Daten:", this.userData)
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
    const messages = data.messages || [];
    const messagesWithUserData = await Promise.all(
      messages.map(async (msg: Message) => {
        const userInfo = await this.authService.getUserInfo(msg.uid);
        const time = msg.timestamp
        const formattedDateMessage = new Date(time).toLocaleString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        return {
          uid: msg.uid, 
          timestamp: formattedDateMessage,
          message:msg.message,
          username: userInfo? userInfo['name'] : "Unbekannt",
          profilePic: userInfo? userInfo['fotolink'] : "default.png",
          editing:false,
        };
      })
    );
    const members = data.members || [];
    const membersWithUserData = await Promise.all(
      members.map(async (uid: string) => {
        const userInfo = await this.authService.getUserInfo(uid);
        return {
          uid: uid,
          username: userInfo ? userInfo['name'] : "Unbekannt",
          profilePic: userInfo ? userInfo['fotolink'] : "default.png",
        };
      })
    );
    const creatorUID: string = data.created.createdFrom; // Einzelne UID aus Firebase
    const creator = await this.authService.getUserInfo(creatorUID);
    const createdAt = data.created.createdAt? (data.created.createdAt.toDate() || new Date(data.created.createdAt)): null; // Timestamp umwandeln
    const formattedDate = new Date(createdAt).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    console.log(formattedDate); // → "11.02.2025, 12:09"
    
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
    };
    console.log('Aktuelle Channeldaten: ', this.currentChannel);
  });
  }
  sendMessage(){
    const rawForm = this.sendMessageForm.getRawValue();
    if(this.currentChannel){
      this.authService.sendMessage(rawForm.message, this.currentChannel.name);
    }
  }
  openDetailsAboutChannel(){
    this.openDetailsOfChannel = !this.openDetailsOfChannel;
  }
  addMembersToChannelDialog(){
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
  
}