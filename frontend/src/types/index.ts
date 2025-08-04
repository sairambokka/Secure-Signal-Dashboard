export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Signal {
  _id: string;
  user_id: string;
  agent_id: string;
  signal_type: 'HRV' | 'GSR' | 'respiration' | 'temperature' | 'heart_rate';
  timestamp: string;
  payload: {
    raw: any[];
    avg: number;
    sdnn?: number;
  };
  context?: {
    activity?: string;
    environment?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface SignalsResponse {
  success: boolean;
  message: string;
  data: {
    signals: Signal[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}