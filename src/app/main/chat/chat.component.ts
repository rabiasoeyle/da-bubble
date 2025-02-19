import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Chat } from '../../../modules/chat';
import { UserData } from '../../../modules/user';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnChanges{
  router = inject(Router);
  fb = inject(FormBuilder);
@Input() currentChat:any|null = null;
@Input() userData:UserData ={
    uid: "",
    name: "",
    email: "",
    fotolink:"",
    channels:[],
    chats:[],
  } 
@Output() newChatPartner = new EventEmitter<number>();
@Output() nstartEditMessage = new EventEmitter<number>();
@Output() ncloseEditMessage = new EventEmitter<number>();
@Output() neditMessage = new EventEmitter<number>();


  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChat'] && this.currentChat) {
      console.log("Aktualisierte Chat-Daten:", this.currentChat);
      this.cdr.detectChanges(); // Erzwingt das UI-Update
    }
  }

openUserDetails(idx:number){
this.newChatPartner.emit(idx)
}
startEditMessage(idx:number){
this.nstartEditMessage.emit(idx);
}
closeEditMessage(idx:number){
this.ncloseEditMessage.emit(idx);
}
editMessage(idx:number){
  this.neditMessage.emit(idx);
}
}
