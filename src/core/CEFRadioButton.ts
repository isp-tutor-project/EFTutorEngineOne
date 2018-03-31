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


export class CEFRadioButton extends CEFCheckButton
{
		
	constructor()
	{
		super();

		//trace("CEFRadioButton:Constructor");
	}
	
	public attachGroup(butGroup:CEFButtonGroup)
	{
		butGroup.addButton(this);	
	}
	
	/**
	 * Don't allow radio buttons to be clicked off
	 * @param	evt
	 */
	public doMouseClick(evt:CEFMouseEvent) : void 
	{		
		// Radio buttons can only be clicked to the ON state - you cannot turn them off independently only the button group can turn them off
		this.setCheck(true);

		if(this.traceMode) CUtil.trace("Setting Checked State: " + this.fChecked + " on button: " + name)				
	}					

	/**
	 * Dispatch message to tell listeners that selection has been made
	 * @param	bCheck
	 */
	public setCheck(bCheck:boolean)
	{
		super.setCheck(bCheck);			
		
		if (this.fChecked)
			this.dispatchEvent(new CEFButtonEvent(CEFButtonEvent.WOZCHECKED));
		else
			this.dispatchEvent(new CEFButtonEvent(CEFButtonEvent.WOZUNCHECKED));
	}
			
	/**
	 * return a text representation of what the button is
	 */
	public toString() : string
	{
		return this.getLabel();
	}			
	
}
}
