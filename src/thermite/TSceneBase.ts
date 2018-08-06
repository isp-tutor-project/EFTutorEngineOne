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


import { TObject } 			from "./TObject";
import { TTutorContainer } 	from "./TTutorContainer";

import { CEFActionEvent } 	from "../events/CEFActionEvent";
import { CEFScriptEvent } 	from "../events/CEFScriptEvent";
import { CEFSeekEvent }		from "../events/CEFSeekEvent";

import { ILogManager }  	from "../managers/ILogManager";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";

import DisplayObject      = createjs.DisplayObject;


export class TSceneBase extends TObject
{		
	// This is a special signature to avoid typescript error "because <type> has no index signature."
	// on this[<element name>]
	// 
	[key: string]: any;

	public fComplete:boolean = false;			// scene Complete Flag
	
	// For scenes with Timelines, these arrays are used to fire the appropriate code events 
	// as the user seeks the play head.
	//
	public seekForeFunc:Array<any>;
	public seekBackFunc:Array<any>;
	
	public sceneAttempt:number = 1;		
	public sceneTag:string;
    
	public classPath:string;
	public hostModule:string;
    
    public moduleData:any; 
    public sceneData :any; 

	protected _section:string;					// Arbitrary tutor section id
    
    protected tutorNavigator:any;
    
	protected _nextButton:any = null;
	protected _prevButton:any = null;



	/**
	 * Scene Constructor
	 */
	constructor()
	{
		super();
		this.init3();
	}


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

	public TSceneBaseInitialize() {

		this.TObjectInitialize.call(this);
		this.init3();
	}

	public initialize() {

		this.TObjectInitialize.call(this);		
		this.init3();
	}

	private init3() {
		
		this.traceMode = true;
		if(this.traceMode) CUtil.trace("TSceneBase:Constructor");			
	}

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */




	public onCreate() : void
	{
		try {
            this.moduleData     = this.tutorDoc.moduleData[this.hostModule][CONST.SCENE_DATA];
            this.sceneData      = this.moduleData[this.sceneName];
            this.tutorNavigator = this.tutorDoc.tutorNavigator;

            let dataElement:any;

            // walk all the scene data items and find matching scene components (there should be matches for all)
            // deserialize the data into the component.
            // 
            for(let element in this.sceneData) {

                dataElement = this.sceneData[element];

                // resolve data references to library and foreign modules.
                // 
                if(dataElement.$$REF) {
                    let dataPath:Array<string> = dataElement.$$REF.split(".");

                    if(dataPath[0] === "$$EFL") {

                        dataElement = this.tutorDoc.moduleData[this.hostModule][CONST.SCENE_DATA]._LIBRARY[dataPath[1]][dataPath[2]];
                    }
                    else if(dataPath[0] === "$$EFM") {

                        let forMod = dataElement = this.tutorDoc.moduleData[dataPath[1]];

                        if(!forMod) {
                            console.log("Error: module for Foreign-Reference missing!")
                            throw("missing module");
                        }
                        dataElement = forMod[CONST.SCENE_DATA]._LIBRARY[dataPath[2]][dataPath[3]];
                    }
                    else {
                        console.error("Error: moduleData link error");
                    }
                }
                
                if(this[element] && this[element].deSerializeObj) {
                    this[element].deSerializeObj(dataElement);
                }       
                else {
                    console.log(`Error: ObjData mismatch: Module-${this.hostModule}  Scene-${this.sceneName}  Element-${element}`);
                }         
            }

			// Execute the create procedures for this scene instance
			// see notes on sceneExt Code - tutor Supplimentary code
			// 
			this.$onCreateScene();
			
			// Support for demo scene-initialization
			// 
			this.$demoInitScene();
		}		
		catch(error) {

			CUtil.trace(`Error in TSceneBase onCreate: ${this.sceneName} -- ${error}`);
		}
	}


	/**
	 * polymorphic UI set up
	 */
	protected initUI() : void
	{
		
	}

	
	public connectNavButton(type:string, butComp:string, _once:boolean = true) {

		this.disConnectNavButton(type, butComp );

		switch(type) {
			case CONST.NEXTSCENE:
				this._nextButton = this[butComp].on(CONST.MOUSE_CLICK, this.tutorNavigator.onButtonNext, this.tutorNavigator);
				break;

			case CONST.PREVSCENE:
				this._prevButton = this[butComp].on(CONST.MOUSE_CLICK, this.tutorNavigator.onButtonPrev, this.tutorNavigator);
				break;				
		}
	}


