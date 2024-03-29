import {Component, OnChanges, OnInit} from '@angular/core';
import {EmployeeService} from '../../../core/services/data/employee.service';
import {Employee} from '../../../core/models/employee.model';
import {EmployeeOptions} from './employee.options';
import {AreaService} from '../../../core/services/data/area.service';
import {Area} from '../../../core/models/area.model';
import Swal from 'sweetalert2';
import {ConfirmationService} from 'primeng/api';
import {forkJoin} from 'rxjs';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss', '../../../../assets/styles/primeNG.scss']
})
export class EmployeesComponent implements OnInit {
  employees: any[];
  areas: Area[];
  cols: any[];
  action: string;


  isEmployeeForm = false;
  newEmployee = {};

  rows = 5;
  msg;

  constructor(private employeeService: EmployeeService, private areaService: AreaService,
              private confirmationService: ConfirmationService) {
    this.initData();
    this.cols = EmployeeOptions.cols;
  }

  ngOnInit(): void {
  }

  initData(): void {
    forkJoin({
      areas: this.areaService.getAreas().pipe(take(1)),
      employees: this.employeeService.getEmployees().pipe(take(1)),
    }).subscribe(value => {
      this.areas = value.areas;
      this.employees = value.employees;
      this.initSubscribtions();
    });
  }

  prepareEmployees(): void {
    for (const emp of this.employees) {
      if (emp.areaIdsList && emp.areaIdsList.length > 0) {
        emp.area = this.areas.find(area => area.id === emp.areaIdsList[0]).name;
      } else {
        emp.area = 'No area';
      }
    }
  }

  initSubscribtions(): void {
    this.employeeService.getEmployees().subscribe(value => {
      this.employees = value;
      this.prepareEmployees();
    });
  }

  addEmployeeForm(): void {
    this.newEmployee = {};
    this.isEmployeeForm = true;
    this.action = 'add';
  }

  updateEmployeeForm(employee): void {
    this.isEmployeeForm = true;
    this.action = 'update';
    this.newEmployee = employee;
  }

  afterEmployeeAction(employee): void {
    if (this.action === 'add') {
      this.msg = [{
        severity: 'success', summary: 'Confirmed',
        detail: employee.username + 'added successfully to the system'
      }];
      this.employees.find(value => value.id === employee.id).area = 'No area';
    }
    if (this.action === 'update') {
      this.msg = [{
        severity: 'success', summary: 'Confirmed',
        detail: employee.username + 'updated successfully'
      }];
      if (employee.areaIdsList && employee.areaIdsList.length > 0) {
        this.employees.find(value => value.id === employee.id).area = this.areas.find(area => area.id === employee.areaIdsList[0]).name;
      } else {
        this.employees.find(value => value.id === employee.id).area = 'no area';
      }
    }
    this.isEmployeeForm = false;
  }

  deleteEmployee(employee): void {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this Employee?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.employeeService.deleteEmployee(employee.id).subscribe(value => {
          this.msg = [{
            severity: 'error', summary: 'Confirmed',
            detail: employee.username + 'deleted successfully'
          }];
        });
      },
    });
  }

  clearMessages(): void {
    this.msg = [];
  }
}
