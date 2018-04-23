import { CONST } from "./CONST";

export class CTutorState {

    public static tutorAutoObj:any;		// The tutor object hierarchy

    public static _pFeatures:any = {}; 

    public static gApp:any;
	
	public static designWidth:number = 1024;
    public static designHeight:number = 768;
    
    public static STAGEWIDTH:number  = 1024;  
	public static STAGEHEIGHT:number = 768;  

    //*** global scene graph XML declaration
		
	public static gSceneConfig:any;								// The factory definition object used to create the scene structure
	public static gSceneGraphDesc:any;							// The factory definition object used to create the scene Graph		
	public static gAnimationGraphDesc:any;						// The factory definition object used to create animation graphs for specified scenes
	
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
	
	public static _framendx:number   = 0;


    //*** Demo configuration
	
	public static fRemoteMode:boolean	  = false;				// Used to control SWFLoader security domain
	public static fDemo:boolean  	 	  = true;				// Controls the insertion of the demo selection scene 
	public static fDebug:boolean 	 	  = true;				// Controls whether the server connection is used			
	public static fLog:boolean   	   	  = false;				// Controls whether logging is used or not		Note: Affects ILogManager CTutorStateructor
	public static fDeferDemoClick:boolean = true;				// defer demo button clicks while scene changes are in progress
	
//********
	
	public static fTutorPart:string = "Intro & Ramp Pre-test";	// Goes in to the xml header to indicate the portion of the tutor the file represents - deprecated Jun 6 2013 - see CLogManager 
	public static fFullSignIn:boolean = false;					// Set dynamically based upon Feature Set		
	
//****************		
	
	public static fSkipAssess:boolean      = false;				// Controls where to go after the ramp test - user trials support 	
	public static fEnableBack:boolean      = true;				// force all back buttons to enabled
	public static fForceBackButton:boolean = true;				//@@ Mod May 22 2013 - Prepost module integration - back button behaves different in prepost then anywhere else
																//                     So in general outside the prepost we force the back button to off
	public static fSkillometer:boolean 	   = false;				//@@ Mod Mar2 2012 - support for showing skillometer in loader

//********

	public static sessionAccount:any	   = {};				//@@ Mod Dec 03 2013 - session Account data  
	
	public static fSessionID:string;							// Unique session identifier
	public static fSessionTime:number;
	public static serverUserID:number = 0;						// Numeric user ID assigned by the logging server DB
	
	public static fPlaybackMode:boolean = false;
	
	public static gTutor:any;									// Root Tutor object - @@Mod Aug 7 2013 - public so scenegraph can access  		
	
	public static logR:any;							        // ILogManager - Logging service connection
    public static SceneData:string = "";	            		// Root Tutor data cache				
	
	public static _wozInstance:number = 1;		
	public static _gNavigator:any;                             // CEFNavigator
	
    // CSceneGraphNavigator
    //
    public static _globals:any	 = {};			        
	public static _history:any;                             //CGraphHistory;				
	public static _rootGraph:any;                           //CSceneGraph;
	public static _sceneData:any = {};						//## Added Dec 11 2013 - DB based state logging
	public static _phaseData:any = {};						//## Added Dec 12 2013 - DB based state logging
	public static _fSceneGraph:boolean = true;
	
	
	//*************** Navigator
	//@@Mod Aug 10 2013 - tutorautomator made public so CSceneGraph can access it.
	
	public static prntTutor:any;				// The parent CEFTutorRoot of these transitions
	public static TutAutomator:any;				// The location of this tutor automation object			



//***************** Globals ****************************


    public static get gData():string
    {
        return CTutorState.SceneData;
    }

    public static set gData(dataXML:string) 
    {			
        CTutorState.SceneData = dataXML;
    }

    //@@ Mod May 16 2013 - support for prepost upgrade

    public static get gPhase():string
    {
        return CTutorState.fTutorPart;
    }

    public static set gPhase(phase:string) 
    {
        CTutorState.fTutorPart = phase;
    }

    //@@ Mod May 07 2012 - support for relative module pathing

    public static get gLogR(): any
    {
        return CTutorState.logR;
    }

    public static set gLogR(logr:any) 
    {        
        CTutorState.logR = logr;
    }


    /*
    *	restore scenedata XML to allow reuse of scene 
    */
    public static resetSceneDataXML() : void
    {			
        //CTutorState.sceneConfig.replace("scenedata", sceneDataArchive);
    }			


    public static get gForceBackButton() : boolean 
    {		
        return CTutorState.fForceBackButton;
    }
            
    public static set gForceBackButton(fForce:boolean)
    {		
        CTutorState.fForceBackButton = fForce;
    }

    public static get gNavigator() : any 
    {		
        return CTutorState._gNavigator;
    }

    public static set gNavigator(navObject:any)
    {		
        CTutorState._gNavigator = navObject;
    }




	/**
	 * 
	 */
	public static setButtonBehavior(behavior:string) : void
	{
		if(behavior == "incrScene")
			CTutorState.buttonBehavior = CONST.GOTONEXTSCENE;
		else				
			CTutorState.buttonBehavior = CONST.GOTONEXTANIMATION;
	}
	
	/**
		* Used to set the nextButton 
		*/
	public static set buttonBehavior(action:string)
	{
		if(action == CONST.GOTONEXTSCENE) CTutorState._fSceneGraph = true;
							  		else  CTutorState._fSceneGraph = false;
	}
	


//***************** Globals ****************************

}