    public setNavigationTarget(behavior:string) {

        if(behavior.toUpperCase() === "TUTOR")
            this.tutorNavigator.buttonBehavior = CONST.GOTONEXTSCENE;
        else				
            this.tutorNavigator.buttonBehavior = CONST.GOTONEXTTRACK;

    }

	public disConnectNavButton(type:string, butComp:string ) {

		switch(type) {
			case CONST.NEXTSCENE:
				if(this._nextButton) {

					this[butComp].off(this._nextButton);
					this._nextButton = null;
				}
				break;

			case CONST.PREVSCENE:
				if(this._prevButton) {

					this[butComp].off(this._prevButton);
					this._prevButton = null;
				}
				break;				
		}
	}




//*************** Effect management - from Audio Stream
	
	/**
	 * 
	 */	
	public effectHandler(evt:CEFActionEvent) : void
	{
		if(this.traceMode) CUtil.trace("Effect Event: " + evt);
		
		this[evt.prop1](evt.prop2, evt.prop3, evt.prop4, evt.prop5);
	}		
	
	
	/**
	 * 
	 */	
	public scriptHandler(evt:CEFScriptEvent) : void
	{
		var fTest:boolean = true;
		
		if(this.traceMode) CUtil.trace("Effect Event: " + evt);

		// If initializer is featured - execute matching features
		
		if(evt.script.features != undefined)
		{
			// Each element of the fFeature vector contains an id for a feature of the tutor.
			// This permits the tutor to have multiple independently managed features.
			// All identifiers of all the feature sets must be globally unique.
			
			fTest = this.tutorDoc.tutorContainer.testFeatureSet(String(evt.script.features));
		}
		
		// Note "common" elements within the packet will search the SceneConfig space for matches,
		// which may or may not be desirable. 
		if(fTest)		
			this.parseOBJ(this, evt.script.children(), "script");
	}		
	
//*************** Effect management - from Audio Stream

//***************** Logging *******************************		

	/**
	 * encode experiment tag polymorphically
	 * 
	 */
	public logSceneTag() : Object
	{
		//@@ State Logging - return polymorphic tag info
		
		return {'scenetag':this.sceneTag, 'attempt':this.sceneAttempt++};		
		
		//@@ State Logging			
	}			

//***************** Logging *******************************		


//****** Overridden Behaviors
//***************** Automation *******************************		
	
	
	public initAutomation(_parentScene:TSceneBase, sceneAutoObj:any, ObjIdRef:string, lLogger:ILogManager, lTutor:TTutorContainer) : void
	{								

		// parse all the component objects - NOTE: everything must be derived from CEFObject
		//
		let propName:string;
		let childName:string;
		let childObj:any;
		let wozObj:TObject;

		// Do scripted initialization
		
		this.onCreate();							
		
		// Do Automation Capture

		// Enumerate the child objects - Animate instantiates these as properties of the object 
		// itself and only adds them to the display list as managedChildren in a Tween
		//
		let nonTObj:Array<string> = Object.getOwnPropertyNames(_parentScene);
		
		for(propName of nonTObj) {

			// Note: in checking all props... many will be null
			// 
			childObj = _parentScene[propName];
			
			// Skip any Tutor container references - would be infinitely recursive
			//
			if(childObj instanceof TTutorContainer)
											continue;

			// Have Object determine its inplace size
			//
			if(childObj instanceof TObject)
			{
				//## Mod Apr 14 2014 - maintain linkage to parent scene - used for D.eval execution context
				//  - e.g. button script execution
				// 
				childObj.parentScene = _parentScene;
				
				(childObj as TObject).measure();					
			}
			
			if(childObj instanceof DisplayObject)
			{
				// Assign transition names (xnames) to AnimateCC objects
				
				if(!(childObj as any).xname) {
					(childObj as any).xname = this.nextXname();
				}

				if(childObj.name) childName = childObj.name;
				else childName = propName;
	   
				// Record each Object within scene
				//
				sceneAutoObj[childName] = {};
				sceneAutoObj[childName]._instance = childObj;										
						
				// Record object in-place position - This is only done for top level objects in scene to record their inplace positions 
				// for inter-scene tweening.
				//
				sceneAutoObj[childName].inPlace = childObj._cloneProps({});

				// sceneAutoObj[childName].inPlace = {X:childObj.x, Y:childObj.y, Width:childObj.width, Height:childObj.height, Alpha:childObj.alpha};	 //** TODO */							

				if(this.traceMode) CUtil.trace("\t\tTScene found subObject named:" + childName + " ... in-place: ");

				// Recurse WOZ Children
				//
				if(childObj instanceof TObject)
				{
					wozObj = childObj as TObject;				// Coerce the Object					
					wozObj.initAutomation(_parentScene, sceneAutoObj[childName], name+".", lLogger, lTutor);
				}
				
				if(this.traceMode) for(var id in sceneAutoObj[childName].inPlace)
				{
					CUtil.trace("\t\t\t\t" + id + " : " + sceneAutoObj[childName].inPlace[id]);
				}						
			}
		}
	}
	
	
	// Walk the WOZ Objects to capture their default state
	//
	public captureDefState(TutScene:any ) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start Capture - Walking Top Level Objects***");

