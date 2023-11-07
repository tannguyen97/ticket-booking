import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ versionKey: false })
export class Ticket {
  @Prop()
  ticketKey: string;

  @Prop()
  total: number;

  @Prop()
  ticketSold: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
