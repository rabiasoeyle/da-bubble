import { Component, EventEmitter, Output } from '@angular/core';
import { ChatService } from '../../chat.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-channel-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-channel-dialog.component.html',
  styleUrl: './add-channel-dialog.component.scss'
})
export class AddChannelDialogComponent {
  createChannelData = {
    name:"",
    description:"",
  };
  @Output() closeChannel = new EventEmitter<void>();

  constructor(private chatService: ChatService){}

  onAddChannel(){
    this.chatService.createChannel(this.createChannelData.name, this.createChannelData.description);
    this.addChannelDialog();
  }
  
  addChannelDialog(){
    this.closeChannel.emit();
  }
}
