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
//  File:      CEFProdSys.as
//                                                                        
//  Purpose:   CEFProdSys object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation May 02 2010  
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

/*
 // GOAL QUESTION
		<phrase id="SCIENCE">	 	<fragment text="I'm comparing the two ramps, or parts of them."/>

		<phrase id="ENGINEERING">	<fragment text="I'm not comparing the ramps, I'm making the ball(s) roll fast / far / the same."/>

		<phrase id="SCIENCE2">		<fragment text="I'm trying to find out if part of the ramp affects how fast / far the balls roll."/>

		<phrase id="NONE">			<fragment text="I don't really have a goal."/>
		
 // reasoning QUESTION
		<phrase id="PHRASE1">	<fragment text="To have only one part of the ramps different."/>     

		<phrase id="PHRASE2">	<fragment text="To compare everything about the ramps."/>                         

		<phrase id="PHRASE3">	<fragment text="To compare a part of the ramps."/>                                        

		<phrase id="PHRASE4">	<fragment text="To compare several parts of the ramps."/>                                

		<phrase id="PHRASE5">	<fragment text="To make the balls land where I want."/>                            

		<phrase id="PHRASE6">	<fragment text="To see what parts of the ramps mattered."/>                                  

		<phrase id="PHRASE7">	<fragment text="To see if some parts of the ramps work together well."/>            

		<phrase id="PHRASE8">	<fragment text="To see how the balls rolled."/>                                  

		<phrase id="PHRASE9">	<fragment text="To make the balls do what I want."/>                             

		<phrase id="PHRASE10">	<fragment text="To make the ball(s) roll farther / faster/ the same."/>                                 

		<phrase id="PHRASE11">	<fragment text="I don't know / I guessed."/>       
		   
  // Design Correlation
		<TYPE1>		<if selects TV only>
		
		<TYPE2>		<if selects only one variable>
		
		<TYPE3>		<if selects only variable(s) varied>
		
  // CVSLogic
		<TYPEA>		<Because I'm only testing the TV
		
		<TYPEB>		<To see if the TV has an effect, but nothing else does.>
		
		<TYPEC>		<So that I could tell the difference between [a] and [b].>
		
  // CVSWVLogic
		<TYPEA>		<So that none of the other variables interfere.>
		
		<TYPEB>		<To see if just one thing had an effect but nothing else does.>
		
		<TYPEC>		<So that I could tell the difference between [a] and [b].>
		
*/


/**
 * ...
 * @author K Willows
 */
export class CEFProdSys
{
	public wm:any;		// Working Memory
	
	constructor() 
	{
		this.resetWorkMem();
	}
	
	public resetWorkMem() : void
	{
		this.wm = {};			
	}
	
	public setWorkMem(prop:string, value:string) : void
	{
		this.wm[prop] = value;
	}
	
	public prop(_prop:string) : String
	{
		return this.wm[_prop].toString();
	}
	
