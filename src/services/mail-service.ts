import ResponseModel from "../models/response-model";
import UserModel from "../models/user-model";
import ConfigurationService from "./configuration-service";
import LoggingService from "./logging-service";

import nodemailer from 'nodemailer';
import nodemailerHandlebars, { NodemailerExpressHandlebarsOptions } from 'nodemailer-express-handlebars';
import path from 'path';

interface Dependencies {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
}
  
class MailService {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    transporter: any;
  
    constructor({ loggingService, configurationService }: Dependencies) {
        this.configurationService = configurationService;
        this.loggingService = loggingService;
        
        // Init SMTP Transporter
        const handlebarOptions: NodemailerExpressHandlebarsOptions = {
            viewEngine: {
                extname: ".handlebars",
                partialsDir: path.resolve(__dirname, "../views/email_templates"),
                //defaultLayout: 'false',
            },
            viewPath: path.resolve(__dirname, "../views/email_templates"),
            extName: ".handlebars",
        };
        
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
            },
        });
        
        this.transporter.use(
            "compile",
            nodemailerHandlebars(handlebarOptions)
        );
    }

    async sendPasswordResetEmail(user: UserModel, passwordResetToken: string) {
        try {
    
          const replacements: any = {
            reset_token: passwordResetToken, //{{reset_token}} placeholder
          };
          var passwordResetAddress = '';
          
          if(process.env.FUELIFY_RESET_PASSWORD_ADDRESS) {
            passwordResetAddress = process.env.FUELIFY_RESET_PASSWORD_ADDRESS.replace(
              /{{(\w+)}}/g, 
              (placeholderWithDelimiters, placeholderWithoutDelimiters) =>
              replacements.hasOwnProperty(placeholderWithoutDelimiters) ? 
                replacements[placeholderWithoutDelimiters] : placeholderWithDelimiters
            );
          }
          
          var mailOptions = {
            from: process.env.NODEMAILER_SENDER_EMAIL,
            to: user.email,
            subject: "Fuelify Reset Password",
            template: "password-reset",
            context: {
               passwordResetAddress: passwordResetAddress,
           }
          };
          
          var status = await this.transporter.sendMail(mailOptions);
          this.loggingService.info(status);
          if(status.response.startsWith('250 2.0.0 OK')) {
            return new ResponseModel(200, "success", "Password reset email sent successfully!");
          } else {
            return new ResponseModel(500, "error", "Password reset email not sent successfully. Mail not delivered!");
          }
        } catch(err: any) {
            this.loggingService.error("Error occurred while attempting to send password reset email",err)
            return new ResponseModel(500, "error", "Error occurred while attempting to send password reset email", {'Error': err.toString()});  
        }
      }
}

export default MailService;