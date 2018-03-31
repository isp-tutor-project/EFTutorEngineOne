/// <reference types="createjs-lib" />
/// <reference types="easeljs" />
/// <reference types="tweenjs" />
declare module "animationgraph/CAnimationChoice" {
    export class CAnimationChoice {
        private _classname;
        private _odds;
        private _chosen;
        constructor(data: any);
        odds(ndx: number): number;
        readonly count: number;
        readonly classname: string;
        replace(): void;
        choose(): void;
    }
}
declare module "animationgraph/CAnimationChoiceSet" {
    import { CAnimationNode } from "animationgraph/CAnimationNode";
    import { CAnimationGraph } from "animationgraph/CAnimationGraph";
    import EventDispatcher = createjs.EventDispatcher;
    export class CAnimationChoiceSet extends CAnimationNode {
        private _choices;
        private _iter;
        private _cycle;
        private _count;
        private _replace;
        constructor(target?: EventDispatcher);
        static factory(parent: CAnimationGraph, nodeName: string, moduleFactory: any): CAnimationChoiceSet;
        nextAnimation(): string;
    }
}
declare module "animationgraph/CAnimationTrack" {
    import { CAnimationGraph } from "animationgraph/CAnimationGraph";
    export class CAnimationTrack {
        private _parent;
        private _type;
        private _choiceset;
        private _classname;
        private _features;
        private _pid;
        private _cycle;
        private _prob;
        constructor(factory: any, parent: CAnimationGraph);
        nextAnimation(): string;
        testPFeature(): boolean;
        readonly hasPFeature: boolean;
        readonly type: string;
        features: string;
        readonly classname: string;
    }
}
declare module "util/CUtil" {
    export class CUtil extends Object {
        static w: any;
        static now: Function;
        static getDefinitionByNameCache: any;
        constructor();
        static trace(message: string | string[], ...alt: any[]): void;
        static getTimer(): number;
        static getQualifiedClassName(value: any): string;
        getDefinitionByName(name: string): any;
    }
}
declare module "mongo/MObject" {
    export class MObject extends Object {
        constructor();
    }
}
declare module "mongo/CObject" {
    import { MObject } from "mongo/MObject";
    export class CObject extends MObject {
        constructor();
        getValue(tarObj: Object, path: string): any;
        setValue(tarObj: Object, objPath: Array<string>, value: any): void;
    }
}
declare module "mongo/CMongo" {
    export class CMongo {
        static readonly FIND: string;
        static readonly INSERT: string;
        static readonly CREATEACCT: string;
        static readonly UPSERT: string;
        static readonly UPDATE: string;
        static readonly UNSET: string;
        static readonly REMOVE: string;
        static readonly RECYCLE: string;
        static readonly RECOVER: string;
        static readonly DBCOMMAND: string;
        static readonly DBRUN_DBCOMMAND: string;
        static readonly DBRUN_LISTDBS: string;
        static readonly DBRUN_LISTCOLS: string;
        static readonly DBRUN_DROPCOLLECTION: string;
        static readonly DBRUN_UPDATEDOCUMENT: string;
        static readonly ACK_FIND: string;
        static readonly ACK_INSERT: string;
        static readonly ACK_CREATEACCT: string;
        static readonly ACK_UPSERT: string;
        static readonly ACK_UPDATE: string;
        static readonly ACK_UNSET: string;
        static readonly ACK_REMOVE: string;
        static readonly ACK_RECYCLE: string;
        static readonly ACK_RECOVER: string;
        static readonly ACK_DBCOMMAND: string;
        static readonly QUERY_ALL: string;
        static readonly LOG_PACKET: string;
        static readonly LOG_TERMINATE: string;
        static readonly LOG_PROGRESS: string;
        static readonly ACKLOG_PACKET: string;
        static readonly ACKLOG_TERMINATE: string;
        static readonly ACKLOG_PROGRESS: string;
        static readonly ACKLOG_NAK: string;
        static readonly _READY: string;
        static readonly _INPROGRESS: string;
        static readonly _COMPLETE: string;
        constructor();
        static commandPacket(_source: string, _command: string, _collection: string, _query: any, _database?: string): string;
        static queryPacket(_source: string, _command: string, _collection: string, _query: any, _limit?: any, _database?: string): string;
        static recyclePacket(_source: string, _command: string, _collection: string, _query: any, recover: string): string;
        static insertPacket(_source: string, _command: string, _collection: string, _objectDoc: Object): string;
        static updatePacket(_source: string, _command: string, _collection: string, _query: any, _updateObj: Object): string;
        static unsetFieldPacket(_source: string, _command: string, _collection: string, _query: any, _updateObj: Object): string;
        private static parseUpdateFields(node, objPath?);
        static encodeAsJSON(_fields: Object, parent: Object): string;
        static encodeAsObject(host: Object, _fields: any, parent: any): Object;
        static objectBuilder(leafObj: any, pathArray: Array<string>): Object;
        static setValue(tarObj: Object, path: string, value: any): void;
    }
}
declare module "events/CEFEvent" {
    import Event = createjs.Event;
    export class CEFEvent extends Event {
        static readonly ENTER_FRAME: string;
        static readonly ADDED_TO_STAGE: string;
        static readonly REMOVED_FROM_STAGE: string;
        static readonly MOTION_FINISH: string;
        static readonly CHANGE: string;
        static readonly COMPLETE: string;
        tarObjID: string;
        constructor(TarObjID: string, type: string, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
        captureLogState(obj?: any): Object;
        captureXMLState(): string;
        restoreXMLState(xmlState: string): void;
        compareXMLState(xmlState: string): boolean;
        trace(message: string | string[]): void;
    }
}
declare module "core/CEFDoc" {
    import { CEFRoot } from "core/CEFRoot";
    import { CEFTutorRoot } from "core/CEFTutorRoot";
    export class CEFDoc extends CEFRoot {
        Stutor: CEFTutorRoot;
        static tutorAutoObj: any;
        static gApp: CEFDoc;
        static designWidth: number;
        static designHeight: number;
        logFrameID: number;
        logStateID: number;
        constructor();
        initOnStage(evt: Event): void;
        launchTutors(): void;
        resetStateFrameID(): void;
        frameID: number;
        incFrameID(): void;
        stateID: number;
        incStateID(): void;
        connectFrameCounter(fCon: boolean): void;
        private doEnterFrame(evt);
        protected dumpTutors(): void;
    }
}
declare module "events/CEFMouseEvent" {
    import MouseEvent = createjs.MouseEvent;
    export class CEFMouseEvent extends MouseEvent {
        tarObjID: string;
        localX: number;
        localY: number;
        static readonly MOUSE_MOVE: string;
        static readonly MOUSE_DOWN: string;
        static readonly MOUSE_UP: string;
        static readonly MOUSE_CLICK: string;
        static readonly DOUBLE_CLICK: string;
        static readonly CLICK: string;
        static readonly WOZCLICK: string;
        static readonly WOZCLICKED: string;
        static readonly WOZDBLCLICK: string;
        static readonly WOZMOVE: string;
        static readonly WOZDOWN: string;
        static readonly WOZUP: string;
        static readonly WOZOVER: string;
        static readonly WOZOUT: string;
        static readonly WOZKEYDOWN: string;
        static readonly WOZKEYUP: string;
        static readonly WOZNULL: string;
        constructor(TarObjID: string, type: string, bubbles: boolean, cancelable: boolean, stageX: number, stageY: number, nativeEvent: NativeMouseEvent, pointerID: number, primary: boolean, rawX: number, rawY: number);
        clone(): CEFMouseEvent;
        captureLogState(obj?: any): any;
        captureXMLState(): any;
        restoreXMLState(xmlState: any): void;
        compareXMLState(xmlState: any): Boolean;
    }
}
declare module "events/CEFTextEvent" {
    import Event = createjs.Event;
    import { CEFEvent } from "events/CEFEvent";
    export class CEFTextEvent extends CEFEvent {
        static readonly WOZSETSELECTION: string;
        static readonly WOZSETSCROLL: string;
        static readonly WOZINPUTTEXT: string;
        static readonly WOZCAPTUREFOCUS: string;
        static readonly WOZRELEASEFOCUS: string;
        textdata: string;
        index1: number;
        index2: number;
        constructor(TarObjID: string, Type: string, Index1?: number, Index2?: number, TextData?: string, Bubbles?: boolean, Cancelable?: boolean);
        clone(): Event;
    }
}
declare module "core/CEFCursorProxy" {
    import { CEFRoot } from "core/CEFRoot";
    import { CEFObject } from "core/CEFObject";
    import { CEFMouseEvent } from "events/CEFMouseEvent";
    import MovieClip = createjs.MovieClip;
    import Point = createjs.Point;
    import Tween = createjs.Tween;
    export class CEFCursorProxy extends CEFRoot {
        Sstandard: MovieClip;
        Ssmallhand: MovieClip;
        Shand: MovieClip;
        Sautomate: MovieClip;
        Ssparkle: MovieClip;
        curObject: CEFObject;
        actObject: CEFObject;
        cLocation: Point;
        sAuto: string;
        tween: Tween;
        lastFrameTime: number;
        fSparkler: boolean;
        fSparklerTest: boolean;
        fSparklerDrag: boolean;
        fLiveLog: boolean;
        static readonly WOZLIVE: string;
        static readonly WOZREPLAY: string;
        constructor();
        setCursorStyle(style: string): void;
        initWOZCursor(sMode: string): void;
        decodeTarget(baseObj: any, objArray: Array<any>): CEFObject;
        initPlayBack(): void;
        playBackAction(wozEvt: any): void;
        playBackMove(nextMove: any, frameTime: number): void;
        replayEvent(xEvt: any): void;
        replayEventB(xEvt: any): void;
        replayEventAndMove(xEvt: any, laEvt: any, l2Evt: any): Array<any>;
        replayMove(oldTime: number, laEvt: any): Array<Tween>;
        liveMouseMove(evt: CEFMouseEvent): void;
        liveMouseDown(evt: CEFMouseEvent): void;
        liveMouseUp(evt: CEFMouseEvent): void;
        liveMouseDblClick(evt: CEFMouseEvent): void;
        stateHelper(tarObj: CEFObject): boolean;
        hitTestCoord(locX: number, locY: number): CEFObject;
        hitTestMouse(evt: CEFMouseEvent): void;
        show(bFlag: boolean): void;
        private updateCurrentObject(evt, hitObj);
        isWOZObject(tObj: any): CEFObject;
    }
}
declare module "core/CEFAnimator" {
    import { CEFRoot } from "core/CEFRoot";
    import { CEFEvent } from "events/CEFEvent";
    export class CEFAnimator extends CEFRoot {
        Running: Array<any>;
        started: number;
        runCount: number;
        xnFinalize: Function;
        CEFAnimator(): void;
        startTransition(xnF?: Function): void;
        private xnCleanup();
        xnFinished(evt: CEFEvent): void;
        stopTransitions(): void;
    }
}
declare module "core/CEFObjectMask" {
    import { CEFObject } from "core/CEFObject";
    export class CEFObjectMask extends CEFObject {
        constructor();
    }
}
declare module "core/CEFTransitions" {
    import { CEFAnimator } from "core/CEFAnimator";
    import { CEFTutorRoot } from "core/CEFTutorRoot";
    import DisplayObject = createjs.DisplayObject;
    export class CEFTransitions extends CEFAnimator {
        currScene: string;
        newScene: string;
        rTime: number;
        tTime: number;
        fSingleStep: boolean;
        prntTutor: Object;
        tutorAutoObj: any;
        private activeObjs;
        private currentObjs;
        private persistObjs;
        private fSwapObjects;
        constructor();
        connectToTutor(parentTutor: CEFTutorRoot, autoTutor: Object): void;
        resetTransitions(): void;
        walkTweens(): void;
        gotoScene(scn: string): void;
        setTransitionOUT(): void;
        setTransitionIN(objectList: any, objectName: string): void;
        changeScene(): void;
        shallowStateCopy(tar: DisplayObject, src: DisplayObject): void;
        xnFinished(evt: any): void;
        outFinished(): void;
        inFinished(): void;
    }
}
declare module "core/CEFButton" {
    import { CEFObject } from "core/CEFObject";
    import { CEFMouseEvent } from "events/CEFMouseEvent";
    import MovieClip = createjs.MovieClip;
    export class CEFButton extends CEFObject {
        Sup: MovieClip;
        Sover: MovieClip;
        Sdown: MovieClip;
        Sdisabled: MovieClip;
        Sfocus: MovieClip;
        curState: string;
        fPressed: boolean;
        fEnabled: boolean;
        fOver: boolean;
        private onClickScript;
        constructor();
        Destructor(): void;
        captureDefState(TutScene: Object): void;
        restoreDefState(TutScene: Object): void;
        captureLogState(obj?: any): Object;
        capturestringState(): string;
        resetState(): void;
        gotoState(sState: string): void;
        muteButton(bMute: boolean): void;
        enableButton(bFlag: boolean): void;
        doMouseClicked(evt: CEFMouseEvent): void;
        protected doClickAction(evt: CEFMouseEvent): void;
        doMouseOver(evt: CEFMouseEvent): void;
        doMouseOut(evt: CEFMouseEvent): void;
        doMouseDown(evt: CEFMouseEvent): void;
        doMouseUp(evt: CEFMouseEvent): void;
        showButton(fShow: boolean): void;
        loadXML(stringSrc: any): void;
        saveXML(): string;
    }
}
declare module "navigation/CEFNavNext" {
    import { CEFButton } from "core/CEFButton";
    export class CEFNavNext extends CEFButton {
        constructor();
    }
}
declare module "navigation/CEFZNavBack" {
    import { CEFButton } from "core/CEFButton";
    export class CEFNavBack extends CEFButton {
        constructor();
    }
}
declare module "events/CEFTimerEvent" {
    import Event = createjs.Event;
    export class CEFTimerEvent extends Event {
        static readonly TIMER_COMPLETE: string;
        constructor(type: string, bubbles?: boolean, cancelable?: boolean);
    }
}
declare module "core/CEFTimer" {
    import { CEFTimerEvent } from "events/CEFTimerEvent";
    import EventDispatcher = createjs.EventDispatcher;
    export class CEFTimer extends EventDispatcher {
        private traceMode;
        protected _delay: number;
        protected _repeatCount: number;
        private static activeTimers;
        constructor(delay: number, repeatCount?: number);
        cancelTimers(evt: Event): void;
        pauseTimers(evt: Event): void;
        playTimers(evt: Event): void;
        timerRemoveThis(): void;
        timerAddThis(): void;
        reset(): void;
        start(): void;
        timerFinished(evt: CEFTimerEvent): void;
        stop(): void;
    }
}
declare module "events/CEFNavEvent" {
    import Event = createjs.Event;
    export class CEFNavEvent extends Event {
        static readonly WOZNAVNEXT: string;
        static readonly WOZNAVBACK: string;
        static readonly WOZNAVTO: string;
        static readonly WOZNAVINC: string;
        static readonly WOZNAVREPLAY: string;
        wozNavTarget: string;
        wozFeatures: string;
        constructor(type: string, _target?: string, _featureSet?: string, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
    }
}
declare module "scenegraph/CGraphConstraint" {
    import { CSceneGraph } from "scenegraph/CSceneGraph";
    export class CGraphConstraint extends Object {
        protected _parent: CSceneGraph;
        private _cmd;
        private _code;
        constructor();
        static factory(parent: CSceneGraph, factory: any): CGraphConstraint;
        execute(): boolean;
    }
}
declare module "scenegraph/CGraphEdge" {
    import { CSceneGraph } from "scenegraph/CSceneGraph";
    import { CGraphNode } from "scenegraph/CGraphNode";
    export class CGraphEdge extends Object {
        protected _parent: CSceneGraph;
        private _edgeConst;
        private _edgeNode;
        private _pid;
        private _cycle;
        private _prob;
        constructor();
        static factory(parent: CSceneGraph, factory: any): CGraphEdge;
        testPConstraint(): boolean;
        testConstraint(): boolean;
        followEdge(): CGraphNode;
    }
}
declare module "scenegraph/CGraphScene" {
    import { CSceneGraph } from "scenegraph/CSceneGraph";
    export class CGraphScene extends Object {
        private _parent;
        private _scene;
        _name: string;
        private _title;
        private _page;
        private _class;
        private _features;
        private _enqueue;
        private _create;
        private _visible;
        private _persist;
        private _checkpnt;
        private _object;
        private _pid;
        private _cycle;
        private _prob;
        private _iteration;
        constructor(factory: any, parent: CSceneGraph);
        instantiateScene(): any;
        destroyScene(): void;
        features: string;
        readonly hasPFeature: boolean;
        testPFeature(): boolean;
        readonly scenename: string;
        readonly classname: string;
        readonly title: string;
        readonly isCheckPoint: boolean;
        readonly page: string;
        readonly persist: boolean;
        readonly iteration: number;
        incIteration(): number;
        enumDisplayList(): void;
    }
}
declare module "scenegraph/CGraphNode" {
    import { CSceneGraph } from "scenegraph/CSceneGraph";
    import { CGraphScene } from "scenegraph/CGraphScene";
    import EventDispatcher = createjs.EventDispatcher;
    export class CGraphNode extends EventDispatcher {
        protected _parent: CSceneGraph;
        protected _id: string;
        protected _name: string;
        protected _type: string;
        protected _edges: Array<any>;
        protected _preEnter: string;
        protected _preExit: string;
        constructor();
        protected nodeFactory(parent: CSceneGraph, id: string, nodefactory: any): void;
        readonly id: string;
        captureGraph(obj: Object): Object;
        restoreGraph(obj: Object): any;
        nextScene(): CGraphScene;
        nextNode(): CGraphNode;
        applyNode(): boolean;
        seekToScene(seekScene: CGraphScene): CGraphScene;
        seekToSceneByName(seekScene: string): CGraphScene;
        resetNode(): void;
    }
}
declare module "bkt/CBKTSkill" {
    export class CBKTSkill {
        Bel: number;
        pL: number;
        pT: number;
        pG: number;
        pS: number;
        constructor();
        static factory(factory: any): CBKTSkill;
        updateBelief(ans: boolean): void;
        private calcTRUE();
        private calcFALSE();
        private updatePrior(Bel);
        queryBelief(): number;
    }
}
declare module "scenegraph/CGraphAction" {
    import { CGraphNode } from "scenegraph/CGraphNode";
    import { CSceneGraph } from "scenegraph/CSceneGraph";
    import { CGraphScene } from "scenegraph/CGraphScene";
    export class CGraphAction extends CGraphNode {
        private _cmnd;
        private _parms;
        constructor();
        static factory(parent: CSceneGraph, id: string, factory: any): CGraphAction;
        captureGraph(obj: Object): Object;
        restoreGraph(obj: Object): any;
        nextScene(): CGraphScene;
        applyNode(): boolean;
    }
}
declare module "scenegraph/CGraphModule" {
    import { CGraphNode } from "scenegraph/CGraphNode";
    import { CSceneGraph } from "scenegraph/CSceneGraph";
    import { CGraphScene } from "scenegraph/CGraphScene";
    export class CGraphModule extends CGraphNode {
        private _scenes;
        private _ndx;
        private _reuse;
        constructor();
        static factory(parent: CSceneGraph, id: string, moduleFactory: any, factory: any): CGraphModule;
        captureGraph(obj: any): Object;
        restoreGraph(obj: any): any;
        nextScene(): CGraphScene;
        applyNode(): boolean;
        seekToScene(seekScene: CGraphScene): CGraphScene;
        resetNode(): void;
    }
}
declare module "scenegraph/CGraphModuleGroup" {
    import { CGraphNode } from "scenegraph/CGraphNode";
    import { CSceneGraph } from "scenegraph/CSceneGraph";
    import { CGraphScene } from "scenegraph/CGraphScene";
    export class CGraphModuleGroup extends CGraphNode {
        private _modules;
        private _ndx;
        private _moduleShown;
        private _shownCount;
        private instanceNode;
        private type;
        private start;
        private show;
        private reuse;
        private onempty;
        private static SEQUENTIAL;
        private static STOCHASTIC;
        constructor();
        static factory(parent: CSceneGraph, id: string, groupFactory: any, factory: any): CGraphModuleGroup;
        captureGraph(obj: any): Object;
        restoreGraph(obj: any): any;
        initialize(): void;
        nextScene(): CGraphScene;
        applyNode(): boolean;
        seekToScene(seekScene: CGraphScene): CGraphScene;
        resetNode(): void;
    }
}
declare module "scenegraph/CSceneGraph" {
    import { CGraphNode } from "scenegraph/CGraphNode";
    import { CGraphScene } from "scenegraph/CGraphScene";
    import { CEFObject } from "core/CEFObject";
    import { CGraphConstraint } from "scenegraph/CGraphConstraint";
    export class CSceneGraph extends CGraphNode {
        private _nodes;
        private _modules;
        private _actions;
        private _graphs;
        private _constraints;
        private _skillSet;
        private _currNode;
        private _currScene;
        private _prevScene;
        private static _pFeatures;
        private static _pConstraints;
        constructor();
        static factory(parent: CSceneGraph, id: string, factory: any): CSceneGraph;
        captureGraph(obj: any): Object;
        restoreGraph(obj: any): any;
        sceneInstance(): CEFObject;
        queryPFeature(pid: string, size: number, cycle: number): number;
        queryPConstraint(pid: string, size: number, cycle: number): number;
        seekTo(nxtScene: string): CGraphScene;
        seekEnd(): CGraphScene;
        applyNode(): boolean;
        seekBack(): CGraphScene;
        seekRoot(): void;
        nextScene(): CGraphScene;
        private parseNodes(_factory);
        private parseConstraints(constFactory);
        parseSkills(skillsFactory: any): boolean;
        findNodeByName(name: string): CGraphNode;
        findConstraintByName(name: string): CGraphConstraint;
        node: CGraphNode;
        scene: CGraphScene;
    }
}
declare module "scenegraph/CGraphHistoryNode" {
    import { CGraphNode } from "scenegraph/CGraphNode";
    import { CGraphScene } from "scenegraph/CGraphScene";
    export class CGraphHistoryNode extends Object {
        node: CGraphNode;
        scene: CGraphScene;
        constructor(_node: CGraphNode, _scene: CGraphScene);
    }
}
declare module "scenegraph/CGraphHistory" {
    import { CGraphNode } from "scenegraph/CGraphNode";
    import { CGraphScene } from "scenegraph/CGraphScene";
    import { CGraphHistoryNode } from "scenegraph/CGraphHistoryNode";
    export class CGraphHistory extends Object {
        private _history;
        private _volatile;
        private _ndx;
        constructor();
        push(node: CGraphNode, scene: CGraphScene): void;
        next(): CGraphHistoryNode;
        back(): CGraphHistoryNode;
        volatile: boolean;
        readonly isVolatile: boolean;
    }
}
declare module "scenegraph/CSceneGraphNavigator" {
    import { CSceneGraph } from "scenegraph/CSceneGraph";
    import { CGraphHistory } from "scenegraph/CGraphHistory";
    import { CEFSceneSequence } from "core/CEFSceneSequence";
    import { CEFNavigator } from "core/CEFNavigator";
    import { CEFMouseEvent } from "events/CEFMouseEvent";
    export class CSceneGraphNavigator extends CEFNavigator {
        static _history: CGraphHistory;
        static _rootGraph: CSceneGraph;
        static _fSceneGraph: boolean;
        static readonly GOTONEXTSCENE: string;
        static readonly GOTONEXTANIMATION: string;
        private _sceneGraph;
        private _currScene;
        private _nextScene;
        private _prevScene;
        private _xType;
        private _iterations;
        private _profileData;
        constructor();
        readonly sceneObj: CEFSceneSequence;
        readonly iteration: string;
        private updateSceneIteration();
        static rootGraphFactory(factory: any): void;
        private enQueueTerminateEvent();
        private _deferredTerminate(e);
        static buttonBehavior: string;
        onButtonNext(evt: CEFMouseEvent): void;
        recoverState(): void;
        gotoNextScene(): void;
        private _deferredNextScene(e);
        private traceGraphEdge();
        onButtonPrev(evt: CEFMouseEvent): void;
        private seekToScene(nextScene);
        protected doEnterScene(evt: Event): void;
    }
}
declare module "events/CEFSceneCueEvent" {
    import Event = createjs.Event;
    export class CEFSceneCueEvent extends Event {
        static readonly CUEPOINT: string;
        cueID: string;
        constructor(type: string, CueID: string, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
    }
}
declare module "events/CEFCommandEvent" {
    import Event = createjs.Event;
    export class CEFCommandEvent extends Event {
        static readonly OBJCMD: string;
        objCmd: any;
        constructor(type: string, _objCmd: any, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
    }
}
declare module "events/CEFScriptEvent" {
    import Event = createjs.Event;
    export class CEFScriptEvent extends Event {
        static readonly SCRIPT: string;
        script: any;
        constructor(type: string, _script: any, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
    }
}
declare module "events/CEFActionEvent" {
    import Event = createjs.Event;
    export class CEFActionEvent extends Event {
        static readonly CHKCMD: string;
        static readonly STCCMD: string;
        static readonly INDCMD: string;
        static readonly RMPCMD: string;
        static readonly PMTCMD: string;
        static readonly NAVCMD: string;
        static readonly EFFECT: string;
        prop1: string;
        prop2: string;
        prop3: string;
        prop4: string;
        prop5: string;
        constructor(type: string, Prop1: string, Prop2?: string, Prop3?: string, Prop4?: string, Prop5?: string, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
    }
}
declare module "core/CEFSceneSequence" {
    import { CEFRoot } from "core/CEFRoot";
    import { CEFScene } from "core/CEFScene";
    import { CEFNavigator } from "core/CEFNavigator";
    import { CEFTimer } from "core/CEFTimer";
    import { CEFNavEvent } from "events/CEFNavEvent";
    import MovieClip = createjs.MovieClip;
    import DisplayObject = createjs.DisplayObject;
    import { CEFTimerEvent } from "events/CEFTimerEvent";
    import { CEFSceneCueEvent } from "events/CEFSceneCueEvent";
    import { CEFCommandEvent } from "events/CEFCommandEvent";
    export class CEFSceneSequence extends CEFScene {
        Saudio1: CEFRoot;
        audioStartTimer: CEFTimer;
        static readonly DEFAULT_MONITOR_INTERVAL: Number;
        protected _timer: CEFTimer;
        protected _interval: Number;
        protected ktUpdated: boolean;
        private seqID;
        private seqTrack;
        private seqIndex;
        private animationGraph;
        constructor();
        Destructor(): void;
        setButtonBehavior(behavior: string): void;
        rewindScene(): void;
        sceneReplay(evt: Event): void;
        scenePlay(): void;
        playHandler(evt: CEFTimerEvent): void;
        connectNavigator(Navigator: CEFNavigator): void;
        connectAudio(audioClip: MovieClip): void;
        disConnectAudio(audioClip: MovieClip): void;
        bindAudio(audioClass: any): CEFRoot;
        createAudio(): void;
        initAudio(): void;
        initControlNames(): void;
        initPrompts(): void;
        navNext(event: CEFNavEvent): void;
        doSceneCue(evt: CEFSceneCueEvent): void;
        doActionXML(evt: CEFCommandEvent): void;
        parseOBJ(tarObj: DisplayObject, tarOBJ: any, xType: string): void;
        nextGraphAnimation(bNavigating?: boolean): string;
        nextActionTrack(tarXML?: any): void;
        gotoActionTrackId(id?: string): void;
        preEnterScene(lTutor: Object, sceneLabel: string, sceneTitle: string, scenePage: string, Direction: string): string;
        deferredEnterScene(Direction: string): void;
        onEnterScene(Direction: string): void;
        onExitScene(): void;
        enQueueTerminateEvent(): void;
        private _deferredTerminate(e);
        updateKT(): void;
    }
}
declare module "core/CEFNavigator" {
    import { CEFScene } from "core/CEFScene";
    import { CEFNavNext } from "navigation/CEFNavNext";
    import { CEFNavBack } from "navigation/CEFZNavBack";
    import { CEFMouseEvent } from "events/CEFMouseEvent";
    import { CEFSceneSequence } from "core/CEFSceneSequence";
    import { CEFTutorRoot } from "core/CEFTutorRoot";
    export class CEFNavigator extends CEFScene {
        SnextButton: CEFNavNext;
        SbackButton: CEFNavBack;
        sceneCnt: number;
        static prntTutor: any;
        static TutAutomator: any;
        protected _inNavigation: boolean;
        CEFNavigator(): void;
        readonly iteration: string;
        readonly sceneObj: CEFSceneSequence;
        addScene(SceneTitle: string, ScenePage: string, SceneName: string, SceneClass: string, ScenePersist: boolean, SceneFeatures?: string): void;
        connectToTutor(parentTutor: CEFTutorRoot, autoTutor: Object): void;
        protected scenePrev: number;
        protected sceneCurr: number;
        protected readonly sceneCurrINC: number;
        protected readonly sceneCurrDEC: number;
        protected sceneTitle: Array<string>;
        protected sceneSeq: Array<string>;
        protected scenePage: Array<string>;
        protected sceneName: Array<string>;
        protected sceneClass: Array<string>;
        protected scenePersist: Array<string>;
        private findSceneOrd(tarScene);
        goToScene(tarScene: string): void;
        onButtonNext(evt: CEFMouseEvent): void;
        recoverState(): void;
        gotoNextScene(): void;
        onButtonPrev(evt: CEFMouseEvent): void;
        private gotoPrevScene();
        protected doEnterNext(evt: Event): void;
        protected doEnterBack(evt: Event): void;
        protected doEnterScene(evt: Event): void;
    }
}
declare module "core/CEFTimeStamp" {
    import { CEFObject } from "core/CEFObject";
    export class CEFTimeStamp extends CEFObject {
        static _baseTime: number;
        constructor();
        getStartTime(objprop: string): string;
        createLogAttr(objprop: string, restart?: boolean): string;
    }
}
declare module "controls/CEFSkillBar" {
    import { CEFObject } from "core/CEFObject";
    import MovieClip = createjs.MovieClip;
    import TextField = createjs.Text;
    export class CEFSkillBar extends CEFObject {
        Smask: MovieClip;
        Stext: TextField;
        SprogBar: MovieClip;
        private _name;
        private _level;
        private _invlevel;
        private _position;
        constructor();
        skillName: string;
        level: number;
    }
}
declare module "controls/CEFSkilloMeter" {
    import { CEFObject } from "core/CEFObject";
    import { CEFSkillBar } from "controls/CEFSkillBar";
    import TextField = createjs.Text;
    export class CEFSkilloMeter extends CEFObject {
        Stitle: TextField;
        Sskill1: CEFSkillBar;
        Sskill2: CEFSkillBar;
        Sskill3: CEFSkillBar;
        Sskill4: CEFSkillBar;
        Sskill5: CEFSkillBar;
        Sskill6: CEFSkillBar;
        private tfValue;
        constructor();
        Destructor(): void;
        updateSkill(index: number, newValue: number, tfVal: string): void;
        updateName(index: number, newName: string): void;
        title: string;
        private skillClick(evt);
    }
}
declare module "core/CEFTitleBar" {
    import { CEFScene } from "core/CEFScene";
    import { CEFObject } from "core/CEFObject";
    import { CEFTutorRoot } from "core/CEFTutorRoot";
    import { CEFButton } from "core/CEFButton";
    import { CEFMouseEvent } from "events/CEFMouseEvent";
    import { CEFSkilloMeter } from "controls/CEFSkilloMeter";
    import TextField = createjs.Text;
    export class CEFTitleBar extends CEFScene {
        Stitle: TextField;
        Spage: TextField;
        Spause: CEFButton;
        Splay: CEFButton;
        Sreplay: CEFButton;
        Sskill: CEFSkilloMeter;
        Sprediction: CEFSkilloMeter;
        SdemoButton: CEFObject;
        static prntTutor: Object;
        private _demoInhibit;
        private _demoClicked;
        CEFTitleBar(): void;
        configDemoButton(_Tutor: CEFTutorRoot): void;
        doTitleClick(evt: CEFMouseEvent): void;
        private doDemoClick(evt);
        private doDeferedDemoClick(evt);
        onTutorPlay(evt: CEFMouseEvent): void;
        onTutorPause(evt: CEFMouseEvent): void;
        onTutorReplay(evt: CEFMouseEvent): void;
        setObjMode(TutScene: any, sMode: string): void;
        dumpSceneObjs(TutScene: any): void;
    }
}
declare module "scenes/CEFScene0" {
    import { CEFSceneSequence } from "core/CEFSceneSequence";
    import MovieClip = createjs.MovieClip;
    export class CEFScene0 extends CEFSceneSequence {
        SbackGround: MovieClip;
        constructor();
        captureDefState(TutScene: Object): void;
        restoreDefState(TutScene: Object): void;
    }
}
declare module "kt/CEFBNode" {
    export class CEFBNode {
        _name: string;
        _arity: number;
        private _aritytags;
        private _vector;
        constructor();
        getValue(row: number, col: number): number;
        setValue(row: number, col: number, newVal: number): void;
        normalize(): void;
        tagToNdx(tag: string): number;
        loadXML(xmlSrc: any): void;
        saveXML(): any;
    }
}
declare module "events/CEFPropertyChangeEventKind" {
    export class CEFPropertyChangeEventKind {
        static readonly UPDATE: string;
        static readonly DELETE: string;
    }
}
declare module "events/CEFPropertyChangeEvent" {
    import Event = createjs.Event;
    export class CEFPropertyChangeEvent extends Event {
        static readonly PROPERTY_CHANGE: string;
        static createUpdateEvent(source: Object, property: Object, oldValue: Object, newValue: Object): CEFPropertyChangeEvent;
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, kind?: string, property?: Object, oldValue?: Object, newValue?: Object, source?: Object);
        kind: string;
        newValue: Object;
        oldValue: Object;
        property: Object;
        source: Object;
        clone(): Event;
    }
}
declare module "kt/CEFKTNode" {
    import EventDispatcher = createjs.EventDispatcher;
    export class CEFKTNode extends EventDispatcher {
        private _name;
        private _pT;
        private _hypoNode;
        private _evidNode;
        private _arity;
        CEFKTNode(): void;
        newEvid: string;
        readonly predValue: number;
        private dispatchBeliefChangedEvent(oldValue);
        readonly BeliefName: string;
        readonly BeliefValue: number;
        loadXML(xmlSrc: any): void;
        saveXML(): any;
    }
}
declare module "network/CLogManagerType" {
    export class CLogManagerType {
        static readonly RECLOGNONE: number;
        static readonly RECORDEVENTS: number;
        static readonly LOGEVENTS: number;
        static readonly RECLOGEVENTS: number;
        static readonly MODE_JSON: String;
        static readonly JSON_ACKLOG: String;
        static readonly JSON_ACKTERM: String;
        readonlyructor(): void;
    }
}
declare module "events/CEFKeyboardEvent" {
    import Event = createjs.Event;
    export class CEFKeyboardEvent extends Event {
        static readonly KEY_PRESS: string;
        static readonly KEY_DOWN: string;
        static readonly KEY_UP: string;
        constructor(type: string, bubbles?: boolean, cancelable?: boolean);
    }
}
declare module "core/CEFTutorRoot" {
    import { CEFRoot } from "core/CEFRoot";
    import { CEFCursorProxy } from "core/CEFCursorProxy";
    import { CEFTransitions } from "core/CEFTransitions";
    import { CEFNavigator } from "core/CEFNavigator";
    import { CEFTimeStamp } from "core/CEFTimeStamp";
    import { CEFScene } from "core/CEFScene";
    import { CEFTitleBar } from "core/CEFTitleBar";
    import { CEFScene0 } from "scenes/CEFScene0";
    import { CEFNavEvent } from "events/CEFNavEvent";
    import DisplayObject = createjs.DisplayObject;
    import DisplayObjectContainer = createjs.Container;
    import Tween = createjs.Tween;
    export class CEFTutorRoot extends CEFRoot {
        StitleBar: CEFTitleBar;
        SnavPanel: CEFNavigator;
        Sscene0: CEFScene0;
        private fFeatures;
        private fDefaults;
        fIntroVideo: boolean;
        fCVSIntro: boolean;
        fRampsIntro: boolean;
        fRampPreTest: boolean;
        fFreeResponse: number;
        fStepByStep0: boolean;
        fStepByStep1: boolean;
        fEIA: boolean;
        fEIB: boolean;
        fEIC: boolean;
        fSummaryVideo: boolean;
        fRampPostTest: boolean;
        timeStamp: CEFTimeStamp;
        playing: Array<DisplayObject>;
        isPaused: boolean;
        scenePtr: Array<CEFScene>;
        stateStack: Array<any>;
        cCursor: CEFCursorProxy;
        sceneCnt: number;
        tutorAutoObj: any;
        xitions: CEFTransitions;
        replayIndex: Array<number>;
        replayTime: number;
        Running: Array<Tween>;
        runCount: number;
        baseTime: number;
        ktNets: any;
        ktSkills: any;
        private sceneGraph;
        constructor();
        resetZorder(): void;
        captureSceneGraph(): void;
        setTutorDefaults(featSet: string): void;
        setTutorFeatures(featSet: string): void;
        features: string;
        addFeature: string;
        delFeature: string;
        private testFeature(element, index, arr);
        testFeatureSet(featSet: string): boolean;
        traceFeatures(): void;
        addScene(sceneTitle: string, scenePage: string, sceneName: string, sceneClass: string, sceneFeatures: string, sceneEnqueue: boolean, sceneCreate: boolean, sceneVisible: boolean, scenePersist: boolean, sceneObj?: any): void;
        instantiateScene(sceneName: string, sceneClass: string, sceneVisible?: boolean): any;
        destroyScene(sceneName: string): void;
        automateScene(sceneName: string, sceneObj: any, nameObj?: boolean): void;
        instantiateKT(): void;
        loadKTNets(tarXML: any): void;
        recurseXML(xmlNodes: Array<any>, xmlTar: any, newVal: string): string;
        state(xmlSpec: string, newVal?: string): string;
        scene(xmlSpec: string, newVal?: string): string;
        wozReplay(): void;
        wozStopPlay(): void;
        wozPause(): void;
        wozPlay(): void;
        playRemoveThis(wozObj: CEFRoot): void;
        playAddThis(wozObj: CEFRoot): void;
        showPPlay(fShow: boolean): void;
        showReplay(fShow: boolean): void;
        setCursor(sMode: string): void;
        replaceCursor(): void;
        initAutomation(tutorObj: Object): void;
        initializeScenes(): void;
        captureDefState(Tutor: any): void;
        restoreDefState(Tutor: any): void;
        doPlayBack(pbSource: any): void;
        replayStream(evt: CEFNavEvent): void;
        replayLiveStream(): void;
        private abortPlayBack(evt);
        private abortPlayBack2(evt);
        playBackByFrame(evt: Event): void;
        playBackByTime(evt: Event): void;
        dumpScenes(Tutor: any): void;
        enumScenes(): void;
        enumChildren(scene: DisplayObjectContainer, indentCnt: number): void;
        showNext(fshow: boolean): void;
        enableNext(fEnable: boolean): void;
        enableBack(fEnable: boolean): void;
        questionStart(evt: Event): void;
        questionComplete(evt: Event): void;
        goBackScene(evt: CEFNavEvent): void;
        goNextScene(evt: CEFNavEvent): void;
        goToScene(evt: CEFNavEvent): void;
    }
}
declare module "network/ILogManager" {
    export interface ILogManager {
        useLocalHost(): void;
        queryTheQueue(): void;
        addEventListener(type: string, listener: Function, useCapture: boolean, priority: number, useWeakReference: boolean): void;
        removeEventListener(type: string, listener: Function, useCapture: boolean): void;
        fLogging: number;
        account(_account: object): void;
        fTutorPart(): string;
        fTutorPart(newval: string): void;
        setQueueStreamState(startQueue: boolean): void;
        getQueueStreamState(): string;
        getQueueState(): string;
        connectProtocol(func: Function): void;
        disConnectProtocol(func: Function): void;
        connectForInterface(): void;
        connectToAuthenticate(): void;
        connectToReattach(): void;
        isSessionActive(): boolean;
        recycleConnection(fRestart: boolean): void;
        sessionStatus(): string;
        connectionActive(): boolean;
        getConnectionState(): string;
        connectionActiveOrPending(): boolean;
        sessionID(): string;
        sessionHost(): string;
        sessionHost(newHost: string): void;
        sessionPort(): number;
        sessionPort(newPort: number): void;
        useQueue(useQ: boolean): void;
        abandonSession(abandonData: boolean, newStatus: string): void;
        abandonSocket(abandonData: boolean): void;
        submitAuthentication(xMsg: any): void;
        submitJSONQuery(jMsg: any): void;
        activateSession(sessionID: string): void;
        failSession(): void;
        sendPacket(packet: any): boolean;
        logTerminateEvent(): void;
        logSessionIDEvent(): void;
        logLiveEvent(logData: object): void;
        logActionEvent(logData: object): void;
        logStateEvent(logData: object): void;
        logNavEvent(logData: object): void;
        flushGlobalStateLocally(name: string): void;
        logProgressEvent(logData: any): void;
        logDurationEvent(logData: any): void;
        logErrorEvent(logData: object): void;
        isDataStreaming(): boolean;
        isQueueStreaming(): boolean;
        queueLength(): number;
        queuePosition(): number;
        isSending(): boolean;
        isConnected(): boolean;
        sendDebugPacket(logData: object): void;
        startDebugDataStream(): void;
        stopDebugDataStream(): void;
        startQueueing(): void;
        stopQueueing(): void;
        setPlayBackSource(logSource: Array<String>): void;
        unWrapLog(): Array<String>;
        normalizePlayBackTime(): void;
        normalizePlayBack(): void;
        getNextEventState(): number;
        getNextEvent(stateID: number, frameID: number): string;
        playBackDone(): boolean;
        getActionEvent(frameTime: Number): string;
        setPlayBackDone(val: boolean): void;
        getMoveEvent(frameTime: Number): string;
    }
}
declare module "core/CEFObjectDyno" {
    import { CEFRoot } from "core/CEFRoot";
    import { CEFTutorRoot } from "core/CEFTutorRoot";
    import { CEFScene } from "core/CEFScene";
    import { ILogManager } from "network/ILogManager";
    export class CEFObjectDyno extends CEFRoot {
        objID: string;
        constructor();
        initAutomation(_parentScene: CEFScene, sceneObj: Object, ObjIdRef: string, lLogger: ILogManager, lTutor: CEFTutorRoot): void;
    }
}
declare module "core/CEFObject" {
    import { CEFTutorRoot } from "core/CEFTutorRoot";
    import { CEFAnimator } from "core/CEFAnimator";
    import { CEFNavigator } from "core/CEFNavigator";
    import { CEFScene } from "core/CEFScene";
    import { CEFEvent } from "events/CEFEvent";
    import { ILogManager } from "network/ILogManager";
    import Shape = createjs.Shape;
    import ColorMatrixFilter = createjs.ColorMatrixFilter;
    import DisplayObject = createjs.DisplayObject;
    export class CEFObject extends CEFAnimator {
        SclickMask: Shape;
        sAuto: string;
        objID: string;
        tweenID: number;
        bTweenable: boolean;
        bSubTweenable: boolean;
        bPersist: boolean;
        static readonly CANCELNAV: string;
        static readonly OKNAV: string;
        private defRot;
        private defX;
        private defY;
        private defWidth;
        private defHeight;
        private defAlpha;
        private newSaturation;
        private satFrames;
        private satIncrement;
        private curSat;
        private newSat;
        private curBlur;
        private newBlur;
        private blurFrames;
        private blurIncrement;
        private blurTarget;
        private curGlow;
        private newGlow;
        private glowColor;
        private glowStage;
        private glowAlpha;
        private glowStrength;
        private glowFrames;
        private glowIncrement;
        private glowTarget;
        private static readonly LUMA_R;
        private static readonly LUMA_G;
        private static readonly LUMA_B;
        private _tarObj;
        protected _XMLsrc: string;
        protected _XMLSnapShot: string;
        protected _isvalid: string;
        protected _ischecked: string;
        protected _activeFeature: string;
        protected _validFeature: string;
        protected _invalidFeature: string;
        private _features;
        private static _globals;
        protected _sceneData: any;
        _phaseData: any;
        _hasClickMask: boolean;
        _maskColor: string;
        _maskAlpha: string;
        private _hidden;
        navigator: CEFNavigator;
        protected onCreateScript: string;
        protected onExitScript: string;
        private static _framendx;
        constructor();
        onCreate(): void;
        protected doCreateAction(): void;
        doExitAction(): void;
        incFrameNdx(): void;
        hidden: boolean;
        features: string;
        setANDFeature(newFTR: string): void;
        setORFeature(newFTR: string): void;
        unSetFeature(ftr: string): void;
        buildObject(objectClass: string, objectName: string): CEFObject;
        buildMask(): void;
        activeFeature: string;
        clearAllEffects(fHide?: boolean): void;
        moveChild(tarObj: string, moveX: string, moveY: string, duration?: string): void;
        moveOriginChild(tarObj: string, regx: string, regy: string, duration?: string): void;
        scaleChild(tarObj: string, scalex: string, scaley: string, duration?: string): void;
        saturateChild(tarObj: string, newState: string, duration?: string): void;
        saturateChildTo(tarObj: string, newSat: number, duration?: string): void;
        saturateObj(newState: string, duration?: string): void;
        saturateObjTo(_newSat: number, duration?: string): void;
        private saturationTimer(evt);
        adjustSaturation(s?: number): ColorMatrixFilter;
        blurChild(tarObj: string, duration?: string): void;
        blurObj(duration?: string): void;
        private blurTimer(evt);
        flashChild(tarObj: string, _glowColor: number, duration?: string): void;
        flashObj(_glowColor: number, duration?: string): void;
        private flashTimer(evt);
        showChild(tarObj: string, alphaTo?: number, autoStart?: boolean): void;
        hideChild(tarObj: string): void;
        fadeChildOff(tarObj: string, autoStart?: boolean, duration?: string): void;
        private hideDone();
        fadeChild(tarObj: string, alphaTo: string, autoStart?: boolean, duration?: string): void;
        fadeChildTo(tarObj: string, alphaTo: number, autoStart?: boolean, duration?: string): void;
        twnDone(): void;
        startTween(xnF?: () => void): void;
        deepStateCopy(src: CEFObject): void;
        shallowStateCopy(tar: DisplayObject, src: DisplayObject): void;
        captureDefState(tutObject: any): void;
        restoreDefState(tutObject: any): void;
        isTweenable(): boolean;
        isSubTweenable(): boolean;
        captureLogState(obj?: Object): Object;
        captureXMLState(): string;
        restoreXMLState(xmlState: string): void;
        compareXMLState(xmlState: string): boolean;
        createLogAttr(objprop: string, restart?: boolean): string;
        measure(): void;
        initAutomation(_parentScene: CEFScene, sceneObj: any, ObjIdRef: string, lLogger: ILogManager, lTutor: CEFTutorRoot): void;
        setAutomationMode(sceneObj: any, sMode: string): void;
        dumpSubObjs(sceneObj: any, Indent: string): void;
        isChecked: string;
        checked: boolean;
        isValid: string;
        assertFeatures(): string;
        retractFeatures(): void;
        readonly tallyValid: string;
        assertFeature(_feature: string): void;
        retractFeature(_feature: string): void;
        static initGlobals(): void;
        incrGlobal(_id: string, _max?: number, _cycle?: number): number;
        assertGlobal(_id: string, _value: any): void;
        retractGlobal(_id: string): void;
        queryGlobal(_id: string): any;
        globals: Object;
        valid: boolean;
        wozMouseClick(evt: CEFEvent): void;
        wozMouseMove(evt: CEFEvent): void;
        wozMouseDown(evt: CEFEvent): void;
        wozMouseUp(evt: CEFEvent): void;
        wozMouseOver(evt: CEFEvent): void;
        wozMouseOut(evt: CEFEvent): void;
        wozKeyDown(evt: CEFEvent): void;
        wozKeyUp(evt: CEFEvent): void;
        protected decodeTarget(baseObj: DisplayObject, objArray: Array<any>): DisplayObject;
        private parseOBJLog(tarObj, element);
        private constructLogName(attr);
        private setXMLProperty(tarObj, tarXML);
        private runXMLFunction(tarObj, tarXML);
        parseOBJ(tarObj: DisplayObject, tarXML: any, xType: string): void;
        loadOBJ(xmlSrc: any): void;
    }
}
declare module "events/CEFSeekEvent" {
    import Event = createjs.Event;
    export class CEFSeekEvent extends Event {
        static readonly SEEKFORWARD: string;
        static readonly SEEKBACKWARD: string;
        wozSeekSeq: string;
        constructor(type: string, SeekSeq: string, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
    }
}
declare module "core/CEFScene" {
    import { CEFObject } from "core/CEFObject";
    import { CEFActionEvent } from "events/CEFActionEvent";
    import { CEFScriptEvent } from "events/CEFScriptEvent";
    import { ILogManager } from "network/ILogManager";
    import { CEFTutorRoot } from "core/CEFTutorRoot";
    import { CEFSeekEvent } from "events/CEFSeekEvent";
    export class CEFScene extends CEFObject {
        fComplete: boolean;
        seekForeFunc: Array<any>;
        seekBackFunc: Array<any>;
        sceneAttempt: number;
        sceneTag: string;
        protected _section: string;
        CEFScene(): void;
        onCreate(): void;
        protected doCreateAction(): void;
        doExitAction(): void;
        protected initUI(): void;
        effectHandler(evt: CEFActionEvent): void;
        scriptHandler(evt: CEFScriptEvent): void;
        logSceneTag(): Object;
        initAutomation(_parentScene: CEFScene, scene: any, ObjIdRef: string, lLogger: ILogManager, lTutor: CEFTutorRoot): void;
        captureDefState(TutScene: any): void;
        restoreDefState(TutScene: any): void;
        setObjMode(TutScene: any, sMode: string): void;
        dumpSceneObjs(TutScene: any): void;
        updateNav(): void;
        questionFinished(evt: Event): void;
        questionComplete(): boolean;
        preEnterScene(lTutor: any, sceneLabel: string, sceneTitle: string, scenePage: string, Direction: string): string;
        deferredEnterScene(Direction: string): void;
        onEnterScene(Direction: string): void;
        preExitScene(Direction: string, sceneCurr: number): string;
        onExitScene(): void;
        demoBehavior(): void;
        initSeekArrays(): void;
        doSeekForward(evt: CEFSeekEvent): void;
        doSeekBackward(evt: CEFSeekEvent): void;
    }
}
declare module "core/CEFRoot" {
    import { CEFScene } from "core/CEFScene";
    import { CEFTutorRoot } from "core/CEFTutorRoot";
    import { CEFNavigator } from "core/CEFNavigator";
    import { ILogManager } from "network/ILogManager";
    import MovieClip = createjs.MovieClip;
    import DisplayObject = createjs.DisplayObject;
    import DisplayObjectContainer = createjs.Container;
    export class CEFRoot extends MovieClip {
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
        logState(): string;
        IsUserDefined(): number;
        readonly captureLOGString: string;
        captureLOGState(): string;
        isDefined(prop: string): boolean;
        superPlay(): void;
        superStop(): void;
        gotoAndStop(frame: Object, scene?: string): void;
        stop(): void;
        gotoAndPlay(frame: Object, scene?: string): void;
        play(): void;
        bindPlay(tutor: CEFTutorRoot): void;
        setTopMost(): void;
        startSession(): void;
        readonly sessionTime: string;
        instantiateObject(objectClass: string): DisplayObject;
        getDefinitionByName(className: string): any;
        dumpStage(_obj: DisplayObjectContainer, _path: string): void;
    }
}
declare module "animationgraph/CAnimationModule" {
    import { CAnimationNode } from "animationgraph/CAnimationNode";
    import { CAnimationGraph } from "animationgraph/CAnimationGraph";
    import EventDispatcher = createjs.EventDispatcher;
    export class CAnimationModule extends CAnimationNode {
        private _animations;
        private _ndx;
        private _reuse;
        constructor(target?: EventDispatcher);
        static factory(parent: CAnimationGraph, nodeName: string, moduleFactory: any): CAnimationModule;
        nextAnimation(): string;
        seekToAnimation(seek: string): string;
        applyNode(): boolean;
        resetNode(): void;
    }
}
declare module "animationgraph/CAnimationConstraint" {
    import { CAnimationGraph } from "animationgraph/CAnimationGraph";
    export class CAnimationConstraint extends Object {
        protected _parent: CAnimationGraph;
        private _cmd;
        private _code;
        constructor();
        static factory(parent: CAnimationGraph, factory: any): CAnimationConstraint;
        execute(): boolean;
    }
}
declare module "animationgraph/CAnimationGraph" {
    import { CAnimationNode } from "animationgraph/CAnimationNode";
    import { CAnimationConstraint } from "animationgraph/CAnimationConstraint";
    import { CEFSceneSequence } from "core/CEFSceneSequence";
    export class CAnimationGraph extends CAnimationNode {
        private _nodes;
        private _modules;
        private _choicesets;
        private _actions;
        private _graphs;
        private _constraints;
        private _currNode;
        private _currAnimation;
        private _prevAnimation;
        private _parentScene;
        _graphFactory: any;
        static _pFeatures: any;
        CAnimationGraph(): void;
        static factory(parent: CEFSceneSequence, id: string, factoryName: string): CAnimationGraph;
        seekRoot(): void;
        onEnterRoot(): void;
        sceneInstance: CEFSceneSequence;
        queryPFeature(pid: string, size: number, cycle: number): number;
        nextAnimation(): string;
        private parseNodes();
        private parseModules();
        private parseActions();
        private parseChoiceSets();
        private parseConstraints();
        findNodeByName(name: string): CAnimationNode;
        findConstraintByName(name: string): CAnimationConstraint;
        node: CAnimationNode;
    }
}
declare module "animationgraph/CAnimationEdge" {
    import { CAnimationGraph } from "animationgraph/CAnimationGraph";
    import { CAnimationNode } from "animationgraph/CAnimationNode";
    export class CAnimationEdge {
        protected _parent: CAnimationGraph;
        private _edgeConst;
        private _edgeNode;
        constructor();
        static factory(parent: CAnimationGraph, factory: any): CAnimationEdge;
        testConstraint(): boolean;
        followEdge(): CAnimationNode;
    }
}
declare module "animationgraph/CAnimationNode" {
    import { CAnimationGraph } from "animationgraph/CAnimationGraph";
    import EventDispatcher = createjs.EventDispatcher;
    export class CAnimationNode extends EventDispatcher {
        protected _parent: CAnimationGraph;
        protected _id: string;
        protected _name: string;
        protected _type: string;
        protected _edges: Array<any>;
        protected _preEnter: string;
        protected _preExit: string;
        constructor(target?: EventDispatcher);
        protected nodeFactory(parent: CAnimationGraph, id: string, nodefactory: any): void;
        nextAnimation(): string;
        nextNode(): CAnimationNode;
        preEnter(): void;
        seekToAnimation(seek: string): string;
        applyNode(): boolean;
        resetNode(): void;
    }
}
declare module "animationgraph/CAnimationAction" {
    import { CAnimationNode } from "animationgraph/CAnimationNode";
    import { CAnimationGraph } from "animationgraph/CAnimationGraph";
    import EventDispatcher = createjs.EventDispatcher;
    export class CAnimationAction extends CAnimationNode {
        private _cmd;
        private _code;
        constructor(target?: EventDispatcher);
        static factory(parent: CAnimationGraph, nodeName: string, moduleFactory: any): CAnimationAction;
        nextAnimation(): string;
        applyNode(): boolean;
    }
}
declare module "controls/CEFLabelButton" {
    import { CEFButton } from "core/CEFButton";
    export class CEFLabelButton extends CEFButton {
        CEFLabelButton(): void;
        setLabel(newLabel: string): void;
    }
}
declare module "controls/CEFLabelControl" {
    import { CEFObject } from "core/CEFObject";
    import TextField = createjs.Text;
    export class CEFLabelControl extends CEFObject {
        Slabel: TextField;
        constructor();
        setLabel(newLabel: String, colour?: number): void;
    }
}
declare module "core/CEFCheckButton" {
    import { CEFButton } from "core/CEFButton";
    import { CEFMouseEvent } from "events/CEFMouseEvent";
    import MovieClip = createjs.MovieClip;
    export class CEFCheckButton extends CEFButton {
        Schecked: MovieClip;
        Slabel: MovieClip;
        protected fChecked: boolean;
        private _ftrChecked;
        private _ftrUnchecked;
        CEFCheckButton(): void;
        Destructor(): void;
        highLight(color: number): void;
        label: string;
        setLabel(newLabel: string): void;
        getLabel(): string;
        showLabel: boolean;
        captureDefState(TutScene: Object): void;
        restoreDefState(TutScene: Object): void;
        deepStateCopy(src: any): void;
        captureLogState(obj?: any): Object;
        captureXMLState(): any;
        resetState(): void;
        gotoState(sState: string): void;
        doMouseClick(evt: CEFMouseEvent): void;
        setCheck(bCheck: boolean): void;
        getChecked(): boolean;
        assertFeatures(): string;
        retractFeatures(): void;
        loadXML(xmlSrc: any): void;
        saveXML(): any;
    }
}
declare module "events/CEFButtonEvent" {
    import Event = createjs.Event;
    export class CEFButtonEvent extends Event {
        static readonly WOZCHECKED: string;
        static readonly WOZUNCHECKED: string;
        constructor(type: string, bubbles?: boolean, cancelable?: boolean);
    }
}
declare module "core/CEFButtonGroup" {
    import { CEFObject } from "core/CEFObject";
    import { CEFButton } from "core/CEFButton";
    export class CEFButtonGroup extends CEFObject {
        buttons: Array<any>;
        buttonType: Array<string>;
        _fRadioGroup: boolean;
        private _inited;
        private onChangeScript;
        static readonly CHECKED: string;
        constructor();
        addButton(newButton: any, bType?: string): void;
        removeButton(newButton: CEFButton): void;
        updateGroupChk(evt: Event): void;
        updateGroupUnChk(evt: Event): void;
        protected doChangeAction(evt: Event): void;
        radioType: boolean;
        readonly isComplete: string;
        querySelectedValid(): string;
        resetAll(): void;
        highLightRightOnly(): void;
        highLightRightLabel(hColor: number): void;
        highLightWrong(): void;
        readonly isValid: string;
        assertFeatures(): string;
        retractFeatures(): void;
        readonly tallyValid: string;
        readonly tallySelected: string;
        readonly ansText: string;
        readonly inUse: boolean;
        logState(): any;
        querylogGroup(): string;
        loadXML(xmlSrc: any): void;
        saveXML(): any;
    }
}
declare module "core/CEFRadioButton" {
    import { CEFButtonGroup } from "core/CEFButtonGroup";
    import { CEFMouseEvent } from "events/CEFMouseEvent";
    import { CEFCheckButton } from "core/CEFCheckButton";
    export class CEFRadioButton extends CEFCheckButton {
        constructor();
        attachGroup(butGroup: CEFButtonGroup): void;
        doMouseClick(evt: CEFMouseEvent): void;
        setCheck(bCheck: boolean): void;
        toString(): string;
    }
}
declare module "core/CEFCheckBox" {
    import { CEFRadioButton } from "core/CEFRadioButton";
    import { CEFMouseEvent } from "events/CEFMouseEvent";
    import MovieClip = createjs.MovieClip;
    export class CEFCheckBox extends CEFRadioButton {
        Scheck2: MovieClip;
        Scheck3: MovieClip;
        constructor();
        doMouseClick(evt: CEFMouseEvent): void;
        setCheck(bCheck: boolean): void;
        setCheck2(bCheck: boolean): void;
        setCheck3(bCheck: boolean): void;
        resetState(): void;
        deepStateCopy(src: any): void;
    }
}
declare module "core/CEFMouseMask" {
    import { CEFObject } from "core/CEFObject";
    import { CEFMouseEvent } from "events/CEFMouseEvent";
    export class CEFMouseMask extends CEFObject {
        constructor();
        discardEvent(evt: CEFMouseEvent): void;
        setObjMode(dlgPanel: any, sMode: String): void;
        dumpSceneObjs(dlgPanel: any): void;
    }
}
declare module "core/CEFSceneNavigator" {
    import { CEFNavigator } from "core/CEFNavigator";
    export class CEFSceneNavigator extends CEFNavigator {
        private StscenePrev;
        private StsceneCurr;
        private StsceneTitle;
        private StscenePage;
        private StsceneSeq;
        private StsceneClass;
        private StscenePersist;
        private StsceneFeatures;
        constructor();
        addScene(SceneTitle: string, ScenePage: string, SceneName: string, SceneClass: string, ScenePersist: boolean, SceneFeatures?: string): void;
        protected scenePrev: number;
        protected sceneCurr: number;
        protected readonly sceneCurrINC: number;
        protected readonly sceneCurrDEC: number;
        protected sceneTitle: Array<string>;
        protected sceneSeq: Array<string>;
        protected scenePage: Array<string>;
        protected sceneName: Array<string>;
        protected sceneClass: Array<string>;
        protected scenePersist: Array<string>;
    }
}
declare module "scenes/CEFNavDemo" {
    import { CEFSceneSequence } from "core/CEFSceneSequence";
    export class CEFNavDemo extends CEFSceneSequence {
        private _demoPanel;
        private _scenesShown;
        constructor();
        private gotoScene(evt);
    }
}
declare module "events/CEFDialogEvent" {
    import Event = createjs.Event;
    export class CEFDialogEvent extends Event {
        result: string;
        static readonly ENDMODAL: string;
        static readonly DLGOK: string;
        static readonly DLGCANCEL: string;
        constructor(Result: string, type: string, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
    }
}
declare module "dialogs/CEFDialogBox" {
    import { CEFObject } from "core/CEFObject";
    import { CEFMouseMask } from "core/CEFMouseMask";
    import MovieClip = createjs.MovieClip;
    import TextField = createjs.Text;
    export class CEFDialogBox extends CEFObject {
        Sframe: MovieClip;
        Stitle: TextField;
        sMask: CEFMouseMask;
        fAddDlg: boolean;
        static readonly ENDMODAL: string;
        CEFDialogBox(): void;
        setTitle(txt: string): void;
        moveDialog(X: number, Y: number): void;
        centerDialog(): void;
        doModal(accounts?: any, Alpha?: number, fAdd?: boolean): void;
        endModal(result: string): void;
        setObjMode(dlgPanel: any, sMode: string): void;
        dumpSceneObjs(dlgPanel: any): void;
    }
}
declare module "dialogs/CDialogDesignPrompt1" {
    import { CEFMouseEvent } from "events/CEFMouseEvent";
    import { CEFDialogBox } from "dialogs/CEFDialogBox";
    import TextField = createjs.Text;
    import { CEFLabelButton } from "controls/CEFLabelButton";
    export class CDialogDesignPrompt1 extends CEFDialogBox {
        Sbody: TextField;
        Scancel: CEFLabelButton;
        Smoveon: CEFLabelButton;
        static readonly DLGSTAY: string;
        static readonly DLGNEXT: string;
        CDialogDesignPrompt1(): void;
        Destructor(): void;
        doCancel(evt: CEFMouseEvent): void;
        doModal(accounts?: any, Alpha?: number, fAdd?: boolean): void;
        endModal(Result: string): void;
    }
}
declare module "core/CEFTutor" {
    import { CEFTutorRoot } from "core/CEFTutorRoot";
    import { CEFMouseMask } from "core/CEFMouseMask";
    import { CEFNavDemo } from "scenes/CEFNavDemo";
    import { CDialogDesignPrompt1 } from "dialogs/CDialogDesignPrompt1";
    export class CEFTutor extends CEFTutorRoot {
        SdlgPrompt: CDialogDesignPrompt1;
        SdlgMask: CEFMouseMask;
        SdemoScene: CEFNavDemo;
        static CREATE: boolean;
        static NOCREATE: boolean;
        static PERSIST: boolean;
        static NOPERSIST: boolean;
        static ENQUEUE: boolean;
        static NOENQUEUE: boolean;
        tutorScenes: Array<any>;
        Ramps_Pre_Title: string;
        designTitle: string;
        thinkTitle: string;
        constructor();
        initializeScenes(): void;
        resetZorder(): void;
    }
}
declare module "core/CEFTutorDoc" {
    import { CEFDoc } from "core/CEFDoc";
    import { ILogManager } from "network/ILogManager";
    export class CEFTutorDoc extends CEFDoc {
        private _extLoader;
        private _extConnection;
        private _tutorFeatures;
        _modulePath: string;
        private _forcedPause;
        constructor();
        initOnStage(evt: Event): void;
        doOffStage(evt: Event): void;
        doOnStage(evt: Event): void;
        extAccount: any;
        extFTutorPart: string;
        extFFullSignIn: string;
        extFDemo: boolean;
        extFDebug: boolean;
        extFRemoteMode: boolean;
        extFDeferDemoClick: string;
        extFSkillometer: string;
        extTutorFeatures: string;
        extLoader: string;
        readonly extLoaded: boolean;
        extmodPath: string;
        extLogManager: ILogManager;
        extSceneDescr: string;
        extSceneGraph: string;
        extAnimationGraph: string;
        extForceBackButton: any;
        readonly extAspectRatio: string;
    }
}
declare module "events/CEFAutomationEvent" {
    import Event = createjs.Event;
    export class CEFAutomationEvent extends Event {
        _result: string;
        static readonly ENDPROMPT: string;
        constructor(type: string, Result: string, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
    }
}
declare module "events/CEFCaptionEvent" {
    import Event = createjs.Event;
    export class CEFCaptionEvent extends Event {
        static readonly WOZCAP: string;
        _CapIndex: string;
        constructor(CapIndex: string, type?: string, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
    }
}
declare module "events/CEFSelectEvent" {
    import Event = createjs.Event;
    export class CEFSelectEvent extends Event {
        static readonly WOZTABSELECT: string;
        static readonly WOZIMGSELECT: string;
        wozSelection: string;
        constructor(target: string, type: string, bubbles?: boolean, cancelable?: boolean);
        clone(): Event;
    }
}
declare module "kt/CEFProdSys" {
    export class CWOZProdSys {
        wm: any;
        constructor();
        resetWorkMem(): void;
        setWorkMem(prop: string, value: string): void;
        prop(_prop: string): String;
        value(_prop: string): Boolean;
        execRules(): void;
    }
}
declare module "navigation/CEFNavPanel" {
    import { CEFSceneNavigator } from "core/CEFSceneNavigator";
    import { CEFScene } from "core/CEFScene";
    import { ILogManager } from "network/ILogManager";
    import { CEFTutorRoot } from "core/CEFTutorRoot";
    export class CEFNavPanel extends CEFSceneNavigator {
        constructor();
        initAutomation(_parentScene: CEFScene, scene: any, ObjIdRef: String, lLogger: ILogManager, lTutor: CEFTutorRoot): void;
        setObjMode(TutScene: any, sMode: String): void;
        dumpSceneObjs(TutScene: any): void;
    }
}
declare module "scenes/CEFEndCloak" {
    import { CEFSceneSequence } from "core/CEFSceneSequence";
    import MovieClip = createjs.MovieClip;
    export class CEFEndCloak extends CEFSceneSequence {
        SbackGround: MovieClip;
        constructor();
        captureDefState(TutScene: Object): void;
        restoreDefState(TutScene: Object): void;
        preEnterScene(lTutor: Object, sceneLabel: string, sceneTitle: string, scenePage: string, Direction: string): string;
    }
}
declare module "scenes/CEFEndScene" {
    import { CEFSceneSequence } from "core/CEFSceneSequence";
    import { CEFEvent } from "events/CEFEvent";
    import { CEFLabelButton } from "controls/CEFLabelButton";
    import MovieClip = createjs.MovieClip;
    import TextField = createjs.Text;
    export class CEFEndScene extends CEFSceneSequence {
        SpostTest: MovieClip;
        SdoneButton: CEFLabelButton;
        SuploadButton: CEFLabelButton;
        Send: TextField;
        CEFEndScene(): void;
        onDoneClick(evt: CEFEvent): void;
        onPostTest(evt: CEFEvent): void;
        onUploadClick(evt: CEFEvent): void;
        captureDefState(TutScene: Object): void;
        restoreDefState(TutScene: Object): void;
    }
}
declare module "scenes/CEFSceneN" {
    import { CEFButton } from "core/CEFButton";
    import { CEFSceneSequence } from "core/CEFSceneSequence";
    import { CEFEvent } from "events/CEFEvent";
    import MovieClip = createjs.MovieClip;
    export class CEFSceneN extends CEFSceneSequence {
        SreplaySession: CEFButton;
        SbackGround: MovieClip;
        CEFSceneN(): void;
        doReplay(evt: CEFEvent): void;
        captureDefState(TutScene: Object): void;
        restoreDefState(TutScene: Object): void;
    }
}
declare module "scenes/CEFStartScene" {
    import { CEFSceneSequence } from "core/CEFSceneSequence";
    import MovieClip = createjs.MovieClip;
    import TextField = createjs.Text;
    export class CEFStartScene extends CEFSceneSequence {
        Sstart: TextField;
        Sicon: MovieClip;
        CEFStartScene(): void;
        captureDefState(TutScene: Object): void;
        restoreDefState(TutScene: Object): void;
        preEnterScene(lTutor: Object, sceneLabel: string, sceneTitle: string, scenePage: string, Direction: string): string;
        onEnterScene(Direction: string): void;
        preExitScene(Direction: string, sceneCurr: number): string;
    }
}
