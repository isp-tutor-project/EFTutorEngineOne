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

import { findArray }        from "../scenegraph/IAudioTypes";

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
    public graphState:string;
    
	// For scenes with Timelines, these arrays are used to fire the appropriate code events 
	// as the user seeks the play head.
	//
	public seekForeFunc:Array<any>;
	public seekBackFunc:Array<any>;
	
	public sceneAttempt:number = 1;		
	public sceneTag:string;
    
	public classPath:string;
    
    public moduleData:any; 
    public sceneData :any; 
    private sceneState:any;

	protected _section:string;					// Arbitrary tutor section id
    
    protected tutorNavigator:any;
    
	protected _nextButton:any = null;
	protected _prevButton:any = null;

    private RX_SELECTOR:RegExp;
    private RX_TEMPLTAGS:RegExp;
    private RX_TEMPLATES:RegExp;
    private RX_TEMPLATE:RegExp;
    private RX_ONTQUERY:RegExp;

    private RX_GENSELECTOR:RegExp;     // Can decompose all selector types
    private RX_GENTEMPLATE:RegExp;     // Can decompose only Ontology selectors
    
    private NDX_RAWTEMPLATE:number  = 0;      // e.g. "{{$EFO_S_A?|name}}"    | "{{$EFM_selectedArea.ontologyKey}}"
    private NDX_RAWSELECTOR:number  = 1;      // e.g. "$EFO_S_A?|name"        | "$EFM_selectedArea.ontologyKey"
    private NDX_SELECTORSIG:number  = 2;      // e.g. "$EFO_"                 | "$EFM_"
    private NDX_SELECTOR:number     = 3;      // e.g. "S_A?|name"             | "selectedArea.ontologyKey"
    private NDX_OBJSELECTOR:number  = 4;      // e.g. "S_A?"                  | "selectedArea.ontologyKey"
    private NDX_PROPSELECTOR:number = 5;      // e.g. "name"                  | ""
    

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
        
        this.sceneState = {};

        this.RX_SELECTOR  = /(\$EF\w*?_)(.*)/;            // regex to decompose selectors - $EFO_<xxx>  $EFTR_<xxx> etc.  returns SelectorSig $1 and Selector $2
        this.RX_TEMPLATES = /\{\{[^\}]*\}\}/g;
        this.RX_TEMPLTAGS = /\{\{|\}\}/g;
        this.RX_TEMPLATE  = /{{[\$\w\.\?_\|]*}}/;
        this.RX_ONTQUERY  = /{{\$EFO_([\w\.\?]*\|\w*)}}/;

        this.RX_GENSELECTOR = /\{\{((\$EF\w*?_)(([\w_\.\?]*)\|?([\w_\?]*)))\}\}/g;
        this.RX_GENTEMPLATE = /\{\{((\$EF\w*?_)(([\w_\?]*)\|([\w_\?]*)))\}\}/g;
    
        this.NDX_RAWTEMPLATE  = 0; 
        this.NDX_RAWSELECTOR  = 1; 
        this.NDX_SELECTORSIG  = 2; 
        this.NDX_SELECTOR     = 3; 
        this.NDX_OBJSELECTOR  = 4; 
        this.NDX_PROPSELECTOR = 5; 


	}

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */




	public onCreate() : void
	{
		try {
            this.moduleData     = this.tutorDoc.moduleData[this.hostModule][CONST.SCENE_DATA];
            this.sceneData      = this.moduleData[this.sceneName];
            this.tutorNavigator = this.tutorDoc.tutorNavigator;

            // Init the tutor state variables - maintain any that are extant
            // 
            this.tutorDoc.sceneState[this.name]         = {};
            this.tutorDoc.moduleState[this.hostModule]  = this.tutorDoc.moduleState[this.hostModule] || {};
            this.tutorDoc.tutorState                    = this.tutorDoc.tutorState || {};

            this.tutorDoc.sceneChange[this.sceneName]   = {};
            this.tutorDoc.moduleChange[this.hostModule] = this.tutorDoc.moduleChange[this.hostModule] || {};
            this.tutorDoc.tutorChange                   = this.tutorDoc.tutorChange                   || {};            

            let dataElement:any;

			// Execute the create procedures for this scene instance
			// see notes on sceneExt Code - tutor Supplimentary code
			// 
			this.$preCreateScene();

            // walk all the scene data items and find matching scene components (there should be matches for all)
            // deserialize the data into the component.
            // 
            for(let element in this.sceneData) {

                dataElement = this.sceneData[element];
                
                if(this[element] && this[element].deSerializeObj) {

                    this[element].hostModule = this.hostModule;
                    this[element].hostScene  = this;
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


    private assignProperty(root:any, property:string, value:any) : void {

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


    private resolveProperty(root:any, property:string) : any {

        let path   = property.split(".");
        let target = root;
        let value:any;

        for(let i1 = 0 ; i1 < path.length-1 ; i1++) {

            if(target[path[i1]])             
                target = target[path[i1]];
            else 
                target = target[path[i1]] = {};
        }

        return value = target[path[path.length-1]];
    }


    public setSceneValue(property:string, value:any) : void {
        this.setStateValue(property, value, CONST.SCENESTATE) 
    }    
    public setModuleValue(property:string, value:any) : void {
        this.setStateValue(property, value, CONST.MODULESTATE) 
    }
    public setTutorValue(property:string, value:any) : void {
        this.setStateValue(property, value, CONST.TUTORSTATE) 
    }

    public setStateValue(property:string, value:any, target:string = CONST.MODULESTATE) : void {

        switch(target) {

            case CONST.SCENESTATE:
                this.assignProperty(this.tutorDoc.sceneState[this.name], property, value);
                this.tutorDoc.sceneChange[this.name][property] = true;
                break;

            case CONST.MODULESTATE:
                this.assignProperty(this.tutorDoc.moduleState[this.hostModule], property, value);
                this.tutorDoc.moduleChange[this.hostModule][property] = true;
                break;

            case CONST.TUTORSTATE:
                this.assignProperty(this.tutorDoc.tutorState, property, value);
                this.tutorDoc.tutorChange[property] = true;
                break;
        }        
    }

    

    public getRawSceneValue(property:string) : any {
        return this.getRawStateValue(property, CONST.SCENESTATE) 
    }    
    public getRawModuleValue(property:string) : any {
        return this.getRawStateValue(property, CONST.MODULESTATE) 
    }
    public getRawTutorValue(property:string) : any {
        return this.getRawStateValue(property, CONST.TUTORSTATE) 
    }

    public getRawStateValue(property:string, target:string = CONST.MODULESTATE) : any {

        let prop:any;

        switch(target) {
            case CONST.SCENESTATE:
                prop = this.resolveProperty(this.tutorDoc.sceneState[this.name], property);
                break;

            case CONST.MODULESTATE:
                prop = this.resolveProperty(this.tutorDoc.moduleState[this.hostModule], property);
                break;

            case CONST.TUTORSTATE:
                prop = this.resolveProperty(this.tutorDoc.tutorState, property);
                break;
        }        

        return prop;
    }



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
        prop = this.resolveTemplates(prop, null);

        return prop;
    }



    public querySceneChange(property:string) : boolean {
        return this.queryValueChanged(property, CONST.SCENESTATE) 
    }    
    public queryModuleChange(property:string) : boolean {
        return this.queryValueChanged(property, CONST.MODULESTATE) 
    }
    public queryTutorChange(property:string) : boolean {
        return this.queryValueChanged(property, CONST.TUTORSTATE) 
    }

    public queryValueChanged(property:string, target:string = CONST.MODULESTATE) : boolean {

        let prop:any;

        prop = this.getRawStateValue(property, target);

        return prop.changed;
    }



    public testSceneValue(property:string, value:any) :boolean {
        return this.testStateValue(property, value, CONST.SCENESTATE) 
    }    
    public testModuleValue(property:string, value:any) :boolean {
        return this.testStateValue(property, value, CONST.MODULESTATE) 
    }
    public testTutorValue(property:string, value:any) :boolean {
        return this.testStateValue(property, value, CONST.TUTORSTATE) 
    }

    public testStateValue(property:string, value:any, target:string = CONST.MODULESTATE) :boolean {

        let result:boolean = false;
        let prop:any;

        prop = this.getRawStateValue(property, target);

        result = prop === value;

        return result;
    }



    public querySceneProp(property:string[]) :boolean {
        return this.queryStateProp(property, CONST.SCENESTATE) 
    }    
    public queryModuleProp(property:string[]) :boolean {
        return this.queryStateProp(property, CONST.MODULESTATE) 
    }
    public queryTutorProp(property:string[]) :boolean {
        return this.queryStateProp(property, CONST.TUTORSTATE) 
    }

    public queryStateProp(property:string[], target:string = CONST.MODULESTATE) : boolean {

        let prop:any;
        let valid:any = null;

        for(let i1 = 0 ; i1 < property.length ; i1++) {

            prop = this.getRawStateValue(property[i1], target);

            valid = prop;

            if(!valid) break;
        }

        return valid? true:false;
    }





    public resolveTemplates(sourceStr:string, templateRef:any) : string {

        let result:string = sourceStr;  // Don't change non-templates

        let templArray:Array<findArray>;

        templArray = this.enumerateTemplates(this.RX_GENSELECTOR, sourceStr);

        if(templArray.length > 0) {

            result = this.composeScript(sourceStr, templArray, templateRef);
        }
        else {
            result = this.resolveSelector(sourceStr, templateRef) || sourceStr;
        }
        return result;
    }


    private enumerateTemplates(regex:RegExp, text:string) : Array<findArray> {

        let templArray:Array<findArray> = [];
        let templ:findArray;
    
        while((templ = regex.exec(text)) !== null) {
    
            templArray.push(templ);
            templ.endIndex = regex.lastIndex;
            // console.log(`Found ${templ[NDX_RAWTEMPLATE]} at: ${templ.index} Next starts at ${regex.lastIndex}.`);
        }
    
        return templArray;
    }
    
    
    private composeScript(inst:string, templArray:Array<findArray>, templateRef:any) : string {

        let start:number = 0;
        let end:number   = inst.length;
        let composition:string = "";
    
        if(templArray.length) {
            start    = 0;
    
            // enumerate the templates to segment the text for TTS synthesis and playback
            // 
            for(let templ of templArray) {
    
                // First add the text before or between template(s) if there is any
                // 
                end = templ.index;            
                if(start < end) {  
                    if(start > 0)
                        composition += " ";  

                    composition += inst.substring(start, end);
                }
    
                // then add the template itself
                start = templ.index;
                end   = templ.endIndex;

                if(start > 0)
                    composition += " ";  

                composition += this.resolveSelector(templ[this.NDX_RAWSELECTOR], templateRef);
    
                start = end;
            }
        }
    
        // Finally add the text after the last template if there is any
        // 
        end = inst.length;            
        if(start < end) {

            if(start > 0)
                composition += " ";  

            composition += inst.substring(start, end);
        }

        return composition;
    }
    
    
    public resolveSelector(selector:string, templateRef:any, targetThis:any = null) : any{

        let result:any = null;

        let selectorVal = this.RX_SELECTOR.exec(selector);

        if(selectorVal) {

            result = this.resolveRawSelector(selector, templateRef, targetThis);

            //  recursively resolve references for specific selector types
            // 
            switch(selectorVal[1]) {

                case CONST.SCENESTATE_SELECTOR:
                case CONST.MODULESTATE_SELECTOR:
                case CONST.TUTORSTATE_SELECTOR:

                    if(selector !== result)
                        result = this.resolveSelector(result, null);
                    break;                
            }
        }

        return result;
    }    

    public resolveRawSelector(selector:string, templateRef:any, targetThis:any = null) : any{

        let dataPath:Array<string>;
        let result:any = null;

        let selectorVal = this.RX_SELECTOR.exec(selector);

        if(selectorVal) {
            switch(selectorVal[1]) {

                case CONST.MODULEONTOLOGY_SELECTOR:                

                    result = this.resolveOntologyObject(selectorVal[2], this.tutorDoc.moduleData[this.hostModule][CONST.SCENE_DATA]._ONTOLOGY, templateRef) 
                    break;   

                case CONST.GLOBALONTOLOGY_SELECTOR:                

                    result = this.resolveOntologyObject(selectorVal[2], this.tutorDoc.globalData._ONTOLOGY, templateRef) 
                    break;   

                case CONST.TRACK_SELECTOR:

                    result = targetThis[selectorVal[2]];
                    break;

                case CONST.SCENESTATE_SELECTOR:

                    result = this.getRawStateValue(selectorVal[2], CONST.SCENESTATE);
                    break;

                case CONST.MODULESTATE_SELECTOR:

                    result = this.getRawStateValue(selectorVal[2], CONST.MODULESTATE);
                    break;
                
                case CONST.TUTORSTATE_SELECTOR:

                    result = this.getRawStateValue(selectorVal[2], CONST.TUTORSTATE);
                    break;
                
                case CONST.FOREIGNMODULE_SELECTOR:

                    dataPath = selectorVal[2].split(".");

                    let forMod = this.tutorDoc.moduleData[dataPath[1]];

                    if(!forMod) {
                        console.log("Error: module for Foreign-Reference missing!")
                        throw("missing module");
                    }
                    result = forMod[CONST.SCENE_DATA]._LIBRARY[dataPath[2]][dataPath[3]];
                    break;

                case CONST.MODULELIBRARY_SELECTOR:

                    result = this.resolveObject(this.tutorDoc.moduleData[this.hostModule][CONST.SCENE_DATA]._LIBRARY, selectorVal[2]);
                    break;
                
                case CONST.GLOBALLIBRARY_SELECTOR:

                break;
            }
        }

        return result;
    }


    private resolveObject(baseObj:any, objPath:string ) : any {

        let dataPath:Array<string> = objPath.split(".");

        try {
            dataPath.forEach((element:string) => {

                baseObj = baseObj[element];
            });
        }
        catch(err) {
            console.log("Object Resolution Error: " + err);
        }

        return baseObj;
    }


    private resolveOntologyObject(oSelector:string, ontologyRoot:any, templateRef:any) : any {

        let result:any   = oSelector;
        let ontologyPath = [];

        if(oSelector) {

            this.resolveOntologyKey(oSelector, templateRef);

            let vArray:Array<string> = oSelector.split("|");
            let qArray:Array<string> = vArray[0].split("_");

            for(let index = 0 ; index < qArray.length ; index++) {
                
                let pathEl = qArray[index].includes("?")? this._ontologyKey[index]: qArray[index];

                ontologyPath.push(pathEl);

                ontologyRoot = ontologyRoot[pathEl];
            }

            // Update the result
            // May resolve property of object or the object itself
            // also build the ontologyPath to the selected resource
            // - used as component values
            // 
            this._ontologyPath = ontologyPath.join("_");

            if(vArray[1]) {
                result = ontologyRoot[vArray[1]];
                
                this._ontologyPath += "|" + vArray[1];
            }
            else {
                result = ontologyRoot;
            }
        }

        return result;
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

	
//****** Navigation Behaviors


//****** Component Behaviors Start

    public handleEvent(target:string) {

        // User selection has been made
		//
		this.$handleEvent(target);
    }

	/**
	 */
	public onSelect(target:string) : void {
		// User selection has been made
		//
		this.$onSelect(target);
	}

	/**
	 */
	public onClick(target:string) : void {
		// User selection has been made
		//
		this.$onClick(target);
	}


//****** Component Behaviors End


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
	

	public showScene() : void
	{
		if(this.traceMode) CUtil.trace("Base showScene Behavior: " + this.name);		
		
		// Allow mixins to fire behaviors
		// 
		try {
			this.$preShowScene();
		}
		catch(error) {
			CUtil.trace("preShowScene error on scene: " + this.name + " - " + error);
		}
			
	}

	
	public hideScene() : void
	{
		if(this.traceMode) CUtil.trace("Base showScene Behavior: " + this.name);		
		
		// Allow mixins to fire behaviors
		// 
		try {
			this.$preHideScene();
		}
		catch(error) {
			CUtil.trace("preHideScene error on scene: " + this.name + " - " + error);
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