	public value(_prop:string) : Boolean
	{
		return this.wm[_prop];
	}
	
	
	public execRules() : void
	{
		// Reset rule assessments
		
		this.wm.rule0      = false;
		this.wm.rule1      = false;
		this.wm.rule2      = false;
		this.wm.ruleTOV    = false;
		this.wm.ruleVVFAR  = false;
		this.wm.ruleCVSLOG = false;						
		
		if(this.wm.ramp == "NC")
		{
			if(this.wm.reasoning == "PHRASE3")	/// NC
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				
				// ALWAYS
			}				
			else if(this.wm.reasoning == "PHRASE6")	/// NC
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				
				// ALWAYS
			}				
		}
		else if(this.wm.ramp == "CVS")
		{
			if(this.wm.reasoning == "PHRASE1")	/// CVS
			{
				if(this.wm.CVSLogic == "TYPEA")
				{
					this.wm.rule0      = true;
					this.wm.rule1      = true;
					this.wm.rule2      = true;
					this.wm.ruleTOV    = true;
					this.wm.ruleVVFAR  = true;
				}
				else if(this.wm.CVSLogic == "TYPEB")
				{
					this.wm.rule0      = true;
					this.wm.rule1      = true;
					this.wm.rule2      = true;
					this.wm.ruleTOV    = true;
					this.wm.ruleVVFAR  = true;
					this.wm.ruleCVSLOG = true;
				}
				else if(this.wm.CVSLogic == "TYPEC")
				{
					this.wm.rule0      = true;
					this.wm.rule1      = true;
					this.wm.rule2      = true;
				}
				
				// ALWAYS
			}				
			else if(this.wm.reasoning == "PHRASE3")	/// CVS
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
					this.wm.rule1      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				
				// ALWAYS
				this.wm.ruleVVFAR  = true;
			}				
			else if(this.wm.reasoning == "PHRASE6")	/// CVS
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
					this.wm.rule1      = true;
					this.wm.ruleVVFAR  = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				
				// ALWAYS
			}				
		}			
		else if(this.wm.ramp == "CVS_WV")
		{
			if(this.wm.reasoning == "PHRASE1")	/// CVS_WV
			{
				if(this.wm.CVSWVLogic == "TYPEA")
				{
					this.wm.rule2      = true;
				}
				else if(this.wm.CVSWVLogic == "TYPEB")
				{
					this.wm.rule1      = true;
					this.wm.rule2      = true;
					this.wm.ruleTOV    = true;
					this.wm.ruleVVFAR  = true;
					this.wm.ruleCVSLOG = true;
				}
				else if(this.wm.CVSWVLogic == "TYPEC")
				{
					this.wm.rule1      = true;
					this.wm.rule2      = true;
				}
				
				// ALWAYS
			}				
			else if(this.wm.reasoning == "PHRASE3")	/// CVS_WV
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE3 == "true")
				{
					this.wm.rule1      = true;
				}
				
				// ALWAYS
				this.wm.ruleTOV    = true;
				this.wm.ruleVVFAR  = true;
			}				
			else if(this.wm.reasoning == "PHRASE6")	/// CVS_WV
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				if(this.wm.corrTYPE3 == "true")
				{
					this.wm.rule1      = true;
					this.wm.ruleVVFAR  = true;
				}
				
				// ALWAYS
			}				
		}			
		else if(this.wm.ramp == "SC")
		{
			if(this.wm.reasoning == "PHRASE4")	/// SC
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				if(this.wm.corrTYPE3 == "true")
				{
					this.wm.rule1      = true;
				}
				
				// ALWAYS
				this.wm.ruleVVFAR  = true;
			}				
			else if(this.wm.reasoning == "PHRASE6")	/// SC
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				if(this.wm.corrTYPE3 == "true")
				{
					this.wm.rule1      = true;
					this.wm.ruleVVFAR  = true;
				}
				
				// ALWAYS
			}				
		}			
		else if(this.wm.ramp == "SC_WV")
		{
			if(this.wm.reasoning == "PHRASE4")	/// SC_WV
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				if(this.wm.corrTYPE3 == "true")
				{
					this.wm.rule1      = true;
				}
				
				// ALWAYS
				this.wm.ruleVVFAR  = true;
			}				
			else if(this.wm.reasoning == "PHRASE6")	/// SC_WV
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				if(this.wm.corrTYPE3 == "true")
				{
					this.wm.rule1      = true;
					this.wm.ruleVVFAR  = true;
				}
				
				// ALWAYS
			}				
		}			
		else if(this.wm.ramp == "DC")
		{
			if(this.wm.reasoning == "PHRASE4")	/// DC
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				if(this.wm.corrTYPE3 == "true")
				{
					this.wm.rule1      = true;
				}
				
				// ALWAYS
				this.wm.ruleVVFAR  = true;
			}				
			else if(this.wm.reasoning == "PHRASE6")	/// DC
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				if(this.wm.corrTYPE3 == "true")
				{
					this.wm.rule1      = true;
					this.wm.ruleVVFAR  = true;
				}
				
				// ALWAYS
			}				
		}			
		else if(this.wm.ramp == "MC")
		{
			if(this.wm.reasoning == "PHRASE2")	/// MC
			{
				// ALWAYS
				this.wm.rule1      = true;
				this.wm.ruleVVFAR  = true;
			}				
			else if(this.wm.reasoning == "PHRASE3")	/// MC
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				
				// ALWAYS
				this.wm.rule1      = true;
				this.wm.ruleVVFAR  = true;
			}				
			else if(this.wm.reasoning == "PHRASE6")	/// MC
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				
				// ALWAYS
				this.wm.rule1      = true;
				this.wm.ruleVVFAR  = true;
			}				
		}			
		else if(this.wm.ramp == "HOTAT")
		{
			if(this.wm.reasoning == "PHRASE4")	/// HOTAT
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				if(this.wm.corrTYPE3 == "true")
				{
					this.wm.rule1      = true;
				}
				
				// ALWAYS
				this.wm.ruleVVFAR  = true;
			}				
			else if(this.wm.reasoning == "PHRASE6")	/// HOTAT
			{
				if(this.wm.corrTYPE1 == "true")
				{
					this.wm.rule0      = true;
				}
				if(this.wm.corrTYPE2 == "true")
				{
					this.wm.ruleTOV    = true;
				}
				if(this.wm.corrTYPE3 == "true")
				{
					this.wm.rule1      = true;
					this.wm.ruleVVFAR  = true;
				}
				
				// ALWAYS
			}				
		}			
	}		
}
