import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Bootstrap JS — necessário para data-bs-toggle (navbar collapse, dropdowns, etc.)
import 'bootstrap';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
