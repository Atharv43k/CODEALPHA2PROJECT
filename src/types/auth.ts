export interface User {
  id: number;
  username: string;
  createdAt: string;
  lastLogin: string;
  transformationStage: number; // 1: Chrysalis, 2: Awakening, 3: Emergence, 4: Metamorphosis
  reflection: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface HealthResponse {
  status: string;
  engine: string;
  language: string;
  hashingAlgorithm: string;
  storageBackend: string;
  dataFile: string;
  totalUsers: number;
  activeSessions: number;
}

export interface VivaInfoResponse {
  project: string;
  language: string;
  security: {
    hashingAlgorithm: string;
    memoryCostKiB: number;
    iterations: number;
    parallelism: number;
    saltSource: string;
    timingAttackProtection: string;
    plaintextStored: boolean;
  };
  storage: {
    mechanism: string;
    format: string;
    concurrencyControl: string;
    atomicity: string;
    filePath: string;
    fileSizeBytes: number;
    lastModified: string;
    totalUsers: number;
  };
  keyCppConcepts: string[];
}

export interface FilePreviewResponse {
  filePath: string;
  totalUsers: number;
  fileSizeBytes: number;
  lastModified: string;
  content: string;
}
