// is-null-or-exists.validator.ts

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsNullOrExistsConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async validate(id: number | null, args: ValidationArguments) {
    if (id === null) {
      return true; // null is allowed
    }
    const employee = await this.employeeRepository.findOneBy({ id });
    return Boolean(employee);
  }
}

export function IsNullOrExists(
  entity: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entity],
      validator: IsNullOrExistsConstraint,
    });
  };
}
