import { AfterViewChecked, Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { UserData } from '../../../../modules/user';
import { Channel } from '../../../../modules/channel';
import { ChatService } from '../../../chat.service';
import { FormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { Message } from '../../../../modules/messages';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule, PickerModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MessagesComponent implements AfterViewChecked {
editMessageData={
  message:""
}
emojisOpenInEditM:boolean=false;
emojisOpenForReaction:boolean=false;
currentMessageId:number|null=null;
@Input() userData:UserData|null = null;
@Input() currentChannel:Channel|null = null;
@ViewChild('scrollContainer') scrollContainer!: ElementRef;
@Input() scrolledDown:boolean=false;
constructor(private chatService:ChatService){}
  ngAfterViewChecked(): void {
    if(this.scrolledDown){return}else{
      this.scrollToBottom();
      this.scrolledDown=true;
    }
  }
  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { 
      console.warn('Scroll failed', err);
    }
  }
removeReaction(reactionIdx:number, messageIdx:number){
  if(this.currentChannel && this.userData){
    this.chatService.removeEmojiReaction(this.currentChannel?.name, messageIdx, reactionIdx, this.userData?.uid)
  }
  
}

addEmojiReaction(event:any, idx:number){
  if(this.currentChannel && this.userData){
    this.chatService.addEmojiReaction(this.currentChannel.name, event.emoji.native, idx, this.userData?.uid);
    this.emojisOpenForReaction=false;
  }
}

toggleEmojisForReaction(idx:number){
  this.emojisOpenForReaction=!this.emojisOpenForReaction;
  this.currentMessageId=idx;
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
    this.emojisOpenInEditM=false;
  }
}

closeEditMessage(idx:number){
  if(this.currentChannel!=null){
    const msg = this.currentChannel.messages[idx];
    msg.editing = false;
    this.editMessageData.message="";
    this.emojisOpenInEditM=false;
  }
}

editMessage(idx:number){
    if(this.currentChannel && this.editMessageData.message !=""){
      this.chatService.editMessage(this.currentChannel.name, this.editMessageData.message, idx);
      this.editMessageData.message="";
      this.emojisOpenInEditM=false;
    }
}
}
