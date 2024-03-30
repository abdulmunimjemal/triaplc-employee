// employee.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { Employee } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: ['reportsTo', 'subordinates'],
    });
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOneBy({ id: id });

    if (!employee) {
      throw new BadRequestException(`Employee with ID ${id} not found.`);
    }

    return employee;
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // This should be done in a transaction to ensure data consistency
    return await this.employeeRepository.manager.transaction(
      async (transactionalEntityManager) => {
        if (createEmployeeDto.reportsTo) {
          // Check if the manager exists
          const managerExists = await transactionalEntityManager.count(
            Employee,
            {
              where: {
                id: createEmployeeDto.reportsTo,
              },
            },
          );

          if (!managerExists) {
            throw new BadRequestException(
              'Manager specified in reportsTo not found.',
            );
          }

          // Assign the manager's ID directly to the DTO
          createEmployeeDto.reportsTo = {
            id: createEmployeeDto.reportsTo,
          } as Employee;
        } else {
          // Check for the existence of a top-level employee (no reportsTo)
          const topLevelEmployeeCount = await transactionalEntityManager.count(
            Employee,
            {
              where: {
                reportsTo: null,
              },
            },
          );

          if (topLevelEmployeeCount > 0) {
            throw new BadRequestException(
              'Top-level employee already exists. Please specify reportsTo.',
            );
          }
        }

        // Create and save the new employee
        const employee = transactionalEntityManager.create(
          Employee,
          createEmployeeDto,
        );
        return await transactionalEntityManager.save(Employee, employee);
      },
    );
  }

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const existingEmployee = await this.employeeRepository.preload({
      id: id,
      ...updateEmployeeDto,
    });

    if (!existingEmployee) {
      throw new BadRequestException(`Employee with ID ${id} not found.`);
    }

    return this.employeeRepository.save(existingEmployee);
  }

  async remove(id: number): Promise<void> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['subordinates'],
    });
    if (!employee) {
      throw new BadRequestException(`Employee with ID ${id} not found.`);
    }
    if (employee.subordinates.length > 0) {
      throw new BadRequestException(
        `Employee with ID ${id} has subordinates. Please delete them or move them to other superior first.`,
      );
    }
    const deleteResult = await this.employeeRepository.delete(id);

    if (!deleteResult.affected) {
      throw new BadRequestException(`Employee with ID ${id} not found.`);
    }
  }

  async buildEmployeeTree(id: number): Promise<any> {
    // Fetch the root employee and the first level of subordinates
    const rootEmployee = await this.employeeRepository.findOne({
      where: {
        id: id,
      },
      relations: ['subordinates'],
    });
    if (!rootEmployee) {
      throw new BadRequestException('Employee not found');
    }

    console.log(`root: ${rootEmployee.name}`);

    // Build and return the entire tree starting from the rootEmployee
    return this.buildTree(rootEmployee);
  }

  private async buildTree(employee: Employee): Promise<any> {
    // Create a copy of the current employee with only the needed information
    const employeeTree = {
      id: employee.id,
      name: employee.name,
      // Start with an empty array for subordinates, to be populated recursively
      subordinates: [],
    };

    // Base case: if there are no subordinates, return the current employee
    if (employee.subordinates.length === 0) {
      return employeeTree;
    }

    // Recursively build the subordinates tree
    for (const subordinate of employee.subordinates) {
      // Fetch the full subordinate employee entity including their subordinates
      const fullSubordinate = await this.employeeRepository.findOne({
        where: { id: subordinate.id },
        relations: ['subordinates'],
      });

      // Check if the full subordinate entity was successfully fetched
      if (fullSubordinate) {
        // Recursively build the tree for the current subordinate
        const subordinateTree = await this.buildTree(fullSubordinate);
        employeeTree.subordinates.push(subordinateTree);
      }
    }

    return employeeTree;
  }
}
