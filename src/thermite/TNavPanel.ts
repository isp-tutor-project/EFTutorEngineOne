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

import { CEFNavEvent } 			from "../events/CEFNavEvent";

import { CSceneTrack }          from "../scenegraph/CSceneTrack";
import { CSceneGraph } 		    from "../scenegraph/CSceneGraph";
import { CSceneHistory }        from "../scenegraph/CSceneHistory";
import { CSceneHistoryNode }    from "../scenegraph/CSceneHistoryNode";

import { CEFSceneCueEvent } 	from "../events/CEFSceneCueEvent";
import { CEFEvent } 			from "../events/CEFEvent";

import { CUtil } 				from "../util/CUtil";
import { CONST }                from "../util/CONST";
import { TScene } from "./TScene";
import { TObject } from "./TObject";




/**
* ...
*/
export class TNavPanel extends TScene
{	

	//************ Stage Symbols
    
    protected Sbackground:TObject;
    protected Sback:TObject;
    protected SbackMask:TObject;
    protected Snext:TObject;
	
	// non-interactive elements
	
	
	//************ Stage Symbols				
    
	/**
	 * 
	 */
	constructor() 
	{
		super();
		this.init5();
	}
	
	
	/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
	/* ######################################################### */

	public TNavPanelInitialize() {

        this.TSceneInitialize.call(this);
        this.init5();
    }

    public initialize() {

        this.TSceneInitialize.call(this);		
        this.init5();
    }

    private init5() {

		this.traceMode = true;
		
        if(this.traceMode) CUtil.trace("TNavPanel:Constructor");					
    }

	/* ######################################################### */
	/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


	
	public Destructor() : void
	{
		
		super.Destructor();
	}
    
    
	public onCreate() : void
	{
        super.onCreate();

        this.Sback.hidden     = true;
        this.SbackMask.hidden = true;        
        this.Snext.enableButton(false);
	}


    public enableNext(enable:boolean) {
        this.Snext.enableButton(enable);
    }


    public enablePrev(enable:boolean) {
        this.Sback.enableButton(enable);
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


    public setNavigationTarget(behavior:string) {

        if(behavior.toUpperCase() === "TUTOR")
            this.tutorNavigator.buttonBehavior = CONST.GOTONEXTSCENE;
        else				
            this.tutorNavigator.buttonBehavior = CONST.GOTONEXTTRACK;

    }
}
	
