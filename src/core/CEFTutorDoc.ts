//*********************************************************************************
//
//  Copyright(c) 2008,2018 Kevin Willows. All Rights Reserved
//
//	License: Proprietary
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//
//*********************************************************************************

//** Imports

import { IEFTutorDoc } 			from "./IEFTutorDoc";

import { CLogManager }			from "../managers/CLogManager";
import { CURLLoader }           from "../network/CURLLoader";
import { CURLRequest }          from "../network/CURLRequest";

import { TTutorContainer }      from "../thermite/TTutorContainer";
import { TNavPanel }            from "../thermite/TNavPanel";

import { CEFEvent } 		    from "../events/CEFEvent";

import { CTutorGraphNavigator } from "../tutorgraph/CTutorGraphNavigator";

import { LoaderPackage } 		from "../util/IBootLoader";
import { CONST }                from "../util/CONST";
import { CUtil }                from "../util/CUtil";


import EventDispatcher 		  = createjs.EventDispatcher;
import { TSceneBase } from "../thermite/TSceneBase";

// for web logger
import { WebLogger } from "../network/WebLogger"



export class CEFTutorDoc extends EventDispatcher implements IEFTutorDoc
{
	public traceMode:boolean;
    private isDebug:boolean;
    private clickBoundListener:EventListener;

	// This is a special signature to avoid typescript error "because <type> has no index signature."
	// on this[<element name>]
	// 
	[key: string]: any;

	//************ Stage Symbols
	
    public tutorContainer:TTutorContainer;			// every WOZObject must be associated with a specific tutor

	//************ Stage Symbols

    public SnavPanel:TNavPanel;	
    
	//************ Stage Symbols
    
    public tutorNavigator:CTutorGraphNavigator;	
    public name:string;
    public loaderData:Array<LoaderPackage.ILoaderData>;

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
	
	public logFrameID = 0;
	public logStateID = 0;

    // knowledge tracing 
    public   ktSkills:any;							    //@@ Mod Aug 28 2013 - support for new kt structure in sceneGraph
    

    //*** Tutor graph descriptions
		
	public sceneGraph:any;						        // The factory definition object used to create scene graphs for specified scenes
	public tutorGraph:any;						    	// The factory definition object used to create the tutor Graph		
    public tutorStateData:any;						   	// The factory definition object used to initialize tutor state
    public userStateData:any = null;
    public userID:string;
    public graphState:any;
    public sceneObj:TSceneBase;

    public tutorConfig:LoaderPackage.ITutorConfig;

    public language:string = "en";
    public voice:string    = "F0";                      // F0 | M0

    public modules:Array<LoaderPackage.IModuleDescr>;
    public moduleData:any;
    public globalData:any;

    public state:Array<string>;
    public scenedata:Array<string>;

    public _tutorFeatures:string = "";                  // used in Flash mode to set instance features   
    public _modulePath:string;							//@@ Mod May 07 2012 - support for relative module paths						
    public _forcedPause:boolean = false;				//@@ Mod Mar 15 2013 - FLEX support - manage pause when transitioning in and out of full screen mode 
    
    public _pFeatures:any = {}; 
	
	public designWidth:number = 1024;
    public designHeight:number = 768;
    
    public STAGEWIDTH:number  = 1024;  
	public STAGEHEIGHT:number = 768;  
    
    private hostFeatures:string;
    private hostTutorData:string;

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
	
	public _framendx:number   = 0;


    //*** Demo configuration
	
	public fRemoteMode:boolean	  = false;				// Used to control SWFLoader security domain
	public fDemo:boolean  	 	  = true;				// Controls the insertion of the demo selection scene 
	public fDebug:boolean 	 	  = true;				// Controls whether the server connection is used			
	public fLog:boolean   	   	  = false;				// Controls whether logging is used or not		Note: Affects ILogManager this.tutorDocructor
	public fDeferDemoClick:boolean = true;				// defer demo button clicks while scene changes are in progress
	
//********
	
	public fTutorPart:string = "Intro & Ramp Pre-test";	// Goes in to the xml header to indicate the portion of the tutor the file represents - deprecated Jun 6 2013 - see CLogManager 
	public fFullSignIn:boolean = false;					// Set dynamically based upon Feature Set		
	
//****************		
	
	public fSkipAssess:boolean      = false;			// Controls where to go after the ramp test - user trials support 	
	public fEnableBack:boolean      = true;				// force all back buttons to enabled
	public fForceBackButton:boolean = true;				//@@ Mod May 22 2013 - Prepost module integration - back button behaves different in prepost then anywhere else
														//                     So in general outside the prepost we force the back button to off
	public fSkillometer:boolean 	   = false;			//@@ Mod Mar2 2012 - support for showing skillometer in loader

//********

