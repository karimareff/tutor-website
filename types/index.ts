export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Tutor extends User {
  role: 'teacher';
  subject: string;
  exams: string[];
  price: number;
  rating: number;
  reviews: number;
  location: string;
  experience: string;
  about: string;
  education: string[];
  achievements: string[];
  availability: string[];
}

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  subject: string;
}
