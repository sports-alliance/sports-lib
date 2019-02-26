export interface EventJsonInterface {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    stats: {
        className: string;
        value: number;
    }[];
}
