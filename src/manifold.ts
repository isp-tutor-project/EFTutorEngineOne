

namespace EngineTest {

    // import { Startup } from "./engine";

    Startup.main();
    Test.main();

    export class BootLoader {

        public static anLibrary:object = {"test":"object"};

        constructor() {        
        }

        public static main(): number {
            
            Startup.main();
            return 0;
        }
    }
}