	public sessionAccount:any = {};						//@@ Mod Dec 03 2013 - session Account data  

	public fSessionID:string;							// Unique session identifier
	public fSessionTime:number;
	public serverUserID:number = 0;						// Numeric user ID assigned by the logging server DB
	
	public fPlaybackMode:boolean = false;
		
    public _log:any;							  		// ILogManager - Logging service connection
    
    public hostModule:string;

    public sceneState:any  = {};	 	       	    	     						
    public moduleState:any = {};	 	       		     						    
    public tutorState:any  = {};	 	       		         						
	
    public sceneChange:any  = {};	        	    	     						
    public moduleChange:any = {};	 	       		     						    
    public tutorChange:any  = {};	        		         						
	
    
	//*************** Automation Shadow Display List
	// 
	public TutAutomator:any	= {};		        		// The location of this tutor automation object			

    // CSceneGraphNavigator
    //
    public _globals:any	  = {};			        
	public _sceneData:any = {};							//## Added Dec 11 2013 - DB based state logging
	public _phaseData:any = {};							//## Added Dec 12 2013 - DB based state logging
	

	//**************** Current feature vector
	
    private fFeatures:any = {};		
    private featureID:any = {};		
    	
	private fDefaults:any = {};			
    
    


    constructor()
    {
        super();

        CUtil.trace("CEFTutorDoc:Constructor");
		
        //@@ Mod Sept 22 2014 - reset global object - only required for demo sequences - more than one demo may be loaded in a single session
        
        this.initGlobals();			
        this.isDebug = true;						 			

        this.sceneGraph = {};
        this.modules    = new Array<LoaderPackage.IModuleDescr>();
        this.moduleData = {};
        this.globalData = {};

        // Frame counter - for logging
		// NOTE: this must be the first ENTER_FRAME event listener 
		
		this.connectFrameCounter(true);		

        // Create the tutor container - 
        // TODO: extract the dimensions from the tutor loader
        //
        this.tutorContainer          	 = new TTutorContainer();
		this.tutorContainer.tutorDoc     = this;
		this.tutorContainer.tutorAutoObj = this.TutAutomator;		
        this.tutorContainer.name     	 = CONST.TUTORCONTAINER;
        
        EFLoadManager.efStage.addChild(this.tutorContainer);
        
        //@@ Mod May 09 2012 - Demo Support - manage the features so that the demo can augment the default set.
        
        this.setTutorDefaults(this._tutorFeatures);
		
        this.log = CLogManager.getInstance();

        this.clickBoundListener  = this.clickListener.bind(this);
	}
	
	
	public launchTutor() {

        this.hostModule = this.tutorGraph.hostModule;

		// TODO: implement under HTML5 
		// NOTE: Logger Connections must be made before cursor replacement
        //
        // this.Stutor.replaceCursor();
        console.log("tutor has been launched and weblogger is about to start up");

        EFLoadManager.nativeUserMgr = new WebLogger();
        EFLoadManager.nativeUserMgr.setValues(EFLoadManager.efBootNode, EFLoadManager.efFeatures);

        // Load user state data
        // If the native logger is available use it to record state data
        // 
        if(EFLoadManager.nativeUserMgr) {

            this.userID       = EFLoadManager.nativeUserMgr.getUserId();
            this.graphState   = EFLoadManager.nativeUserMgr.getCurrentScene();
            this.hostFeatures = EFLoadManager.nativeUserMgr.getFeatures();

            // Restore the named tutor state.
            // Then add the instructionseq defined features
            // 
            this.restoreTutorState();
            this.addTutorFeatures(this.hostFeatures);    
        }
        else {
            this.userID       = "GUESTBL_JAN_1";
            this.graphState   = EFLoadManager.efBootNode;
            this.hostFeatures = EFLoadManager.efFeatures;

            this.addTutorFeatures(this.hostFeatures);
        }

		// reset the frame and state IDs
		
		this.resetStateFrameID();	

        // This manufactures the tutorGraph from the JSON spec file 			
        //
        CTutorGraphNavigator.rootFactory(this, this.tutorGraph);
        
        //## Mod Aug 10 2012 - must wait for initializeScenes to ensure basic scenes are in place now that 
        //					   we allow dynamic creation of the navPanel etc.
        // 
        // Parse the active Tutor
        //
        this.tutorContainer.initAutomation();										

        if(this.graphState && this.graphState.currNodeID && (this.graphState.currNodeID != "")) {
            this.tutorNavigator.restoreGraph(this.graphState);
        }

        // Force click to start Tutor - Chrome DOMException if you don't interact with the document prior to
        // play event.
        // 
        if(this.testFeatures("FTR_WEB")) {

            window.addEventListener("click", this.clickBoundListener);
            console.log("$$ Waiting for user interaction. $$");

        }
        else {
            //### TUTOR LAUNCH ###
            this.tutorNavigator.gotoNextScene("$launchTutor");
        }
    }

