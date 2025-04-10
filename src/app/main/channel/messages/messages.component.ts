import { Component, Input, ViewEncapsulation } from '@angular/core';
import { UserData } from '../../../../modules/user';
import { Channel } from '../../../../modules/channel';
import { ChatService } from '../../../chat.service';
import { FormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule, PickerModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MessagesComponent {
editMessageData={
  message:""
}
emojisOpenInEditM:boolean=false;
emojisOpenForReaction:boolean=false;
@Input() userData:UserData|null = null;
@Input() currentChannel:Channel|null = null;

constructor(private chatService:ChatService){}

addEmojReaction(event:any, idx:number){
  console.log(event.emoji.native)
  if(this.currentChannel){
    this.chatService.addEmojiReaction(this.currentChannel.name, event.emoji.native, idx);
  }
}

toggleEmojisForReaction(){
  this.emojisOpenForReaction=!this.emojisOpenForReaction;
}

toggleEmojisOnEditM(){
  this.emojisOpenInEditM=!this.emojisOpenInEditM;
}

addEmojiOnEditMessage(event:any){
  this.editMessageData.message += event.emoji.native;
}

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
