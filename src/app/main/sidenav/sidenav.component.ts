import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserData } from '../../../modules/user';
import { Chat } from '../../../modules/chat';
import { AuthService } from '../../auth.service';
import { Channel } from '../../../modules/channel';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  directMessagesOpen:boolean = true;
  channelsOpen:boolean = true;
  currentChat:Chat|null = null;
  currentChannel: Channel|null = null;
  @Input() userData:UserData ={
    uid: "",
    name: "",
    email: "",
    fotolink:"",
    channels:[],
    chats:[],
  } 
  @Input() userChats:Chat[] = [];
  @Output() newChat = new EventEmitter<number>();
  @Output() newChannel = new EventEmitter<string>();
  @Output() openAddChannel = new EventEmitter<string>();
  @Output() startNewChatClicked = new EventEmitter<string>();
  constructor(private authService: AuthService) {
    }
  changeChannelAreaStatus(){
    this.channelsOpen = !this.channelsOpen;
  }
  changeMessageAreaStatus(){
    this.directMessagesOpen = !this.directMessagesOpen;
  }
  openChannel(item:string){
    this.newChannel.emit(item);
  }
  openChat(item:number){
    this.newChat.emit(item);
  }
  addChannelDialog(){
    this.openAddChannel.emit();
  }
  startNewChat(){
    this.startNewChatClicked.emit();
  }

}