    // Override
    public clickListener(e:Event) {        

        if(e.type === "click") {
            window.removeEventListener("click", this.clickBoundListener);

            //### DEFERRED TUTOR LAUNCH ###
            this.tutorNavigator.gotoNextScene("$launchTutor");
        }
    }        


    public initializeSceneStateData(scene:TSceneBase, name:string, sceneName:string, hostModule:string) {

        //TODO: want to remove one of these - they appear to be duplicate
        if(name !== sceneName) { 
            alert("TutorDoc Scene name Mismatch: "+ name + " != " + sceneName);
        }

        // Init the tutor state variables - retain any that are extant
        // 
        this.sceneObj               = scene;
        this.sceneState[name]       = {};
        this.sceneChange[sceneName] = {};
    }


    private getTutorState() : string {

        let store:any = {
            "sceneState" : {},
            "moduleState": {},
            "tutorState" : {},

            "fFeatures" : {},
            "featureID" : {}
        };

        Object.assign(store.sceneState,  this.sceneState);
        Object.assign(store.moduleState, this.moduleState);
        Object.assign(store.tutorState,  this.tutorState);

        delete(store.sceneState.$seq);
        delete(store.moduleState.$seq);
        delete(store.tutorState.$seq);

        Object.assign(store.fFeatures, this.fFeatures);
        Object.assign(store.featureID, this.featureID);

        return JSON.stringify(store);
    }

    private restoreTutorState(): boolean {

        let result: boolean = false;
        /*
                let jsonData:string = EFLoadManager.nativeUserMgr.getTutorState(this.tutorConfig.tutorStateID);
        
                // If the tutor has saved a state previously - use that to init the state
                // 
                if(jsonData && jsonData !== "") {
        
                    let hostTutorData:any = JSON.parse(jsonData);
        
                    // TODO: Do we ever want to restore scene state????
                    //       We never start mid-scene so the scene data should be clear???
                    // 
                    // Object.assign(this.sceneState, hostTutorData.sceneState);
        
                    Object.assign(this.moduleState, hostTutorData.moduleState);
                    Object.assign(this.tutorState  = hostTutorData.tutorState);
            
                    Object.assign(this.fFeatures   = hostTutorData.fFeatures);
                    Object.assign(this.featureID   = hostTutorData.featureID);
                }
        */
        // made it async
        EFLoadManager.nativeUserMgr.getTutorState(this.tutorConfig.tutorStateID)
            .then((jsonData: string) => {
                if (jsonData && jsonData !== "") {

                    let hostTutorData: any = JSON.parse(jsonData);

                    // TODO: Do we ever want to restore scene state????
                    //       We never start mid-scene so the scene data should be clear???
                    // 
                    // Object.assign(this.sceneState, hostTutorData.sceneState);

                    Object.assign(this.moduleState, hostTutorData.moduleState);
                    Object.assign(this.tutorState = hostTutorData.tutorState);

                    Object.assign(this.fFeatures = hostTutorData.fFeatures);
                    Object.assign(this.featureID = hostTutorData.featureID);
                }
            });

        return result;
    }

    // TODO: Templates management should reside in TutorDoc or preferably a custom object
    // 
    public resolveTemplates(selector:string, ref:string) : string {

        return this.sceneObj.resolveTemplates(selector, ref);
    }

    public attachNavPanel(panel:TNavPanel) {

        this.SnavPanel = panel;
    }
    
    public setBreadCrumbs(text:string) {

        if(this.SnavPanel) 
            this.SnavPanel.setBreadCrumbs(text);
    }

    public hideProgress() {

        if(this.SnavPanel) 
            this.SnavPanel.hideProgress();
    }

    public setProgress(step:number, state:number ) {

        if(this.SnavPanel) 
            this.SnavPanel.setProgress(step, state);
    }

	public enableNext(fEnable:boolean)
	{			
        if(this.SnavPanel) 
            this.SnavPanel.enableNext(fEnable);		
	}

	public enableBack(fEnable:boolean)
	{			
        if(this.SnavPanel) 
            this.SnavPanel.enableBack(fEnable);		
	}

    public setNavMode(navMode:number, navTarget:string) {
        
        if(this.SnavPanel) 
            this.SnavPanel.setNavMode(navMode, navTarget);
    }

