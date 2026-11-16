import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { isOnline } from '@/config/env';
import { api, ApiError } from '@/lib/api';
import { getDeviceId, newSecret } from '@/lib/biometrics';

export interface Account {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
}

export interface Session {
  user: Account;
  /** API access token. `null` for accounts that live only on this device. */
  token: string | null;
}

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthGateway {
  register(input: RegisterInput): Promise<Session>;
  login(identifier: string, password: string): Promise<Session>;
  /** Verifies the password and returns a new fingerprint secret for this device. */
  enableBiometric(session: Session, password: string): Promise<string>;
  disableBiometric(session: Session, password: string): Promise<void>;
  biometricLogin(identifier: string, secret: string): Promise<Session>;
}

/* --------------------------------- API --------------------------------- */

const remote: AuthGateway = {
  register: (input) => api<Session>('/v1/auth/register', { method: 'POST', body: input }),
  login: (identifier, password) => api<Session>('/v1/auth/login', { method: 'POST', body: { identifier, password } }),
  async enableBiometric(session, password) {
    const { secret } = await api<{ secret: string }>('/v1/auth/biometric', {
      method: 'POST',
      token: session.token,
      body: { deviceId: await getDeviceId(), password },
    });
    return secret;
  },
  async disableBiometric(session, password) {
    await api<null>('/v1/auth/biometric/disable', {
      method: 'POST',
      token: session.token,
      body: { deviceId: await getDeviceId(), password },
    });
  },
  async biometricLogin(identifier, secret) {
    return api<Session>('/v1/auth/biometric/login', { method: 'POST', body: { identifier, deviceId: await getDeviceId(), secret } });
  },
};

/* ---------------------------- On this device ---------------------------- */

/**
 * Used when the app runs without a server. Accounts are kept on the device with
 * salted SHA-256 password hashes; the server (bcrypt, rate limits) is what
 * production deployments should use.
 */
interface LocalAccount extends Account {
  salt: string;
  passwordHash: string;
  biometricHash?: string;
}

const ACCOUNTS_KEY = 'kovra.accounts';

const sha256 = (value: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
const hashPassword = (salt: string, password: string) => sha256(`${salt}:${password}`);
const fail = (message: string, status = 401) => new ApiError(status, 'unauthorized', message);

async function readAccounts(): Promise<LocalAccount[]> {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  return raw ? (JSON.parse(raw) as LocalAccount[]) : [];
}

const writeAccounts = (accounts: LocalAccount[]) => AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

const byIdentifier = (accounts: LocalAccount[], identifier: string) => {
  const value = identifier.trim().toLowerCase();
  return accounts.find((a) => a.username === value || a.email === value);
};

const toSession = ({ salt: _s, passwordHash: _p, biometricHash: _b, ...user }: LocalAccount): Session => ({ user, token: null });

async function verified(userId: string, password: string): Promise<[LocalAccount[], LocalAccount]> {
  const accounts = await readAccounts();
  const account = accounts.find((a) => a.id === userId);
  if (!account || (await hashPassword(account.salt, password)) !== account.passwordHash) throw fail('Password is incorrect');
  return [accounts, account];
}

const local: AuthGateway = {
  async register(input) {
    const accounts = await readAccounts();
    const username = input.username.trim().toLowerCase();
    const email = input.email.trim().toLowerCase();
    if (accounts.some((a) => a.username === username)) throw fail('That username is taken', 409);
    if (accounts.some((a) => a.email === email)) throw fail('An account with this email already exists', 409);

    const salt = newSecret();
    const account: LocalAccount = {
      id: Crypto.randomUUID(),
      name: input.name.trim(),
      username,
      email,
      phone: input.phone,
      salt,
      passwordHash: await hashPassword(salt, input.password),
    };
    await writeAccounts([...accounts, account]);
    return toSession(account);
  },

  async login(identifier, password) {
    const account = byIdentifier(await readAccounts(), identifier);
    if (!account || (await hashPassword(account.salt, password)) !== account.passwordHash) {
      throw fail('Username, email or password is incorrect');
    }
    return toSession(account);
  },

  async enableBiometric(session, password) {
    const [accounts, account] = await verified(session.user.id, password);
    const secret = newSecret();
    account.biometricHash = await sha256(secret);
    await writeAccounts(accounts);
    return secret;
  },

  async disableBiometric(session, password) {
    const [accounts, account] = await verified(session.user.id, password);
    delete account.biometricHash;
    await writeAccounts(accounts);
  },

  async biometricLogin(identifier, secret) {
    const account = byIdentifier(await readAccounts(), identifier);
    if (!account?.biometricHash || account.biometricHash !== (await sha256(secret))) {
      throw fail('Fingerprint sign-in isn’t set up for this account on this phone');
    }
    return toSession(account);
  },
};

export const auth: AuthGateway = isOnline ? remote : local;
