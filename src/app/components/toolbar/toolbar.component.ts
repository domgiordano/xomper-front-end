// toolbar.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust the path as necessary

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  dropdownVisible = false;
  isMobile: boolean;
  constructor(
    private AuthService: AuthService,
    private router: Router
    ) {
      this.checkIfMobile();
      window.addEventListener('resize', this.checkIfMobile.bind(this));
    }

  ngOnInit(): void {
    console.log("Toolbar locked n loaded.")
  }

  // Toggle dropdown visibility
  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  // Handle item selection and close dropdown
  selectItem(route: string) {
    this.dropdownVisible = false; // Close the dropdown
    // Optionally, navigate to the selected route
    this.router.navigate([route]); // Make sure to import Router
  }

  // Close dropdown if clicked outside
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.dropdown-button')) {
      this.dropdownVisible = false;
    }
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768; // Adjust this threshold as needed
  }

  isLoggedIn(): boolean {
    return this.AuthService.isLoggedIn();
  }
  isSelected(route: string): boolean {
    return this.router.url === route;
  }
}