    //*************** MIXINS *************
    //************************************

    public $preEnterScene(scene:any): void {};
    public $preExitScene(scene:any): void {};
    public $nodeConstraint(nodeName:string, edgeConstraint:string): boolean {return false};

    //*************** MIXINS *************
    //************************************


    public getSceneValue(property:string) : any {
        return this.getStateValue(property, CONST.SCENESTATE) 
    }    
    public getModuleValue(property:string) : any {
        return this.getStateValue(property, CONST.MODULESTATE) 
    }
    public getTutorValue(property:string) : any {
        return this.getStateValue(property, CONST.TUTORSTATE) 
    }

    public getStateValue(property:string, target:string = CONST.MODULESTATE) : any {

        let prop:any;

        prop = this.getRawStateValue(property, target);

        return prop;
    }

    public getRawStateValue(property:string, target:string = CONST.MODULESTATE) : any {

        let prop:any;

        switch(target) {
            case CONST.SCENESTATE:
                prop = this.resolveProperty(this.sceneState[this.name], property);
                break;

            case CONST.MODULESTATE:
                prop = this.resolveProperty(this.moduleState, property);
                break;

            case CONST.TUTORSTATE:
                prop = this.resolveProperty(this.tutorState, property);
                break;
        }        

        return prop;
    }

    
    public assignProperty(root:any, property:string, value:any) : void {

        let path   = property.split(".");
        let target = root;

        for(let i1 = 0 ; i1 < path.length-1 ; i1++) {

            if(target[path[i1]])             
                target = target[path[i1]];
            else 
                target = target[path[i1]] = {};
        }
        target[path[path.length-1]] = value;
    }


    public resolveProperty(root:any, property:string) : any {

        let path   = property.split(".");
        let target = root;
        let value:any;

        for(let i1 = 0 ; i1 < path.length-1 ; i1++) {

            if(target[path[i1]])             
                target = target[path[i1]];
            else 
                target = target[path[i1]] = {};
        }

        value = target[path[path.length-1]];

        if(value === undefined) 
                        value = null;

        return value;
    }


    public pushEvent(root:any, property:string, value:any) : void {

        root["$seq"] = root["$seq"] || [];

        root["$seq"].push({
                            "prop":property,
                            "value":value,
                            "time":Date.now()
                            });
    }


    //*************** FLEX integration 
    
    public set extAccount(Obj:any)
    {
        this.sessionAccount = Obj;
    }		
    
    public set extFTutorPart(str:string)
    {
        //CONST.fTutorPart = str;		
        //LogManager.fTutorPart = str;
    }
    public set extFFullSignIn(val:string)
    {
        this.fFullSignIn = (val == "true")? true:false;
    }
    public set extFDemo(val:boolean)
    {
        this.fDemo = val;
    }
    public set extFDebug(val:boolean)
    {
        this.fDebug = val;
    }
    public set extFRemoteMode(val:boolean)
    {
        this.fRemoteMode = val;			
    }
    public set extFDeferDemoClick(val:string)
    {
        this.fDeferDemoClick = (val == "true")? true:false;
    }
    
    //@@ Mod Mar2 2012 - support for showing skillometer in loader
    
    public set extFSkillometer(val:string)
    {
        this.fSkillometer = (val == "true")? true:false;
    }
    
    
    
    // note that the feature set is not ready for use until the call to 
    // TutorRoot.setTutorFeatures which occures in the CEFTutorDoc.doOnStage Handler
    
    public set extTutorFeatures(ftrStr:string)
    {
        this._tutorFeatures = ftrStr;
    }
    

    //@@ Mod May 07 2012 - support for relative module pathing
    
    public set extmodPath(val:string) 
    {
        this._modulePath = val;			
    }
    
    //@@ Mod May 07 2012 - support for relative module pathing
    
    public set extLogManager(val:CLogManager) 
    {
        this.log = val;			
    }

    
    
    public set extForceBackButton(fForce:any) 
    {		
        if(typeof fForce === 'string')
            this.gForceBackButton = (fForce == "true")? true:false;
        else if(typeof fForce === 'boolean')
            this.gForceBackButton = fForce;
    }
    
    public get extAspectRatio() : string 
    {		
        return "STD";
    }
    
    
    public incFrameNdx() : void
	{
		this._framendx++;
	}


    //****************** START Globals		
        
    public initGlobals() : void
    {
        this._globals = {};
    }


    public incrGlobal(_id:string, _max:number = -1, _cycle:number = 0) : number			//## Added Feb 10 2014 - global counter support
    {	
        let result:any;
        
        if(this._globals.hasOwnProperty(_id))
        {		
            this._globals[_id]++;
            
            result = this._globals[_id];
            
            // Roll over at max value > -1 will never roll
            
            if(this._globals[_id] == _max)
                    this._globals[_id] = _cycle;
        }
        else
            result = this._globals[_id] = 1;
        
        return result; 
    }