		for(var sceneObj in TutScene)
		{			
			if(sceneObj != "_instance" && TutScene[sceneObj]._instance instanceof TObject)
			{
				if(this.traceMode) CUtil.trace("capturing: " + TutScene[sceneObj]._instance.name);
				
				TutScene[sceneObj]._instance.captureDefState(TutScene[sceneObj] );										
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End Capture - Walking Top Level Objects***");
	}
	
	
	// Walk the WOZ Objects to restore their default state
	//
	public restoreDefState(TutScene:any ) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start Restore - Walking Top Level Objects***");

		for(var sceneObj in TutScene)
		{			
			if(sceneObj != "_instance" && TutScene[sceneObj]._instance instanceof TObject)
			{
				if(this.traceMode) CUtil.trace("restoring: " + TutScene[sceneObj]._instance.name);
				
				TutScene[sceneObj]._instance.restoreDefState(TutScene[sceneObj] );									
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End Restore - Walking Top Level Objects***");
	}
	
	
	// Walk the WOZ Objects to initialize their automation mode
	//
	public setObjMode(TutScene:any, sMode:string) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start - Walking Top Level Objects***");

		for(var sceneObj in TutScene)
		{			
			if(sceneObj != "_instance" && TutScene[sceneObj]._instance instanceof TObject)
			{
				TutScene[sceneObj]._instance.setAutomationMode(TutScene[sceneObj], sMode );										
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End - Walking Top Level Objects***");
	}
	
	
//***************** Automation *******************************		
//****** Overridden Behaviors
	
	
//***************** Debug *******************************		
		
	public dumpSceneObjs(TutScene:any) : void
	{				
		for(var sceneObj in TutScene)
		{
			if(this.traceMode) CUtil.trace("\tSceneObj : " + sceneObj);
			
			if(sceneObj != "_instance" && TutScene[sceneObj]._instance instanceof TObject)
			{
				if(this.traceMode) CUtil.trace("\tCEF***");
				
				TutScene[sceneObj]._instance.dumpSubObjs(TutScene[sceneObj], "\t");										
			}					
		}		
	}
	
//***************** Debug *******************************		

//****** Overridable Behaviors

	/**
	 * Polymorphic Navigation enabling
	*/
	public updateNav() : void 
	{
		if(this.traceMode) CUtil.trace("UpdateNavigation: ", name, this.fComplete);
		
		// Update the Navigation
		//
		if(!this.fComplete)
			this.tutorDoc.tutorContainer.enableNext(false);		
		else	
			this.tutorDoc.tutorContainer.enableNext(true);		
			
		if(this.tutorDoc.gForceBackButton)
			this.tutorDoc.tutorContainer.enableBack(this.tutorDoc.fEnableBack);																		
	}

	/**
	 * Polymorphic question complete criteria
	*/
	public questionFinished(evt:Event) : void 
	{
		// User selection has been made
		//
		this.fComplete = true;
		
		// Update the Navigation
		//
		this.updateNav();
	}

	
	/**
	 * Polymorphic question complete criteria
	 */
	public questionComplete() : boolean 
	{
		// User selection has been made
		//
		return this.fComplete;
	}

	
//****** Navigation Behaviors

//*** REWIND PLAY Management		

	/**
	 * Initiate the action/audio sequence - 
	 * @param	evt
	 */
	public sceneReplay(evt:Event) : void 
	{
		if(this.traceMode) CUtil.trace("sceneReplay: " + evt);
		
		// do XML based reset
		
		this.rewindScene();
		
		//## Mod Feb 07 2013 - added to support actionsequence replay functionality 
		// restart the ActionTrack sequence
		// 
		try {
			this.$preEnterScene();
		}
		catch(error) {
			CUtil.trace("sceneReplay preenter error on scene: " + this.name + " - " + error);
		}
		
		// Use the timer to do an asynchronous start of the track
		
        this.trackPlay();
    }		

	
	/**
	 * See override
	 */
	public trackPlay() : void 
	{
	}		


	/**
	 * polymorphic scene reset initialization
	*/
	public rewindScene() : void
	{
		// Parse the Tutor.config for create procedures for this scene 
	
		try {
			// Execute the rewind procedures for this scene instance
			// see notes on sceneExt Code - tutor Supplimentary code
			// 
			this.$rewindScene();
			
			// Support for demo scene-initialization
			// 
			this.$demoIinitScene();
		}		
		catch(error) {

			CUtil.trace("Error in rewindScene script: ");
		}
	}
	

	// Default behavior - Set the Tutor Title and return same target scene
	// Direction can be - "WOZNEXT" , "WOZBACK" , "WOZGOTO"
	// 
	// return values - label of target scene or one of "WOZNEXT" or "WOZBACK"
	//
	public preEnterScene(lTutor:any, sceneLabel:string, sceneTitle:string, scenePage:string, Direction:string ) : string
	{
		if(this.traceMode) CUtil.trace("Base preenter Scene Behavior: " + this.name);		
		
		// Parse the Tutor.config for preenter procedures for this scene 
		// 
		try {
			this.$preEnterScene();
		}
		catch(error) {
			CUtil.trace("preenter error on scene: " + this.name + " - " + error);
		}
			
		return sceneLabel;
	}

	
	public onEnterScene(Direction:string) : void
	{				
		if (this.traceMode) CUtil.trace("Base onenter Scene Behavior:" + this.name);
		
		// Parse the Tutor.config for onenter procedures for this scene 
		// 
		try {
			this.$onEnterScene();
		}
		catch(error) {
			CUtil.trace("onenter error on scene: " + this.name + " - " + error);
		}
	}
	
	// Direction can be - "NEXT" , "BACK" , "GOTO"
	// 
	public preExitScene(Direction:string, sceneCurr:number ) : string
	{
		if(this.traceMode) CUtil.trace("Base preexit Scene Behavior:" + this.name);
		
		// Parse the Tutor.config for onenter procedures for this scene 
		// 
		try {
			this.$preExitScene();
		}
		catch(error) {
			CUtil.trace("preexit error on scene: " + this.name + " - " + error);
		}
		return(CONST.OKNAV);			
	}

	public onExitScene() : void
	{				
		if (this.traceMode) CUtil.trace("Base onexit Scene Behavior:" + this.name);
        
		// Check for Terminate Flag
		// 
		try {
			if(this.$terminateScene) {
				if(this.tutorDoc.testFeatureSet(this.$features)) {
					this.enQueueTerminateEvent();
				}
				else {
					this.enQueueTerminateEvent();
				}
			}
		}
		catch(error) {
			CUtil.trace("enQueueTerminateEvent error on scene: " + this.name + " - " + error);
		}

		try {
			this.$logScene();
		}
		catch(error) {
			CUtil.trace("logging error on scene: " + this.name + " - " + error);
		}
		        
		// Parse the Tutor.config for onenter procedures for this scene 
		// 
		try {
			this.$onExitScene();
		}
		catch(error) {
			CUtil.trace("onexit error on scene: " + this.name + " - " + error);
		}
	}
	
//****** DEMO Behaviors

	// Update the Navigation Features on entry
	//
	public demoBehavior() : void
	{
		if(this.traceMode) CUtil.trace("Default demoBehavior: ");		
	}

//****** DEMO Behaviors

//****** Navigation Behaviors
			
//*************** TimeLine/Seek Events		

	public initSeekArrays()
	{
		// place scene specific seek events into arrays	
	}


	public doSeekForward(evt:CEFSeekEvent) : void
	{
		switch(evt.wozSeekSeq)
		{
		}
	}


	public doSeekBackward(evt:CEFSeekEvent) : void
	{
		
	}
	
//*************** TimeLine/Seek Events		
	
//****** Overridable Behaviors
}