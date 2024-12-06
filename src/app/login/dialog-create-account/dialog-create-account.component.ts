import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DialogLoginComponent } from '../dialog-login/dialog-login.component';

@Component({
  selector: 'app-dialog-create-account',
  standalone: true,
  imports: [],
  templateUrl: './dialog-create-account.component.html',
  styleUrl: './dialog-create-account.component.scss'
})
export class DialogCreateAccountComponent {
  // @Input() startLogin= this.start
  @Output()goBackEvent = new EventEmitter<string>
  // public service = inject(LoginComponent);
  checkInfoForNewAccount(){

  }
  goBackToLogin(){
    // this.service.startLogin = false;
    // this.service.createNewAccount= true;
    this.goBackEvent.emit();
  }
}