    public assertGlobal(_id:string, _value:any) : void				//## Added Sep 23 2013 - to support global variables
    {	
        this._globals[_id] = _value;
    }

    public retractGlobal(_id:string) : void						//## Added Sep 23 2013 - to support global variables
    {	
        this._globals[_id] = "";
    }

    public queryGlobal(_id:string) : any							//## Added Sep 23 2013 - to support global variables
    {	
        let result:any;
        
        if(this._globals.hasOwnProperty(_id))
        {		
            result = this._globals[_id];
        }
        else result = "null";
        
        return result; 
    }		

    public set globals(gval:Object) 
    {
        this._globals = gval;			
    }

    public get globals() : Object
    {			
        return this._globals;						
    }



//***************** Automation *******************************		

	/**
	 * reset the log counters
	 */
	public resetStateFrameID() : void 
	{
		this.frameID = 0;
		this.stateID = 0;
	}	

	public get frameID() : number 
	{
		return this.logFrameID;
	}
	
	public set frameID(newVal:number) 
	{
		this.logFrameID = newVal;
	}
	
	public incFrameID() : void 
	{
		this.logFrameID++;
	}
	
	public get stateID() : number 
	{
		return this.logStateID;
	}
	
	public set stateID(newVal:number) 
	{
		this.logStateID = newVal;
	}
	
	/**
	 * Increment the interface stateID and reset the frameID - frameID's are relative to state changes
	 * this is to make any events occur proportionally in time relative to associated state changes.
	 */
	public incStateID() : void 
	{
		if(this.traceMode) CUtil.trace("@@@@@@@@@ logStateID Update : " + this.logStateID);
		
		this.logStateID++;
		this.frameID = 0;
	}
	
	/**
	 * connect or disconnect the log frame counter.
	 * @param	fCon
	 */
	public connectFrameCounter(fCon:boolean)
	{
		if (fCon)
			this.on(CEFEvent.ENTER_FRAME, this.doEnterFrame);											
		else
			this.off(CEFEvent.ENTER_FRAME, this.doEnterFrame);								
	}


	/**
	 * maintain the tutor frame counter used for logging
	 * 
	 * @param	evt
	 */
	public doEnterFrame(evt:Event)
	{
		this.incFrameID();
	}
	
	
//***************** Automation *******************************		
 


//***************** Globals ****************************

    // deprecated - was XML data repository
    public get gData():string
    {
        return "";
    }

    // deprecated
    public set gData(dataXML:string) 
    {			
    }

    public get gPhase():string
    {
        return this.fTutorPart;
    }

    public set gPhase(phase:string) 
    {
        this.fTutorPart = phase;
    }

    public get log(): any
    {
        return this._log;
    }

    public set log(logr:any) 
    {        
        this._log = logr;
    }


    /*
    *	restore scenedata XML to allow reuse of scene 
    */
    public resetSceneDataXML() : void
    {			
        //this.sceneConfig.replace("scenedata", sceneDataArchive);
    }			


    public get gForceBackButton() : boolean 
    {		
        return this.fForceBackButton;
    }
            
    public set gForceBackButton(fForce:boolean)
    {		
        this.fForceBackButton = fForce;
    }

    public get gNavigator() : any 
    {		
        return this.tutorNavigator;
    }


    /**
     * Deprecated: use setNavigationTarget in TSceneBase
     */
    public setNavButtonBehavior(behavior:string) : void
    {
        if(behavior == "incrScene")
            this.tutorNavigator.buttonBehavior = CONST.GOTONEXTSCENE;
        else				
            this.tutorNavigator.buttonBehavior = CONST.GOTONEXTTRACK;
    }


//***************** Globals ****************************


//***************** TUTOR LOADER START ****************************

