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

    generateSalt(iterations: number) {
        //return bcryptGenSalt(iterations);
        return bcryptGenSalt();
    }

    generateHash(password: string, salt: string | number) {
        return bcryptGenHash(password, salt);
    }

}

export default EncryptionService;