import { CreatorInterface } from './creatorInterface';
export declare class Creator implements CreatorInterface {
    name: string;
    swInfo?: string;
    hwInfo?: string;
    serialNumber?: string;
    constructor(name: string);
    toJSON(): any;
}
