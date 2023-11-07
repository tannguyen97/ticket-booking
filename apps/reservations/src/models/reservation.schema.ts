import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, HydratedDocument } from 'mongoose';

export type ReservationDocument = HydratedDocument<Reservation>;

@Schema({ versionKey: false })
export class Reservation {
  @Prop()
  email: string;

  @Prop()
  ticketId: string;

  @Prop()
  seatCode: number;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
