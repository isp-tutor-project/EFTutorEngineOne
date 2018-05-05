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
//  File:      CEFBNode.as
//                                                                        
//  Purpose:   CEFBNode object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Apr 27 2010  
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

/** Deprecated */


/**
 * ...
 * @author Kevin Willows
 */
export class CEFBNode 
{
	public  _name:string;
	public  _arity:number;
	private _aritytags:Array<string> = new Array;
	private _vector:Array<Array<number>> = new Array;
	
	constructor() 
	{		
	}
	
	/*
		* 
		*/
	public getValue(row:number, col:number) :number 
	{
		return this._vector[row][col];
	}
	
	
	/*
		* 
		*/
	public setValue(row:number, col:number, newVal:number) : void
	{
		this._vector[row][col] = newVal;
	}
	
	
	/*
		* 
		*/
	public normalize() : void
	{
		let sum:number;
		let i1:number;
		let i2:number;
		
		let width:number = this._vector[0].length;
		
		for(i2 = 0 ; i2 < width ; i2++)			
		{
			sum = 0;
			
			for(i1 = 0 ; i1 < this._arity ; i1++)
						sum += this._vector[i1][i2];
			
			for(i1 = 0 ; i1 < this._arity ; i1++)
			this._vector[i1][i2] /= sum;
			
		}
	}
	
	/*
		* 
		*/
	public tagToNdx(tag:string) : number
	{
		let i1:number;
		
		for(i1 = 0 ; i1 < this._arity ; i1++)
		{							
			if(this._aritytags[i1] == tag) 
								return i1;
		}			
		
		return -1;
	}
	
	
	/*
		* 
		*/
	public loadXML(xmlSrc:any) : void
	{	
		let i1:number;
		
		this._name  = xmlSrc.name;
		this._arity = xmlSrc.arity;
		
		this._aritytags = xmlSrc.aritytags[0].split(',');
		
		for(i1 = 0 ; i1 < this._arity ; i1++)
		{							
			this._vector.push(xmlSrc.values[i1].split(','));
		}			
	}
	
	/*
		*/
	public saveXML() : any
	{
		let propVector:any;
		
		return propVector;
	}
	
}
