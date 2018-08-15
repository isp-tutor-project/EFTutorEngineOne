﻿//*********************************************************************************
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

import { CONST }        from "../util/CONST";
import { CUtil } 		from "../util/CUtil";

import MovieClip     		  = createjs.MovieClip;
import Timeline     		  = createjs.Timeline;



export class TVirtual extends TObject
{
	//************ Stage Symbols
	
	public shape:MovieClip;
	public shape_1:MovieClip;
	public shape_2:MovieClip;
	public shape_3:MovieClip;
	
	//************ Stage Symbols
	
	public curState:string   = "unknown";
	public fPressed:boolean  = false;
	public fEnabled:boolean  = true;
    public fOver:boolean     = false;
    
    public STATE_UP:string;      
    public STATE_OVER:string;
    public STATE_DOWN:string;
    public STATE_DISABLED:string;


	private onClickScript:TObject = null;
	

	constructor()
	{
		super();
		this.init3();
	}


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

	public TVirtualInitialize() {

		this.TObjectInitialize.call(this);
		this.init3();
	}

	public initialize() {

		this.TObjectInitialize.call(this);		
		this.init3();
	}

	private init3() {
		
		this.traceMode = true;
		if(this.traceMode) CUtil.trace("TVirtual:Constructor");

		this.on(CEFEvent.ADDED_TO_STAGE, this.onAddedToStage);	

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

		console.log("Button On Stage");

        // TODO: Look at better way to hide this - it may be autoshown by transitions

		this.mouseChildren = false;
		this.alpha   = 0;
    }


//*************** Serialization
	
	
//*************** Serialization
	
}
