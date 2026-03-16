import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MockJobsDataService } from '../services/mock-jobs-data.service';
import { Job } from '../types/job.types';

@Component({
  selector: 'app-job-listings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './job-listings.component.html',
  styleUrls: ['./job-listings.component.scss']
})
export class JobListingsComponent implements OnInit {
  jobs: Job[] = [];
  searchQuery: string = '';
  selectedLocation: string = '';
  selectedType: string = '';
  
  locations: string[] = ['All Locations', 'San Francisco, CA', 'Remote', 'New York, NY', 'Boston, MA', 'Seattle, WA', 'Austin, TX', 'Denver, CO', 'Palo Alto, CA', 'Chicago, IL', 'Miami, FL'];
  types: string[] = ['All Types', 'Full-time', 'Remote', 'Contract', 'Part-time'];

  constructor(private jobsService: MockJobsDataService) {}

  ngOnInit(): void {
    this.jobs = this.jobsService.getJobs();
  }

  onSearchChange(): void {
    this.jobs = this.jobsService.searchJobs(
      this.searchQuery,
      this.selectedLocation !== 'All Locations' ? this.selectedLocation : undefined,
      this.selectedType !== 'All Types' ? this.selectedType : undefined
    );
  }

  onFilterChange(): void {
    this.onSearchChange();
  }

  formatSalary(min: number, max: number): string {
    const formatNum = (num: number) => {
      if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}k`;
      }
      return `$${num}`;
    };
    return `${formatNum(min)} - ${formatNum(max)}`;
  }

  timeAgo(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    return `${Math.floor(diffDays / 7)} weeks ago`;
  }
}
