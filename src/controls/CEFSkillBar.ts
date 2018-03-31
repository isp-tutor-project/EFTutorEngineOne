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
export class CEFSkillBar extends CEFObject
{
	//************ Stage Symbols
	
	public Smask:MovieClip;
	public Stext:TextField;
	
	// non-interactive elements
	
	public SprogBar:MovieClip;
	
	//************ Stage Symbols
	
	private _name:string;
	private _level:number;
	private _invlevel:number;
	private _position:number;
	
	
	constructor() 
	{
		super();
		
		this.level = 0;
	}

	public set skillName(newName:string)
	{
		this._name = newName;
	}
	
	public get skillName() : string
	{
		return this._name;
	}
	
	public set level(newLevel:number) 
	{		
		this._invlevel = 1 - newLevel;
		this._level    = newLevel;
		
		this.Smask.x = -((this.SprogBar as any)['width'] * this._invlevel);			
		
		this._level *= 100;
		
		this.Stext.text = this._level.toFixed(0) + '%';
	}
	
	public get level() : number 
	{
		return this._level;
	}
}
}