    public buildBootSet(targetTutor:string) : void {
        
        this.loaderData = [];

        // Loaders for the Tutorgraph and TutorConfig
        //
        for(let i1 = 0 ; i1 < CONST.TUTOR_VARIABLE.length ; i1++) {

            this.loaderData.push( {
                 type: CONST.TUTOR_VARIABLE[i1],
                 filePath : CONST.TUTOR_COMMONPATH + targetTutor + "/" + CONST.TUTOR_VARIABLE[i1],
                 onLoad   : this.onLoadJson.bind(this),
                 fileName : CONST.TUTOR_VARIABLE[i1],
                 varName  : CONST.TUTOR_FACTORIES[i1]
            });
        }

        this.loaderData.push( {
            type     : CONST.TUTOR_GLOBALCODE,
            filePath : CONST.TUTOR_COMMONPATH + targetTutor + CONST.GLOBALS_FILEPATH,
            onLoad   : this.onLoadCode.bind(this),
            modName : CONST.TUTOR_EXT,
            debugPath: this.isDebug? "ISP_Tutor/EFbuild/TUTORCODE" + CONST.GLOBALS_FILEPATH :null
        });

        this.loaderData.push( {
            type     : CONST.TUTOR_GLOBALDATA,
            filePath : CONST.TUTOR_COMMONPATH + targetTutor + CONST.GDATA_FILEPATH,
            onLoad   : this.onLoadData.bind(this),
            modName : CONST.TUTOR_GLOBALDATA,
            debugPath: this.isDebug? "ISP_Tutor/EFbuild/TUTORDATA" + CONST.GDATA_FILEPATH :null
        });

        this.loaderData.push( {
            type     : CONST.TUTOR_GLOBALDATA,
            filePath : CONST.TUTOR_COMMONPATH + targetTutor + CONST.GLIBR_FILEPATH,
            onLoad   : this.onLoadData.bind(this),
            modName : CONST.TUTOR_GLOBALDATA,
            debugPath: this.isDebug? "ISP_Tutor/EFbuild/TUTORDATA" + CONST.GLIBR_FILEPATH :null
        });

    }

    public buildTutorSet() : void {

        this.loaderData = [];

        // Each module has a set of files 
        // 
        for(let moduleName of this.tutorConfig.dependencies) {

            let moduleNameCS = moduleName;

            this.loaderData.push( {
                type     : "ModuleID",
                filePath : moduleName + CONST.MODID_FILEPATH,
                onLoad   : this.onLoadModID.bind(this),
                modName : moduleNameCS
            });

            this.loaderData.push( {
                type     : "Scene Graph",
                filePath : moduleName + CONST.GRAPH_FILEPATH,
                onLoad   : this.onLoadSceneGraphs.bind(this),
                modName : moduleNameCS
            });

            // TODO: This cannot be path specific for debugging - e.g. ISP_TUTOR...
            // 
            this.loaderData.push( {
                type     : "Class Extensions",
                filePath : moduleName + CONST.EXTS_FILEPATH,
                onLoad   : this.onLoadCode.bind(this),
                modName : moduleNameCS,
                // debugPath: this.isDebug? "ISP_Tutor/EFbuild/" + moduleName + "/code_exts/src":null
                debugPath: this.isDebug? "ISP_Tutor/EFbuild/" + moduleName + "/exts.js":null
            });

            this.loaderData.push( {
                type     : "Scene Mixins",
                filePath : moduleName + CONST.MIXINS_FILEPATH,
                onLoad   : this.onLoadCode.bind(this),
                modName : moduleNameCS,
                debugPath: this.isDebug? "ISP_Tutor/EFbuild/" + moduleName + "/mixins.js":null
            });

            this.loaderData.push( {
                type     : "Fonts",
                filePath : moduleName + CONST.FONTFACE_FILEPATH,
                onLoad   : this.onLoadFonts.bind(this),
                modName : moduleNameCS,
            });
           
            this.loaderData.push( {
                type     : CONST.SCENE_DATA,
                filePath : moduleName + CONST.DATA_FILEPATH,
                onLoad   : this.onLoadData.bind(this),
                modName : moduleNameCS,
            });

            this.loaderData.push( {
                type     : CONST.SCENE_DATA,
                filePath : moduleName + CONST.LIBR_FILEPATH,
                onLoad   : this.onLoadData.bind(this),
                modName : moduleNameCS,
            });

            this.loaderData.push( {
                type     : CONST.TRACK_DATA,
                filePath : moduleName + CONST.TRACKDATA_FILEPATH,
                onLoad   : this.onLoadData.bind(this),
                modName : moduleNameCS,
            });

            this.loaderData.push( {
                type     : "AnimateCC",
                filePath : moduleName + CONST.ANMODULE_FILEPATH,
                onLoad   : this.onLoadCode.bind(this),
                modName : moduleNameCS,
                debugPath: this.isDebug? moduleName + ".js":null
            });
        }
    }


    public loadFileSet(): Promise<any>[] {

        let modulePromises:Promise<any>[];

        try {

            modulePromises = this.loaderData.map((fileLoader, index) => {

                let loader = new CURLLoader();
        
                return loader.load(new CURLRequest(fileLoader.filePath))
                    .then((filetext:string) => {
        
                       return fileLoader.onLoad(fileLoader, filetext);
                    })                        
            })
        }        
        catch(error){

            console.log("Load-Set failed: " + error);
        }

        return modulePromises;
    }


