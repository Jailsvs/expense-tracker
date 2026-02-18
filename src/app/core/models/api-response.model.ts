export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string; // Opcional - Analytics
}

export interface AppConfig {
  firebaseConfig?: FirebaseConfig;
  useMockData: boolean;
  theme: 'light' | 'dark';
}
