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


export class CEFLabelButton extends CEFButton
{
		
	
	
	
	public CEFLabelButton():void
	{
		//trace("CEFLabelButton:Constructor");
	}
	
	
	public setLabel(newLabel:string) : void
	{
		(this.Sup as any).Slabel.text       = newLabel;			
		(this.Sover as any).Slabel.text     = newLabel;			
		(this.Sdown as any).Slabel.text 	= newLabel;			
		(this.Sdisabled as any).Slabel.text = newLabel;			
	}		
			
}
}
