import { Injectable } from '@nestjs/common';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import { NotifyEmailDto } from './dto/notify-email.dto';

@Injectable()
export class NotificationsService {
  private readonly sesClient: SESClient;
  private readonly SOURCE_ADDRESS: string;

  constructor(private configService: ConfigService) {
    this.sesClient = new SESClient({
      region: this.configService.get('REGION'),
      credentials: {
        accessKeyId: this.configService.get('SES_KEY'),
        secretAccessKey: this.configService.get('SES_SECRET')
      }
    })

    this.SOURCE_ADDRESS = this.configService.get('SES_SOURCE');
  }

  sendEmail({email, text}: NotifyEmailDto) {
    this.sesClient.send(new SendEmailCommand({
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: text
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: "Purchase ticket success.",
        },
      },
      Source: `${this.SOURCE_ADDRESS}`,
    }))
    .then(res => console.log(res))
    .catch(error => console.log(error));
  }
}
