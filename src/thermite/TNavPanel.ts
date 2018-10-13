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
import { TText } from "./TText";
import { THtmlText } from "./THtmlText";




/**
* ...
*/
export class TNavPanel extends TScene
{	

	//************ Stage Symbols
    
    protected SbackMask:TObject;
    protected SbreadCrumbs:THtmlText;
    protected Sbackground:TObject;
    protected Sback:TObject;
    protected Snext:TObject;
    protected Smask0:TObject;
    protected Smask1:TObject;
    protected Smask2:TObject;
    protected Smask3:TObject;
	
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
        // Allow scene to override settings
        // 
        super.onCreate();

        this.tutorDoc.attachNavPanel(this);

        this.SbreadCrumbs.addHTMLControls();
	}


    public enableNext(enable:boolean) {
        this.Snext.enable(enable);
    }


    public enablePrev(enable:boolean) {
        this.Sback.enable(enable);
    }


    public setBreadCrumbs(text:string) {

        this.SbreadCrumbs.setContentFromString(text);
    }


	public showHideNavButton(type:string, show:boolean) {

		switch(type) {
			case CONST.NEXTSCENE:
                this.Snext.hidden = !show;        
                this.Snext.enable(show);
				break;

			case CONST.PREVSCENE:
                this.Sback.hidden = !show;
                this.Sback.enable(show);
                break;				
		}
	}


	public connectNavButton(type:string, butComp:string, _once:boolean = true) {

		this.disConnectNavButton(type, butComp );

		switch(type) {
			case CONST.NEXTSCENE:
                this._nextButton  = this[butComp].on(CONST.BUTTON_CLICK, this.tutorNavigator.onButtonNext, this.tutorNavigator);
                this.Snext.hidden = false;        
                this.Snext.enable(true);
				break;

			case CONST.PREVSCENE:
				this._prevButton  = this[butComp].on(CONST.BUTTON_CLICK, this.tutorNavigator.onButtonPrev, this.tutorNavigator);
                this.Sback.hidden = false;
                this.Sback.enable(true);
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

    private hideAllAssets() {

        this.disConnectNavButton(CONST.NEXTSCENE, "Snext");
        this.disConnectNavButton(CONST.PREVSCENE, "Sback");

        this.showHideNavButton(CONST.NEXTSCENE, false);
        this.showHideNavButton(CONST.PREVSCENE, false);

        this.Smask0.hide();
        this.Smask1.hide();
        this.Smask2.hide();
        this.Smask3.hide();
    }

    public setNavMode(modeID:number, navTar:string) {
        
        this.hideAllAssets();

        this.setNavigationTarget(navTar);    

        switch(modeID) {
            case CONST.NAVNONE:
                // no buttons to show
                this.enableNext(false);
                this.enablePrev(false);
                this.Smask0.show();
                break;

            case CONST.NAVBACK:
                this.connectNavButton(CONST.PREVSCENE, "Sback");
                this.Sback.show();
                this.Smask1.show();
                break;
            
            case CONST.NAVNEXT:
                this.connectNavButton(CONST.NEXTSCENE, "Snext");
                this.Snext.show();
                this.Smask2.show();
                break;
            
            case CONST.NAVBOTH:
                this.connectNavButton(CONST.NEXTSCENE, "Snext");
                this.connectNavButton(CONST.PREVSCENE, "Sback");
                this.Sback.show();
                this.Snext.show();
                this.Smask3.show();
                break;            
        }
    }

}
	
