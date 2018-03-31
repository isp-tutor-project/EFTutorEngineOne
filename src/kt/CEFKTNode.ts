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


import EventDispatcher = createjs.EventDispatcher;

/**
 * ...
 * @author Kevin Willows
 */
export class CEFKTNode extends EventDispatcher
{
	private _name:string;			// KT knowledge component name
	private _pT:number;				// probability of transition from unlearned to learned state
	
	private _hypoNode:CEFBNode;
	private _evidNode:CEFBNode;
	private _arity:number;
	
	
	public CEFKTNode() 
	{
		this._hypoNode = new CEFBNode;
		this._evidNode = new CEFBNode;			
	}
	
	public set newEvid(evid:string) 
	{
		let oldValue:number = this._hypoNode.getValue(0, 0);
		let evidNdx:number  = this._evidNode.tagToNdx(evid);
		let i1:number;
		
		// perform normal bayesian belief update
		//p
		for(i1 = 0 ; i1 < this._arity ; i1++)
		{
			this._hypoNode.setValue( i1, 0, this._evidNode.getValue(evidNdx, i1) * this._hypoNode.getValue(i1, 0)); 	
		}
		
		this._hypoNode.normalize();
		
		// perform Corbet & Anderson DBN update - 
		//
		//			p(Ln) = p(Ln-1 | evidence) + (1- p(Ln-1 | evidence)) * p(T)
		//
		//_hypoNode.setValue( 0, 0, _hypoNode.getValue(0, 0) + (_hypoNode.getValue(1, 0) * _pT)); 
		//_hypoNode.setValue( 1, 0, 1 - _hypoNode.getValue(0, 0)); 
		
		this.dispatchBeliefChangedEvent(oldValue);
	}
	
	
	public get predValue() :number
	{
		let prediction:number = 0;

		prediction += this._evidNode.getValue(0, 0) * this._hypoNode.getValue(0, 0); 	
		prediction += this._evidNode.getValue(0, 1) * this._hypoNode.getValue(1, 0); 	
		
		return prediction;
	}
	
	
	/**
	 *  @private
	 */
	private dispatchBeliefChangedEvent(oldValue:any):void
	{
		if(this.hasEventListener("propertyChange")) 
			this.dispatchEvent(CEFPropertyChangeEvent.createUpdateEvent(this._hypoNode, "value", oldValue, this._hypoNode.getValue(0, 0)));
	}
	
	public get BeliefName() :string
	{
		return this._hypoNode._name;
	}
	
	public get BeliefValue() :number
	{
		return  this._hypoNode.getValue(0, 0);
	}
	
	/*
		* 
		*/
	public loadXML(xmlSrc:any) : void
	{	
		this._name = xmlSrc.name;
		this._pT   = xmlSrc.pt;
		
		this._hypoNode.loadXML(xmlSrc.hyponode[0]);
		this._evidNode.loadXML(xmlSrc.evidnode[0]);
		
		this._arity = this._hypoNode._arity; 			
	}
	
	/*
		*/
	public saveXML() : any
	{
		let propVector:any;
		
		return propVector;
	}
	
}
}
