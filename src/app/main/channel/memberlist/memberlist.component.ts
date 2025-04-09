import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Channel } from '../../../../modules/channel';

@Component({
  selector: 'app-memberlist',
  standalone: true,
  imports: [],
  templateUrl: './memberlist.component.html',
  styleUrl: './memberlist.component.scss'
})
export class MemberlistComponent {
@Input() currentChannel:Channel|null=null;
@Output() closeDialogEvent = new EventEmitter<void>();
@Output() openDetailsEvent = new EventEmitter<number>();
@Output() openAddMemberEvent = new EventEmitter<void>();

constructor(){}

closeMembersList(){
  this.closeDialogEvent.emit()
}

addMembersToChannelDialog(){
  this.openAddMemberEvent.emit();
}

openUserDetails(idx:number){
  this.openDetailsEvent.emit(idx)
}
}
