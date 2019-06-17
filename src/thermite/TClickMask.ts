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

import { TObject }     	from "./TObject";

import { CEFEvent } 	from "../events/CEFEvent";
import { TMouseEvent }  from "./events/TMouseEvent";
import { TEvent }       from "./events/TEvent";

import { CONST }        from "../util/CONST";
import { CUtil } 		from "../util/CUtil";

import MovieClip     		  = createjs.MovieClip;
import Text          		  = createjs.Text;
import Timeline     		  = createjs.Timeline;



export class TClickMask extends TObject
{
	//************ Stage Symbols
    
    public Smask:MovieClip;
    	
	//************ Stage Symbols
    


	constructor()
	{
		super();
		this.init3();
	}


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

	public TClickMaskInitialize() {

		this.TObjectInitialize.call(this);
		this.init3();
	}

	public initialize() {

		this.TObjectInitialize.call(this);		
		this.init3();
	}

	private init3() {
		
		this.traceMode = true;
		if(this.traceMode) CUtil.trace("TClickMask:Constructor");

        // Note the CreateJS(AnimateCC) parts of the button have not been created
		// at this point.
	}

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


	public Destructor() : void
	{
		super.Destructor();
	}


    public onAddedToStage(evt:CEFEvent) {

		console.log("ClickMask On Stage");

        this.mouseChildren = false;

        this.on(TMouseEvent.MOUSE_CLICK , this.doMouseEvent, this);
        this.on(TMouseEvent.MOUSE_OVER  , this.doMouseEvent, this);
        this.on(TMouseEvent.MOUSE_OUT   , this.doMouseEvent, this);
        this.on(TMouseEvent.MOUSE_DOWN  , this.doMouseEvent, this);
        this.on(TMouseEvent.MOUSE_UP    , this.doMouseEvent, this);    
    }

	public doMouseEvent(evt:TMouseEvent) : void 
	{						
        evt.stopImmediatePropagation();

        console.log("NOTICE: Event Masked by TClickMask Object");
	}					

}
