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



export class CSceneChoice
{
	private _classname:string;		
	private _odds:Array<number>;
	private _chosen:boolean = false; 
	
	constructor(data:any)
	{			
		this._classname	= data.classname;
		this._odds    	= data.odds.split('.');
	}
	
	/**
	 * 
	 */
	public odds(ndx:number) : number
	{
		let result:number;
		
		if(this._chosen) result = 0;  
				else result = this._odds[ndx];
			
		return result;
	}		
	
	public get count() : number
	{
		return this._odds.length;
	}
	
	public get classname() : string
	{
		return this._classname;
	}		
	
	public replace() : void
	{
		this._chosen = false;
	}
	
	public choose() : void
	{
		this._chosen = true;
	}
}
