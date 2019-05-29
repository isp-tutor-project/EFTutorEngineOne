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
import { CEFTimeLine }      from "core/CEFTimeLine";

import { TObject }			from "thermite/TObject";
import { TScene }           from "thermite/TScene";

import { CUtil } 			from "util/CUtil";

import Tween     = createjs.Tween;




export class TProgress extends TObject
{
	//************ Stage Symbols
    
	
	// non-interactive elements
	
	
    //************ Stage Symbols
                    
    // NOTE: due to the way CreateJS objects are constructed you cannot initialize member variables in this fashion
    // But you still define them here.
    private SHOW:boolean = true;
    private HIDE:boolean = false;
    private MAXSTATE:number = 1000;

	constructor()
	{
		super();
		this.init3();
	}


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

	public TProgressInitialize() {

		this.TObjectInitialize.call(this);
		this.init3();
	}

	public initialize() {

		this.TObjectInitialize.call(this);		
		this.init3();
	}

	private init3() {
		
		this.traceMode = true;
		if(this.traceMode) CUtil.trace("TProgress:Constructor");

        this.effectTimeLine = new CEFTimeLine(null, null, {"useTicks":false, "loop":false, "paused":true }, this.tutorDoc);
        this.effectTweens   = new Array<Tween>();

        this.SHOW = true;
        this.HIDE = false;
        this.MAXSTATE = 1000;
            
		// Note the CreateJS(AnimateCC) parts of the control have not been created
		// at this point.
	}

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


	public Destructor() : void
	{		
		super.Destructor();
	}


    /**
     * Provides a means to defer adding the HTML component until transition time - The control itself may be persistent
     * in which case we don't want the unused copy on stage.
     * Allow custom controls to override to init subcomponents.
     */
    public addHTMLControls() {
    
        
    }


    public set hostScene(scene:TScene) {

        this._hostScene = scene;

        // Initialize subcomponent pointers
        // required for deserialization
        // 
        // this.STextBox1.hostScene = scene;
        // this.STextBox2.hostScene = scene;
    }


    private showStates(item:string, newState:number, show:boolean) {

        let  state:string;
        let  id:number = 1;

        while(id <= newState) {

            state = "Sstate"+id;

            if(this[item][state]) {
                this[item][state].visible = show;
            }
            else {
                break;
            }
            id++;
        }
    }
    

    private showAll(show:boolean) {

        let  item:string;
        let  id:number = 1;

        while(true) {

            item = "Sprog"+id;

            if(this[item]) {
                this.showStates(item, this.MAXSTATE, show);
            }
            else {
                break;
            }
            id++;
        }
    }


    private gotoStepState(step:number, state:number) {

        let  item:string;

        item = "Sprog"+step;

        this.showStates(item, state, this.SHOW);
    }


    public gotoState(step:number, state:number) {

        if(state == 0) {
            this.visible = false;
        }
        else {
            this.visible = true;

            this.showAll(this.HIDE);

            this.currStep  = step;
            this.currState = state;

            for(let i1 = 1 ; i1 < step; i1++)
                          this.gotoStepState(i1, this.MAXSTATE);

            this.gotoStepState(step, state);
        }
    }

    
//*************** Logging state management
	
	public captureLogState(obj:any = null) : Object
	{
		obj = super.captureLogState(obj);
					
		return obj;											   
	}						
	
	public captureXMLState() :any
	{		
		let stateVal:any   = {progress:{}};

		return stateVal;				
	}		

	public restoreXMLState(stateVal:any) : void
	{
	}		
	
	public compareXMLState(stateVal:any) :boolean
	{
		var bTest:boolean = true;

		return bTest;			
	}		
	
//*************** Logging state management
	
   /*
    * 
    */
   public deSerializeObj(objData:any) : void
   {
       console.log("deserializing: TProgress Custom Control");

       super.deSerializeObj(objData);				

    //    this.STextBox1.deSerializeObj(objData.STextBox1);
    //    this.STextBox2.deSerializeObj(objData.STextBox2);
   }
	
}
