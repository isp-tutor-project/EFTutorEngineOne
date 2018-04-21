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
import { CEFCursorProxy } 	from "./CEFCursorProxy";	

import { ILogManager }      from "../managers/ILogManager";

import { CEFEvent } 		from "../events/CEFEvent";
import { CEFTutorRoot }     from "./CEFTutorRoot";
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
        
        CEFObject.initGlobals();									 			
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
            this.Stutor = CEFRoot.instantiateObject("CEFTutor") as CEFTutorRoot;
            this.Stutor.name = "Stutor";
            
            //@@ Mod May 09 2012 - Demo Support - manage the features so that the demo can augment the default set.
            
            this.Stutor.setTutorDefaults(this._tutorFeatures);
            this.Stutor.setTutorFeatures("");
            
            this.addChild(this.Stutor);
        }			
        
        // Init the automation Object
        
        CEFDoc.tutorAutoObj = this.Stutor.tutorAutoObj;
        
        
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
        this.Stutor.initAutomation(CEFDoc.tutorAutoObj);										
        
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
        if(!CEFRoot.gTutor.isPaused)
        {
            this._forcedPause = true;
            CEFRoot.gTutor.wozPause();			
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
            CEFRoot.gTutor.wozPlay();
        }
        
        // rettach the cursor proxy when the stage property is valid
        
        this.Stutor.setCursor(CEFCursorProxy.WOZLIVE);
    }
            
    
    //*************** FLEX integration 
    
    public set extAccount(Obj:any)
    {
        CEFRoot.sessionAccount = Obj;
    }		
    
    public set extFTutorPart(str:string)
    {
        //CEFRoot.fTutorPart = str;		
        //LogManager.fTutorPart = str;
    }
    public set extFFullSignIn(val:string)
    {
        CEFRoot.fFullSignIn = (val == "true")? true:false;
    }
    public set extFDemo(val:boolean)
    {
        CEFRoot.fDemo = val;
    }
    public set extFDebug(val:boolean)
    {
        CEFRoot.fDebug = val;
    }
    public set extFRemoteMode(val:boolean)
    {
        CEFRoot.fRemoteMode = val;			
    }
    public set extFDeferDemoClick(val:string)
    {
        CEFRoot.fDeferDemoClick = (val == "true")? true:false;
    }
    
    //@@ Mod Mar2 2012 - support for showing skillometer in loader
    
    public set extFSkillometer(val:string)
    {
        CEFRoot.fSkillometer = (val == "true")? true:false;
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
        this.gLogR = val;			
    }

    
    //@@ Mod Jul 17 2013 - Separated scenegraph from scene description
    
    public set extSceneDescr(val:string) 
    {
        CEFRoot.gSceneConfig = JSON.parse(val);			
    }
    
    
    //@@ Mod Jul 17 2013 - Separated scenegraph from scene description
    
    public set extSceneGraph(val:string) 
    {
        CEFRoot.gSceneGraphDesc = JSON.parse(val);						
    }
    
    
    //@@ Mod Feb 16 2013 - support for Adobe Spelling Library
    
    public set extAnimationGraph(val:string) 
    {
        CEFRoot.gAnimationGraphDesc = JSON.parse(val);			
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
    
    
    
//*************** FLEX integration 
    
}