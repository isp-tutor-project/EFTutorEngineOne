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



namespace TutorEngineOne {

//** Imports

import MovieClip     		  = createjs.MovieClip;


export class CEFCheckBox extends CEFRadioButton
{
	//************ Stage Symbols
	
	public Scheck2:MovieClip;			// green check
	public Scheck3:MovieClip;			// red X
	
	//************ Stage Symbols
		
	
	
	constructor()
	{
		super();
		//trace("CEFCheckBox:Constructor");
	}
	
	/**
	 * Don't allow radio buttons to be clicked off
	 * @param	evt
	 */
	public doMouseClick(evt:CEFMouseEvent) : void 
	{		
		// Radio buttons can only be clicked to the ON state - you cannot turn them off independently only the button group can turn them off
		this.setCheck(!this.fChecked);

		if(this.traceMode) CUtil.trace("Setting Checked State: " + this.fChecked + " on button: " + name)				
	}					

	/**
	 * Dispatch message to tell listeners that selection has been made
	 * @param	bCheck
	 */
	public setCheck(bCheck:boolean)
	{
		super.setCheck(bCheck);			
		
		this.dispatchEvent(new Event(CEFEvent.CHANGE));
	}
	
	public setCheck2(bCheck:boolean)
	{
		this.resetState();
		
		this["Scheck2"].visible = bCheck;		
	}
	
	public setCheck3(bCheck:boolean)
	{
		this.resetState();
		
		this["Scheck3"].visible = bCheck;		
	}
	
	public resetState() : void 
	{			
		super.resetState();
		
		this["Scheck2"].visible    = false;		
		this["Scheck3"].visible    = false;		
	}
			
//*************** Deep state management

	public deepStateCopy(src:any): void
	{
		this.fChecked = src["fChecked"];
		this.curState = src["curState"];
		this._isvalid = src["_isvalid"];
		
		this["Schecked"].visible  = src["Schecked"].visible;		
		this["Scheck2"].visible   = src["Scheck2"].visible;		
		this["Scheck3"].visible   = src["Scheck3"].visible;		
		
		this.label = src["Slabel"].label.text;

		//  @@Mod Sept 28 2010 - causes incorrect check mode on multi check boxes
	}		

//*************** Deep state management

}
}
