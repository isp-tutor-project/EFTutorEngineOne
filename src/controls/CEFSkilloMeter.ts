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

// imports

import MovieClip = createjs.MovieClip;
import TextField = createjs.Text;




/**
 * ...
 */
export class CEFSkilloMeter extends CEFObject
{
	//************ Stage Symbols

	public Stitle:TextField;
	
	public Sskill1:CEFSkillBar;
	public Sskill2:CEFSkillBar;
	public Sskill3:CEFSkillBar;
	public Sskill4:CEFSkillBar;
	public Sskill5:CEFSkillBar;
	public Sskill6:CEFSkillBar;
	
	// non-interactive elements
	
	//************ Stage Symbols
	
	private tfValue:Array<string> = new Array(6);
	
	constructor() 
	{
		super();

		let i1:number;
		
		super();
		
		for(i1 = 0 ; i1 < 6 ; i1++)
						this.updateSkill(i1 + 1, 0, "");
						
		this.addEventListener(CEFMouseEvent.CLICK, this.skillClick);
	}
	
	public Destructor() : void
	{
		super.Destructor();
	}
	
	public updateSkill(index:number, newValue:number, tfVal:string) : void
	{
		(this as any)["Sskill" + index].level = newValue;
		
		this.tfValue[index - 1] = tfVal;
	}		

	public updateName(index:number, newName:string) : void
	{
		(this as any)["Sskill" + index].skillName = newName;
	}		

	public set title(newTitle:string)
	{
		this.Stitle.text = newTitle;
	}
	
	private skillClick(evt:MouseEvent) : void
	{
		let i1:number;
		let SkillData:string = "";
		
		for(i1 = 1 ; i1 <= 6 ; i1++)
		{
			SkillData += (this as any)["Sskill" + i1].skillName;
			SkillData += ": ";
			SkillData += (this as any)["Sskill" + i1].level;
			SkillData += ": ";				
			SkillData += this.tfValue[i1 - 1];
			SkillData += "\n";
		}
		
		//System.setClipboard(SkillData);
	}
	
}
}
