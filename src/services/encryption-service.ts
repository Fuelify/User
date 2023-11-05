import LoggingService from "./logging-service";

import bcrypt from 'bcryptjs'
import { promisify } from 'util';
const bcryptGenSalt = promisify(bcrypt.genSalt);
const bcryptGenHash = promisify(bcrypt.hash);

interface Dependencies {
    loggingService: LoggingService;
}

class EncryptionService {
    loggingService: LoggingService;

    constructor({ loggingService }: Dependencies) {
      this.loggingService = loggingService;
    }

    generateSalt(iterations: number = 10): Promise<string> {
        //return bcryptGenSalt(iterations);
        return bcryptGenSalt() as Promise<string>;
    }

    generateHash(password: string, salt: string | number) {
        return bcryptGenHash(password, salt);
    }

}

export default EncryptionService;