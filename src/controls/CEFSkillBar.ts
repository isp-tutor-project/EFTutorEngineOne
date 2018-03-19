//********************************************************************************* 
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2010 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CEFSkilloMeter.as
//                                                                        
//  Purpose:   CEFSkilloMeter object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Apr 30 2010  
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

// imports

import { CEFObject } from "../core/CEFObject";

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
