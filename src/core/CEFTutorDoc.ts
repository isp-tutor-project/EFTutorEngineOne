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

import { CEFRoot } 	    	from "./CEFRoot";	
import { CEFDoc }			from "./CEFDoc";
import { CEFObject } 	    from "./CEFObject";	
import { CEFTutorRoot }     from "./CEFTutorRoot";
import { CEFCursorProxy } 	from "./CEFCursorProxy";	
import { CEFTutor }         from "./CEFTutor";

import { ILogManager }      from "../managers/ILogManager";

import { CEFEvent } 		from "../events/CEFEvent";

import { CTutorState }      from "../util/CTutorState";
import { CONST }            from "../util/CONST";
import { CUtil }            from "../util/CUtil";


import EventDispatcher 		  = createjs.EventDispatcher;
import { TutorContainer } from "../thermite/TutorContainer";



export class CEFTutorDoc extends EventDispatcher
{
	public traceMode:boolean;

	//************ Stage Symbols
	
	public Stutor:TutorContainer;			// every WOZObject must be associated with a specific tutor
	
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
	
	public logFrameID = 0;
	public logStateID = 0;

    
    // Flex integration - Used to indicate if Pretest is running embedded
    private _extLoader:boolean = false;
    private _extConnection:boolean = false;
    
    private _tutorFeatures:string = "";                     	// used in Flash mode to set instance features   
    public  _modulePath:string;									//@@ Mod May 07 2012 - support for relative module paths						
    private _forcedPause:boolean = false;						//@@ Mod Mar 15 2013 - FLEX support - manage pause when transitioning in and out of full screen mode 
    
    
    constructor(_sceneDescr:any, _sceneGraph:any, _tutorGraph:any )
    {
        super();

        CTutorState.gSceneConfig        = _sceneDescr;			
        CTutorState.gAnimationGraphDesc = _sceneGraph;			
        CTutorState.gSceneGraphDesc     = _tutorGraph;						

        CUtil.trace("CWOZTutorDoc:Constructor");
        
		// First get the Root Tutor movie object - this encapsulates all the scenes and navigation features
		//
		CTutorState.gApp = this;			
        
        //@@ Mod Sept 22 2014 - reset global object - only required for demo sequences - more than one demo may be loaded in a single session
        
        this.initGlobals();									 			

        // Frame counter - for logging
		// NOTE: this must be the first ENTER_FRAME event listener 
		
		this.connectFrameCounter(true);		

        // Create the tutor container - 
        // TODO: extract the dimensions from the tutor loader
        //
        this.Stutor = new TutorContainer();
        this.Stutor.name = "Stutor";
        
        EFLoadManager.efStage.addChild(this.Stutor);
        
        //@@ Mod May 09 2012 - Demo Support - manage the features so that the demo can augment the default set.
        
        this.Stutor.setTutorDefaults(this._tutorFeatures);
        this.Stutor.setTutorFeatures("");

        
        // Init the automation Object
        
        CTutorState.tutorAutoObj = this.Stutor.tutorAutoObj;
        
        
        // //****** Initialize the scene configurations - Add Audio etc.
        
        this.Stutor.initializeTutor();
        

        //## Mod Aug 10 2012 - must wait for initializeScenes to ensure basic scenes are in place now that 
        //					   we allow dynamic creation of the navPanel etc.
        // Parse the active Tutor
        //
        this.Stutor.initAutomation(CTutorState.tutorAutoObj);										
        
        // NOTE: Logger Connections must be made before cursor replacement
        //
        // this.Stutor.replaceCursor();
        
        this.launchTutor();			
    }
    

    //*************** FLEX integration 
    
    public set extAccount(Obj:any)
    {
        CTutorState.sessionAccount = Obj;
    }		
    
    public set extFTutorPart(str:string)
    {
        //CONST.fTutorPart = str;		
        //LogManager.fTutorPart = str;
    }
    public set extFFullSignIn(val:string)
    {
        CTutorState.fFullSignIn = (val == "true")? true:false;
    }
    public set extFDemo(val:boolean)
    {
        CTutorState.fDemo = val;
    }
    public set extFDebug(val:boolean)
    {
        CTutorState.fDebug = val;
    }
    public set extFRemoteMode(val:boolean)
    {
        CTutorState.fRemoteMode = val;			
    }
    public set extFDeferDemoClick(val:string)
    {
        CTutorState.fDeferDemoClick = (val == "true")? true:false;
    }
    
