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
  createdAt:string;
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
  //forms
  addChannelForm = this.fb.nonNullable.group({
      channelname:['', Validators.required],
      description:['', Validators.required],
    })
  sendMessageForm = this.fb.nonNullable.group({
    message:['', Validators.required],
    })
  
  userData: UserData | null = null;
  sidenavButtonText:string="Workspace-Menü schließen";
  currentChannel: Channel|null = null;
  allDaBubbleUser:[]=[];

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
        return {
          uid: msg.uid, 
          timestamp: msg.timestamp,
          message:msg.message,
          username: userInfo? userInfo['name'] : "Unbekannt",
          profilePic: userInfo? userInfo['fotolink'] : "default.png",
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
    this.currentChannel = {
      name: data.name || channelName,
      description: data.description || "Keine Beschreibung verfügbar",
      createdAt: data.createdAt || "Unbekanntes Erstellungsdatum",
      messages: messagesWithUserData,
      members:membersWithUserData,
      membersAmount:data.members.length,
    };
  });
  }

  sendMessage(){
    const rawForm = this.sendMessageForm.getRawValue();
    if(this.currentChannel){
      this.authService.sendMessage(rawForm.message, this.currentChannel.name);
    }
  }
  
  openDetailsAboutChannel(){}
  addMembersToChannel(){
    
  }
  
}