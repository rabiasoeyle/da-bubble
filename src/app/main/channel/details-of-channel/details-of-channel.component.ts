import { Component, Input } from '@angular/core';
import { Channel } from '../../../../modules/channel';
import { FormsModule } from '@angular/forms';

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
  closeDetailsAboutChannel(){
  
  }
  openEditChannel(){
    this.editChannel = !this.editChannel;
  }
  deleteChannelAtUser(name:string){}
  changeChannelName(){}
  changeChannelDescription(){}

}
