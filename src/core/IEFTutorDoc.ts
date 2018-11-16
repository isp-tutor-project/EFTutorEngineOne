import { LoaderPackage } from "../util/IBootLoader";
import { TSceneBase } from "../thermite/TSceneBase";

export interface IEFTutorDoc {


	traceMode:boolean;

	//************ Stage Symbols
	
    tutorContainer:any;			// every WOZObject must be associated with a specific tutor
    tutorNavigator:any;

    name:string;
    loaderData:Array<LoaderPackage.ILoaderData>;

	//************ Stage Symbols
	
	// These are used for log playback
	//
	// The frameID is the actual frame in which a log entry occured
	// The stateID is the Tutor state when a log entry occured
	//
	// During capture:
	//	the frameID runs at the selected frame rate for the tutor
	// 	the stateID records changes in the tutor state as it progresses.
	//
	// During playback:
	//  the tutor runs frame by frame playing back events as they originally occured from the event stream
	//  Note: It is possible for the stateID and frameID to lose sync with the recorded stream should events 
	//        process faster or slower than on the original machine.
	//	Therefore at each frame:
	//		Check the next event in the log
	// 				if the Tutor stateID matches the playback stateID then
	//					if the Tutor frameID matches the playback frameID fire the event 
	//					if the Tutor frameID < playback frameID - wait for the playback tutor to reach the event
	//					if the Tutor frameID > playback frameID - sequentially fire events (playback is running slow)
	//
	// 				if the Tutor stateID > playback stateID then
	//					flush all queued events until sync achieved
	//
	// 				if the Tutor stateID < playback stateID then (may freeze if state transitions do not occur)
	//					wait for the tutor to fire non-event state transitions				
	//					
	
	logFrameID:number;
	logStateID:number;

    // knowledge tracing 
      ktSkills:any;							    //@@ Mod Aug 28 2013 - support for new kt structure in sceneGraph
    
    //*** Tutor graph descriptions
		
	sceneGraph:any;						        // The factory definition object used to create scene graphs for specified scenes
	tutorGraph:any;						    	// The factory definition object used to create the tutor Graph		
    tutorStateData:any;						   	// The factory definition object used to initialize tutor state
    
    tutorConfig:LoaderPackage.ITutorConfig;

    language:string;
    voice:string;             // F0 | M0

    modules:Array<LoaderPackage.IModuleDescr>;
    moduleData:any;
    globalData:any;

    state:Array<string>;
    scenedata:Array<string>;

    _tutorFeatures:string;                      // used in Flash mode to instance features   
    _forcedPause:boolean;		        		//@@ Mod Mar 15 2013 - FLEX support - manage pause when transitioning in and out of full screen mode 

     _modulePath:string;							//@@ Mod May 07 2012 - support for relative module paths						

    _pFeatures:any; 
	
	designWidth:number;
    designHeight:number;
    
    STAGEWIDTH:number;  
	STAGEHEIGHT:number;  
	
	// Global logging support - each scene instance and subscene animation instance represent 
	//                          object instances in the log.
	//                          The frameid is a '.' delimited string representing the:
	//
	//     framendx:graphnode.nodemodule.moduleelement... :animationnode.animationelement...iterationNdx
	//
	//			Semantics - each ':' represents the root of a new different (sub)graph	
	//  e.g.
	//
	//	  000001:root.start.SstartSplash...:root.Q0A.CSSbSRule1Part1AS...
	
	_framendx:number;


    //*** Demo configuration
	
	fRemoteMode:boolean;				// Used to control SWFLoader security domain
	fDemo:boolean;				// Controls the insertion of the demo selection scene 
	fDebug:boolean;				// Controls whether the server connection is used			
	fLog:boolean;				// Controls whether logging is used or not		Note: Affects ILogManager this.tutorDocructor
	fDeferDemoClick:boolean;				// defer demo button clicks while scene changes are in progress
	
//********
	
	fTutorPart:string;	// Goes in to the xml header to indicate the portion of the tutor the file represents - deprecated Jun 6 2013 - see CLogManager 
	fFullSignIn:boolean;					// dynamically based upon Feature Set		
	
//****************		
	
	fSkipAssess:boolean;						// Controls where to go after the ramp test - user trials support 	
	fEnableBack:boolean;						// force all back buttons to enabled
	fForceBackButton:boolean;					//@@ Mod May 22 2013 - Prepost module integration - back button behaves different in prepost then anywhere else
												//                     So in general outside the prepost we force the back button to off
	fSkillometer:boolean;

//********

	sessionAccount:any;							//@@ Mod Dec 03 2013 - session Account data  
	
	fSessionID:string;							// Unique session identifier
	fSessionTime:number;
	serverUserID:number;						// Numeric user ID assigned by the logging server DB
	
