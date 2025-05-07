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
  errorMessage:string="Dieser Name wird bereits für einen anderen Channel genutzt!"
  editChannel:boolean = false;
  channelData={
    name:"",
    description:""
  }
  isNameChanged = false;
  isDescriptionChanged = false;
  deletedChannelname="";
  channelDeleted=true;
  channelNameIsAvailable:boolean=true;
  @Input() currentChannel:Channel|null=null;
  @Output() closeDetailsEvent = new EventEmitter<number>();
  @Output() deleteChannelEvent = new EventEmitter<void>();
  @Output() openChannelEvent = new EventEmitter<string>();
  @Output() openDetailsEvent = new EventEmitter<number>();
  @Output() openAddMemberEvent = new EventEmitter<void>();
  
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

  async changeChannelName(){
    if(this.currentChannel){
      this.channelNameIsAvailable = await this.chatService.checkIfNameAvailable(this.channelData.name)
      if(this.chatService.channelNameIsAvailable){
        this.chatService.changeChannelName(this.currentChannel.name, this.channelData.name);
        this.chatService.changeChannelNameForUsers(this.currentChannel.name, this.channelData.name);
        this.openEditChannel(),
        this.openChannelEvent.emit(this.channelData.name)
      }
    }
  }

  changeChannelDescription(){
    if(this.currentChannel){
    this.chatService.changeChannelDescription(this.currentChannel.name, this.channelData.description);
    }this.openEditChannel();
  }

  addMembersToChannelDialog(){
    this.openAddMemberEvent.emit();
  }

  openUserDetails(idx:number){
    this.openDetailsEvent.emit(idx)
  }
}
