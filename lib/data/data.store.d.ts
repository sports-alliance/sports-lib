import { DataInterface } from './data.interface';
import { UserUnitSettingsInterface } from '../users/user.unit.settings.interface';
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
    /**
     * This gets the base and extended unit datatypes from a datatype array depending on the user settings
     * @param dataTypes
     * @param userUnitSettings
     */
    protected static getUnitBasedDataTypesFromDataTypes(dataTypes: string[], userUnitSettings?: UserUnitSettingsInterface): string[];
    /**
     * Gets the unitbased types
     * @param dataType
     * @param userUnitSettings
     */
    protected static getUnitBasedDataTypesFromDataType(dataType: string, userUnitSettings?: UserUnitSettingsInterface): string[];
}
export interface DataTypeUnitGroups {
    [type: string]: string[];
}