    //@@ Mod Mar2 2012 - support for showing skillometer in loader
    
    public set extFSkillometer(val:string)
    {
        CTutorState.fSkillometer = (val == "true")? true:false;
    }
    
    
    
    // note that the feature set is not ready for use until the call to 
    // TutorRoot.setTutorFeatures which occures in the CWOZTutorDoc.doOnStage Handler
    
    public set extTutorFeatures(ftrStr:string)
    {
        this._tutorFeatures = ftrStr;
    }
    
    public set extLoader(val:string) 
    {
        this._extLoader = (val == "true")? true:false;			
    }
    
    public get extLoaded() : boolean
    {
        return this._extLoader;			
    }
    
    //@@ Mod May 07 2012 - support for relative module pathing
    
    public set extmodPath(val:string) 
    {
        this._modulePath = val;			
    }
    
    //@@ Mod May 07 2012 - support for relative module pathing
    
    public set extLogManager(val:ILogManager) 
    {
        CTutorState.gLogR = val;			
    }

    
    
    public set extForceBackButton(fForce:any) 
    {		
        if(typeof fForce === 'string')
            CTutorState.gForceBackButton = (fForce == "true")? true:false;
        else if(typeof fForce === 'boolean')
            CTutorState.gForceBackButton = fForce;
    }
    
    public get extAspectRatio() : string 
    {		
        return "STD";
    }
    
    
    
    //****************** START Globals		
        
    public initGlobals() : void
    {
        CTutorState._globals = {};
    }


    public incrGlobal(_id:string, _max:number = -1, _cycle:number = 0) : number			//## Added Feb 10 2014 - global counter support
    {	
        let result:any;
        
        if(CTutorState._globals.hasOwnProperty(_id))
        {		
            CTutorState._globals[_id]++;
            
            result = CTutorState._globals[_id];
            
            // Roll over at max value > -1 will never roll
            
            if(CTutorState._globals[_id] == _max)
                    CTutorState._globals[_id] = _cycle;
        }
        else
            result = CTutorState._globals[_id] = 1;
        
        return result; 
    }

    public assertGlobal(_id:string, _value:any) : void				//## Added Sep 23 2013 - to support global variables
    {	
        CTutorState._globals[_id] = _value;
    }

    public retractGlobal(_id:string) : void						//## Added Sep 23 2013 - to support global variables
    {	
        CTutorState._globals[_id] = "";
    }

    public queryGlobal(_id:string) : any							//## Added Sep 23 2013 - to support global variables
    {	
        let result:any;
        
        if(CTutorState._globals.hasOwnProperty(_id))
        {		
            result = CTutorState._globals[_id];
        }
        else result = "null";
        
        return result; 
    }		

    public set globals(gval:Object) 
    {
        CTutorState._globals = gval;			
    }

    public get globals() : Object
    {			
        return CTutorState._globals;						
    }



	public launchTutor(): void
	{			
		// reset the frame and state IDs
		
		this.resetStateFrameID();	
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
	private doEnterFrame(evt:Event)
	{
		this.incFrameID();
	}
	
	
//***************** Automation *******************************		
	
	
//***************** Debug *******************************		
		
	protected dumpTutors() : void
	{
		if(this.traceMode) CUtil.trace("\n*** Start root dump ALL tutors ***");
		
		for(let tutor of CTutorState.tutorAutoObj)
		{
			if(this.traceMode) CUtil.trace("TUTOR : " + tutor);
		
			if(CTutorState.tutorAutoObj[tutor].instance instanceof CEFTutorRoot) 
			{
				if(this.traceMode) CUtil.trace("CEF***");
				
				CTutorState.tutorAutoObj[tutor].instance.dumpScenes(CTutorState.tutorAutoObj[tutor]);
			}				
		}			
		
		if(this.traceMode) CUtil.trace("*** End root dump tutor structure ***");			
	}

//***************** Debug *******************************		
    
}