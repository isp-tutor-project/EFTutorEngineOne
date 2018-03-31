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

import { CEFObject } 	from "./CEFObject";
import { CUtil } 		from "../util/CUtil";

//## TODO  Should implement this as a true singleton

export class CEFTimeStamp extends CEFObject
{
	public static _baseTime:number = 0;
	
	constructor()
	{	
		if(CEFTimeStamp._baseTime == 0)
			CEFTimeStamp._baseTime = Number(CUtil.getTimer());
		
		super();
	}

	public getStartTime(objprop:string) : string
	{
		var sResult:string;
		var dT:Number;
		
		// If this is the first call for this named timestamp  - set a named-stamp time
		// return delta from Tutor creation
		
		if(!this.hasOwnProperty(objprop)) 
		{
			sResult = 'invalid';
		}			
			
		// Otherwise return scene start time relative to tutor base time
		
		else 
		{
			dT = ((this as any)[objprop] - CEFTimeStamp._baseTime) / 1000;
			
			sResult = dT.toFixed(3);
		}
		
		return sResult; 
	}
	
	public createLogAttr(objprop:string, restart:boolean = false) : string
	{
		var sResult:string;
		var dT:Number;
		
		// If this is the first call for this named timestamp  - set a named-stamp time
		// return delta from Tutor creation
		
		if(!this.hasOwnProperty(objprop)) 
		{
			(this as any)[objprop] = Number(CUtil.getTimer());				
			
			dT = ((this as any)[objprop] - CEFTimeStamp._baseTime) / 1000;
		}			
		
		// Otherwise give delta time since created or reset
		
		else 
		{
			if(restart)
				(this as any)[objprop] = Number(CUtil.getTimer());
			
			dT = (Number(CUtil.getTimer()) - (this as any)[objprop]) / 1000;		
		}
		
		return sResult = dT.toFixed(3); 
	}
	
}
