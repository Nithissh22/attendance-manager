export interface AttendanceRecord {
  courseCode: string;
  courseName: string;
  category: 'Theory' | 'Lab' | 'Project' | string;
  classesHeld: number | null;
  classesAttended: number | null;
  percentage: number;
}

export interface TimetableSlot {
  day: string; // e.g. 'MON', 'TUE', ...
  period: number; // 1-8
  startTime: string; // e.g. '08:00'
  endTime: string;   // e.g. '08:50'
  courseCode: string;
  courseName: string;
  roomNo: string;
  facultyName: string;
}

export interface MarkRecord {
  courseCode: string;
  courseName: string;
  cat1: number | null;
  cat2: number | null;
  assignment: number | null;
  total: number | null;
  maxTotal: number;
}

export interface SessionData {
  cookies: string[];
  studentName: string;
  netId: string;
  loginTime: number;
  isLoggedIn: boolean;
  attendanceCache?: AttendanceRecord[];
  attendanceCacheTime?: number;
}

export interface BunkStats {
  canBunk: number;       // classes can miss while staying >=75%
  mustAttend: number;    // classes must attend to reach 75%
  isSafe: boolean;       // currently >=75%
  targetPercentage: number;
}

export interface DashboardData {
  studentName: string;
  overallPercentage: number;
  attendance: AttendanceRecord[];
  lastUpdated: string;
}
