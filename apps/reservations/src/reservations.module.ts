import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './models/ticket.schema';
import { Reservation, ReservationSchema } from './models/reservation.schema';
import { Device, DeviceSchema } from './models/device.schema';
import { deviceLimitMiddleware } from './middlewares/deviceLimit.middleware';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
        NOTIFICATIONS_HOST: Joi.string().required(),
        NOTIFICATIONS_PORT: Joi.number().required()
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
         uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Device.name, schema: DeviceSchema }
    ]),
    ClientsModule.registerAsync([
      {
        name: "notifications",
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: 'notifications',
          },
        }),
        inject: [ConfigService],
      },
    ])
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService]
})
export class ReservationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(deviceLimitMiddleware).forRoutes({ path: 'reservations', method: RequestMethod.POST });
  }
}
