import { Component, Input } from '@angular/core';
import { Channel } from '../../../modules/channel';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
@Input() currentChannel:Channel[] = [];
}