    public onLoadJson(fileLoader:LoaderPackage.ILoaderData, filedata:string) {

        try {
            console.log("JSON Loaded: " + fileLoader.fileName);

            this[fileLoader.varName] = JSON.parse(filedata);      
        }
        catch(error) {

            console.log("JSON parse failed: " + error);
        }
    }


    public onLoadModID(fileLoader:LoaderPackage.ILoaderData, filedata:string) {

        try {
            console.log("MODID Loaded: " + fileLoader.modName );

            // Extract the compID from the file into the modules IModuleDescr spec
            //
            Object.assign(fileLoader,JSON.parse(filedata));      
        }
        catch(error) {

            console.log("ModID parse failed: " + error);
        }
    }


    public onLoadSceneGraphs(fileLoader:LoaderPackage.ILoaderData, filedata:string) {

        try {
            console.log("SceneGraph Loaded: " + fileLoader.modName );

            // Add the module specific graphs to the scenegraph factory object
            //
            this.sceneGraph[fileLoader.modName] = JSON.parse(filedata);      
        }
        catch(error) {

            console.log("Graph parse failed: " + error);
        }
    }

        
    public onLoadCode(fileLoader:LoaderPackage.ILoaderData, filedata:string) {

        try {
            console.log("Module:" + fileLoader.type + " Loaded: " + fileLoader.modName );

            // Extract the compID from the file into the modules IModuleDescr spec
            //
            let tag = document.createElement("script");

            //## TODO: Check if there is a problem using "head" - i.e. is it universal

            // Inject the script with a suffix to expose the source in the debugger listing.
            //
            if(fileLoader.debugPath)
                tag.text = filedata + "\n//# sourceURL= http://127.0.0.1/"+ fileLoader.debugPath;

            // Inject the script into the page
            document.head.appendChild(tag);
        }
        catch(error) {

            console.log("Exts parse failed: " + error);
        }
    }


    public onLoadFonts(fileLoader:LoaderPackage.ILoaderData, filedata:string) {

        try {
            console.log("Fonts Loaded: " + fileLoader.modName );

            // Create a link tag to inject the @fontface style sheet
            //
            let tag = document.createElement("style");

            tag.type = 'text/css';
            tag.appendChild(document.createTextNode(filedata));

            // Inject the script into the page
            document.head.appendChild(tag);

    }
        catch(error) {

            console.log("Font parse failed: " + error);
        }
    }


    public onLoadData(fileLoader:LoaderPackage.ILoaderData, filedata:string) {

        try {
            console.log("Data:" + fileLoader.type + " Loaded: " + fileLoader.modName );

            // ****
            // Note: Several files may integrate information into the tutor moduleData 
            //       structure.
            //
            let data:Object = JSON.parse(filedata);

            if(fileLoader.type === CONST.TUTOR_GLOBALDATA) {
                this.globalData = this.globalData || {};

                CUtil.mixinDataObject(this.globalData, data);
            }
            else {
                this.moduleData[fileLoader.modName] = this.moduleData[fileLoader.modName] || {};
                this.moduleData[fileLoader.modName][fileLoader.type] = this.moduleData[fileLoader.modName][fileLoader.type] || {};

                CUtil.mixinDataObject(this.moduleData[fileLoader.modName][fileLoader.type], data);
            }

        }
        catch(error) {

            console.log("Data parse failed: " + error);
        }
    }



//***************** TUTOR LOADER END ****************************



//***************** FEATURES ****************************

	// generate the working feature set for this instance
	//
	public setTutorDefaults(featSet:string) : void
	{
		let featArray:Array<string> = featSet.split(":");
		
		this.fDefaults = {};
		
		for(let feature in featArray)
		{
			this.fDefaults[feature] = true;
		}
    }
    

	// generate the working feature set for this instance
	//
	public addTutorFeatures(featSet:string) : void
	{
		let featArray:Array<string> = new Array;
		
		if(featSet.length > 0)
			featArray = featSet.split(":");

		// Add default features 
		
		for (let feature in this.fDefaults)
		{
            this.addFeature(feature, null); 
		}

		// Add instance features 
		
		for (let feature of featArray)
		{
            this.addFeature(feature, null); 
		}
	}

	// get : delimited string of features
	//## Mod Oct 16 2012 - logging support
	//
	public get features() : string
	{			
		// Add new features - no duplicates
		
		return this.fFeatures.join(":");
	}
	
