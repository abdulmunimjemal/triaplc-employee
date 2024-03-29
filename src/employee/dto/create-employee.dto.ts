// create-employee.dto.ts

import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsNullOrExists } from '../validator/'; // Custom validator (you will need to implement this)
import { Employee } from '../entities';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsOptional()
  @Type(() => Number) // Ensure that the input is treated as a number
  @IsInt()
  @Min(1)
  @ValidateIf((o) => o.reportsTo !== null) // Apply the following validation only if reportsTo is not null
  @Validate(IsNullOrExists, ['Employee']) // Custom validator to check if the employee exists or is null
  reportsTo?;
}
