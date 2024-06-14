import { Session } from 'express-session';

export type User = {
	credentials?: any; 
	provider?: string | undefined;
	authMethod?: string | undefined;
  };
declare module 'express-session' {
  interface SessionData {
    user: User;
  }
}
