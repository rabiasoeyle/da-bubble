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
  noError:boolean=true;
  errorMessage:string="Dieser Name ist bereits vorhanden! Bitte wähle einen anderen Namen "
  @Output() closeChannel = new EventEmitter<void>();
  constructor(private chatService: ChatService){
  }

  onAddChannel(){
    this.chatService.createChannel(this.createChannelData.name, this.createChannelData.description)
    setTimeout(()=>{this.noError= this.chatService.channelIsCreatable;},1000);
    setTimeout(()=>{
      if(this.noError==true){this.addChannelDialog();}},1000
    )
  }
  
  addChannelDialog(){
    this.closeChannel.emit();
  }
}
