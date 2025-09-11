import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  showDynamicButton: boolean = false;
  footerButtonText: string = '';
  githubRepoUrl: string = 'https://github.com/domgiordano/angular-spotify';
  userId: string;


  constructor(
    private router: Router,
    private ToastService: ToastService,
  ) {}

  ngOnInit() {
  }

  openGitHubRepo() {
    window.open(this.githubRepoUrl, '_blank');
  }
}
