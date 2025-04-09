import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormBuilder,FormsModule} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-create-account',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dialog-create-account.component.html',
  styleUrl: './dialog-create-account.component.scss'
})
export class DialogCreateAccountComponent implements OnChanges {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  errorMessage : string |null = null;
  errorMessageEmail : string |null = null;
  registerData={
    name:"",
    email:"",
    password:"",
    pPolicyAccepted: false,
  }
  @Input() errorMessageParent:any=null;
  @Input() registerDataOld:any=null;
  @Output()goBackEvent = new EventEmitter<string>();
  @Output() accountCreated = new EventEmitter<any>();

  constructor(){}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['registerDataOld'] && changes['registerDataOld'].currentValue) {
      this.registerData=this.registerDataOld;
    }
    if (changes['errorMessageParent'] && changes['errorMessageParent'].currentValue) {
      this.errorMessageEmail=this.errorMessageParent;
    }
  }
  
  onSubmit() {
    this.accountCreated.emit(this.registerData);
  }
  
  goBackToLogin(){
    this.goBackEvent.emit();
  }
}
