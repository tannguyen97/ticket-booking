import {
  IsEmail, IsNumber
} from 'class-validator';

export class CreateReservationDto {
   @IsEmail()
   email: string;

   @IsNumber()
   tickets: number;

   @IsNumber()
   moneyAmount: number;
}
