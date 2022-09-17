import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubEntity } from '../club/club.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { SocioEntity } from '../socio/socio.entity';

@Injectable()
export class ClubSocioService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,
    @InjectRepository(SocioEntity)
    private readonly socioRepository: Repository<SocioEntity>,
  ) {}

  async addMemberToClub(clubId: string, socioId: string): Promise<ClubEntity> {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });

    if (!socio)
      throw new BusinessLogicException(
        'El socio con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'El club con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );

    club.socios = [...club.socios, socio];
    return await this.clubRepository.save(club);
  }

  async findMembersFromClub(clubId: string): Promise<SocioEntity[]> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'El club con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );

    return club.socios;
  }

  async findMemberFromClub(
    clubId: string,
    socioId: string,
  ): Promise<SocioEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });

    if (!club)
      throw new BusinessLogicException(
        'El club con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );

    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        'El socio con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );

    const socioClub: SocioEntity = club.socios.find((e) => e.id === socio.id);

    if (!socioClub)
      throw new BusinessLogicException(
        'El socio no esta asociado al club',
        BusinessError.PRECONDITION_FAILED,
      );

    return socioClub;
  }

  async updateMembersFromClub(
    clubId: string,
    socios: SocioEntity[],
  ): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'El club con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );

    for (let i = 0; i < socios.length; i++) {
      const socio: SocioEntity = await this.socioRepository.findOne({
        where: { id: `${socios[i].id}` },
      });
      if (!socio)
        throw new BusinessLogicException(
          'El socio con el id dado no ha sido encontrado',
          BusinessError.NOT_FOUND,
        );
    }

    club.socios = socios;
    return await this.clubRepository.save(club);
  }

  async deleteMemberFromClub(clubId: string, socioId: string) {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });

    if (!club)
      throw new BusinessLogicException(
        'El club con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );

    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        'El socio con el id dado no ha sido encontrado',
        BusinessError.NOT_FOUND,
      );

    const socioClub: SocioEntity = club.socios.find((e) => e.id === socio.id);

    if (!socioClub)
      throw new BusinessLogicException(
        'El socio no esta asociado al club',
        BusinessError.PRECONDITION_FAILED,
      );

    club.socios = club.socios.filter((e) => e.id !== socioId);
    await this.clubRepository.save(club);
  }
}
