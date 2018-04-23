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

import { ILogManager }      from "../managers/ILogManager";

import { CEFEvent } 		from "../events/CEFEvent";

import { CTutorState }      from "../util/CTutorState";
import { CONST }            from "../util/CONST";
import { CUtil }            from "../util/CUtil";



export class CEFTutorDoc extends CEFDoc
{
    
    // Flex integration - Used to indicate if Pretest is running embedded
    private _extLoader:boolean = false;
    private _extConnection:boolean = false;
    
    private _tutorFeatures:string = "FTR_PRETEST:FTR_TYPEA";	// used in Flash mode to set instance features   
    public  _modulePath:string;									//@@ Mod May 07 2012 - support for relative module paths						
    private _forcedPause:boolean = false;						//@@ Mod Mar 15 2013 - FLEX support - manage pause when transitioning in and out of full screen mode 
    
    
    constructor()
    {
        super();

        CUtil.trace("CWOZTutorDoc:Constructor");
        
        // If this is being downloaded as an on demand component then 
        // We need to wait to initialize until the object is instantiated 
        // on the stage when the "stage" property is then valid
        //
        this.on(CEFEvent.ADDED_TO_STAGE, this.initOnStage);
        
        //@@ Mod Sept 22 2014 - reset global object - only required for demo sequences - more than one demo may be loaded in a single session
        
        this.initGlobals();									 			
    }
    
    /**
     * 
     * @param event
     * 
     */
    public initOnStage(evt:Event):void
    {	
        CUtil.trace("CWOZTutorDoc:Object OnStage");
        
        this.off(CEFEvent.ADDED_TO_STAGE, this.initOnStage);									
        this.on(CEFEvent.REMOVED_FROM_STAGE, this.doOffStage);						
        
        // do default processing
        
        super.initOnStage(evt);
        
        // Flex integration - create the tutor object manually 
        //
        if(this.Stutor == null)
        {
            this.Stutor = CUtil.instantiateObject("CEFTutor") as CEFTutorRoot;
            this.Stutor.name = "Stutor";
            
            //@@ Mod May 09 2012 - Demo Support - manage the features so that the demo can augment the default set.
            
            this.Stutor.setTutorDefaults(this._tutorFeatures);
            this.Stutor.setTutorFeatures("");
            
            this.addChild(this.Stutor);
        }			
        
        // Init the automation Object
        
        CTutorState.tutorAutoObj = this.Stutor.tutorAutoObj;
        
        
        // ****** Use to capture Tutor Layout in XML format
        
        //let structureXML:XML = <struct/>;
        //
        //Stutor.captureXMLStructure(structureXML,0);
        //
        //System.setClipboard(structureXML.toXMLString());
        //dumpTutors();											//@@ TESTCODE			
        
        // ****** Use to capture Tutor Layout in XML format
        
        
        //****** Initialize the scene configurations - Add Audio etc.
        
        this.Stutor.initializeScenes();
        
        //## Mod Aug 10 2012 - must wait for initializeScenes to ensure basic scenes are in place now that 
        //					   we allow dynamic creation of the navPanel etc.
        // Parse the active Tutor
        //
        this.Stutor.initAutomation(CTutorState.tutorAutoObj);										
        
        // NOTE: Logger Connections must be made before cursor replacement
        //
        this.Stutor.replaceCursor();
        
        this.launchTutors();			
    }
    
    
    /**
     *  FLEX SUPPORT
     *  When the tutor goes off stage we need to dettach the cursor proxy as it 
     *  is dependent on the "stage" property
     * 
     * @param event
     * 
     */
    public doOffStage(evt:Event):void
    {
        CUtil.trace("going off stage");
        
        this.off(CEFEvent.REMOVED_FROM_STAGE, this.doOffStage);
        this.on(CEFEvent.ADDED_TO_STAGE, this.doOnStage);						
    
        // Pause the tutor while it is off screen
        if(!CTutorState.gTutor.isPaused)
        {
            this._forcedPause = true;
            CTutorState.gTutor.wozPause();			
        }
        
        // dettach the cursor proxy while the stage property is invalid
        
        this.Stutor.setCursor(CEFCursorProxy.WOZREPLAY);
    }
    
    
    /**
     *  FLEX SUPPORT
     *	When the tutor regains focus we reattch the cursorproxy to process all mouse actions
        *  
        * @param event
        * 
        */
    public doOnStage(evt:Event):void
    {	
        CUtil.trace("coming on stage");
        
        this.off(CEFEvent.ADDED_TO_STAGE, this.doOnStage);						
        this.on(CEFEvent.REMOVED_FROM_STAGE, this.doOffStage);
        
        // Start the tutor once back on screen
        if(this._forcedPause)
        {
            this._forcedPause = false;
            CTutorState.gTutor.wozPlay();
        }
        
        // rettach the cursor proxy when the stage property is valid
        
        this.Stutor.setCursor(CEFCursorProxy.WOZLIVE);
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

    
    //@@ Mod Jul 17 2013 - Separated scenegraph from scene description
    
    public set extSceneDescr(val:string) 
    {
        CTutorState.gSceneConfig = JSON.parse(val);			
    }
    
    
    //@@ Mod Jul 17 2013 - Separated scenegraph from scene description
    
    public set extSceneGraph(val:string) 
    {
        CTutorState.gSceneGraphDesc = JSON.parse(val);						
    }
    
    
    //@@ Mod Feb 16 2013 - support for Adobe Spelling Library
    
    public set extAnimationGraph(val:string) 
    {
        CTutorState.gAnimationGraphDesc = JSON.parse(val);			
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

}