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

//**Imports

import { TButton } 			from "./TButton";
import { TObject } 			from "./TObject";
import { TRoot } 			from "./TRoot";
import { THtmlText }        from "./THtmlText";

import { CEFEvent }         from "../events/CEFEvent";
import { TMouseEvent } 		from "../events/CEFMouseEvent";

import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";

import MovieClip     	  = createjs.MovieClip;
import Text     		  = createjs.Text;



export class THtmlButton extends TButton
{	
	//************ Stage Symbols
	
	public Stext:THtmlText;
	
	//************ Stage Symbols
	    
    protected fAdded:boolean;
    protected _updateVisibilityCbk:any;
    protected _updateComponentCbk:any;



	constructor()
	{
		super();
		this.init4();
	}


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

	public THtmlButtonInitialize() {

		this.TButtonInitialize.call(this);
		this.init4();
	}

	public initialize() {

		this.TButtonInitialize.call(this);		
		this.init4();
	}

	private init4() {
		
		this.traceMode = true;
        if(this.traceMode) CUtil.trace("THtmlButton:Constructor");
	}

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


    public Destructor() : void
    {        
        if(this.fAdded && this.stage) {
            this.stage.removeEventListener('drawstart', this._updateVisibilityCbk);
            this.stage.removeEventListener('drawend', this._updateComponentCbk);
        }

        this.Stext.Destructor();
        super.Destructor();

        this.fAdded = false;
    }


    public onAddedToStage(evt:CEFEvent) {

        let stage;

        console.log("THtmlButton On Stage");

        super.onAddedToStage(evt);

        if(!this.fAdded) {

            this.fAdded = true;

            if(stage = this.getStage()) {
                this._updateVisibilityCbk = stage.on('drawstart', this._handleDrawStart, this, false);
                this._updateComponentCbk  = stage.on('drawend'  , this._handleDrawEnd  , this, false);
            }
        }
        this.Stext.onAddedToStage(evt);
    }


    public _handleDrawStart(evt:CEFEvent) {
    }


    public _handleDrawEnd(evt:CEFEvent) {

        if(this.fAdded && !this.HTMLmute) {

            this.Stext.alpha = this.alpha;
        }
    }


    /**
     * Provides a means to defer adding the HTML component until transition time - The control itself may be persistent
     * in which case we don't want the unused copy on stage.
     */
    public addHTMLControls() {

        this.Stext.addHTMLControls();
    }


//*************** Serialization

    // We must initialize the context of child TObject controls 
    // 
    public setContext(_hostModule:any, _ownerModule:any, _hostScene:any) {

        super.setContext(_hostModule, _ownerModule, _hostScene);

        this.Stext.setContext(_hostModule, _ownerModule, _hostScene);
    }

    public deSerializeObj(objData:any) : void
    {
        super.deSerializeObj(objData);		

        console.log("deserializing: Text Control");

        if(objData.buttonHTML)
            this.Stext.deSerializeObj(objData.buttonHTML);       
    }

//*************** Serialization		
	
}
