export type CreateAttendanceDto = {
  serviceDate: string;
  serviceType: string;
  maleCount: number;
  femaleCount: number;
};

export type UpdateAttendanceDto = Partial<CreateAttendanceDto>;

export type Attendance = {
  id: string;
  serviceDate: string;
  serviceType: string;
  maleCount: number;
  femaleCount: number;
  createdAt: string;
};
