export abstract class Module {
    abstract name: string;
    abstract urlMatch: RegExp | RegExp[];

    abstract init(): void;
    abstract destroy(): void;
}