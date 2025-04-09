import { Component, Input } from '@angular/core';
import { UserData } from '../../../../modules/user';
import { Channel } from '../../../../modules/channel';
import { ChatService } from '../../../chat.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {
@Input() userData:UserData|null = null;
@Input() currentChannel:Channel|null = null;
editMessageData={
  message:""
}

constructor(private chatService:ChatService){}

isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
  });
}

startEditMessage(idx:number){
  if(this.currentChannel != null){
    const msg = this.currentChannel.messages[idx];
    this.editMessageData.message=msg.message;
    msg.editing = true;
  }
}

closeEditMessage(idx:number){
  if(this.currentChannel!=null){
    const msg = this.currentChannel.messages[idx];
    msg.editing = false;
    this.editMessageData.message="";
  }
}

editMessage(idx:number){
    if(this.currentChannel && this.editMessageData.message !=""){
      this.chatService.editMessage(this.currentChannel.name, this.editMessageData.message, idx);
      this.editMessageData.message="";
    }
}
}
