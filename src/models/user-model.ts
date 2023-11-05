// Import dependencies
import { integer } from 'aws-sdk/clients/cloudfront';
import { v4 as uuidv4 } from 'uuid';

interface UserModelConfig {
  id?: string;
  email?: string;
  family?: string;
  level?: string;
  passwords?: Record<string, any>;
  salt?: string | null;
  refreshToken?: string | null;
  passwordResetToken?: string | null;
  settings?: Record<string, any> | null;
  states?: Record<string, any> | null;
  plan?: string;
  tsCreated?: integer;
}

class UserModel {
  id: string;
  email: string;
  family: string;
  level: string;
  passwords: Record<string, any> | null;
  salt: string | null;
  refreshToken: string | null;
  passwordResetToken: string | null;
  settings: Record<string, any> | null;
  states: Record<string, any> | null;
  plan: string;
  tsCreated: integer;

  constructor(config: UserModelConfig) {
    this.id = config.id || uuidv4().toUpperCase();
    this.email = config.email || '';
    this.family = config.family || 'USER';
    this.level = config.level || 'USER';
    this.passwords = config.passwords || null;
    this.salt = config.salt || null;
    this.refreshToken = config.refreshToken || null;
    this.passwordResetToken = config.passwordResetToken || null;
    this.settings = config.settings || null;
    this.states = config.states || null;
    this.plan = config.plan || 'FREE';
    this.tsCreated = config.tsCreated || new Date().getTime();
  }

  
  toJson() {
    return {
      id: this.id,
      email: this.email,
      family: this.family,
      level: this.level,
      passwords: this.passwords,
      salt: this.salt,
      refreshToken: this.refreshToken,
      passwordResetToken: this.passwordResetToken,
      settings: this.settings,
      states: this.states,
      plan: this.plan,
      tsCreated: this.tsCreated
    };
  }

  toSanitizedJson() {
    return {
      id: this.id,
      email: this.email,
      family: this.family,
      level: this.level,
      settings: this.settings,
      states: this.states,
      plan: this.plan,
      tsCreated: this.tsCreated
    };
  }

  toDatabase() {
    return {
      ID: this.id,
      FAMILY: this.family,
      Email: this.email,
      Level: this.level,
      Passwords: this.passwords,
      Salt: this.salt,
      RefreshToken: this.refreshToken,
      PasswordResetToken: this.passwordResetToken,
      Settings: this.settings,
      States: this.states,
      Plan: this.plan,
      TimestampCreated: this.tsCreated
    }
  }

  static fromJson(json: any): UserModel {
      return new UserModel(
        {
          id: json.ID,
          email: json.Email,
          family: json.FAMILY,
          level: json.FAMILY,
          passwords: json.Passwords,
          salt: json.Salt,
          refreshToken: json.RefreshToken,
          passwordResetToken: json.PasswordResetToken,
          settings: json.Settings,
          states: json.States,
          plan: json.Plan,
          tsCreated: json.TimestampCreated
        }
      );
    }
  }
  
  export default UserModel;
  