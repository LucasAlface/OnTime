import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FavouritesService } from './favourites.service.js';
import { FavouriteRequest } from './favourites.interfaces.js';

@ApiTags('Favourites')
@ApiExtraModels(FavouriteRequest)
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar favoritos' })
  @ApiOkResponse({ description: 'Lista de favoritos' })
  async getFavourites() {
    return this.favouritesService.getFavourites();
  }

  @Post('create')
  @ApiOperation({ summary: 'Criar um ou vários favoritos' })
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(FavouriteRequest) },
        { type: 'array', items: { $ref: getSchemaPath(FavouriteRequest) } },
      ],
    },
  })
  @ApiCreatedResponse({ description: 'Favorito(s) criado(s)' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  async createFavourite(@Body() body: FavouriteRequest | FavouriteRequest[]) {
    return this.favouritesService.createFavourite(body);
  }

  @Post('update/:userId/:routeLine')
  @ApiOperation({ summary: 'Atualizar um favorito' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID atual do utilizador' })
  @ApiParam({ name: 'routeLine', type: String, description: 'Código atual da linha' })
  @ApiBody({ type: FavouriteRequest })
  @ApiResponse({ status: 201, description: 'Favorito atualizado' })
  @ApiBadRequestResponse({ description: 'ID do utilizador inválido' })
  @ApiNotFoundResponse({ description: 'Favorito não encontrado' })
  async updateFavourite(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('routeLine') routeLine: string,
    @Body() body: FavouriteRequest,
  ) {
    return this.favouritesService.updateFavourite(
      userId,
      routeLine,
      body.userId,
      body.routeLine,
    );
  }

  @Post('delete/:userId/:routeLine')
  @ApiOperation({ summary: 'Remover um favorito' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID do utilizador' })
  @ApiParam({ name: 'routeLine', type: String, description: 'Código da linha' })
  @ApiResponse({ status: 201, description: 'Favorito removido' })
  @ApiBadRequestResponse({ description: 'ID do utilizador inválido' })
  @ApiNotFoundResponse({ description: 'Favorito não encontrado' })
  async deleteFavourite(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('routeLine') routeLine: string,
  ) {
    return this.favouritesService.deleteFavourite(userId, routeLine);
  }
}
