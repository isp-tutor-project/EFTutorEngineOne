//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//  Copyright(c) 2013 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  Author(s): Kevin Willows                                                           
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


import { MObject } 	from "./MObject";	


/**
 * 	 CObjects are parsable sub-objects - i.e. we don't want to replace the entire sub-document	
 *   but only to update fields within it.			
 * 
 * 	 See: CMongo:parseUpdateFields
 * 
 */	
export class CObject extends MObject
{
	constructor()
	{
		super();
	}
	
	
	public getValue(tarObj:Object, path:string) : any
	{
		var objPath:Array<string>;
		var dataObj:any;
		
		// support nested children
		
		try
		{
			dataObj = tarObj;
			
			objPath = path.split(".");
			
			while(objPath.length > 1)
				dataObj = dataObj[objPath.shift()];	
			
			return dataObj[objPath.shift()];
		}
		catch(err)
		{
			return "";
		}
	}
	
	
	public setValue(tarObj:Object, objPath:Array<string>, value:any) : void
	{
		var dataObj:any;
		var name:string;
		
		// support nested children
		
		dataObj = tarObj;
		
		while(objPath.length > 1)
		{
			name = objPath.shift();
			
			if(dataObj[name] == null)
				dataObj[name] = new Object
			
			dataObj = dataObj[name];	
		}
		
		dataObj[objPath.shift()] = value;
	}
}






