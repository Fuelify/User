'use strict';

import winston from 'winston'
import ecsFormat from '@elastic/ecs-winston-format'
import axios from 'axios'

import ConfigurationService from './configuration-service';

winston.createLogger({
    format: ecsFormat({ convertReqRes: true }), 
    transports: [
      new winston.transports.Console()
    ]
  });

interface Dependencies {
    configurationService: ConfigurationService
}

class LoggingService {
    private logger: winston.Logger;
    configurationService: ConfigurationService;

    constructor({ configurationService }: Dependencies) {

        const timestampInMilliseconds = winston.format((info) => {
            info.timestampValue = Date.now();
            return info;
        })();

        this.logger = winston.createLogger({
            format: ecsFormat({ convertReqRes: true }), 
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        timestampInMilliseconds,
                        winston.format.simple(),
                    ),
                }),
            ]
        });    

        this.configurationService = configurationService;
    }


    public log(level: string, message: string, meta?: any) {
        this.logger.log({
            level,
            message,
            ...meta,
        });
    }

    public info(message: string, meta?: any) {
        this.log('info', message, meta);
    }

    public warn(message: string, meta?: any) {
        this.log('warn', message, meta);
    }

    public error(message: string, meta?: any) {
        this.log('error', message, meta);
    }
    


    public async slack(inputs: { [x: string]: any; }) {
        try {
        // Build fields object list
        const fields = [
            {
                "title": "Message",
                "value": inputs['message'],
                "short": false
            },
            {
                "title": "UserID",
                "value": inputs['userId'],
                "short": false
            },
            {
                "title": "Timestamp (UTC)",
                "value": new Date().valueOf(),
                "short": false
            },
            {
                "title": "Error Source",
                "value": inputs['source'],
                "short": false
            },
            {
                "title": "Error Message",
                "value": inputs['error'],
                "short": false
            },
        ];

        Object.keys(inputs['raw'] || []).forEach(key => {
            fields.push({
            "title": key,
            "value": inputs['raw'][key],
            "short": false
            })
        });

        // Build request
        const data = {
        "attachments":[
            {
                "fallback": `[${inputs['level']}] Error occurred in ${inputs['source']}`,
                "pretext": `[${inputs['level']}] Error occurred in ${inputs['source']}`,
                "color": inputs['color'],
                "fields": fields
            }
            ]
        };

        const headers = {
            'Content-Type': 'application/json'
        };
        const payload = JSON.stringify(data);
        await axios.post(this.configurationService.SLACK_URL, payload, { headers });  
        } catch (err) {
        var logmessage = 'Error sending slack notification!';
        this.error(inputs['level'], {
            obj_function: 'slack', 
            file: 'logging-service', 
            obj_class: 'LoggingService', 
            message: logmessage, 
            error: err});
        }
    
    }
}

export default LoggingService;