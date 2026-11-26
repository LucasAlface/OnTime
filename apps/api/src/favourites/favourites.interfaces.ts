import { ApiProperty } from '@nestjs/swagger';

export class FavouriteRequest {
  @ApiProperty({ example: 42, description: 'ID do utilizador' })
  userId!: number;

  @ApiProperty({ example: '200', description: 'Código da linha favorita' })
  routeLine!: string;
}
