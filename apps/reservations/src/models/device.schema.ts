import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema({ versionKey: false })
export class Device {
  @Prop()
  ip: string;

  @Prop()
  ticketBought: number;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
