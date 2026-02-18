import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from './FIREBASE-config.service';
import { 
  initializeApp, 
  FirebaseApp 
} from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  DocumentData,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private firebaseApp: FirebaseApp | null = null;
  private firestore: Firestore | null = null;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    const config = this.configService.getFirebaseConfig();
    
    if (config && !this.firebaseApp) {
      try {
        this.firebaseApp = initializeApp(config);
        this.firestore = getFirestore(this.firebaseApp);
        console.log('✅ Firebase inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
      }
    }
  }

  isUsingMockData(): boolean {
    return this.configService.useMockData() || !this.firestore;
  }

  getAll<T>(collectionName: string, constraints?: QueryConstraint[]): Observable<T[]> {
    if (this.isUsingMockData()) {
      return throwError(() => new Error('Mock data - use service mock'));
    }

    if (!this.firestore) {
      return throwError(() => new Error('Firebase não inicializado'));
    }

    const collectionRef = collection(this.firestore, collectionName);
    const q = constraints ? query(collectionRef, ...constraints) : collectionRef;

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data(),
          // Converter Timestamps do Firebase para Date
          createdAt: this.convertTimestamp(doc.data()['createdAt']),
          updatedAt: this.convertTimestamp(doc.data()['updatedAt'])
        })) as T[];
      }),
      catchError(error => {
        console.error(`Erro ao buscar ${collectionName}:`, error);
        return throwError(() => error);
      })
    );
  }

  getById<T>(collectionName: string, id: string): Observable<T> {
    if (this.isUsingMockData()) {
      return throwError(() => new Error('Mock data - use service mock'));
    }

    if (!this.firestore) {
      return throwError(() => new Error('Firebase não inicializado'));
    }

    const docRef = doc(this.firestore, collectionName, id);

    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Documento não encontrado');
        }
        return {
          _id: snapshot.id,
          ...snapshot.data(),
          createdAt: this.convertTimestamp(snapshot.data()['createdAt']),
          updatedAt: this.convertTimestamp(snapshot.data()['updatedAt'])
        } as T;
      }),
      catchError(error => {
        console.error(`Erro ao buscar documento ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  create<T>(collectionName: string, data: Partial<T>): Observable<T> {
    if (this.isUsingMockData()) {
      return throwError(() => new Error('Mock data - use service mock'));
    }

    if (!this.firestore) {
      return throwError(() => new Error('Firebase não inicializado'));
    }

    const collectionRef = collection(this.firestore, collectionName);
    const now = Timestamp.now();
    
    const docData = {
      ...data,
      createdAt: now,
      updatedAt: now
    };

    return from(addDoc(collectionRef, docData)).pipe(
      map(docRef => ({
        _id: docRef.id,
        ...docData,
        createdAt: now.toDate(),
        updatedAt: now.toDate()
      } as T)),
      catchError(error => {
        console.error(`Erro ao criar documento em ${collectionName}:`, error);
        return throwError(() => error);
      })
    );
  }

  update<T>(collectionName: string, id: string, data: Partial<T>): Observable<T> {
    if (this.isUsingMockData()) {
      return throwError(() => new Error('Mock data - use service mock'));
    }

    if (!this.firestore) {
      return throwError(() => new Error('Firebase não inicializado'));
    }

    const docRef = doc(this.firestore, collectionName, id);
    const updateData = {
      ...data,
      updatedAt: Timestamp.now()
    };

    return from(updateDoc(docRef, updateData)).pipe(
      map(() => ({
        _id: id,
        ...updateData,
        updatedAt: new Date()
      } as T)),
      catchError(error => {
        console.error(`Erro ao atualizar documento ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  delete(collectionName: string, id: string): Observable<void> {
    if (this.isUsingMockData()) {
      return throwError(() => new Error('Mock data - use service mock'));
    }

    if (!this.firestore) {
      return throwError(() => new Error('Firebase não inicializado'));
    }

    const docRef = doc(this.firestore, collectionName, id);

    return from(deleteDoc(docRef)).pipe(
      catchError(error => {
        console.error(`Erro ao deletar documento ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  query<T>(collectionName: string, ...constraints: QueryConstraint[]): Observable<T[]> {
    return this.getAll<T>(collectionName, constraints);
  }

  private convertTimestamp(timestamp: any): Date {
    if (!timestamp) return new Date();
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  }

  reinitializeFirebase(): void {
    this.firebaseApp = null;
    this.firestore = null;
    this.initializeFirebase();
  }
}
