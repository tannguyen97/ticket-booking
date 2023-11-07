import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { ReservationsService } from "../reservations.service";

@Injectable()
export class deviceLimitMiddleware implements NestMiddleware {
  
   constructor(private readonly reservationService: ReservationsService) {}

   async use(req: Request, res: Response, next: NextFunction) {
      const deviceIp = req.ip;
      const tickets = req?.body?.tickets;
      const isLimit = await this.reservationService.isLimtedBuy(deviceIp, tickets);
      if(isLimit === true){
         return res.status(403).json({error: "You have reached the ticket purchase limit"});
      }
      next();
   }
}