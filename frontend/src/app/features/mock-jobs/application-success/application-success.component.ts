import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-application-success',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './application-success.component.html',
  styleUrls: ['./application-success.component.scss']
})
export class ApplicationSuccessComponent implements OnInit {
  jobTitle = '';
  companyName = '';
  confirmationNumber = '';
  submittedAt = new Date();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.jobTitle = this.route.snapshot.queryParamMap.get('jobTitle') || '';
    this.companyName = this.route.snapshot.queryParamMap.get('companyName') || '';
    this.confirmationNumber = this.route.snapshot.queryParamMap.get('confirmationNumber') || '';
    const submittedAtParam = this.route.snapshot.queryParamMap.get('submittedAt');
    if (submittedAtParam) {
      this.submittedAt = new Date(submittedAtParam);
    }
  }

  formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
