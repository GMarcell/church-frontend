export type StandardResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};
