import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { TICKET } from './constants/ticket.constant';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Ticket } from './models/ticket.schema';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Reservation } from './models/reservation.schema';
import { Device } from './models/device.schema';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ReservationsService implements OnModuleInit {
  constructor(
    // @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
    @InjectModel(Reservation.name) private readonly reservationsModel: Model<Reservation>,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    @Inject('notifications')
    private readonly notificationsService: ClientProxy
    ) {}

  async onModuleInit() {
    const ticket = await this.ticketModel.find({});
    if(ticket.length == 0) {
      await this.ticketModel.create({
        ticketKey: TICKET.name,
        total: TICKET.total,
        ticketSold: 0
      });
    }
  }

  async create(ip: string, createReservationDto: CreateReservationDto): Promise<Reservation[]> {
    const { email, tickets, moneyAmount } = createReservationDto;
    const ticket = await this.ticketModel.findOne({ticketKey: TICKET.name}).lean();

    if(!ticket) {
      throw new NotFoundException('Don not have any ticket to buy');
    } 

    if(ticket.ticketSold == ticket.total) {
      throw new BadRequestException('Sold out');
    }

    if(moneyAmount != TICKET.price * tickets){
      throw new BadRequestException('Payment amount is incorrect');
    }

    if(
      ticket.total - ticket.ticketSold < tickets
    ) {
      throw new BadRequestException('Exceeds the number of remaining tickets');
    }

    // const session = await this.connection.startSession(); 
    // session.startTransaction();
    try {
      await this.ticketModel.findOneAndUpdate({ticketKey: TICKET.name}, {
        ticketSold: ticket.ticketSold + tickets
      })
      
      let seetcodes = '';
      const bookedTickets = [] as Reservation[];
      for (let index = 1; index <= tickets; index++) {
        bookedTickets.push({
          email,
          seatCode: ticket.ticketSold + index,
          ticketId: TICKET.name
        })
        const char = index == tickets ? '' : ', ';
        seetcodes = seetcodes + (ticket.ticketSold + index) + char;
      }
      const userTickets = await this.reservationsModel.insertMany([...bookedTickets]);
      await this.deviceModel.findOneAndUpdate({ip}, { $inc: { ticketBought: tickets}}, {upsert: true});
      // await session.commitTransaction();
      // session.endSession();

      // emit email
      this.notificationsService.emit('notify_email', {
        email,
        text: `You have successfully purchased ${tickets} tickets, seat codes: ${seetcodes}`,
      });

      return userTickets;
    } catch (error) {
      // await session.abortTransaction();
      // session.endSession();
      console.log(error);
      throw error;
    }
  }

  async isLimtedBuy(ip: string, tickets: number) {
    const device = await this.deviceModel.findOne({ip}).lean();
    if(
      (!device && tickets <= 3) || 
      (device && (device.ticketBought + tickets <= 3))) 
    {
      return false;
    } else {
      return true;
    }
  }

  findTicketsByEmail(email: string) {
    return this.reservationsModel.find({email}).lean();
  }
}
