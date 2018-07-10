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

import { IEFTutorDoc } 			from "../core/IEFTutorDoc";

import { CLogManager }			from "../managers/CLogManager";
import { CURLLoader }           from "../network/CURLLoader";
import { CURLRequest }          from "../network/CURLRequest";

import { TTutorContainer }      from "../thermite/TTutorContainer";

import { CEFEvent } 		    from "../events/CEFEvent";

import { CTutorGraphNavigator } from "../tutorgraph/CTutorGraphNavigator";

import { LoaderPackage } 		from "../util/IBootLoader";
import { CONST }                from "../util/CONST";
import { CUtil }                from "../util/CUtil";


import EventDispatcher 		  = createjs.EventDispatcher;



export class CEFTutorDoc extends EventDispatcher implements IEFTutorDoc
{
	public traceMode:boolean;
    private isDebug:boolean;

	// This is a special signature to avoid typescript error "because <type> has no index signature."
	// on this[<element name>]
	// 
	[key: string]: any;

	//************ Stage Symbols
	
    public tutorContainer:TTutorContainer;			// every WOZObject must be associated with a specific tutor

	//************ Stage Symbols

    public tutorNavigator:CTutorGraphNavigator;	

    
	//************ Stage Symbols
    
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
    public tutorConfig:LoaderPackage.ITutorConfig;

    public language:string = "en";
    public modules:Array<LoaderPackage.IModuleDescr>;
    public moduleData:any;

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
    public SceneData:string = "";	            		// Root Tutor data cache				
	
    
	//*************** Automation Shadow Display List
	// 
	public TutAutomator:any	= {};		        		// The location of this tutor automation object			

    // CSceneGraphNavigator
    //
    public _globals:any	  = {};			        
	public _sceneData:any = {};							//## Added Dec 11 2013 - DB based state logging
	public _phaseData:any = {};							//## Added Dec 12 2013 - DB based state logging
	

	//**************** Current feature vector
	
	private fFeatures:Array<string> = new Array<string>();			
	private fDefaults:Array<string> = new Array<string>();			
    
    


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
		this.setTutorFeatures("");
		
		this.log = CLogManager.getInstance();
	}
	
	
	public initializeTutor() {

		// Load the scene extension code
		// 
		// for(let suppl in this.tutorDescr.supplScripts) {

		// 	if(this.tutorDescr.supplScripts[suppl].intNameSpace == CONST.SCENE_EXT) {
		// 		this.tutorExt = this.tutorDescr.supplScripts[suppl].instance;
		// 		break;
		// 	}
		// }

        // This manufactures the tutorGraph from the JSON spec file 			
        //
        this.tutorNavigator = CTutorGraphNavigator.rootFactory(this, this.tutorGraph);

        //## Mod Aug 10 2012 - must wait for initializeScenes to ensure basic scenes are in place now that 
        //					   we allow dynamic creation of the navPanel etc.
        // Parse the active Tutor
        //
        this.tutorContainer.initAutomation();										

		// TODO: implement under HTML5 
		// NOTE: Logger Connections must be made before cursor replacement
        //
        // this.Stutor.replaceCursor();
        
        this.launchTutor();			
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



	public launchTutor(): void
	{			
		// reset the frame and state IDs
		
		this.resetStateFrameID();	

		this.tutorNavigator.gotoNextScene();
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


    public get gData():string
    {
        return this.SceneData;
    }

    public set gData(dataXML:string) 
    {			
        this.SceneData = dataXML;
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
     * 
     */
    public setButtonBehavior(behavior:string) : void
    {
        if(behavior == "incrScene")
            this.tutorNavigator.buttonBehavior = CONST.GOTONEXTSCENE;
        else				
            this.tutorNavigator.buttonBehavior = CONST.GOTONEXTANIMATION;
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
                 filePath : "EFTutors/" + targetTutor + "/" + CONST.TUTOR_VARIABLE[i1],
                 onLoad   : this.onLoadJson.bind(this),
                 fileName : CONST.TUTOR_VARIABLE[i1],
                 varName  : CONST.TUTOR_FACTORIES[i1]
            });
        }
    }

    public buildTutorSet() : void {

        this.loaderData = [];

        // Each module has a set of files 
        // 
        for(let moduleName of this.tutorConfig.dependencies) {

            let moduleNameCS = moduleName.toUpperCase();

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

            this.loaderData.push( {
                type     : "Class Extensions",
                filePath : moduleName + CONST.EXTS_FILEPATH,
                onLoad   : this.onLoadCode.bind(this),
                modName : moduleNameCS,
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
                type     : "Scene Data",
                filePath : moduleName + CONST.DATA_FILEPATH,
                onLoad   : this.onLoadData.bind(this),
                modName : moduleNameCS,
            });

            this.loaderData.push( {
                type     : "Track Data",
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
            //
            this.moduleData[fileLoader.modName] = JSON.parse(filedata);      
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
		let feature:string;
		let featArray:Array<string> = featSet.split(":");
		
		this.fDefaults = new Array<string>();
		
		for(let feature of featArray)
		{
			this.fDefaults.push(feature);
		}
	}
			
	// generate the working feature set for this instance
	//
	public setTutorFeatures(featSet:string) : void
	{
		let feature:string;
		let featArray:Array<string> = new Array;
		
		if(featSet.length > 0)
			featArray = featSet.split(":");
		
		this.fFeatures = new Array<string>();

		// Add default features 
		
		for (let feature of this.fDefaults)
		{
			this.fFeatures.push(feature);
		}

		// Add instance features 
		
		for (let feature of featArray)
		{
			this.fFeatures.push(feature);
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
		
		this.fFeatures = ftrSet.split(":");
	}

	
	// udpate the working feature set for this instance
	//
	public set addFeature(feature:string) 
	{			
		// Add new features - no duplicates
		
		if(this.fFeatures.indexOf(feature) == -1)
		{
			this.fFeatures.push(feature);
		}
	}
	
	// udpate the working feature set for this instance
	//
	public set delFeature(feature:string)
	{
		let fIndex:number;
		
		// remove features - no duplicates
		
		if((fIndex = this.fFeatures.indexOf(feature)) != -1)
		{
			this.fFeatures.splice(fIndex,1);
		}
	}
	
	//## Mod Jul 01 2012 - Support for NOT operation on features.
	//
	//	
	private testFeature(element:any, index:number, arr:Array<string>) : boolean
	{
		if(element.charAt(0) == "!")
		{
			return (this.fFeatures.indexOf(element.substring(1)) != -1)? false:true;
		}
		else
			return (this.fFeatures.indexOf(element) != -1)? true:false;
	}
	
	
	// test possibly compound features
	//
	public testFeatureSet(featSet:string) : boolean
	{
		let feature:string;
		let disjFeat:Array<string> = featSet.split(":");	// Disjunctive features
		let conjFeat:Array<string>;							// Conjunctive features
		
		// match a null set - i.e. empty string means the object is not feature constrained
		
		if(featSet == "")
				return true;
		
		// Check all disjunctive featuresets - one in each element of disjFeat
		// As long as one is true we pass
		
		for (let feature of disjFeat)
		{
			conjFeat = feature.split(",");
			
			// Check that all conjunctive features are set in fFeatures 
			
			if(conjFeat.every(this.testFeature))
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


}