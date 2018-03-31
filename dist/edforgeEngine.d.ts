/// <reference types="easeljs" />
/// <reference types="EdForgeEngine" />
declare namespace TutorEngineOne {
    import MovieClip = createjs.MovieClip;
    import DisplayObject = createjs.DisplayObject;
    import DisplayObjectContainer = createjs.Container;
    class CEFRoot extends MovieClip {
        traceMode: boolean;
        wozName: string;
        private _listenerArr;
        static STAGEWIDTH: number;
        static STAGEHEIGHT: number;
        parentScene: CEFScene;
        static gSceneConfig: any;
        static gSceneGraphDesc: any;
        static gAnimationGraphDesc: any;
        static fRemoteMode: boolean;
        static fDemo: boolean;
        static fDebug: boolean;
        static fLog: boolean;
        static fDeferDemoClick: boolean;
        static fTutorPart: string;
        static fFullSignIn: boolean;
        static fSkipAssess: boolean;
        static fEnableBack: boolean;
        static fForceBackButton: boolean;
        static fSkillometer: boolean;
        static sessionAccount: any;
        static fSessionID: string;
        static fSessionTime: number;
        static serverUserID: number;
        static fPlaybackMode: boolean;
        static WOZREPLAY: string;
        static WOZCANCEL: string;
        static WOZPAUSING: string;
        static WOZPLAYING: string;
        static gTutor: any;
        private static logR;
        private static SceneData;
        private static _wozInstance;
        private static _gNavigator;
        /**
         * Root Object constructor
         *
         */
        constructor();
        Destructor(): void;
        captureXMLStructure(parentXML: string, iDepth: number): void;
        resetXML(): void;
        loadXML(propVector: Object): void;
        saveXML(): string;
        getSymbolClone(_cloneOf: string, _named: string): string;
        gData: string;
        gPhase: string;
        gLogR: ILogManager;
        resetSceneDataXML(): void;
        gForceBackButton: boolean;
        gNavigator: CEFNavigator;
        /**
         * encode experiment state polymorphically
         * @return An XML object representing the current object state - for the experimenter
         */
        logState(): string;
        /**
         * Check object status - Has user completed object initialization
         * @return int : 1 if object has been fully user (defined - completed - setup) - 0 otherwise
         */
        IsUserDefined(): number;
        readonly captureLOGString: string;
        /**
         * Capture an XML instance of the scene state for logging purposes
         * @return
         */
        captureLOGState(): string;
        /**
         * Provides a safe way to check for property existance on sealed classes
         * Watch uses - ActionScript worked differently -
         * hasOwnProperty checks class
         * in checks prototype chain.
         * @param	prop - String name of the property to check
         * @return  true - property is extant :   false - property is not extant
         */
        isDefined(prop: string): boolean;
        /**
         * Overload the play so that we can start and stop from array references
         *
         */
        superPlay(): void;
        /**
         * Overload the play so that we can start and stop from array references
         *
         */
        superStop(): void;
        /**
         * Overload the gotoAndStop so that we can track what movies are playing and which aren't
         *
         */
        gotoAndStop(frame: Object, scene?: string): void;
        /**
         * Overload the stop so that we can track what movies are playing and which aren't
         *
         */
        stop(): void;
        /**
         * Overload the gotoAndPlay so that we can track what movies are playing and which aren't
         *
         */
        gotoAndPlay(frame: Object, scene?: string): void;
        /**
         * Overload the play so that we can track what movies are playing and which aren't
         *
         */
        play(): void;
        /**
         * wozPlay allows late binding to the Tutor object - use for scene object etc that are created after initAutomation call
         *
         */
        bindPlay(tutor: CEFTutorRoot): void;
        setTopMost(): void;
        startSession(): void;
        readonly sessionTime: string;
        instantiateObject(objectClass: string): DisplayObject;
        getDefinitionByName(className: string): any;
        dumpStage(_obj: DisplayObjectContainer, _path: string): void;
    }
}
