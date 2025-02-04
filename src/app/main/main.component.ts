import { Component, inject, OnInit } from '@angular/core';
import { AuthService, UserData } from '../auth.service';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent,ReactiveFormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  userData: UserData | null = null;
  router = inject(Router);
  sidenavIsOpen:boolean = true;
  sidenavButtonText:string="Workspace-Menü schließen";
  profiles:object = {"":""};
  directMessagesOpen:boolean = true;
  channelsOpen:boolean = true;
  addChannelOpen:boolean = false;
  currentChannel: any = null;
  fb = inject(FormBuilder);
  addChannelForm = this.fb.nonNullable.group({
      channelname:['', Validators.required],
      description:['', Validators.required],
    })
  sendMessageForm = this.fb.nonNullable.group({
    message:['', Validators.required],
    })

  constructor(private authService: AuthService) {
  }

  changeSidenavStatus(){
    this.sidenavIsOpen = !this.sidenavIsOpen;
    if(this.sidenavIsOpen){
      this.sidenavButtonText="Workspace-Menü schließen"
    }else{
      this.sidenavButtonText="Workspace-Menü öffnen"
    }
  }
  
  ngOnInit(): void {
    this.authService.userData$.subscribe((data) => {
      this.userData = data;
      if(this.userData == null){
          this.router.navigateByUrl('');
      }
      console.log('Aktuelle Benutzerdaten im main:', this.userData);
    });
    //Daten von Nachrichten laden
    this.authService.currentChannel.subscribe(async (data) => {
      if (data) {
        console.log("📡 Channel-Daten empfangen:", data);
    
        // 🛑 Falls keine Nachrichten vorhanden sind, leere Liste setzen
        if (!data.messages || !Array.isArray(data.messages)) {
          this.currentChannel = { ...data, messages: [] };
          return;
        }
    
        // 🔥 Für jede Nachricht die Nutzerdaten abrufen
        const messagesWithUserData = await Promise.all(
          data.messages.map(async (msg: any) => {
            if (!msg.uid) {
              console.warn("⚠️ Nachricht ohne UID:", msg);
              return { ...msg, username: "Unbekannt", profilePic: "default.png" };
            }
    
            const userInfo = await this.authService.getUserInfo(msg.uid);
            console.log("📡 Nachricht von UID:", msg.uid, " → User:", userInfo);
    
            return {
              ...msg,
              username: userInfo?.name || "Unbekannt",
              profilePic: userInfo?.profilePic || "default.png",
            };
          })
        );
    
        console.log("🔄 Nachrichten mit User-Daten:", messagesWithUserData);
    
        // 🔄 Channel mit Nutzerinfos aktualisieren
        this.currentChannel = { ...data, messages: messagesWithUserData };
      } else {
        console.log("⚠️ Kein Channel gefunden!");
        this.currentChannel = null;
      }
    });

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
  }
  openChannel(channelName: string) {
    console.log("🔍 Öffne Channel: " + channelName);
    this.authService.getChannelLiveUpdates(channelName); // Startet Live-Update
  
    this.authService.currentChannel.subscribe((data) => {
      if (data) {
        console.log("✅ Live-Update erhalten:", data);
        // Daten aus Firestore holen und speichern
      this.currentChannel = {
        name: data.name || channelName,   // Falls 'name' nicht existiert, nutze channelName
        description: data.description || "Keine Beschreibung verfügbar",
        created: data.createdAt || "Unbekanntes Erstellungsdatum",
        messages: data.messages || []
      };
      console.log("📡 Aktualisierter Channel:", this.currentChannel);
      } else {
        console.log("⚠️ Kein Channel gefunden!");
        this.currentChannel = null;
      }
    });
  }
  sendMessage(){
    const rawForm = this.sendMessageForm.getRawValue();
    this.authService.sendMessage(rawForm.message, this.currentChannel.name);
  }
  
  
}