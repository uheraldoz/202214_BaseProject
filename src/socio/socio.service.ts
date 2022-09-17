import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { SocioEntity } from './socio.entity';

@Injectable()
export class SocioService {
  constructor(
    @InjectRepository(SocioEntity)
    private readonly socioRepository: Repository<SocioEntity>,
  ) {}

  async findAll(): Promise<SocioEntity[]> {
    return await this.socioRepository.find({
      relations: ['clubes'],
    });
  }

  async findOne(id: string): Promise<SocioEntity> {
    const pais: SocioEntity = await this.socioRepository.findOne({
      where: { id },
      relations: ['clubes'],
    });
    if (!pais)
      throw new BusinessLogicException(
        'El socio con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );

    return pais;
  }

  async create(socio: SocioEntity): Promise<SocioEntity> {
    if (!socio.email.includes('@'))
      throw new BusinessLogicException(
        'El correo de socio debe contener @',
        BusinessError.BAD_REQUEST,
      );
    return await this.socioRepository.save(socio);
  }

  async update(id: string, socio: SocioEntity): Promise<SocioEntity> {
    const persistedsocio: SocioEntity = await this.socioRepository.findOne({
      where: { id },
    });
    if (!persistedsocio)
      throw new BusinessLogicException(
        'El socio con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );
    if (!socio.email.includes('@'))
      throw new BusinessLogicException(
        'El correo de socio debe contener @',
        BusinessError.BAD_REQUEST,
      );

    socio.id = id;

    return await this.socioRepository.save(socio);
  }

  async delete(id: string) {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id },
    });
    if (!socio)
      throw new BusinessLogicException(
        'El socio con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );

    await this.socioRepository.remove(socio);
  }
}
