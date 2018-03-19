//********************************************************************************* 
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2013 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Aug 27 2013  
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

export class CBKTSkill 
{
	// All these need to be public so JSON.Stringify finds them all when exporting the ktSkill object for Logging
	
	public Bel:number;
	
	public pL:number;		// Probabilty that we are in the learned state
	public pT:number;		// Probability of transition to learned state on each attempt
	public pG:number;		// Probability of Guess
	public pS:number;		// Probability of Slip
	
	constructor()
	{
	}
	
	
	public static factory(factory:any) : CBKTSkill
	{
		var node:CBKTSkill = new CBKTSkill;			
					
		// Before we see any evidence our belief in the learned state of this skill
		// is the same as the prior belief that it is learned without any evidence.
		
		node.Bel= 0;					// factory.pL;
		
		node.pL = factory.pL;
		node.pT = factory.pT;
		
		node.pG = factory.pG;
		node.pS = factory.pS;			
		
		return node;
	}
	
	public updateBelief(ans:boolean) : void
	{
		// Calculate Knowledge state Belief at Tn given priors and response (evidence) at Tn
		
		if(ans == true) this.Bel = this.calcTRUE();
				   else this.Bel = this.calcFALSE();
		
		// Now calc new prior for Tn+1 based on updated Belief in the Skills knowledge state
		
		this.pL = this.updatePrior(this.Bel);			
	}
	
	// Note that the pS (prob slip) and pG (prob Guess) are static - assumption of "stationary process"
	// however we account for varying degrees of belief in the evidence using Jeffery conditionalization 
	// in the denominator ((pL * (1 - pS)) + ((1 - pL) * pG));
	
	private calcTRUE() : number
	{
		return  (this.pL * (1 - this.pS)) / ((this.pL * (1 - this.pS)) + ((1 - this.pL) * this.pG)); 
	}
	
	private calcFALSE() : number
	{
		return  (this.pL * this.pS) / ((this.pL * this.pS) + ((1 - this.pL) * (1 - this.pG))); 
	}

	private updatePrior(Bel:number) : number
	{
		return Bel + ((1-Bel) * this.pT);
	}

	public queryBelief(): number
	{
		return this.Bel;
	}		
	
}
