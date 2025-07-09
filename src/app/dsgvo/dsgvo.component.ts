import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dsgvo',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dsgvo.component.html',
  styleUrl: './dsgvo.component.scss'
})
export class DsgvoComponent {
router = inject(Router);
}
