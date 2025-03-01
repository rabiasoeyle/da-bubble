import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-start-new-chat',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './start-new-chat.component.html',
  styleUrl: './start-new-chat.component.scss'
})
export class StartNewChatComponent {
  fb = inject(FormBuilder);
sendMessageForm = this.fb.nonNullable.group({
      message:['', Validators.required],
    })
    sendMessage(){
      
    }
}
