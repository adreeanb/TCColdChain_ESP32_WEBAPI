declare global {
  namespace Express {
    interface Request {
      user?: {
        enterpriseId: string;
      };
    }
  }
}

export {};
