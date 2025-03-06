import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Channel } from '../../../../modules/channel';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../chat.service';

@Component({
  selector: 'app-details-of-channel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './details-of-channel.component.html',
  styleUrl: './details-of-channel.component.scss'
})
export class DetailsOfChannelComponent {
  @Input() currentChannel:Channel|null=null;
  editChannel:boolean = false;
  channelData={
    name:"",
    description:""
  }
  @Output() closeDetailsEvent = new EventEmitter<number>();
  @Output() deleteChannelEvent = new EventEmitter<void>();
  @Output() openChannelEvent = new EventEmitter<string>();
  isNameChanged = false;
  isDescriptionChanged = false;
  deletedChannelname="";
  channelDeleted=true;

  constructor(private chatService:ChatService){}

  closeDetailsAboutChannel(){
  this.closeDetailsEvent.emit();
  }
  openEditChannel(){
    this.editChannel = !this.editChannel;
  }
  deleteChannelAtUser(){
    if(this.currentChannel){
    this.chatService.deleteChannelAtMember(this.currentChannel.name);
      if(this.editChannel){
        this.editChannel=false;
      }
      this.closeDetailsEvent.emit();
      this.deleteChannelEvent.emit();
  }}
  changeChannelName(){
    if(this.currentChannel ){
    this.chatService.changeChannelName(this.currentChannel.name, this.channelData.name);
    this.chatService.changeChannelNameForUsers(this.currentChannel.name, this.channelData.name);}
    setTimeout(()=>{
            this.openEditChannel(),
            this.openChannelEvent.emit(this.channelData.name) 
      },200);
  }
  changeChannelDescription(){
    if(this.currentChannel){
    this.chatService.changeChannelDescription(this.currentChannel.name, this.channelData.description);
    }this.openEditChannel();
  }
}
