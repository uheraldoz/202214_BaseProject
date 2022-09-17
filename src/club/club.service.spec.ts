import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ClubEntity } from './club.entity';
import { ClubService } from './club.service';

describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let clubList: ClubEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    clubList = [];
    for (let i = 0; i < 5; i++) {
      const club: ClubEntity = await repository.save({
        nombre: faker.name.fullName(),
        imagen: faker.image.imageUrl(),
        descripcion: faker.lorem.sentence(3),
        fecha_fundacion: faker.date.past(15),
      });
      clubList.push(club);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todos los clubes', async () => {
    const clubes: ClubEntity[] = await service.findAll();
    expect(clubes).not.toBeNull();
    expect(clubes).toHaveLength(clubList.length);
  });

  it('findOne debe retornar un club por id', async () => {
    const storedClub: ClubEntity = clubList[0];
    const club: ClubEntity = await service.findOne(storedClub.id);
    expect(club).not.toBeNull();
    expect(club.nombre).toEqual(storedClub.nombre);
  });

  it('findOne deberia arrojar un excepcion para un club invalido', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'El club con el id dado no ha sido encontrado',
    );
  });

  it('Crear deberia retornar un nuevo club', async () => {
    const club: ClubEntity = {
      id: '',
      nombre: faker.name.fullName(),
      imagen: faker.image.imageUrl(),
      descripcion: faker.lorem.sentence(3),
      fecha_fundacion: faker.date.past(15),
      socios: [],
    };

    const newClub: ClubEntity = await service.create(club);
    expect(newClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({
      where: { id: `${newClub.id}` },
    });
    expect(storedClub).not.toBeNull();
    expect(storedClub.nombre).toEqual(newClub.nombre);
  });

  it('Crear deberia retornar un error para club con descripcion mas de 100 caracteres', async () => {
    const club: ClubEntity = {
      id: '',
      nombre: faker.name.fullName(),
      imagen: faker.image.imageUrl(),
      descripcion: faker.lorem.paragraph(10),
      fecha_fundacion: faker.date.past(15),
      socios: [],
    };

    await expect(() => service.create(club)).rejects.toHaveProperty(
      'message',
      'La descripcion del club no debe superar los 100 caracteres',
    );
  });

  it('Update deberia modificar un club', async () => {
    const club: ClubEntity = clubList[0];
    club.nombre = 'New name';

    const updatedClub: ClubEntity = await service.update(club.id, club);
    expect(updatedClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({
      where: { id: `${club.id}` },
    });
    expect(storedClub).not.toBeNull();
    expect(storedClub.nombre).toEqual(club.nombre);
  });

  it('update deberia arrojar un error para un club invalido', async () => {
    let club: ClubEntity = clubList[0];
    club = {
      ...club,
      nombre: 'New name',
    };
    await expect(() => service.update('0', club)).rejects.toHaveProperty(
      'message',
      'El club con el id dado no ha sido encontrado',
    );
  });

  it('update deberia arrojar un error para un club con una descripcion de más de 100 caracteres', async () => {
    let club: ClubEntity = clubList[0];
    club = {
      ...club,
      descripcion: faker.lorem.paragraph(10),
    };
    await expect(() => service.update(club.id, club)).rejects.toHaveProperty(
      'message',
      'La descripcion del club no debe superar los 100 caracteres',
    );
  });

  it('delete deberia remover un club', async () => {
    const club: ClubEntity = clubList[0];
    await service.delete(club.id);

    const deletedClub: ClubEntity = await repository.findOne({
      where: { id: `${club.id}` },
    });
    expect(deletedClub).toBeNull();
  });

  it('delete deberia arrojar un error para un club invalido', async () => {
    const club: ClubEntity = clubList[0];
    await service.delete(club.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El club con el id dado no ha sido encontrado',
    );
  });
});
