import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Request as Req, query } from 'express';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Request() request: Req, @Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(request.ip, createReservationDto);
  }

  @Get()
  findTicketsByEmail(@Query('email') email: string) {
    return this.reservationsService.findTicketsByEmail(email);
  }
}
