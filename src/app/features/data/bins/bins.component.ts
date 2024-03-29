import {Component, OnInit} from '@angular/core';
import {BinService} from '../../../core/services/data/bin.service';
import {Bin} from '../../../core/models/bin.model';
import {BinOptions} from './bins.options';
import {AreaService} from '../../../core/services/data/area.service';
import {Area} from '../../../core/models/area.model';
import {ConfirmationService} from 'primeng/api';
import {Router} from '@angular/router';
import {EmployeeService} from '../../../core/services/data/employee.service';
import {Employee} from '../../../core/models/employee.model';
import {forkJoin} from 'rxjs';
import {take} from 'rxjs/operators';
import {log} from 'util';


@Component({
  selector: 'app-bins',
  templateUrl: './bins.component.html',
  styleUrls: ['./bins.component.scss', '../../../../assets/styles/primeNG.scss']
})
export class BinsComponent implements OnInit {

  bins: Bin[];
  areas: Area[];
  employees: Employee[];

  cols = BinOptions.cols;
  statusOptions = BinOptions.status;
  areasOptions;
  employeesOptions;

  binsData: BinData[];
  msg;
  rows = 5;

  constructor(private binService: BinService, private areaService: AreaService, private confirmationService: ConfirmationService,
              private router: Router, private employeeService: EmployeeService) {
    this.initializeData();
  }

  ngOnInit(): void {
  }

  initializeData(): void {
    forkJoin({
      bins: this.binService.getBins().pipe(take(1)),
      areas: this.areaService.getAreas().pipe(take(1)),
      employees: this.employeeService.getEmployees().pipe(take(1)),
    }).subscribe(value => {
      this.areas = value.areas;
      this.employees = value.employees;
      this.bins = value.bins;
      this.prepareAreas();
      this.prepareEmployees();
      this.initSubscribtions();
    });
  }

  initSubscribtions(): void {
    this.binService.getBins().subscribe(value => {
      this.bins = value;
      this.prepareTableData(this.bins);
    });
  }

  prepareAreas(): void {
    this.areasOptions = [];
    this.areasOptions.push({label: 'All', value: null});
    for (const area of this.areas) {
      this.areasOptions.push({label: area.name, value: area.name});
    }
  }

  prepareEmployees(): void {
    this.employeesOptions = [];
    this.employeesOptions.push({label: 'All', value: null});
    for (const employee of this.employees) {
      this.employeesOptions.push({label: employee.username, value: employee.username});
    }
  }

  prepareTableData(bins: Bin[]): void {
    this.binsData = [];
    for (const bin of bins) {
      const binD: any = {};
      binD.id = bin.id;
      binD.area = 'No Area';
      binD.employee = 'No Employee';

      const area = this.areas.find(value => value.id === bin.areaId);
      if (area) {
        binD.area = area.name;
        for (const employee of this.employees) {
          // @ts-ignore
          if (employee.areaIdsList.length > 0 && employee.areaIdsList[0] === area.id) {
            binD.employee = employee.username;
          }
        }
      }
      binD.status = bin.status;
      this.binsData.push(binD);
    }
  }

  confirmDelete(bin): void {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this Bin?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.binService.deleteBin(bin.id).subscribe(value => {
          this.msg = [{
            severity: 'success', summary: 'Confirmed',
            detail: 'bin removed successfully'
          }];
        });
      },
    });
  }

  clearMessages(): void {
    this.msg = [];
  }
}


export interface BinData {
  id: number;
  area: string;
  status: string;
  employee: string;
}
