import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dsgvo',
  standalone: true,
  imports: [],
  templateUrl: './dsgvo.component.html',
  styleUrl: './dsgvo.component.scss'
})
export class DsgvoComponent {
router = inject(Router);
}