	// set : delimited string of features
	//## Mod Dec 03 2013 - DB state support
	//
	public set features(ftrSet:string) 
	{			
		// Add new features - no duplicates
        // TODO: deprecate this - it's dangerous
        // 
		this.fFeatures = ftrSet.split(":");
	}

	
	// udpate the working feature set for this instance
	//
	public addFeature(_feature:string, _id:string) 
	{			
        // Add new features
        // 
        if(_feature && _feature != "") {		

            if(_id) {
                this.featureID[_id] = this.featureID[_id] || {};
                this.featureID[_id][_feature] = true;                
            }
            else {
                this.fFeatures[_feature] = true;
            }
        }
    }
    
	// udpate the working feature set for this instance
	//
	public delFeature(_feature:string, _id:string)
	{
        // Remove named features
        // 
        if(_id && _id != "") {

            if(_feature && _feature !== "*") {
                
                if(this.featureID[_id] && this.featureID[_id][_feature]) {
                    delete this.featureID[_id][_feature];
                }
            }
            else {
                if(this.featureID[_id])
                    delete this.featureID[_id];
            }
        }

        // Remove One-dimensional features
        // 
        else if(_feature && this.fFeatures[_feature]) {

            delete this.fFeatures[_feature];
        }
    }

    public getFeaturesById(_id:string) {

        let cnt:number = 0;
        let features:string = "";

        for(let ftr in this.featureID[_id]) {

            if(cnt > 0) {
                features += ":";
            }
            features += ftr;
        }

        return features;
    }
    
    
    private includes(ftrObj:any, ftr:string) : boolean {

        let result:boolean = false;

        for(let fElement in ftrObj) {
            
            if(fElement === ftr) {
                result = true;
                break;
            }
        }

        return result;
    }

	
	//## Mod Jul 01 2012 - Support for NOT operation on features.
	//
	//	
	private testFeature(element:any, index:number, arr:Array<string>) : boolean
	{
        let testElement:string = element;
        let result    = false;
        let invResult = false;

		if(element.charAt(0) == "!")
		{
            testElement = element.substring(1);
            invResult   = true;
        }

        if(this.fFeatures[testElement]) {
            result = true;
        }
        else {
            for(let id in this.featureID) {
                if(this.featureID[id][testElement]) {
                    result = true;
                    break;
                }
            }
        }

		return (invResult)? !result:result;
	}
    
    
    // Simple alias for testFeatureSet
    // 
    public testFeatures(features:string) : boolean {

        let result = false;

        if(features && features !== "")
            result = this.testFeatureSet(features);

        return result;    
    }

	
	// test possibly compound features
	//
	public testFeatureSet(featSet:string) : boolean
	{
		let feature:string;
		let disjFeat:Array<string> = featSet.split("|");	// Disjunctive features
		let conjFeat:Array<string>;							// Conjunctive features
		
		// match a null set - i.e. empty string means the object is not feature constrained
		
		if(featSet === "")
				return true;
		
		// Check all disjunctive featuresets - one in each element of disjFeat
		// As long as one is true we pass
		
		for (feature of disjFeat)
		{
			conjFeat = feature.split(",");
			
			// Check that all conjunctive features are set in fFeatures 
			
			if(conjFeat.every(this.testFeature, this))
									        return true;
		}			
		return false;
	}				

	
	// udpate the working feature set for this instance
	//
	public traceFeatures() : void
	{			
		CUtil.trace(this.fFeatures);
	}		
	
//***************** FEATURES ****************************



//***************** LOGGING ****************************

    // TODO: This logging mechanism is a total kludge !!!!!! MUST FIX !!!!!
    // 
    public logTutorState(scene:TSceneBase) : void {

        // If the native logger is available use it to record state data
        // 
        if(EFLoadManager.nativeUserMgr) 
            EFLoadManager.nativeUserMgr.logState(scene.sceneLogName, JSON.stringify(this.sceneState),JSON.stringify(this.moduleState),JSON.stringify(this.tutorState));

        if(EFLoadManager.nativeUserMgr) 
                EFLoadManager.nativeUserMgr.updateTutorState(this.tutorConfig.tutorStateID, this.getTutorState());
    }


    public logTutorProgress(sceneName:string) : void {

        //##TESTTEST
        // console.log(JSON.stringify(this.tutorNavigator.captureGraph()));

        // If the native logger is available use it to record state data
        // 
        if(EFLoadManager.nativeUserMgr) {

            if(sceneName === CONST.END_OF_TUTOR) {
                EFLoadManager.nativeUserMgr.tutorComplete();
            }
            else {
                let graphState:string = JSON.stringify(this.tutorNavigator.captureGraph());

                EFLoadManager.nativeUserMgr.updateScene(sceneName, graphState);
            }
        }
    }

//***************** LOGGING ****************************
}