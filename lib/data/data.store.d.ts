import { DataInterface } from './data.interface';
/**
 * Only concrete classes no abstracts
 */
export declare const DataStore: any;
export declare class DynamicDataLoader {
    static basicDataTypes: string[];
    static advancedDataTypes: string[];
    static unitBasedDataTypes: DataTypeUnitGroups;
    static allDataTypes: string[];
    static getDataInstanceFromDataType(dataType: string, opts: any): DataInterface;
    static getDataClassFromDataType(dataType: string): any;
    static isUnitDerivedDataType(dataType: string): boolean;
}
export interface DataTypeUnitGroups {
    [type: string]: string[];
}
