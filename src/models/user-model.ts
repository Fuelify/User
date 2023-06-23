class UserModel {
    id: string;
    email: string;
    family: string;
    level: string;
    passwords: Record<string,any>;
    salt: string | null;
    settings: Record<string,any> | null;
    states: Record<string,any> | null;
    plan: string;
  
    constructor(
      id: string, 
      email: string,
      family: string = 'USER', 
      level: string = 'USER', 
      passwords: Record<string,any>, 
      salt: string | null = null, 
      states: Record<string,any> | null = null, 
      settings: Record<string,any> | null = null, 
      plan: string = 'FREE'
    ) {
      this.id = id;
      this.email = email;
      this.family = family;
      this.level = level;
      this.passwords = passwords;
      this.salt = salt;
      this.settings = settings;
      this.states = states;
      this.plan = plan;
    }
  
    toJson() {
      return {
        id: this.id,
        email: this.email,
        family: this.family,
        level: this.level,
        passwords: this.passwords,
        salt: this.salt,
        settings: this.settings,
        states: this.states,
        plan: this.plan
      };
    }

    /*database() {
      ID: this.id,
      FAMILY: this.family,
      Level: this.level,
      Passwords: this.passwords,
      Salt: this.salt,
      Settings: this.settings,
      States: this.states,
      Plan: this.plan
    }*/

    static fromJson(json: any): UserModel {
        return new UserModel(
            json.ID,
            json.Email,
            json.FAMILY,
            json.FAMILY,
            json.Passwords,
            json.Salt,
            json.Settings,
            json.States,
            json.Plan
        );
    }
  }
  
  export default UserModel;
  