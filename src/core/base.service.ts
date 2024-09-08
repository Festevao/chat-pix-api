import { Repository, DeepPartial, FindOptionsWhere, FindOptionsOrder, Entity } from 'typeorm';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';

@Injectable()
export abstract class BaseService<T extends BaseEntity> {
  constructor(
    protected readonly repository: Repository<T>,
    private readonly entityClass: new () => T,
  ) {}

  async findAll(): Promise<T[]> {
    try {
      return this.repository.find();
    } catch (e) {
      console.log(e);
    }
  }

  async findOne(id: string): Promise<T> {
    return await this.findById(id);
  }

  async findById(id: string): Promise<T> {
    const entity = await this.repository.findOneBy({
      id: id,
    } as unknown as FindOptionsWhere<T>);
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(`${this.entityClass.name} already exists.`);
      }
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, data: QueryDeepPartialEntity<T>): Promise<T> {
    const entity = await this.findById(id);
    await this.repository.update(id, data);
    return entity;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }

  async paginate(
    page: number = 1,
    pageSize: number = 10,
    orderByColumn?: FindOptionsOrder<T>,
  ): Promise<{ items: T[]; totalItems: number }> {
    const [items, totalItems] = await this.repository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: orderByColumn,
    });

    return { items, totalItems };
  }
}
