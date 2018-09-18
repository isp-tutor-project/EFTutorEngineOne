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

import { TMouseEvent } 		from "../events/CEFMouseEvent";

import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";

import MovieClip     	  = createjs.MovieClip;
import Text     		  = createjs.Text;
import { THtmlText } from "./THtmlText";
import { CEFEvent } from "../events/CEFEvent";



export class THtmlButton extends TButton
{	
	//************ Stage Symbols
	
	public Stext:THtmlText;
	
	//************ Stage Symbols
	    
    

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

    
    public onAddedToStage(evt:CEFEvent) {

        console.log("THtmlButton On Stage");

        super.onAddedToStage(evt);

        this.Stext.onAddedToStage(evt);
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
        console.log("deserializing: Text Control");

        super.deSerializeObj(objData);		

        if(objData.buttonHTML)
            this.Stext.deSerializeObj(objData.buttonHTML);       
    }

//*************** Serialization		
	
}
