import moment from 'moment';

export interface AdminPostFilters {
  keyword?: string;
  author?: string;
  authorRole?: 'student' | 'teacher' | 'admin';
  dateRange?: [moment.Moment, moment.Moment];
  minVotes?: number;
  maxVotes?: number;
  sortBy?: 'createdAt' | 'votes';
  sortOrder?: 'asc' | 'desc';
}