	fPlaybackMode:boolean;
	
    _log:any;							        // ILogManager - Logging service connection
    
    sceneState:any;	       	    	     						
    moduleState:any;	       		     						    
    tutorState:any;	       		         						
	
    sceneChange:any;	       	    	     						
    moduleChange:any;	       		     						    
    tutorChange:any;	       		         						
	
    // CSceneGraphNavigator
    //
    _globals:any;			        
	_sceneData:any;								//## Added Dec 11 2013 - DB based state logging
	_phaseData:any;								//## Added Dec 12 2013 - DB based state logging
	
	
	//*************** Navigator
	//@@Mod Aug 10 2013 - tutorautomator made so CSceneGraph can access it.
	
	TutAutomator:any;				// The location of this tutor automation object			


    initializeTutor() : void;
    initializeStateData(scene:TSceneBase, name:string, sceneName:string, hostModule:string) : void;
    
    attachNavPanel(panel:any) : void;
    setBreadCrumbs(text:string) : void;
    enableNext(fEnable:boolean) : void;
    enableBack(fEnable:boolean) : void;
    setNavMode(navMode:number, navTarget:string):void;

    assignProperty(root:any, property:string, value:any) : any;
    resolveProperty(root:any, property:string) : any;

    pushEvent(root:any, property:string, value:any) : any;

    // mixins
    $preEnterScene(scene:any ): void;
    $preExitScene(scene:any ): void;
    $nodeConstraint(ownerNode:string, edgeConstraint:string): boolean;


    getSceneValue(property:string) : any;
    getModuleValue(property:string) : any;
    getTutorValue(property:string) : any;
    getStateValue(property:string, target:string) : any;
    getRawStateValue(property:string, target:string) : any;


    //*************** FLEX integration 
    
    extAccount:any;

    extFTutorPart:string;

    extFFullSignIn:string;

    extFDemo:boolean;

    extFDebug:boolean;

    extFRemoteMode:boolean;

    extFDeferDemoClick:string;

    extFSkillometer:string;
    
    
    
    // note that the feature is not ready for use until the call to 
    // TutorRoot.setTutorFeatures which occures in the CEFTutorDoc.doOnStage Handler
    
    extTutorFeatures:string;
        
    extmodPath:string;

    extLogManager:any;
    
    extForceBackButton:any;
    
    extAspectRatio : string 
    
    incFrameNdx() : void
        
    initGlobals() : void

    incrGlobal(_id:string, _max:number, _cycle:number) : number;			//## Added Feb 10 2014 - global counter support

    assertGlobal(_id:string, _value:any) : void				//## Added Sep 23 2013 - to support global variables

    retractGlobal(_id:string) : void						//## Added Sep 23 2013 - to support global variables

    queryGlobal(_id:string) : any							//## Added Sep 23 2013 - to support global variables

    globals : Object;

    launchTutor(): void;

    resetStateFrameID() : void;

    frameID : number;

    incFrameID() : void;

    stateID : number;

    incStateID() : void; 

    connectFrameCounter(fCon:boolean) : void;

    doEnterFrame(evt:Event) : void;

    //***************** Automation *******************************		
 


//***************** Globals ****************************


    gData:string

    gPhase:string

    log: any

    resetSceneDataXML() : void;

    gForceBackButton : boolean 

    gNavigator : any 

    setNavButtonBehavior(behavior:string) : void



//***************** TUTOR LOADER START ****************************

    buildBootSet(targetTutor:string) : void;
    buildTutorSet() : void;


    loadFileSet(): Promise<any>[];

    onLoadJson(fileLoader:LoaderPackage.ILoaderData, filedata:string) : void;

    onLoadModID(fileLoader:LoaderPackage.ILoaderData, filedata:string) : void;

    onLoadSceneGraphs(fileLoader:LoaderPackage.ILoaderData, filedata:string) : void;

    onLoadCode(fileLoader:LoaderPackage.ILoaderData, filedata:string) : void;

    onLoadFonts(fileLoader:LoaderPackage.ILoaderData, filedata:string) : void;

    onLoadData(fileLoader:LoaderPackage.ILoaderData, filedata:string) : void;

//***************** TUTOR LOADER END ****************************


//***************** FEATURES ****************************

	// generate the working feature set for this instance
	//
	setTutorDefaults(featSet:string) : void;

	setTutorFeatures(featSet:string) : void;

	features : string;

	addFeature(feature:string, _id?:string) : void;

	delFeature(feature:string, _id?:string) : void;

    testFeatures(features:string) : boolean;

	testFeatureSet(featSet:string) : boolean;

	traceFeatures() : void;
    
}