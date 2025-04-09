import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [],
  templateUrl: './member-details.component.html',
  styleUrl: './member-details.component.scss'
})
export class MemberDetailsComponent {
  @Input() currentProfileDetail:any|null=null;
  @Output() closeUserDetailsEvent = new EventEmitter<number>();
  @Output() openAddMemberEvent = new EventEmitter<void>();
  @Output() goToPersonalMessagesEvent = new EventEmitter<void>();

  closeUserDetails(idx:number){
    this.closeUserDetailsEvent.emit(idx);
  }
  
  goToPersonalMessages(){
    this.goToPersonalMessagesEvent.emit();
  }
}
