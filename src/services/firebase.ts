import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, 
  getDocFromServer,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Silence internal Firestore SDK connection transition logs
setLogLevel('silent');

// Initialize Firestore with designated database ID and robust configuration
// experimentalAutoDetectLongPolling automatically falls back to long-polling when proxies/iframes restrict WebSockets
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  },
  firebaseConfig.firestoreDatabaseId
);

// Initialize Auth
export const auth = getAuth(app);
signInAnonymously(auth).catch(() => {
  // Silent fallback if anonymous auth provider is not enabled
});

// Test Firestore connection on boot per Firebase integration skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const errCode = (error as any)?.code || '';
    if (
      errCode === 'unavailable' || 
      errMessage.includes('unavailable') || 
      errMessage.includes('offline') ||
      errMessage.includes('Could not reach Cloud Firestore backend')
    ) {
      // Benign temporary network/offline state: Firestore operates transparently from local cache
      return false;
    }
    return false;
  }
}

// Kick off connection check safely after initial handshake
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 1500);
} else {
  testConnection().catch(() => {});
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errCode = (error as any)?.code || '';

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));

  // Per Firebase Integration Skill: re-throw only when permission or security issues occur
  if (
    errCode === 'permission-denied' ||
    errMessage.toLowerCase().includes('permission') ||
    errMessage.toLowerCase().includes('insufficient')
  ) {
    throw new Error(JSON.stringify(errInfo));
  }

  return errInfo;
}
