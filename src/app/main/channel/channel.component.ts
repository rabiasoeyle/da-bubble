import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { Channel } from '../../../modules/channel';
import { ChatService } from '../../chat.service';
import { AuthService } from '../../auth.service';
import { UserData } from '../../../modules/user';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  userData: UserData |null = null;
  fb = inject(FormBuilder);
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
  @Input() currentChannel:Channel[]|any = [];
  openDetailsOfChannel= false;
  editChannel=false;
  addMemberToChannel=false;
  membersOfChannelList=false;
  memberDetails:boolean= false;
  currentProfileDetail:any;
  channelDeleted:boolean=false;
  deletedChannelname:string="";
  constructor(private chatService:ChatService,private cdr: ChangeDetectorRef, private authService:AuthService){

  }

loadLiveUserData(){
  this.authService.userData$.subscribe((data) => {
    this.userData = data;
  });
}
openChannel(channelName: string) {
  this.chatService.getChannelLiveUpdates(channelName);
  this.chatService.currentChannel.subscribe(async (data) => {
  if (!data) {
    this.currentChannel = null;
    return;
  }
  const messagesWithUserData = data.messages ? await this.chatService.loadMessages(data.messages): [];
  const membersWithUserData = data.members ? await this.chatService.loadMembers(data.members): [];
  const creatorUID: string = data.created.createdFrom; // Einzelne UID aus Firebase
  const creator = await this.authService.getUserInfo(creatorUID);
  const createdAt = data.created.createdAt? (data.created.createdAt.toDate() || new Date(data.created.createdAt)): null; // Timestamp umwandeln
  const formattedDate = this.chatService.formatDate(createdAt);
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
  };});
  console.log(this.currentChannel)
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
    this.chatService.editMessage(this.currentChannel.name, rawForm.message, id);
  }
}
openDetailsAboutChannel(){}
addMembersToChannelDialog(){}
addMembersToChannel(name:string){}
openMembersList(){}
openUserDetails(idx:number){}
goToPersonalMessages(){}
sendMessage(){}
openEditChannel(){}
deleteChannelAtUser(name:string){

}
changeChannelName(){}
changeChannelDescription(){}



}
