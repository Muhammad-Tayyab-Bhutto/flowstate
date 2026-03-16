import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MockJobsDataService } from '../services/mock-jobs-data.service';
import { Job } from '../types/job.types';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {
  job: Job | undefined;
  jobId: string = '';

  constructor(
    private route: ActivatedRoute,
    private jobsService: MockJobsDataService
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    this.job = this.jobsService.getJobById(this.jobId);
  }

  formatSalary(min: number, max: number): string {
    const formatNum = (num: number) => {
      if (num >= 1000) {
        return `$${(num / 1000).toLocaleString()}k`;
      }
      return `$${num.toLocaleString()}`;
    };
    return `${formatNum(min)} - ${formatNum(max)}`;
  }

  timeAgo(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    return `Posted ${diffDays} days ago`;
  }
}
