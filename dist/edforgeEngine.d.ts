declare module "engine" {
    export class Startup {
        static anLibrary: object;
        constructor();
        static main(): number;
    }
    export class StartupA {
        static anLibrary: object;
        constructor();
        static main(): number;
    }
    export class StartupB {
        static anLibrary: object;
        constructor();
        static main(): number;
    }
    export class StartupC {
        static anLibrary: object;
        constructor();
        static main(): number;
    }
}
declare module "manifold" {
    export class BootLoader {
        static anLibrary: object;
        constructor();
        static main(): number;
    }
}
