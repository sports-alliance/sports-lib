import { DataInterface } from './data.interface';
/**
 * Only concrete classes no abstracts
 */
export declare const DataStore: any;
export declare class DynamicDataLoader {
    static getDataInstance(className: string, opts: any): DataInterface;
    static getDataClassFromClassName(className: string): DataInterface;
}
