define("engine", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Startup = /** @class */ (function () {
        function Startup() {
        }
        Startup.main = function () {
            console.log('Hello World - From Startup');
            return 0;
        };
        Startup.anLibrary = { "test": "object" };
        return Startup;
    }());
    exports.Startup = Startup;
    var StartupA = /** @class */ (function () {
        function StartupA() {
        }
        StartupA.main = function () {
            console.log('Hello World - From Startup');
            return 0;
        };
        StartupA.anLibrary = { "test": "object" };
        return StartupA;
    }());
    exports.StartupA = StartupA;
    var StartupB = /** @class */ (function () {
        function StartupB() {
        }
        StartupB.main = function () {
            console.log('Hello World - From Startup');
            return 0;
        };
        StartupB.anLibrary = { "test": "object" };
        return StartupB;
    }());
    exports.StartupB = StartupB;
    var StartupC = /** @class */ (function () {
        function StartupC() {
        }
        StartupC.main = function () {
            console.log('Hello World - From Startup');
            return 0;
        };
        StartupC.anLibrary = { "test": "object" };
        return StartupC;
    }());
    exports.StartupC = StartupC;
});
//Startup.main();  
define("manifold", ["require", "exports", "engine"], function (require, exports, engine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    engine_1.Startup.main();
    var BootLoader = /** @class */ (function () {
        function BootLoader() {
        }
        BootLoader.main = function () {
            engine_1.Startup.main();
            return 0;
        };
        BootLoader.anLibrary = { "test": "object" };
        return BootLoader;
    }());
    exports.BootLoader = BootLoader;
});
//# sourceMappingURL=edforgeEngine.js.map